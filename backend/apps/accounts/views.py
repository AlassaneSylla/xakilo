from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import UserSerializer, BoutiqueSerializer
from .models import User, Boutique
from .permissions import IsSuperUser, MAX_USERS_PER_BOUTIQUE


# ── Helpers ──────────────────────────────────────────────────────────────────

def _is_same_boutique_owner(requester, target_boutique_id):
    return requester.role == 'OWNER' and requester.boutique_id == target_boutique_id


# ── Me ───────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_me(request):
    return Response(UserSerializer(request.user, context={'request': request}).data)


# ── Boutiques (création réservée au superuser) ────────────────────────────────

@api_view(['GET'])
@permission_classes([IsSuperUser])
def get_boutiques(request):
    serializer = BoutiqueSerializer(Boutique.objects.all(), many=True, context={'request': request})
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsSuperUser])
def post_boutique(request):
    serializer = BoutiqueSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_boutique(request, id):
    try:
        boutique = Boutique.objects.get(pk=id)
    except Boutique.DoesNotExist:
        return Response({'error': 'not found'}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_superuser and request.user.boutique_id != id:
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

    return Response(BoutiqueSerializer(boutique, context={'request': request}).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def patch_boutique(request, id):
    try:
        boutique = Boutique.objects.get(pk=id)
    except Boutique.DoesNotExist:
        return Response({'error': 'not found'}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_superuser and not _is_same_boutique_owner(request.user, id):
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

    serializer = BoutiqueSerializer(boutique, data=request.data, partial=True, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['DELETE'])
@permission_classes([IsSuperUser])
def delete_boutique(request, id):
    try:
        boutique = Boutique.objects.get(pk=id)
    except Boutique.DoesNotExist:
        return Response({'error': 'not found'}, status=status.HTTP_404_NOT_FOUND)
    boutique.delete()
    return Response({'message': 'boutique deleted'}, status=status.HTTP_204_NO_CONTENT)


# ── Users ─────────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    if request.user.is_superuser:
        users = User.objects.all()
    elif request.user.role == 'OWNER':
        users = User.objects.filter(boutique=request.user.boutique)
    else:
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)
    return Response(UserSerializer(users, many=True).data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request, id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

    if request.user != user and not request.user.is_superuser and not _is_same_boutique_owner(request.user, user.boutique_id):
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

    return Response(UserSerializer(user).data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_user(request):
    if not request.user.is_superuser and request.user.role != 'OWNER':
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

    # Vérification limite boutique pour le owner
    if request.user.role == 'OWNER' and request.user.boutique_id:
        if request.user.boutique.users.count() >= MAX_USERS_PER_BOUTIQUE:
            return Response(
                {'error': f'Limite de {MAX_USERS_PER_BOUTIQUE} utilisateurs par boutique atteinte.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        boutique = (
            request.user.boutique if not request.user.is_superuser
            else serializer.validated_data.get('boutique')
        )
        user = User.objects.create_user(
            username=serializer.validated_data['username'],
            email=serializer.validated_data['email'],
            password=serializer.validated_data['password'],
            first_name=serializer.validated_data.get('first_name', ''),
            last_name=serializer.validated_data.get('last_name', ''),
            role=serializer.validated_data.get('role', 'EMPLOYEE'),
            boutique=boutique,
            is_staff=serializer.validated_data.get('is_staff', False),
        )
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def patch_user(request, id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

    is_self  = request.user.pk == user.pk
    is_owner = _is_same_boutique_owner(request.user, user.boutique_id)

    if not request.user.is_superuser and not is_owner and not is_self:
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

    # Un utilisateur non-owner ne peut modifier que son propre mot de passe
    if is_self and not is_owner and not request.user.is_superuser:
        extra_fields = {k for k in request.data.keys() if k != 'password'}
        if extra_fields:
            return Response(
                {'error': 'Vous pouvez uniquement modifier votre mot de passe.'},
                status=status.HTTP_403_FORBIDDEN,
            )

    data = request.data.copy()
    new_password = data.pop('password', None)

    if data:
        serializer = UserSerializer(user, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()

    if new_password:
        user.set_password(new_password)
        user.save(update_fields=['password'])

    return Response(UserSerializer(user).data, status=status.HTTP_202_ACCEPTED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, id):
    try:
        user = User.objects.get(pk=id)
    except User.DoesNotExist:
        return Response({'error': 'user not found'}, status=status.HTTP_404_NOT_FOUND)

    if not request.user.is_superuser and not _is_same_boutique_owner(request.user, user.boutique_id):
        return Response({'error': 'forbidden'}, status=status.HTTP_403_FORBIDDEN)

    if request.user == user:
        return Response({'error': 'Vous ne pouvez pas supprimer votre propre compte.'}, status=status.HTTP_400_BAD_REQUEST)

    user.delete()
    return Response({'message': 'user deleted'}, status=status.HTTP_204_NO_CONTENT)