import { useEffect, useState } from 'react';
import { client } from '../../../shared/api/client';

const MONTH_LABELS = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

type DashboardStats = {
  totalProducts: number;
  entriesOfTheMonth: number;
  removalsOfTheDay: number;
  lowStockCount: number;
};

export type MonthlyBar = { mois: string; in: number; out: number };
export type CategorySlice = { name: string; value: number };
export type RecentTransaction = {
  id: string;
  date: string;
  type: 'entry' | 'removal';
  product: string;
  quantity: number;
  user: string;
  destination?: string;
};

type RawEntry = {
  id: number;
  date_register: string;
  quantity: number;
  product_name?: string;
  product?: number;
  created_by?: string;
  created_by_username?: string;
};

type RawRemoval = {
  id: number;
  date_register?: string;
  destination?: string;
  created_by_username?: string;
  products_label?: string;
  invoice?: {
    products?: { product_name: string; quantity: number }[];
    date_created?: string;
  };
};

type RawProduct = {
  id: number;
  category?: string;
  stock?: number;
};

type InternalBar = MonthlyBar & { _year: number; _month: number };

function buildMonthlyChart(entries: RawEntry[], removals: RawRemoval[]): MonthlyBar[] {
  const now = new Date();
  const bars: InternalBar[] = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    return { mois: MONTH_LABELS[d.getMonth()], in: 0, out: 0, _year: d.getFullYear(), _month: d.getMonth() };
  });

  entries.forEach((e) => {
    const d = new Date(e.date_register);
    const bar = bars.find((b) => b._year === d.getFullYear() && b._month === d.getMonth());
    if (bar) bar.in += e.quantity ?? 1;
  });

  removals.forEach((r) => {
    const raw = r.date_register;
    if (!raw) return;
    const d = new Date(raw);
    const bar = bars.find((b) => b._year === d.getFullYear() && b._month === d.getMonth());
    if (bar) {
      const qty = r.invoice?.products?.reduce((s, p) => s + (p.quantity ?? 0), 0) ?? 1;
      bar.out += qty;
    }
  });

  return bars.map(({ mois, in: i, out }) => ({ mois, in: i, out }));
}

function buildCategoryChart(products: RawProduct[]): CategorySlice[] {
  const map: Record<string, number> = {};
  products.forEach((p) => {
    if ((p.stock ?? 0) <= 0) return;
    const cat = p.category || 'Autres';
    map[cat] = (map[cat] ?? 0) + (p.stock ?? 0);
  });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}

function buildRecentTransactions(entries: RawEntry[], removals: RawRemoval[]): RecentTransaction[] {
  const list: RecentTransaction[] = [];

  entries.forEach((e) => {
    list.push({
      id: `e-${e.id}`,
      date: e.date_register,
      type: 'entry',
      product: e.product_name ?? `Produit #${e.product}`,
      quantity: e.quantity ?? 1,
      user: e.created_by ?? e.created_by_username ?? '—',
    });
  });

  removals.forEach((r) => {
    const date = r.date_register ?? '';
    const qty = r.invoice?.products?.reduce((s, p) => s + (p.quantity ?? 0), 0) ?? 1;
    list.push({
      id: `r-${r.id}`,
      date,
      type: 'removal',
      product: r.products_label ?? r.invoice?.products?.[0]?.product_name ?? '—',
      quantity: qty,
      user: r.created_by_username ?? '—',
      destination: r.destination,
    });
  });

  return list
    .filter((t) => t.date)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
}

export function useDashboard() {
  const [stats, setStats]                       = useState<DashboardStats>({ totalProducts: 0, entriesOfTheMonth: 0, removalsOfTheDay: 0, lowStockCount: 0 });
  const [monthlyChartData, setMonthlyChartData] = useState<MonthlyBar[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<CategorySlice[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState<string | null>(null);

  useEffect(() => {
    const today = new Date();

    Promise.all([
      client.get('products/'),
      client.get('removals/'),
      client.get('entries/'),
      client.get('products/low-stock/'),
    ])
      .then(([products, removals, entries, lowStock]) => {
        const prods = products.data as RawProduct[];
        const rems  = removals.data as RawRemoval[];
        const ents  = entries.data  as RawEntry[];

        const dailyRemovals = rems.filter((r) => {
          if (!r.date_register) return false;
          const d = new Date(r.date_register);
          return d.getDate() === today.getDate() && d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });

        const monthlyEntries = ents.filter((e) => {
          const d = new Date(e.date_register);
          return d.getMonth() === today.getMonth() && d.getFullYear() === today.getFullYear();
        });

        setStats({
          totalProducts:      prods.length,
          removalsOfTheDay:   dailyRemovals.length,
          entriesOfTheMonth:  monthlyEntries.length,
          lowStockCount:      (lowStock.data as { count?: number }).count ?? 0,
        });

        setMonthlyChartData(buildMonthlyChart(ents, rems));
        setCategoryChartData(buildCategoryChart(prods));
        setRecentTransactions(buildRecentTransactions(ents, rems));
      })
      .catch(() => setError('Erreur lors du chargement du tableau de bord'))
      .finally(() => setLoading(false));
  }, []);

  return { stats, monthlyChartData, categoryChartData, recentTransactions, loading, error };
}
