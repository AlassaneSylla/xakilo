from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Invoice
from .serializers import InvoiceSerializer


##### invoice CRUD #####
@api_view(['GET'])
def get_invoices(request):
    invoices = Invoice.objects.all()
    serializer = InvoiceSerializer(invoices, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_invoice(request, id):
    try: 
        invoice = Invoice.objects.get(pk=id)
        serializer = InvoiceSerializer(invoice)
        return Response(serializer.data)
    except:
        return Response({"error": "invoice not found"}, status=status.HTTP_404_NOT_FOUND)
  
@api_view(['POST'])
def post_invoice(request):
    serializer = InvoiceSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

