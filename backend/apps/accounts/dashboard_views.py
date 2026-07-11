from datetime import date as _date

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, F, Value
from django.db.models.functions import ExtractMonth, ExtractYear, Coalesce

from apps.products.models import Product
from apps.stock.models.entry import Entry
from apps.stock.models.removal import Removal, RemovalItem


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_dashboard_stats(request):
    user  = request.user
    now   = timezone.now()
    today = now.date()
    year  = now.year
    month = now.month

    bid    = user.boutique_id
    prod_f = {'boutique_id': bid} if bid else {}
    ent_f  = {'boutique_id': bid} if bid else {}
    rem_f  = {'boutique_id': bid} if bid else {}

    # ── 4 KPIs — 4 requêtes COUNT/SUM ───────────────────────────────────────────
    total_products   = Product.objects.filter(**prod_f).count()
    entries_of_month = (
        Entry.objects
        .filter(date_register__year=year, date_register__month=month, **ent_f)
        .aggregate(t=Sum('quantity'))['t'] or 0
    )
    removals_of_day = Removal.objects.filter(date_register__date=today, **rem_f).count()
    low_stock_count = Product.objects.filter(stock__lte=F('alert'), **prod_f).count()

    # ── Graphique mensuel rolling 12 mois — 2 requêtes ──────────────────────────
    start_m = month - 11
    start_y = year
    if start_m <= 0:
        start_m += 12
        start_y -= 1
    start_date = _date(start_y, start_m, 1)

    # Liste ordonnée des 12 (année, mois) couverts
    months_list = []
    y, m = start_y, start_m
    for _ in range(12):
        months_list.append((y, m))
        m += 1
        if m > 12:
            m = 1
            y += 1

    ent_by_month = {
        (row['y'], row['m']): row['qty']
        for row in (
            Entry.objects.filter(date_register__gte=start_date, **ent_f)
            .values(y=ExtractYear('date_register'), m=ExtractMonth('date_register'))
            .annotate(qty=Sum('quantity'))
        )
    }

    rem_bout_f = {'removal__boutique_id': bid} if bid else {}
    rem_by_month = {
        (row['y'], row['m']): row['qty']
        for row in (
            RemovalItem.objects
            .filter(removal__date_register__gte=start_date, **rem_bout_f)
            .values(y=ExtractYear('removal__date_register'), m=ExtractMonth('removal__date_register'))
            .annotate(qty=Sum('quantity'))
        )
    }

    monthly_chart = [
        {
            'year':         y,
            'month':        m,
            'entries_qty':  ent_by_month.get((y, m), 0),
            'removals_qty': rem_by_month.get((y, m), 0),
        }
        for y, m in months_list
    ]

    # ── Camembert catégories — 1 requête ────────────────────────────────────────
    category_chart = list(
        Product.objects.filter(stock__gt=0, **prod_f)
        .values(name=Coalesce(F('category'), Value('Autres')))
        .annotate(value=Sum('stock'))
        .order_by('-value')
    )

    # ── 10 dernières transactions — 2 requêtes + merge Python ────────────────────
    recent_entries = list(
        Entry.objects.filter(**ent_f)
        .select_related('product', 'created_by')
        .order_by('-date_register')[:10]
    )
    recent_removals = list(
        Removal.objects.filter(**rem_f)
        .prefetch_related('items__product')
        .select_related('created_by')
        .order_by('-date_register')[:10]
    )

    transactions = []
    for e in recent_entries:
        transactions.append({
            'id':       f'e-{e.id}',
            'date':     e.date_register.isoformat(),
            'type':     'entry',
            'product':  e.product.product_name if e.product else f'Produit #{e.product_id}',
            'quantity': e.quantity,
            'user':     e.created_by.username if e.created_by else '—',
        })
    for r in recent_removals:
        items = list(r.items.all())
        transactions.append({
            'id':          f'r-{r.id}',
            'date':        r.date_register.isoformat() if r.date_register else '',
            'type':        'removal',
            'product':     items[0].product.product_name if items and items[0].product else '—',
            'quantity':    sum(i.quantity for i in items),
            'user':        r.created_by.username if r.created_by else '—',
            'destination': r.destination,
        })

    transactions.sort(key=lambda x: x['date'], reverse=True)

    return Response({
        'stats': {
            'total_products':   total_products,
            'entries_of_month': entries_of_month,
            'removals_of_day':  removals_of_day,
            'low_stock_count':  low_stock_count,
        },
        'monthly_chart':       monthly_chart,
        'category_chart':      category_chart,
        'recent_transactions': transactions[:10],
    })
