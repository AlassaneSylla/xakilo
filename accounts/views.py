from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import UserSerializer
from .models import User


##### User CRUD #####
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_users(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, id):
    try:
        user = User.objects.get(pk=id)
        if request.user != user and not request.user.is_staff:
            return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        serializer = UserSerializer(user)
        return Response(serializer.data)
    except:
        return Response({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
@permission_classes([IsAdminUser])
def post_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = User.objects.create_user(
            username = serializer.validated_data['username'],
            email = serializer.validated_data['email'],
            password = serializer.validated_data['password'],
            is_staff = serializer.validated_data.get('is_staff', False),
            is_superuser=serializer.validated_data.get('is_superuser', False)
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def patch_user(request, id):
    try: 
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)
    
    serializer = UserSerializer(user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_user(request, id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({"error": "user not found"}, status=status.HTTP_404_NOT_FOUND)
    
    user.delete()
    return Response({"message": "user deleted"}, status=status.HTTP_204_NO_CONTENT)

