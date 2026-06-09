import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models
import django.db.models.functions


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
        ('stock', '0004_removal_justification_proof_image'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # ── CashSession ──────────────────────────────────────────────────────
        migrations.CreateModel(
            name='CashSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('status', models.CharField(choices=[('open', 'Ouverte'), ('closed', 'Clôturée')], default='open', max_length=10)),
                ('start_time', models.DateTimeField(auto_now_add=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('opening_balance', models.IntegerField(default=0)),
                ('closing_balance', models.IntegerField(blank=True, null=True)),
                ('expected_balance', models.IntegerField(blank=True, null=True)),
                ('boutique', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cash_sessions', to='accounts.boutique')),
                ('opened_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='sessions_opened', to=settings.AUTH_USER_MODEL)),
            ],
            options={'db_table': 'cash_sessions'},
        ),
        migrations.AddConstraint(
            model_name='cashsession',
            constraint=models.UniqueConstraint(
                condition=models.Q(status='open'),
                fields=['boutique'],
                name='one_open_session_per_boutique',
            ),
        ),

        # ── Expense ──────────────────────────────────────────────────────────
        migrations.CreateModel(
            name='Expense',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('amount', models.IntegerField()),
                ('description', models.CharField(max_length=200)),
                ('payment_mode', models.CharField(choices=[('especes', 'Espèces'), ('mobile_money', 'Mobile Money')], default='especes', max_length=20)),
                ('date_register', models.DateTimeField(auto_now_add=True)),
                ('boutique', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='expenses', to='accounts.boutique')),
                ('cash_session', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='expenses', to='stock.cashsession')),
                ('declared_by', models.ForeignKey(null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='expenses_declared', to=settings.AUTH_USER_MODEL)),
            ],
            options={'db_table': 'expenses'},
        ),

        # ── FK cash_session sur Removal ──────────────────────────────────────
        migrations.AddField(
            model_name='removal',
            name='cash_session',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='removals', to='stock.cashsession'),
        ),
        migrations.AddField(
            model_name='historicalremoval',
            name='cash_session',
            field=models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='stock.cashsession'),
        ),

        # ── FK cash_session sur Entry ────────────────────────────────────────
        migrations.AddField(
            model_name='entry',
            name='cash_session',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='entries', to='stock.cashsession'),
        ),
        migrations.AddField(
            model_name='historicalentry',
            name='cash_session',
            field=models.ForeignKey(blank=True, db_constraint=False, null=True, on_delete=django.db.models.deletion.DO_NOTHING, related_name='+', to='stock.cashsession'),
        ),
    ]