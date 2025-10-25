from django.db import models


class Product(models.Model):
    product_name = models.CharField(max_length=100)
    category = models.CharField(max_length=50, blank=True, null=True)
    product_ref = models.CharField(unique=True, max_length=20)
    stock = models.IntegerField(default=0)
    unit_price = models.DecimalField(max_digits=12, decimal_places=0, blank=True, null=True)
    purchase_price = models.DecimalField(max_digits=12, decimal_places=0, blank=True, null=True)
    alert = models.IntegerField(default=10)

    class Meta:
        db_table = 'products'

    def __str__(self):
        return self.product_name