import django.core.validators
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0003_add_payment_model_and_removal_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='removal',
            name='justification',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='removal',
            name='proof_image',
            field=models.ImageField(blank=True, null=True, upload_to='loss_proofs/'),
        ),
        migrations.AddField(
            model_name='historicalremoval',
            name='justification',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='historicalremoval',
            name='proof_image',
            field=models.TextField(blank=True, max_length=100, null=True),
        ),
    ]