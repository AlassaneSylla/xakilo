import { client } from '../../../shared/api/client';

export type ReportPeriod = 'day' | 'month' | 'year' | 'custom';

export type ReportSection = 'materiel' | 'financier' | 'both';

export type TopCategory    = { category: string; total: number };
export type TopProduct     = { product_name: string; total: number };
export type RuptureProduct = { id: number; product_name: string; category: string };

export type ReportFinancier = {
  ca_reel: number;
  prev_ca?: number;
  creances: number;
  cout_achat: number;
  marge_brute: number;
  charge_pertes: number;
  ventes_totales?: number;
  qty_pertes?: number;
  total_expenses?: number;
  benefice_net?: number;
  paiements_par_mode?: { especes: number; mobile_money: number; carte: number };
};

export type ReportMateriel = {
  qty_entrees: number;
  qty_vendues: number;
  qty_pertes: number;
  qty_dons: number;
  stock_value?: number;
  articles_disponibles?: number;
  articles_rupture?: number;
  valeur_pertes?: number;
  rupture_products?: RuptureProduct[];
};

export type WeeklyPoint    = { week: number; ca_reel: number };
export type EvolutionPoint = { mois: number; ca_reel: number; charge_pertes: number };

export type ReportData = {
  financier?: ReportFinancier;
  materiel?: ReportMateriel;
  weekly?: WeeklyPoint[];
  evolution?: EvolutionPoint[];
  evolution_fin?: EvolutionPoint[];
  evolution_mat?: EvolutionPoint[];
  top_categories?: TopCategory[];
  top_products?: TopProduct[];
};

export async function fetchReport(
  period: ReportPeriod,
  options?: { date_from?: string; date_to?: string; section?: ReportSection },
) {
  const params: Record<string, string> = { period };
  if (options?.section)   params.section   = options.section;
  if (period === 'custom' && options?.date_from) params.date_from = options.date_from;
  if (period === 'custom' && options?.date_to)   params.date_to   = options.date_to;
  const { data } = await client.get('users/reports/', { params });
  return data;
}