from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Entry, Removal
from .serializers import RemovalSerializer, EntrySerializer


##### Entry CRUD #####
@api_view(['GET'])
def get_entries(request):
    entries = Entry.objects.all()
    serializer = EntrySerializer(entries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_entry(request, id):
    try: 
        entry = Entry.objects.get(pk=id)
        serializer = EntrySerializer(entry)
        return Response(serializer.data)
    except:
        return Response({"error": "entry not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def post_entry(request):
    serializer = EntrySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
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


##### removal crud #####
@api_view(['GET'])
def get_removals(request):
    removals = Removal.objects.all()
    serializer = RemovalSerializer(removals, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_removal(request, id):
    try:
        removal = Removal.objects.get(pk=id)
        serializer = RemovalSerializer(removal)
        return Response(serializer.data)
    except:
        return Response({"error": 'removal not found'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def post_removal(request):
    serializer = RemovalSerializer(data=request.data)
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
    
