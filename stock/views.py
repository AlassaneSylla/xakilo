from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Entry, Removal
from .serializers import RemovalSerializer, EntrySerializer


##### Entry CRUD #####
@api_view(['GET'])
def get_entries(request):
    entries = Entry.objects.select_related('product').all()
    serializer = EntrySerializer(entries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_entry(request, id):
    try: 
        entry = Entry.objects.select_related('product').get(pk=id)
        serializer = EntrySerializer(entry)
        return Response(serializer.data)
    except:
        return Response({"error": "entry not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_entry(request):
    serializer = EntrySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user) #enregistrer le user connecte
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def patch_entry(request, id):
    product = Entry.objects.get(pk=id)
    serializer = EntrySerializer(product, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save() 
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_entry(request, id):
    try:
        product = Entry.objects.get(pk=id)
    except Entry.DoesNotExist:
        return Response({"error": "entry not found"}, status=status.HTTP_404_NOT_FOUND)
    product.delete()
    return Response({"message": "entry deleted"}, status=status.HTTP_204_NO_CONTENT)


##### removals crud #####
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removals(request):
    removals = Removal.objects.prefetch_related('items', 'product', 'invoice').all()
    serializer = RemovalSerializer(removals, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_removal(request, id):
    try:
        removal = Removal.objects.prefetch_related('items', 'product', 'invoice').get(pk=id)
    except Removal.DoesNotExist:
        return Response({"error": "removal not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = RemovalSerializer(removal)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_removal(request):
    data = request.data.copy()
    data['created_by'] = request.user.id
    serializer = RemovalSerializer(data=data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
def path_removal(request, id):
    removal = Removal.objects.get(pk=id)
    serializer = RemovalSerializer(removal, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
@api_view(['DELETE'])
def delete_removal(request, id):
    try:
        removal = Removal.objects.get(pk=id)
    except Removal.DoesNotExist:
        return Response({"error": 'removal not found'}, status=status.HTTP_404_NOT_FOUND)
    removal.delete()
    return Response({"message": 'removal was deleted'}, status=status.HTTP_204_NO_CONTENT)
    
