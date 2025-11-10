from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import models
from yaml import serialize

from .models import Product
from .serializers import ProductSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_products(request):
    """
    Get all product
    """
    products = Product.objects.all().order_by('-id') # "-" devant donne le plus recent 
    serializer = ProductSerializer(products, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_product(request, id):
    """
    Get juste one product
    """
    try: 
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist:
        return Response({"error": "product not found"}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = ProductSerializer(product)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_product(request):
    """
    Add a new product
    """
    serializer = ProductSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def patch_product(request, id):
    """
    Update product information
    """
    product = get_object_or_404(Product, pk=id)
    serializer = ProductSerializer(product, data=request.data, partial=True)

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_product(request, id):
    """
    Remove the product. 
    Only the Admin can do that
    """
    product = get_object_or_404(Product, pk=id)
    product.delete()
    return Response({"message": "produit supprime"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_product(request):
    """
    Retourne les produits dont le stock est faible
    """
    low_stock = Product.objects.filter(stock__lte=models.F('alert')).order_by('stock')
    serializer = ProductSerializer(low_stock, many=True)
    return Response({
        "count": low_stock.count(),
        "products": serializer.data
    })
