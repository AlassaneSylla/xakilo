from datetime import date, timedelta
from collections import defaultdict

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.db.models import Sum

from apps.stock.models.removal import Removal, RemovalItem
from apps.stock.models.entry   import Entry
from apps.stock.models.expense import Expense
from apps.stock.models.payment import Payment
from apps.products.models      import Product


# ── Helpers ─────────────────────────────────────────────────────────────────────

def _removals_qs(user):
    qs = Removal.objects.select_related('created_by').prefetch_related(
        'items__product', 'payments'
    )
    if user.boutique_id:
        qs = qs.filter(boutique_id=user.boutique_id)
    return qs


def _entries_qs(user):
    qs = Entry.objects.select_related('created_by', 'product')
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


# ── Résumé financier ─────────────────────────────────────────────────────────────

def _financial_summary(sales_qs, losses_qs, boutique_id=None, date_from=None, date_to=None):
    creances = cout_achat = ventes_totales = 0
    paiements_par_mode = {'especes': 0, 'mobile_money': 0, 'carte': 0}

    # Ventes facturées, créances et CAMV : basés sur la DATE DE LA VENTE
    for r in sales_qs.prefetch_related('payments', 'items__product'):
        total           = r.invoice_total_amount or 0
        ventes_totales += total
        paid_on_removal = sum(p.amount for p in r.payments.all())
        creances       += max(0, total - paid_on_removal)
        for item in r.items.all():
            pp = int(item.purchase_price or 0) if item.purchase_price is not None else (int(item.product.purchase_price or 0) if item.product else 0)
            cout_achat += pp * item.quantity

    # CA Réel encaissé : basé sur la DATE DU PAIEMENT (argent réellement reçu dans la période)
    pay_filter = {'removal__destination': 'vente'}
    if boutique_id:
        pay_filter['removal__boutique_id'] = boutique_id
    if date_from:
        pay_filter['date__date__gte'] = date_from
    if date_to:
        pay_filter['date__date__lte'] = date_to

    payments_in_period = Payment.objects.filter(**pay_filter).select_related('removal')
    ca_reel = sum(p.amount for p in payments_in_period)
    for p in payments_in_period:
        mode = p.mode if p.mode in paiements_par_mode else 'especes'
        paiements_par_mode[mode] += p.amount

    # Marge brute = Prix de vente facturé − Coût d'achat (formule commerciale correcte)
    marge_brute   = ventes_totales - cout_achat

    charge_pertes = 0
    qty_pertes    = 0
    for r in losses_qs.prefetch_related('items__product'):
        for item in r.items.all():
            pp = int(item.purchase_price or 0) if item.purchase_price is not None else (int(item.product.purchase_price or 0) if item.product else 0)
            charge_pertes += pp * item.quantity
            qty_pertes    += item.quantity

    # Dépenses de la période
    total_expenses = 0
    if boutique_id:
        exp_qs = Expense.objects.filter(boutique_id=boutique_id)
        if date_from:
            exp_qs = exp_qs.filter(date_register__date__gte=date_from)
        if date_to:
            exp_qs = exp_qs.filter(date_register__date__lte=date_to)
        total_expenses = exp_qs.aggregate(t=Sum('amount'))['t'] or 0

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
    def _qty(dest):
        return sum(
            item.quantity
            for r in removals_qs.filter(destination=dest).prefetch_related('items')
            for item in r.items.all()
        )

    qty_vendues = _qty('vente')
    qty_dons    = _qty('don')
    qty_entrees = entries_qs.aggregate(t=Sum('quantity'))['t'] or 0

    # Pertes : quantité + valorisation financière (prix d'achat figé au moment de la perte)
    qty_pertes    = 0
    valeur_pertes = 0
    for r in removals_qs.filter(destination='perte').prefetch_related('items__product'):
        for item in r.items.all():
            qty_pertes    += item.quantity
            pp = int(item.purchase_price or 0) if item.purchase_price is not None else (int(item.product.purchase_price or 0) if item.product else 0)
            valeur_pertes += pp * item.quantity

    # Valorisation du stock courant
    stock_value = sum(
        int(p.purchase_price or 0) * p.stock
        for p in products_qs
    )
    articles_disponibles = products_qs.filter(stock__gt=0).count()
    articles_rupture     = products_qs.filter(stock__lte=0).count()
    rupture_products     = list(
        products_qs.filter(stock__lte=0).values('id', 'product_name', 'category')
    )

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
    cat_map = defaultdict(int)
    for r in sales_qs.prefetch_related('items__product'):
        for item in r.items.all():
            cat = item.product.category if item.product else 'Autres'
            cat_map[cat] += item.quantity
    sorted_cats = sorted(cat_map.items(), key=lambda x: x[1], reverse=True)[:5]
    return [{'category': cat, 'qty': qty} for cat, qty in sorted_cats]


