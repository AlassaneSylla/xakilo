import { useEffect, useState } from 'react';
import { client } from '../../../shared/api/client';

const MONTH_LABELS = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc'];

type DashboardStats = {
  totalProducts: number;
  entriesOfTheMonth: number;
  removalsOfTheDay: number;
  lowStockCount: number;
};

export type MonthlyBar         = { mois: string; in: number; out: number };
export type CategorySlice      = { name: string; value: number };
export type RecentTransaction  = {
  id: string;
  date: string;
  type: 'entry' | 'removal';
  product: string;
  quantity: number;
  user: string;
  destination?: string;
};

type ApiResponse = {
  stats: {
    total_products:   number;
    entries_of_month: number;
    removals_of_day:  number;
    low_stock_count:  number;
  };
  monthly_chart: {
    year: number; month: number;
    entries_qty: number; removals_qty: number;
  }[];
  category_chart: { name: string; value: number }[];
  recent_transactions: RecentTransaction[];
};

export function useDashboard() {
  const [stats, setStats]                         = useState<DashboardStats>({ totalProducts: 0, entriesOfTheMonth: 0, removalsOfTheDay: 0, lowStockCount: 0 });
  const [monthlyChartData, setMonthlyChartData]   = useState<MonthlyBar[]>([]);
  const [categoryChartData, setCategoryChartData] = useState<CategorySlice[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading]                     = useState(true);
  const [error, setError]                         = useState<string | null>(null);

  useEffect(() => {
    client.get<ApiResponse>('users/dashboard/')
      .then(({ data }) => {
        setStats({
          totalProducts:     data.stats.total_products,
          entriesOfTheMonth: data.stats.entries_of_month,
          removalsOfTheDay:  data.stats.removals_of_day,
          lowStockCount:     data.stats.low_stock_count,
        });

        setMonthlyChartData(
          data.monthly_chart.map((row) => ({
            mois: MONTH_LABELS[row.month - 1],
            in:   row.entries_qty,
            out:  row.removals_qty,
          }))
        );

        setCategoryChartData(data.category_chart);
        setRecentTransactions(data.recent_transactions);
      })
      .catch(() => setError('Erreur lors du chargement du tableau de bord'))
      .finally(() => setLoading(false));
  }, []);

  return { stats, monthlyChartData, categoryChartData, recentTransactions, loading, error };
}
