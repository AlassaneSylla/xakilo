from datetime import timezone
from django.db import models


class Entry(models.Model):
    product = models.ForeignKey(
        'products.Product', 
        db_column='product_id', 
        on_delete=models.SET_NULL,
        blank=True, 
        null=True, 
        related_name= 'entries'
    )
    date_register = models.DateTimeField(auto_now_add=True)
    quantity = models.IntegerField()
    supplier = models.CharField(max_length=100, blank=True, null=True)
    entry_reference = models.CharField(max_length=20, blank=True, null=True)
    category = models.CharField(max_length=100, blank=True, null=True)
    created_by = models.ForeignKey(
        'accounts.User', 
        db_column='created_by_id', 
        blank=True, 
        on_delete=models.SET_NULL, 
        null=True,
        related_name= 'entries_created'
    )

    class Meta:
        managed = True
        db_table = 'entries'

    def save(self, *args, **kwargs):
        if not self.entry_reference:  
            year = timezone.now().year
            count = Entry.objects.filter(date_register__year=year).count() + 1
            self.reference = f"entry-{year}-{count:04d}"
        super().save(*args, **kwargs)


class Removal(models.Model):
    DESTINATION_CHOICES = [ ('vente', 'Vente'), ('don', 'Don'), ('perte', 'Perte') ]

    product = models.ForeignKey(
        'products.Product',
        on_delete=models.SET_NULL,
        db_column='product_id',
        null=True,
        blank=True,
        related_name='removals'
    )
    date_register = models.DateTimeField(auto_now_add=True)
    quantity = models.PositiveIntegerField()
    client_name = models.CharField(max_length=100, blank=True, null=True)
    destination = models.CharField(max_length=20, choices=DESTINATION_CHOICES)
    removal_ref = models.CharField(max_length=30, unique=True)
    created_by = models.ForeignKey(
        'accounts.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='removals_created'
    )
    invoice = models.ForeignKey(
        'billing.Invoice',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='removals_invoiced'
    )

    class Meta:
        db_table = 'removals'

    def save(self, *args, **kwargs):
        if not self.removal_ref:
            today = timezone.now().strftime("%Y%m%d")
            last_id = Removal.objects.count() + 1
            self.removal_ref = f"rem-{today}-{last_id:04d}"
        super().save(*args, **kwargs)



class RemovalItem(models.Model):
    removal = models.ForeignKey(
        Removal,
        on_delete=models.CASCADE,
        related_name='items'
    )
    product = models.ForeignKey('products.Product', on_delete=models.SET_NULL, null=True)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=12, decimal_places=0, null=True, blank=True)

    class Meta:
        db_table = 'removal_items'

    def save(self, *args, **kwargs):
        # get product price
        if not self.unit_price and self.product:
            self.unit_price = self.product.unit_price
        super().save(*args, **kwargs)

    @property
    def total_price(self):
        return self.unit_price * self.quantity if self.unit_price else 0