# ── Top produits vendus ──────────────────────────────────────────────────────────

def _top_products(sales_qs, limit=10):
    prod_map = {}  # id → { name, category, qty, revenue }
    for r in sales_qs.prefetch_related('items__product'):
        for item in r.items.all():
            if not item.product:
                continue
            pid = item.product.id
            if pid not in prod_map:
                prod_map[pid] = {
                    'id':       pid,
                    'name':     item.product.product_name,
                    'category': item.product.category or 'Autres',
                    'qty':      0,
                    'revenue':  0,
                }
            prod_map[pid]['qty']     += item.quantity
            prod_map[pid]['revenue'] += int(item.unit_price or 0) * item.quantity
    return sorted(prod_map.values(), key=lambda x: x['qty'], reverse=True)[:limit]


# ── Flux mensuel (12 mois, pour graphique matériel) ──────────────────────────────

def _monthly_flux(user, year):
    all_rem = _removals_qs(user)
    all_ent = _entries_qs(user)
    months  = []
    for m in range(1, 13):
        ent_qty = all_ent.filter(
            date_register__year=year, date_register__month=m
        ).aggregate(t=Sum('quantity'))['t'] or 0

        out_qty = sum(
            item.quantity
            for r in all_rem.filter(date_register__year=year, date_register__month=m)
                             .prefetch_related('items')
            for item in r.items.all()
        )
        months.append({'mois': m, 'entrees': ent_qty, 'sorties': out_qty})
    return months


# ── Évolution financière mensuelle ───────────────────────────────────────────────

def _financial_evolution(user, year):
    all_rem = _removals_qs(user)
    months  = []
    for m in range(1, 13):
        sales  = all_rem.filter(destination='vente', date_register__year=year, date_register__month=m)
        losses = all_rem.filter(destination='perte', date_register__year=year, date_register__month=m)

        ca = sum(
            sum(p.amount for p in r.payments.all())
            for r in sales.prefetch_related('payments')
        )
        charge = sum(
            int(item.product.purchase_price or 0) * item.quantity
            for r in losses.prefetch_related('items__product')
            for item in r.items.all()
        )
        months.append({'mois': m, 'ca_reel': ca, 'charge_pertes': charge})
    return months


