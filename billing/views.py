from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Invoice
from .serializers import InvoiceSerializer


##### invoice CRUD #####
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_invoices(request):
    """
    Get all the invoices
    """
    invoices = Invoice.objects.select_related('removal').prefetch_related('items_products').all()
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_invoice(request, id):
    """
    Get juste one invoice
    """
    try: 
        invoice = Invoice.objects.select_related('removal').prefetch_related('items_products').get(pk=id)
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data, status=status.HTTP_200_OK)
    except:
        return Response({"error": "invoice not found"}, status=status.HTTP_404_NOT_FOUND)
  

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def post_invoice(request):
    """
    new invoice
    creted_by : permit to get the user
    """
    serializer = InvoiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(created_by=request.user) 
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



