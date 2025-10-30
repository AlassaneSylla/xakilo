from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone

from stock.models.removal import Removal, RemovalItem
from products.models import Product
from stock.serializers.removal_serializer import RemovalSerializer



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removals(request):
    removals = Removal.objects.prefetch_related('items', 'items__product').all().order_by('date_register')
    serializer = RemovalSerializer(removals, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removal(request, id):
    """
    Get one removal
    """
    removal = get_object_or_404(Removal.objects.prefetch_related('items__product'), pk=id)
    serializer = RemovalSerializer(removal)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_removal(request):
    """
    Créer un nouveau removal (sortie de stock)
    Si c'est une vente la facture est générée automatiquement
    """
    data = request.data
    user = request.user

    # destination validation
    destination = data.get('destination')
    if destination not in ['vente', 'don', 'perte']:
        return Response({"error": "destination invalide"}, status=status.HTTP_400_BAD_REQUEST)

    # validate items
    items_data = data.get('items', [])
    if not items_data:
        return Response({"error": "aucun produit fourni"}, status=status.HTTP_400_BAD_REQUEST)

    invoice_status = data.get('invoice_status', 'payee')

    # for removal
    removal = Removal.objects.create(
        client_name=data.get('client_name'),
        destination=destination,
        created_by=user,
        invoice_status=invoice_status 
    )

    total_amount = 0

    # add product
    for item in items_data:
        product_id = item.get('product')
        quantity = item.get('quantity', 0)

        try:
            product = Product.objects.get(id=product_id)
        except Product.DoesNotExist:
            return Response(
                {"error": f"produit avec id {product_id} introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        if product.stock < quantity:
            return Response(
                {"error": f"stock insuffisant pour {product.product_name}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # create item
        RemovalItem.objects.create(
            removal=removal,
            product=product,
            quantity=quantity,
            unit_price=product.unit_price
        )

        # décrémentation du stock
        product.stock -= quantity
        product.save()

        total_amount += quantity * product.unit_price

    # invoice udated
    if destination == 'vente':
        removal.invoice_total_amount = total_amount
        removal.invoice_date_created = timezone.now()
        removal.save()

    serializer = RemovalSerializer(removal)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def patch_removal(request, id):
    """
    Met à jour un Removal (sortie de stock / facture)
    """
    removal = get_object_or_404(Removal, pk=id)
    data = request.data

    # Vérifier si la facture est déjà payée ou annulée
    if removal.invoice_status in ['payee', 'annulee']:
        return Response(
            {"error": "Impossible de modifier une facture déjà payée ou annulée."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Champs autorisés pour la modification
    allowed_fields = ['client_name', 'invoice_status']
    update_data = {field: data[field] for field in data if field in allowed_fields}

    # Gestion du changement de statut
    new_status = update_data.get('invoice_status')
    if new_status:
        if new_status == 'payee':
            removal.invoice_status = 'payee'
            removal.invoice_date_created = removal.invoice_date_created or timezone.now()
        elif new_status == 'annulee':
            removal.invoice_status = 'annulee'
            for item in removal.items.all():
                product = item.product
                product.stock += item.quantity
                product.save()
    
        update_data.pop('invoice_status')

    # maj des champs envoyes
    serializer = RemovalSerializer(removal, data=update_data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_removal(request, id):
    """
    Delete an removal by an admin only
    """
    removal = get_object_or_404(Removal, pk=id)
    removal.delete()
    return Response({"message": 'removal was deleted'}, status=status.HTTP_204_NO_CONTENT)
    
