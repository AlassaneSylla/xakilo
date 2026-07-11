from datetime import date, timedelta

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Sum, F, Value, Subquery, OuterRef, ExpressionWrapper, IntegerField, Count
from django.db.models.functions import ExtractMonth, ExtractWeek, Coalesce

from django.core.cache import cache


def _cache_get(key):
    try:
        return cache.get(key)
    except Exception:
        return None


def _cache_set(key, value, timeout):
    try:
        cache.set(key, value, timeout=timeout)
    except Exception:
        pass

from apps.stock.models.removal import Removal, RemovalItem
from apps.stock.models.entry   import Entry
from apps.stock.models.expense import Expense
from apps.stock.models.payment import Payment
from apps.products.models      import Product

REPORTS_CACHE_TTL = 5 * 60  # 5 minutes


# ── Helpers ─────────────────────────────────────────────────────────────────────

def _removals_qs(user):
    qs = Removal.objects.all()
    if user.boutique_id:
        qs = qs.filter(boutique_id=user.boutique_id)
    return qs


def _entries_qs(user):
    qs = Entry.objects.all()
    if user.boutique_id:
        qs = qs.filter(boutique_id=user.boutique_id)
    return qs


def _products_qs(user):
    qs = Product.objects.all()
    if user.boutique_id:
        qs = qs.filter(boutique_id=user.boutique_id)
    return qs


def _parse_date_params(request):
    raw_from = request.query_params.get('date_from')
    raw_to   = request.query_params.get('date_to')
    try:
        d_from = date.fromisoformat(raw_from) if raw_from else None
        d_to   = date.fromisoformat(raw_to)   if raw_to   else None
    except ValueError:
        return None, None
    return d_from, d_to


def _item_cost_expr():
    """Prix d'achat × quantité, avec fallback sur le prix d'achat du produit."""
    pp = Coalesce(F('purchase_price'), F('product__purchase_price'), Value(0, output_field=IntegerField()))
    return ExpressionWrapper(pp * F('quantity'), output_field=IntegerField())


# ── Résumé financier ─────────────────────────────────────────────────────────────

def _financial_summary(sales_qs, losses_qs, boutique_id=None, date_from=None, date_to=None):
    # Montant total facturé (somme des invoice_total_amount)
    ventes_totales = sales_qs.aggregate(
        t=Sum(Coalesce(F('invoice_total_amount'), Value(0, output_field=IntegerField())))
    )['t'] or 0

    # Coût d'achat total via les RemovalItems liés aux ventes
    cout_achat = (
        RemovalItem.objects
        .filter(removal__in=sales_qs)
        .aggregate(t=Sum(_item_cost_expr()))['t'] or 0
    )

    # Créances : somme de max(0, facture - paiements) par vente
    pay_sum_sq = (
        Payment.objects
        .filter(removal=OuterRef('pk'))
        .values('removal')
        .annotate(s=Sum('amount'))
        .values('s')
    )
    creances = (
        sales_qs
        .annotate(
            total_facture=Coalesce(F('invoice_total_amount'), Value(0, output_field=IntegerField())),
            total_paye=Coalesce(Subquery(pay_sum_sq), Value(0, output_field=IntegerField())),
        )
        .annotate(creance=ExpressionWrapper(
            F('total_facture') - F('total_paye'), output_field=IntegerField()
        ))
        .filter(creance__gt=0)
        .aggregate(t=Sum('creance'))['t'] or 0
    )

    # CA réel encaissé (basé sur la date du paiement)
    pay_filter = {'removal__destination': 'vente'}
    if boutique_id:
        pay_filter['removal__boutique_id'] = boutique_id
    if date_from:
        pay_filter['date__date__gte'] = date_from
    if date_to:
        pay_filter['date__date__lte'] = date_to

    paiements_par_mode = {'especes': 0, 'mobile_money': 0, 'carte': 0}
    ca_reel = 0
    for row in Payment.objects.filter(**pay_filter).values('mode').annotate(t=Sum('amount')):
        ca_reel += row['t']
        mode = row['mode'] if row['mode'] in paiements_par_mode else 'especes'
        paiements_par_mode[mode] += row['t']

    # Pertes (charge + quantité)
    loss_agg = (
        RemovalItem.objects
        .filter(removal__in=losses_qs)
        .aggregate(qty=Sum('quantity'), val=Sum(_item_cost_expr()))
    )
    charge_pertes = loss_agg['val'] or 0
    qty_pertes    = loss_agg['qty'] or 0

    # Dépenses de la période
    total_expenses = 0
    if boutique_id:
        exp_qs = Expense.objects.filter(boutique_id=boutique_id)
        if date_from:
            exp_qs = exp_qs.filter(date_register__date__gte=date_from)
        if date_to:
            exp_qs = exp_qs.filter(date_register__date__lte=date_to)
        total_expenses = exp_qs.aggregate(t=Sum('amount'))['t'] or 0

    marge_brute  = ventes_totales - cout_achat
    benefice_net = marge_brute - charge_pertes - total_expenses

    return {
        'ca_reel':            ca_reel,
        'ventes_totales':     ventes_totales,
        'creances':           creances,
        'cout_achat':         cout_achat,
        'marge_brute':        marge_brute,
        'charge_pertes':      charge_pertes,
        'benefice_net':       benefice_net,
        'qty_pertes':         qty_pertes,
        'total_expenses':     total_expenses,
        'paiements_par_mode': paiements_par_mode,
    }


