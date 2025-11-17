from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from stock.models.removal import Removal, RemovalItem
from products.models import Product
from stock.serializers.removal_serializer import RemovalSerializer
from stock.services.removal_service import create_removal_with_items, delete_removal_and_restore_stock, update_removal_status


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removals(request):
    removals = Removal.objects.prefetch_related('items', 'items__product').order_by('-date_register')
    serializer = RemovalSerializer(removals, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removal(request, id):
    removal = get_object_or_404(Removal.objects.prefetch_related('items__product'), pk=id)
    serializer = RemovalSerializer(removal)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
# @transaction.atomic
def post_removal(request):
    """
    Crée une sortie de stock (vente / don / perte)
    """
    data = request.data
    user = request.user
    items = data.get('items', [])
    removal_data = {k: v for k, v in data.items() if k != "items"}

    try:
        removal = create_removal_with_items(user, removal_data, items)
    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    serializer = RemovalSerializer(removal)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
# @transaction.atomic
def patch_removal(request, id):
    """
    Met à jour le statut ou les champs autorisés d’un Removal
    """
    removal = get_object_or_404(Removal, pk=id)
    data = request.data

    try:
        # Si un nouveau statut est envoyé
        if 'invoice_status' in data:
            removal = update_removal_status(removal, data['invoice_status'])
    
    # Mise à jour des autres champs autorisés
        allowed_fields = ['client_name']
        update_data = {k: v for k, v in data.items() if k in allowed_fields}
        serializer = RemovalSerializer(removal, data=update_data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    except ValueError as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_removal(request, id):
    """
    Supprime un Removal et restaure le stock.
    (Admins uniquement)
    """
    removal = get_object_or_404(Removal, pk=id)
    delete_removal_and_restore_stock(removal)
    return Response({"message": "Sortie supprimée et stock restauré."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removals_by_product(request, product_id):
    """
    Récupère toutes les sorties liées à un produit donné.
    """
    removal_items = RemovalItem.objects.filter(product_id=product_id)
    removal_ids = removal_items.values_list('removal_id', flat=True).distinct()

    removals = Removal.objects.filter(id__in=removal_ids).order_by('-date_register')
    serializer = RemovalSerializer(removals, many=True)
    return JsonResponse(serializer.data, safe=False)
