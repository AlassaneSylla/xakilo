from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from apps.stock.models.session import CashSession
from apps.stock.models.expense import Expense
from apps.stock.serializers.session_serializer import (
    CashSessionSerializer, CashSessionSummarySerializer, ExpenseSerializer,
)


def _session_qs(user):
    if user.boutique_id:
        return CashSession.objects.filter(boutique_id=user.boutique_id)
    return CashSession.objects.all()


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_session(request):
    session = _session_qs(request.user).filter(status='open').first()
    if not session:
        return Response({'session': None}, status=status.HTTP_200_OK)
    serializer = CashSessionSummarySerializer(session)
    return Response({'session': serializer.data}, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def open_session(request):
    user = request.user
    if user.role == 'OWNER' or user.is_superuser:
        return Response(
            {'error': 'Le propriétaire n\'a pas besoin d\'ouvrir une session.'},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not user.boutique_id:
        return Response({'error': 'Aucune boutique associée à ce compte.'}, status=status.HTTP_400_BAD_REQUEST)

    if _session_qs(user).filter(status='open').exists():
        return Response({'error': 'Une session est déjà ouverte pour cette boutique.'}, status=status.HTTP_400_BAD_REQUEST)

    opening_balance = int(request.data.get('opening_balance', 0))
    session = CashSession.objects.create(
        boutique_id=user.boutique_id,
        opened_by=user,
        opening_balance=opening_balance,
        status='open',
    )
    serializer = CashSessionSummarySerializer(session)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def close_session(request):
    user    = request.user
    session = _session_qs(user).filter(status='open').first()
    if not session:
        return Response({'error': 'Aucune session ouverte à clôturer.'}, status=status.HTTP_400_BAD_REQUEST)

    closing_balance = request.data.get('closing_balance')
    if closing_balance is None:
        return Response({'error': 'Le montant de clôture est obligatoire.'}, status=status.HTTP_400_BAD_REQUEST)

    expected = session.compute_expected_balance()
    session.closing_balance  = int(closing_balance)
    session.expected_balance = expected
    session.status           = 'closed'
    session.end_time         = timezone.now()
    session.save(update_fields=['closing_balance', 'expected_balance', 'status', 'end_time'])

    serializer = CashSessionSerializer(session)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_session_history(request):
    if request.user.role not in ('OWNER',) and not request.user.is_superuser:
        return Response({'error': 'Accès réservé au propriétaire.'}, status=status.HTTP_403_FORBIDDEN)
    sessions = _session_qs(request.user).order_by('-start_time')
    serializer = CashSessionSummarySerializer(sessions, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_expense(request):
    user    = request.user
    session = None

    if user.role not in ('OWNER',) and not user.is_superuser:
        session = _session_qs(user).filter(status='open').first()
        if not session:
            return Response(
                {'error': 'Aucune session ouverte. Ouvrez une session avant de déclarer une dépense.'},
                status=status.HTTP_403_FORBIDDEN,
            )

    amount      = request.data.get('amount')
    description = request.data.get('description', '').strip()
    mode        = request.data.get('payment_mode', 'especes')

    if not amount or not description:
        return Response({'error': 'Montant et description sont obligatoires.'}, status=status.HTTP_400_BAD_REQUEST)

    expense = Expense.objects.create(
        cash_session=session,
        declared_by=user,
        boutique_id=user.boutique_id,
        amount=int(amount),
        description=description,
        payment_mode=mode,
    )
    return Response(ExpenseSerializer(expense).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_expenses(request):
    qs = Expense.objects.filter(boutique_id=request.user.boutique_id).order_by('-date_register')
    session_id = request.query_params.get('session')
    if session_id:
        qs = qs.filter(cash_session_id=session_id)
    serializer = ExpenseSerializer(qs, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)