# ── Résumé matériel ──────────────────────────────────────────────────────────────

def _material_summary(removals_qs, entries_qs, products_qs):
    qty_vendues = (
        RemovalItem.objects
        .filter(removal__in=removals_qs.filter(destination='vente'))
        .aggregate(t=Sum('quantity'))['t'] or 0
    )
    qty_dons = (
        RemovalItem.objects
        .filter(removal__in=removals_qs.filter(destination='don'))
        .aggregate(t=Sum('quantity'))['t'] or 0
    )
    qty_entrees = entries_qs.aggregate(t=Sum('quantity'))['t'] or 0

    loss_agg = (
        RemovalItem.objects
        .filter(removal__in=removals_qs.filter(destination='perte'))
        .aggregate(qty=Sum('quantity'), val=Sum(_item_cost_expr()))
    )
    qty_pertes    = loss_agg['qty'] or 0
    valeur_pertes = loss_agg['val'] or 0

    stock_value = (
        products_qs
        .aggregate(t=Sum(ExpressionWrapper(
            Coalesce(F('purchase_price'), Value(0, output_field=IntegerField())) * F('stock'),
            output_field=IntegerField()
        )))['t'] or 0
    )
    articles_disponibles = products_qs.filter(stock__gt=0).count()
    articles_rupture     = products_qs.filter(stock__lte=0).count()
    rupture_products     = list(products_qs.filter(stock__lte=0).values('id', 'product_name', 'category'))

    return {
        'qty_vendues':          qty_vendues,
        'qty_pertes':           qty_pertes,
        'valeur_pertes':        valeur_pertes,
        'qty_dons':             qty_dons,
        'qty_entrees':          qty_entrees,
        'stock_value':          stock_value,
        'articles_disponibles': articles_disponibles,
        'articles_rupture':     articles_rupture,
        'rupture_products':     rupture_products,
    }


# ── Top 5 catégories vendues ─────────────────────────────────────────────────────

def _top_categories(sales_qs):
    rows = (
        RemovalItem.objects
        .filter(removal__in=sales_qs)
        .values(cat=Coalesce(F('product__category'), Value('Autres')))
        .annotate(qty=Sum('quantity'))
        .order_by('-qty')[:5]
    )
    return [{'category': row['cat'], 'qty': row['qty']} for row in rows]


# ── Top produits vendus ──────────────────────────────────────────────────────────

def _top_products(sales_qs, limit=10):
    rows = (
        RemovalItem.objects
        .filter(removal__in=sales_qs, product__isnull=False)
        .values('product__id', 'product__product_name', 'product__category')
        .annotate(
            qty=Sum('quantity'),
            revenue=Sum(ExpressionWrapper(
                Coalesce(F('unit_price'), Value(0, output_field=IntegerField())) * F('quantity'),
                output_field=IntegerField()
            ))
        )
        .order_by('-qty')[:limit]
    )
    return [
        {
            'id':       row['product__id'],
            'name':     row['product__product_name'],
            'category': row['product__category'] or 'Autres',
            'qty':      row['qty'],
            'revenue':  row['revenue'] or 0,
        }
        for row in rows
    ]


# ── Flux mensuel (12 mois) — 2 queries au lieu de 24 ────────────────────────────

