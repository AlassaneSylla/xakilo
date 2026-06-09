from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from apps.stock.models.removal import Removal
from apps.stock.models.payment import Payment
from apps.stock.serializers.payment_serializer import PaymentSerializer
from apps.stock.serializers.removal_serializer import RemovalSerializer


def _removal_qs(user):
    if user.boutique_id:
        return Removal.objects.filter(boutique_id=user.boutique_id)
    return Removal.objects.all()


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_payment(request, removal_id):
    """
    Enregistre un règlement sur une facture.
    Met à jour automatiquement le statut de la facture.
    Accessible à tous les rôles (OWNER, MANAGER, EMPLOYEE).
    """
    removal = get_object_or_404(
        _removal_qs(request.user),
        pk=removal_id,
        destination='vente',
    )

    if removal.invoice_status == 'annulee':
        return Response(
            {'error': 'Impossible d\'encaisser une facture annulée.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if removal.invoice_status == 'payee':
        return Response(
            {'error': 'Cette facture est déjà soldée.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    # Vérification session active (OWNER et superuser exemptés)
    user = request.user
    if user.role not in ('OWNER',) and not user.is_superuser and user.boutique_id:
        from apps.stock.models.session import CashSession
        if not CashSession.objects.filter(boutique_id=user.boutique_id, status='open').exists():
            return Response(
                {'error': 'Aucune session de caisse ouverte. Ouvrez une session avant d\'encaisser.'},
                status=status.HTTP_403_FORBIDDEN,
            )

    serializer = PaymentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    serializer.save(removal=removal, received_by=request.user)

    # Recalcul depuis la DB (bypass tout cache prefetch)
    amount_paid = Payment.objects.filter(removal=removal).aggregate(t=Sum('amount'))['t'] or 0
    total       = removal.invoice_total_amount or 0

    if amount_paid >= total and total > 0:
        removal.invoice_status = 'payee'
    elif amount_paid > 0:
        removal.invoice_status = 'partiellement_payee'
    else:
        removal.invoice_status = 'en_attente'

    removal.save(update_fields=['invoice_status'])

    # Re-fetch propre pour inclure les nouveaux paiements dans la sérialisation
    fresh = Removal.objects.prefetch_related('payments', 'items__product').get(pk=removal.pk)
    return Response(
        RemovalSerializer(fresh).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_payments(request, removal_id):
    """Liste les règlements d'une facture."""
    removal = get_object_or_404(_removal_qs(request.user), pk=removal_id)
    payments = Payment.objects.filter(removal=removal).select_related('received_by')
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)