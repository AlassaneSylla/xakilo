from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from accounts.models import User
from .models import InvoiceCancellationLog, Invoice, InvoiceItems
from .serializers import InvoiceSerializer, InvoiceItemsSerializer


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

@api_view(['POST'])
def canceled_invoice(request, id):
    try:
        invoice = Invoice.objects.get(pk=id)
    except Invoice.DoesNotExist:
        return Response({"error": "invoice not found"}, status=status.HTTP_404_NOT_FOUND)

    if invoice.payment_status == 'Annulée':
        return Response({"message": "This invoice is already canceled."}, status=status.HTTP_400_BAD_REQUEST)

    reason = request.data.get("reason")
    if not reason:
        return Response({"error": "Please provide a cancellation reason."}, status=status.HTTP_400_BAD_REQUEST)

    user_id = request.data.get("cancelled_by")
    user = None
    if user_id:
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    # Mise à jour du statut
    invoice.payment_status = 'Annulée'
    invoice.save()

    # Enregistrement du log
    InvoiceCancellationLog.objects.create(
        invoice=invoice,
        cancelled_by=user,
        reason=reason
    )

    return Response({
        "message": "Facture annulée avec succès.",
        "invoice_id": invoice.id,
        "cancelled_by": user.username if user else None,
        "reason": reason
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def get_cancellations(request):
    logs = InvoiceCancellationLog.objects.all().select_related('invoice', 'cancelled_by').order_by('-cancelled_at')
    data = [
        {
            "invoice_id": log.invoice.id,
            "invoice_number": log.invoice.invoice_number,
            "cancelled_by": log.cancelled_by.username if log.cancelled_by else None,
            "reason": log.reason,
            "cancelled_at": log.cancelled_at
        }
        for log in logs
    ]
    return Response(data)


###### invoicesItems ######
@api_view(['GET'])
def get_invoices_items(request):
    invoicesItems = InvoiceItems.objects.all()
    serializer = InvoiceItemsSerializer(invoicesItems, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_invoice_item(request, id):
    try:
        invoice_item = InvoiceItems.objects.get(pk=id)
        serializer = InvoiceItemsSerializer(invoice_item)
        return Response(serializer.data)
    except:
        return Response({"error": "item not found"}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['POST'])
def post_invoice_item(request):
    serializer = InvoiceItemsSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['PATCH'])
def patch_invoice_item(request, id):
    invoice = InvoiceItems.objects.get(pk=id)
    serializer = InvoiceItemsSerializer(invoice, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_202_ACCEPTED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_invoice_item(request, id):
    try:
        invoice_item = InvoiceItems.objects.get(pk=id)
    except InvoiceItems.DoesNotExist:
        return Response({"error": "invoice item not found"}, status=status.HTTP_404_NOT_FOUND)
    invoice_item.delete()
    return Response({"message": "invoice item deleted"}, status=status.HTTP_204_NO_CONTENT)

