from django.db.models import Q
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status

from apps.stock.models.removal import Removal, RemovalItem
from apps.stock.models.payment import Payment
from apps.stock.serializers.removal_serializer import RemovalSerializer
from apps.stock.services.removal_service import create_removal_with_items, delete_removal_and_restore_stock, update_removal_status


class _Pagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100


def _removal_qs(user):
    if user.boutique_id:
        return Removal.objects.filter(boutique_id=user.boutique_id)
    return Removal.objects.all()


def _require_session(user):
    """Retourne (session_ou_None, erreur_ou_None). OWNER et superuser sont exemptés."""
    if user.role == 'OWNER' or user.is_superuser:
        return None, None
    if not user.boutique_id:
        return None, Response({'error': 'Aucune boutique associée.'}, status=status.HTTP_403_FORBIDDEN)
    from apps.stock.models.session import CashSession
    session = CashSession.objects.filter(boutique_id=user.boutique_id, status='open').first()
    if not session:
        return None, Response(
            {'error': 'Aucune session de caisse ouverte. Ouvrez une session avant de continuer.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    return session, None


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removals(request):
    qs = _removal_qs(request.user).prefetch_related(
        'items', 'items__product', 'payments', 'payments__received_by'
    ).order_by('-date_register')
    search = request.query_params.get('search', '').strip()
    date   = request.query_params.get('date', '').strip()
    if search:
        qs = qs.filter(
            Q(client_name__icontains=search) |
            Q(removal_ref__icontains=search) |
            Q(destination__icontains=search)
        )
    if date:
        qs = qs.filter(date_register__date=date)
    destination = request.query_params.get('destination', '').strip()
    if destination:
        qs = qs.filter(destination=destination)
    paginator = _Pagination()
    page = paginator.paginate_queryset(qs, request)
    serializer = RemovalSerializer(page, many=True)
    return paginator.get_paginated_response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removal(request, id):
    removal = get_object_or_404(_removal_qs(request.user).prefetch_related('items__product'), pk=id)
    serializer = RemovalSerializer(removal)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_removal(request):
    import json
    session, err = _require_session(request.user)
    if err:
        return err

    data = request.data
    user = request.user

    # items peut arriver en JSON string (multipart) ou dict (application/json)
    raw_items = data.get('items', '[]')
    if isinstance(raw_items, str):
        try:
            items = json.loads(raw_items)
        except (ValueError, TypeError):
            items = []
    else:
        items = list(raw_items) if hasattr(raw_items, '__iter__') else []

    # Extraire les champs de paiement initial (non transmis au service)
    initial_payment = int(data.get('initial_payment') or 0)
    payment_mode    = data.get('payment_mode', 'especes')

    removal_data = {
        k: v for k, v in data.items()
        if k not in ('items', 'initial_payment', 'payment_mode')
    }
    removal_data['boutique_id'] = user.boutique_id
    if session:
        removal_data['cash_session_id'] = session.id

    destination = removal_data.get('destination')

    # Validation justification si perte
    if destination == 'perte':
        justification = removal_data.get('justification', '').strip() if isinstance(removal_data.get('justification', ''), str) else ''
        if not justification:
            return Response({'error': 'Le justificatif est obligatoire pour une perte.'}, status=status.HTTP_400_BAD_REQUEST)

    # Pour une vente, le statut est calculé depuis le montant versé
    if destination == 'vente':
        removal_data['invoice_status'] = 'en_attente'

    try:
        removal = create_removal_with_items(user, removal_data, items)
    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # Attacher la preuve photo si présente
    proof = request.FILES.get('proof_image')
    if proof:
        removal.proof_image = proof
        removal.save(update_fields=['proof_image'])

    # ── Paiement initial (vente uniquement) ──────────────────────────────
    if destination == 'vente':
        total = removal.invoice_total_amount or 0

        if initial_payment >= total and total > 0:
            new_status = 'payee'
        elif initial_payment > 0:
            new_status = 'partiellement_payee'
        else:
            new_status = 'en_attente'

        update_fields = ['invoice_status']
        removal.invoice_status = new_status

        if initial_payment > 0:
            Payment.objects.create(
                removal=removal,
                amount=initial_payment,
                mode=payment_mode,
                received_by=user,
            )

        removal.save(update_fields=update_fields)

    serializer = RemovalSerializer(removal)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_unpaid_invoices(request):
    if request.user.role not in ('OWNER', 'MANAGER') and not request.user.is_superuser:
        return Response({'error': 'Accès non autorisé.'}, status=status.HTTP_403_FORBIDDEN)

    qs = _removal_qs(request.user).filter(
        destination='vente',
        invoice_status__in=['en_attente', 'partiellement_payee'],
    ).prefetch_related('payments').order_by('date_register')

    paginator = _Pagination()
    page_qs = paginator.paginate_queryset(qs, request)

    records = []
    for r in (page_qs or []):
        amount_paid = sum(p.amount for p in r.payments.all())
        total       = r.invoice_total_amount or 0
        balance_due = max(0, total - amount_paid)

        if balance_due == 0:
            r.invoice_status = 'payee'
            r.save(update_fields=['invoice_status'])
            continue

        records.append({
            'id':             r.id,
            'invoice_number': r.invoice_number or '—',
            'client_name':    r.client_name or '—',
            'client_phone':   r.client_phone or '',
            'date':           r.date_register,
            'total':          total,
            'amount_paid':    amount_paid,
            'balance_due':    balance_due,
            'status':         r.invoice_status,
        })

    return paginator.get_paginated_response(records)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_losses(request):
    if request.user.role not in ('OWNER',) and not request.user.is_superuser:
        return Response({'error': 'Accès réservé au propriétaire.'}, status=status.HTTP_403_FORBIDDEN)

    qs = _removal_qs(request.user).filter(destination='perte').prefetch_related(
        'items__product'
    ).select_related('created_by').order_by('-date_register')

    period    = request.query_params.get('period')
    date_from = request.query_params.get('date_from')
    date_to   = request.query_params.get('date_to')
    now       = timezone.now()

    if period == 'day':
        qs = qs.filter(date_register__date=now.date())
    elif period == 'month':
        qs = qs.filter(date_register__year=now.year, date_register__month=now.month)
    elif period == 'year':
        qs = qs.filter(date_register__year=now.year)
    elif period == 'custom' and date_from and date_to:
        qs = qs.filter(date_register__date__gte=date_from, date_register__date__lte=date_to)

    paginator = _Pagination()
    page_qs = paginator.paginate_queryset(qs, request)

    records = []
    for removal in (page_qs or []):
        for item in removal.items.all():
            records.append({
                'date':          removal.date_register,
                'employee':      removal.created_by.username if removal.created_by else '—',
                'product':       item.product.product_name if item.product else '—',
                'quantity':      item.quantity,
                'justification': removal.justification or '',
                'proof_image':   request.build_absolute_uri(removal.proof_image.url) if removal.proof_image else None,
            })

    return paginator.get_paginated_response(records)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def patch_removal(request, id):
    if not request.user.is_superuser and request.user.role not in ('OWNER', 'MANAGER'):
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)
    removal = get_object_or_404(_removal_qs(request.user), pk=id)
    data = request.data

    try:
        if 'invoice_status' in data:
            new_status = data['invoice_status']

            if new_status == 'annulee':
                age_days = (timezone.now() - removal.date_register).days
                is_privileged = request.user.is_superuser or request.user.role == 'OWNER'

                if age_days > 7:
                    return Response(
                        {'error': 'Cette sortie date de plus de 7 jours. Veuillez créer un bon de retour à la place.'},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                if age_days > 2 and not is_privileged:
                    return Response(
                        {'error': 'Cette sortie date de plus de 2 jours. Veuillez contacter le propriétaire pour l\'annulation.'},
                        status=status.HTTP_403_FORBIDDEN,
                    )
                reason = data.get('cancellation_reason', '')
                removal = update_removal_status(removal, new_status, cancelled_by=request.user, cancellation_reason=reason)
            else:
                removal = update_removal_status(removal, new_status)

        allowed_fields = ['client_name']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        serializer = RemovalSerializer(removal, data=update_data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except ValueError as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_removal(request, id):
    if not request.user.is_superuser and request.user.role not in ('OWNER', 'MANAGER'):
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)
    removal = get_object_or_404(_removal_qs(request.user), pk=id)
    delete_removal_and_restore_stock(removal)
    return Response({'message': 'Sortie supprimee et stock restaure.'}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removals_by_product(request, product_id):
    removal_items = RemovalItem.objects.filter(product_id=product_id)
    removal_ids = removal_items.values_list('removal_id', flat=True).distinct()
    removals = _removal_qs(request.user).filter(id__in=removal_ids).order_by('-date_register')
    serializer = RemovalSerializer(removals, many=True)
    return JsonResponse(serializer.data, safe=False)