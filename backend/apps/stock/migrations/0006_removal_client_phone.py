from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('stock', '0005_cashsession_expense_session_fks'),
    ]

    operations = [
        migrations.AddField(
            model_name='removal',
            name='client_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='historicalremoval',
            name='client_phone',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
    ]