def _monthly_flux(user, year):
    bid = user.boutique_id

    ent_filter = {'date_register__year': year}
    if bid:
        ent_filter['boutique_id'] = bid
    ent_map = {
        row['m']: row['qty']
        for row in (
            Entry.objects.filter(**ent_filter)
            .values(m=ExtractMonth('date_register'))
            .annotate(qty=Sum('quantity'))
        )
    }

    out_filter = {'removal__date_register__year': year}
    if bid:
        out_filter['removal__boutique_id'] = bid
    out_map = {
        row['m']: row['qty']
        for row in (
            RemovalItem.objects.filter(**out_filter)
            .values(m=ExtractMonth('removal__date_register'))
            .annotate(qty=Sum('quantity'))
        )
    }

    return [
        {'mois': m, 'entrees': ent_map.get(m, 0), 'sorties': out_map.get(m, 0)}
        for m in range(1, 13)
    ]


# ── Évolution financière mensuelle — 2 queries au lieu de 24 ────────────────────

def _financial_evolution(user, year):
    bid = user.boutique_id

    pay_filter = {'removal__destination': 'vente', 'date__year': year}
    if bid:
        pay_filter['removal__boutique_id'] = bid
    ca_map = {
        row['m']: row['ca']
        for row in (
            Payment.objects.filter(**pay_filter)
            .values(m=ExtractMonth('date'))
            .annotate(ca=Sum('amount'))
        )
    }

    loss_filter = {'removal__destination': 'perte', 'removal__date_register__year': year}
    if bid:
        loss_filter['removal__boutique_id'] = bid
    charge_map = {
        row['m']: row['charge'] or 0
        for row in (
            RemovalItem.objects.filter(**loss_filter)
            .values(m=ExtractMonth('removal__date_register'))
            .annotate(charge=Sum(_item_cost_expr()))
        )
    }

    return [
        {'mois': m, 'ca_reel': ca_map.get(m, 0), 'charge_pertes': charge_map.get(m, 0)}
        for m in range(1, 13)
    ]


