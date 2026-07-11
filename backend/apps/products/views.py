from django.db.models import F, OuterRef, Subquery
from django.shortcuts import get_object_or_404
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Product
from apps.stock.models.entry import Entry
from .serializers import ProductSerializer


class _ProductPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 200

    def paginate_queryset(self, queryset, request, view=None):
        if 'page' not in request.query_params:
            return None
        return super().paginate_queryset(queryset, request, view)


def _product_qs(user):
    if user.boutique_id:
        return Product.objects.filter(boutique_id=user.boutique_id)
    return Product.objects.all()


def _annotate_last_entry(qs):
    last_entry_qs = Entry.objects.filter(product=OuterRef('pk')).order_by('-date_register')
    return qs.annotate(
        _last_supplier=Subquery(last_entry_qs.values('supplier')[:1]),
        _last_entry_date=Subquery(last_entry_qs.values('date_register')[:1]),
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_products(request):
    search = request.query_params.get('search', '').strip()
    low_stock_only = request.query_params.get('low_stock_only') == 'true'

    qs = _annotate_last_entry(_product_qs(request.user)).order_by('-id')
    if search:
        qs = qs.filter(product_name__icontains=search)
    if low_stock_only:
        qs = qs.filter(stock__lte=F('alert'))

    paginator = _ProductPagination()
    page = paginator.paginate_queryset(qs, request)
    if page is not None:
        return paginator.get_paginated_response(ProductSerializer(page, many=True).data)
    return Response(ProductSerializer(qs, many=True).data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_product(request, id):
    try:
        product = _product_qs(request.user).get(pk=id)
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
        serializer.save(created_by=request.user, boutique=request.user.boutique)
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
@permission_classes([IsAuthenticated])
def delete_product(request, id):
    if not request.user.is_superuser and request.user.role not in ('OWNER', 'MANAGER'):
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)
    product = get_object_or_404(_product_qs(request.user), pk=id)
    product.delete()
    return Response({"message": "produit supprime"}, status=status.HTTP_204_NO_CONTENT)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_product(request):
    qs = _product_qs(request.user).filter(stock__lte=F('alert'))

    # Sans ?page : réponse rapide count-only (badge, provider) — 1 seule requête COUNT
    if 'page' not in request.query_params:
        return Response({"count": qs.count(), "products": []})

    # Avec ?page : liste paginée avec annotations complètes (AlertsPage)
    annotated_qs = _annotate_last_entry(qs).order_by('stock')
    paginator = _ProductPagination()
    page_data = paginator.paginate_queryset(annotated_qs, request)
    return paginator.get_paginated_response(ProductSerializer(page_data, many=True).data)
