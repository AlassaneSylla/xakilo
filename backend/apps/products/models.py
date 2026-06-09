from django.conf import settings
from django.db import models


class Product(models.Model):
    CATEGORY_CHOICES = [
        ('electronique', 'Électronique'),
        ('meublier',     'Meublier'),
        ('informatique', 'Informatique'),
    ]
    product_name    = models.CharField(max_length=100)
    category        = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    product_ref     = models.CharField(unique=True, max_length=20)
    stock           = models.IntegerField(default=0)
    unit_price      = models.DecimalField(max_digits=12, decimal_places=0, blank=True, null=True)
    purchase_price  = models.DecimalField(max_digits=12, decimal_places=0, blank=True, null=True)
    alert           = models.IntegerField(default=10)
    boutique = models.ForeignKey(
        'accounts.Boutique',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='products',
    )
    created_by      = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='products_created',
    )

    class Meta:
        db_table = 'products'

    def save(self, *args, **kwargs):
        if not self.product_ref:
            last_product = Product.objects.order_by('-id').first()
            count = (last_product.id + 1) if last_product else 1
            self.product_ref = f"PROD-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.product_name