# ── Vue principale ───────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    period  = request.query_params.get('period', 'day')
    section = request.query_params.get('section', 'both')  # 'materiel' | 'financier' | 'both'
    user    = request.user

    # ── RBAC ────────────────────────────────────────────────────────────────────
    # Le bilan matériel est accessible à tous les rôles sur toutes les périodes.
    # Le bilan financier mensuel/annuel est réservé OWNER (+ MANAGER pour mensuel).
    wants_financial = section in ('financier', 'both')

    if wants_financial and period == 'month' and user.role not in ('OWNER', 'MANAGER') and not user.is_superuser:
        return Response({'error': 'Accès non autorisé au bilan financier mensuel.'}, status=status.HTTP_403_FORBIDDEN)
    if wants_financial and period == 'year' and user.role not in ('OWNER',) and not user.is_superuser:
        return Response({'error': 'Accès non autorisé au bilan financier annuel.'}, status=status.HTTP_403_FORBIDDEN)

    if period == 'custom':
        if user.role == 'EMPLOYEE' and not user.is_superuser:
            return Response({'error': 'Accès non autorisé au filtre de dates.'}, status=status.HTTP_403_FORBIDDEN)

    # ── Filtre dates personnalisé ────────────────────────────────────────────────
    date_from, date_to = None, None
    if period == 'custom':
        date_from, date_to = _parse_date_params(request)
        if not date_from or not date_to:
            return Response({'error': 'date_from et date_to requis pour period=custom.'}, status=status.HTTP_400_BAD_REQUEST)

    now      = timezone.now()
    all_rem  = _removals_qs(user)
    all_ent  = _entries_qs(user)
    all_prod = _products_qs(user)

    bid = user.boutique_id

    # ── Journalier ──────────────────────────────────────────────────────────────
    if period == 'day':
        today = now.date()
        rem   = all_rem.filter(date_register__date=today)
        ent   = all_ent.filter(date_register__date=today)

        sales_qs = rem.filter(destination='vente')
        fin = _financial_summary(sales_qs, rem.filter(destination='perte'),
                                 boutique_id=bid, date_from=today, date_to=today)
        mat = _material_summary(rem, ent, all_prod)

        return Response({
            'period': 'day', 'date': today.isoformat(),
            'financier':      fin,
            'materiel':       mat,
            'top_categories': _top_categories(sales_qs),
            'top_products':   _top_products(sales_qs),
        })

    # ── Mensuel ─────────────────────────────────────────────────────────────────
    if period == 'month':
        rem = all_rem.filter(date_register__year=now.year, date_register__month=now.month)
        ent = all_ent.filter(date_register__year=now.year, date_register__month=now.month)

        sales_qs = rem.filter(destination='vente')
        from datetime import date as _date
        m_start = _date(now.year, now.month, 1)
        import calendar
        m_end   = _date(now.year, now.month, calendar.monthrange(now.year, now.month)[1])
        fin = _financial_summary(sales_qs, rem.filter(destination='perte'),
                                 boutique_id=bid, date_from=m_start, date_to=m_end)
        mat = _material_summary(rem, ent, all_prod)

        # CA hebdomadaire
        weekly = []
        for r in rem.filter(destination='vente').prefetch_related('payments'):
            wk   = r.date_register.isocalendar()[1]
            paid = sum(p.amount for p in r.payments.all())
            e = next((w for w in weekly if w['week'] == wk), None)
            if e: e['ca_reel'] += paid; e['count'] += 1
            else: weekly.append({'week': wk, 'ca_reel': paid, 'count': 1})
        weekly.sort(key=lambda x: x['week'])

        prev_start = (now.replace(day=1) - timedelta(days=1)).replace(day=1)
        prev_ca = sum(
            sum(p.amount for p in r.payments.all())
            for r in all_rem.filter(destination='vente',
                date_register__year=prev_start.year, date_register__month=prev_start.month
            ).prefetch_related('payments')
        )

        return Response({
            'period': 'month', 'month': f"{now.year}-{now.month:02d}",
            'financier':      {**fin, 'prev_ca': prev_ca},
            'materiel':       mat,
            'top_categories': _top_categories(sales_qs),
            'top_products':   _top_products(sales_qs),
            'weekly':         weekly,
        })

    # ── Annuel ───────────────────────────────────────────────────────────────────
    if period == 'year':
        rem = all_rem.filter(date_register__year=now.year)
        ent = all_ent.filter(date_register__year=now.year)

        sales_qs = rem.filter(destination='vente')
        from datetime import date as _date
        y_start = _date(now.year, 1, 1)
        y_end   = _date(now.year, 12, 31)
        fin = _financial_summary(sales_qs, rem.filter(destination='perte'),
                                 boutique_id=bid, date_from=y_start, date_to=y_end)
        mat = _material_summary(rem, ent, all_prod)

        return Response({
            'period': 'year', 'year': now.year,
            'financier':        fin,
            'materiel':         mat,
            'top_categories':   _top_categories(sales_qs),
            'top_products':     _top_products(sales_qs),
            'evolution_fin':    _financial_evolution(user, now.year),
            'evolution_mat':    _monthly_flux(user, now.year),
        })

    # ── Personnalisé ─────────────────────────────────────────────────────────────
    if period == 'custom':
        rem = all_rem.filter(date_register__date__gte=date_from, date_register__date__lte=date_to)
        ent = all_ent.filter(date_register__date__gte=date_from, date_register__date__lte=date_to)

        sales_qs = rem.filter(destination='vente')
        fin = _financial_summary(sales_qs, rem.filter(destination='perte'),
                                 boutique_id=bid, date_from=date_from, date_to=date_to)
        mat = _material_summary(rem, ent, all_prod)

        return Response({
            'period': 'custom', 'date_from': date_from.isoformat(), 'date_to': date_to.isoformat(),
            'financier':      fin,
            'materiel':       mat,
            'top_categories': _top_categories(sales_qs),
            'top_products':   _top_products(sales_qs),
        })

    return Response({'error': 'period invalide.'}, status=status.HTTP_400_BAD_REQUEST)