# ── Vue principale ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    period  = request.query_params.get('period', 'day')
    section = request.query_params.get('section', 'both')
    user    = request.user

    wants_financial = section in ('financier', 'both')

    if wants_financial and period == 'month' and user.role not in ('OWNER', 'MANAGER') and not user.is_superuser:
        return Response({'error': 'Accès non autorisé au bilan financier mensuel.'}, status=status.HTTP_403_FORBIDDEN)
    if wants_financial and period == 'year' and user.role not in ('OWNER',) and not user.is_superuser:
        return Response({'error': 'Accès non autorisé au bilan financier annuel.'}, status=status.HTTP_403_FORBIDDEN)
    if period == 'custom' and user.role == 'EMPLOYEE' and not user.is_superuser:
        return Response({'error': 'Accès non autorisé au filtre de dates.'}, status=status.HTTP_403_FORBIDDEN)

    date_from, date_to = None, None
    if period == 'custom':
        date_from, date_to = _parse_date_params(request)
        if not date_from or not date_to:
            return Response({'error': 'date_from et date_to requis pour period=custom.'}, status=status.HTTP_400_BAD_REQUEST)

    now      = timezone.now()
    all_rem  = _removals_qs(user)
    all_ent  = _entries_qs(user)
    all_prod = _products_qs(user)
    bid      = user.boutique_id

    # Cache key unique par boutique + période + section + date du jour
    today_str = now.strftime('%Y-%m-%d')
    _bid_key  = bid or 'superadmin'
    if period == 'custom':
        _period_key = f"custom:{date_from}:{date_to}"
    elif period == 'month':
        _period_key = f"month:{now.year}-{now.month:02d}"
    elif period == 'year':
        _period_key = f"year:{now.year}"
    else:
        _period_key = f"day:{today_str}"
    cache_key = f"reports:{_bid_key}:{_period_key}:{section}"

    cached = _cache_get(cache_key)
    if cached is not None:
        return Response(cached)

    # ── Journalier ──────────────────────────────────────────────────────────────
    if period == 'day':
        today    = now.date()
        rem      = all_rem.filter(date_register__date=today)
        ent      = all_ent.filter(date_register__date=today)
        sales_qs = rem.filter(destination='vente')

        data = {
            'period': 'day', 'date': today.isoformat(),
            'financier':      _financial_summary(sales_qs, rem.filter(destination='perte'),
                                                 boutique_id=bid, date_from=today, date_to=today),
            'materiel':       _material_summary(rem, ent, all_prod),
            'top_categories': _top_categories(sales_qs),
            'top_products':   _top_products(sales_qs),
        }
        _cache_set(cache_key, data, timeout=REPORTS_CACHE_TTL)
        return Response(data)

    # ── Mensuel ─────────────────────────────────────────────────────────────────
    if period == 'month':
        rem      = all_rem.filter(date_register__year=now.year, date_register__month=now.month)
        ent      = all_ent.filter(date_register__year=now.year, date_register__month=now.month)
        sales_qs = rem.filter(destination='vente')

        from datetime import date as _date
        import calendar
        m_start = _date(now.year, now.month, 1)
        m_end   = _date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])

        fin = _financial_summary(sales_qs, rem.filter(destination='perte'),
                                 boutique_id=bid, date_from=m_start, date_to=m_end)

        # CA hebdomadaire — 1 seule query d'aggregation
        weekly = list(
            Payment.objects
            .filter(removal__in=sales_qs)
            .values(week=ExtractWeek('date'))
            .annotate(ca_reel=Sum('amount'), count=Count('removal', distinct=True))
            .order_by('week')
            .values('week', 'ca_reel', 'count')
        )

        prev_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
        prev_ca_row = (
            Payment.objects
            .filter(removal__destination='vente', removal__boutique_id=bid,
                    date__year=prev_start.year, date__month=prev_start.month)
            .aggregate(t=Sum('amount'))
        ) if bid else Payment.objects.filter(
            removal__destination='vente',
            date__year=prev_start.year, date__month=prev_start.month
        ).aggregate(t=Sum('amount'))
        prev_ca = prev_ca_row['t'] or 0

        data = {
            'period': 'month', 'month': f"{now.year}-{now.month:02d}",
            'financier':      {**fin, 'prev_ca': prev_ca},
            'materiel':       _material_summary(rem, ent, all_prod),
            'top_categories': _top_categories(sales_qs),
            'top_products':   _top_products(sales_qs),
            'weekly':         weekly,
        }
        _cache_set(cache_key, data, timeout=REPORTS_CACHE_TTL)
        return Response(data)

    # ── Annuel ───────────────────────────────────────────────────────────────────
    if period == 'year':
        rem      = all_rem.filter(date_register__year=now.year)
        ent      = all_ent.filter(date_register__year=now.year)
        sales_qs = rem.filter(destination='vente')

        from datetime import date as _date
        y_start = _date(now.year, 1, 1)
        y_end   = _date(now.year, 12, 31)

        data = {
            'period': 'year', 'year': now.year,
            'financier':      _financial_summary(sales_qs, rem.filter(destination='perte'),
                                                 boutique_id=bid, date_from=y_start, date_to=y_end),
            'materiel':       _material_summary(rem, ent, all_prod),
            'top_categories': _top_categories(sales_qs),
            'top_products':   _top_products(sales_qs),
            'evolution_fin':  _financial_evolution(user, now.year),
            'evolution_mat':  _monthly_flux(user, now.year),
        }
        _cache_set(cache_key, data, timeout=REPORTS_CACHE_TTL)
        return Response(data)

    # ── Personnalisé ─────────────────────────────────────────────────────────────
    if period == 'custom':
        rem      = all_rem.filter(date_register__date__gte=date_from, date_register__date__lte=date_to)
        ent      = all_ent.filter(date_register__date__gte=date_from, date_register__date__lte=date_to)
        sales_qs = rem.filter(destination='vente')

        data = {
            'period': 'custom', 'date_from': date_from.isoformat(), 'date_to': date_to.isoformat(),
            'financier':      _financial_summary(sales_qs, rem.filter(destination='perte'),
                                                 boutique_id=bid, date_from=date_from, date_to=date_to),
            'materiel':       _material_summary(rem, ent, all_prod),
            'top_categories': _top_categories(sales_qs),
            'top_products':   _top_products(sales_qs),
        }
        _cache_set(cache_key, data, timeout=REPORTS_CACHE_TTL)
        return Response(data)

    return Response({'error': 'period invalide.'}, status=status.HTTP_400_BAD_REQUEST)
