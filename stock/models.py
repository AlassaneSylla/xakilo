from django.db import models


class Entry(models.Model):
    product = models.ForeignKey('products.Product', db_column='product_id', blank=True, null=True, on_delete=models.SET_NULL)
    date_register = models.DateTimeField()
    quantity = models.IntegerField()
    supplier = models.CharField(max_length=100, blank=True, null=True)
    reference = models.CharField(max_length=20, blank=True, null=True)
    created_by = models.ForeignKey('accounts.User', db_column='created_by', blank=True, on_delete=models.SET_NULL, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'entries'


class Removal(models.Model):
    product = models.ForeignKey('products.Product', on_delete=models.CASCADE)
    date_register = models.DateTimeField()
    quantity = models.IntegerField()
    supplier = models.CharField(max_length=100, blank=True, null=True)
    destination = models.CharField(max_length=20)
    reference = models.CharField(max_length=20, blank=True, null=True)
    created_by = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, blank=True, null=True)
    invoice = models.ForeignKey('billing.Invoice', on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        managed = False
        db_table = 'removals'