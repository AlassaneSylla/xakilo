from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from stock.models.entry import Entry
from stock.serializers.entry_serializer import EntrySerializer
from stock.services.entry_service import adjust_product_stock_on_entry_delete, adjust_product_stock_on_entry_save


##### Entry CRUD #####
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries(request):
    """
    Get all entries
    """
    entries = Entry.objects.select_related('product').all().order_by('-date_register')
    serializer = EntrySerializer(entries, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entry(request, id):
    """
    Get juste one entry
    """
    try: 
        entry = Entry.objects.select_related('product').get(pk=id)
    except Entry.DoesNotExist:
        return Response({"error": "entry not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = EntrySerializer(entry)
    return Response(serializer.data, status=status.HTTP_200_OK)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_entry(request):
    serializer = EntrySerializer(data=request.data)
    if serializer.is_valid():
        entry = serializer.save(created_by=request.user)
        adjust_product_stock_on_entry_save(entry)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def patch_entry(request, id):
    entry = get_object_or_404(Entry, pk=id)
    old_quantity = entry.quantity
    old_product = entry.product

    serializer = EntrySerializer(entry, data=request.data, partial=True)
    if serializer.is_valid():
        entry = serializer.save(created_by=request.user)
        adjust_product_stock_on_entry_save(entry, old_quantity, old_product)
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_entry(request, id):
    entry = get_object_or_404(Entry, pk=id)
    adjust_product_stock_on_entry_delete(entry)
    entry.delete()
    return Response({"message": "entry deleted"}, status=status.HTTP_204_NO_CONTENT)


# recuperer les entress d'1 produit
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_entries_by_product(request, product_id):
    """
    GET toutes les entries liees a un produit donné
    """
    entries = Entry.objects.filter(product_id=product_id).order_by('-date_register')
    serializer = EntrySerializer(entries, many=True)
    return JsonResponse(serializer.data, safe=False)