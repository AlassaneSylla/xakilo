import { useEffect, useState } from 'react';
import {
  Package, TrendingDown, ArrowDown, ArrowUp, AlertTriangle, Trophy, ZoomIn,
  ChevronLeft, ChevronRight,
} from 'lucide-react';

import { useReports } from '../hooks/useReports';
import { usePermission } from '../../../shared/hooks/usePermission';
import ReportHeader from '../components/ReportHeader';
import DonutCategoryChart from '../components/DonutCategoryChart';
import StockEvolutionChart from '../components/StockEvolutionChart';
import { getLossRegistry } from '../../stock/removals/api/removalsApi';
import type { LossRecord } from '../../stock/removals/types';
import type { ReportPeriod, TopProduct } from '../api/reportsApi';

function fmt(n: number | undefined | null) {
  return (n ?? 0).toLocaleString('fr-FR');
}

function KpiCard({
  icon, label, value, sub, accent = 'border-base-300',
}: {
  icon: React.ReactNode; label: string; value: string; sub?: string; accent?: string;
}) {
  return (
    <div className={`card bg-base-200 border ${accent} shadow-sm`}>
      <div className="card-body py-4 px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
            <p className="text-base font-bold leading-tight">{value}</p>
            {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className="p-2 bg-base-300 rounded-lg opacity-70 shrink-0 ml-2">{icon}</div>
        </div>
      </div>
    </div>
  );
}

function KpiCardFlux({
  icon, label, entrees, vendues, dons, accent = 'border-base-300',
}: {
  icon: React.ReactNode; label: string;
  entrees: { value: string; sub: string };
  vendues: { value: string; sub: string };
  dons:    { value: string; sub: string };
  accent?: string;
}) {
  return (
    <div className={`card bg-base-200 border ${accent} shadow-sm`}>
      <div className="card-body py-4 px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <ArrowUp size={12} className="text-emerald-500 shrink-0" />
                <span className="text-sm font-bold leading-tight">{entrees.value}</span>
                <span className="text-[11px] text-gray-400">{entrees.sub}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDown size={12} className="text-blue-500 shrink-0" />
                <span className="text-sm font-bold leading-tight">{vendues.value}</span>
                <span className="text-[11px] text-gray-400">{vendues.sub}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ArrowDown size={12} className="text-purple-400 shrink-0" />
                <span className="text-sm font-bold leading-tight">{dons.value}</span>
                <span className="text-[11px] text-gray-400">{dons.sub}</span>
              </div>
            </div>
          </div>
          <div className="p-2 bg-base-300 rounded-lg opacity-70 shrink-0 ml-2">{icon}</div>
        </div>
      </div>
    </div>
  );
}

type RuptureProduct = { id: number; product_name: string; category: string };

function TopProductsTable({ products }: { products: TopProduct[] }) {
  if (!products.length) {
    return (
      <p className="text-sm text-gray-400 italic text-center py-8">
        Aucune vente enregistrée sur cette période.
      </p>
    );
  }
  const maxQty = products[0].qty;

  return (
    <div className="space-y-2">
      {products.map((p, i) => (
        <div key={p.id} className="flex items-center gap-3 group">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
            i === 0 ? 'bg-amber-400 text-white' :
            i === 1 ? 'bg-gray-300 text-gray-700' :
            i === 2 ? 'bg-orange-300 text-white' :
                      'bg-base-300 text-gray-500'
          }`}>
            {i + 1}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-semibold truncate">{p.name}</p>
              <span className="text-xs font-bold text-gray-500 ml-2 shrink-0">{p.qty} unités</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-base-300 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-(--primary) transition-all duration-500"
                  style={{ width: `${Math.round((p.qty / maxQty) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 shrink-0">{fmt(p.revenue)} F</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function LossRegistryTable({ records }: { records: LossRecord[] }) {
  const [enlarged, setEnlarged] = useState<string | null>(null);

  if (!records.length) {
    return (
      <p className="text-sm text-gray-400 italic text-center py-8">
        Aucune perte enregistrée sur cette période.
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="table table-sm w-full">
          <thead>
            <tr className="text-xs uppercase tracking-widest text-gray-400">
              <th>Date</th>
              <th>Employé</th>
              <th>Produit</th>
              <th className="text-right">Qté</th>
              <th>Justificatif</th>
              <th className="text-center">Photo</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={i} className="hover:bg-base-300/40 transition-colors">
                <td className="text-xs text-gray-400 whitespace-nowrap">
                  {new Date(r.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td className="text-sm font-medium">{r.employee}</td>
                <td className="text-sm">{r.product}</td>
                <td className="text-right font-bold text-red-500">{r.quantity}</td>
                <td className="text-xs text-gray-500 max-w-50 truncate" title={r.justification}>
                  {r.justification || <span className="italic text-gray-300">—</span>}
                </td>
                <td className="text-center">
                  {r.proof_image ? (
                    <button
                      type="button"
                      onClick={() => setEnlarged(r.proof_image!)}
                      className="relative group inline-block"
                    >
                      <img
                        src={r.proof_image}
                        alt="preuve"
                        className="h-9 w-9 object-cover rounded-lg border border-red-200 group-hover:opacity-80 transition-opacity"
                      />
                      <ZoomIn size={12} className="absolute bottom-0.5 right-0.5 text-white drop-shadow" />
                    </button>
                  ) : (
                    <span className="text-gray-300 text-xs italic">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal agrandissement photo */}
      {enlarged && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setEnlarged(null)}
        >
          <img
            src={enlarged}
            alt="Preuve agrandie"
            className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl border-2 border-white/20"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

const TABS: { key: ReportPeriod; label: string }[] = [
  { key: 'day',   label: 'Journalier' },
  { key: 'month', label: 'Mensuel' },
  { key: 'year',  label: 'Annuel' },
];

export default function BilanMaterielPage() {
  const { canFilterByDate, isOwner } = usePermission();

  const [period,   setPeriod]   = useState<ReportPeriod>('day');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');
  const [lossRecords,  setLossRecords]  = useState<LossRecord[]>([]);
  const [lossCount,    setLossCount]    = useState(0);
  const [lossPage,     setLossPage]     = useState(1);
  const [lossLoading,  setLossLoading]  = useState(false);
  const [lossPeriodType, setLossPeriodType] = useState<'day' | 'month' | 'year'>('month');

  const today = new Date();

  // Navigateur principal (onglets Mois / Année)
  const [navYear,  setNavYear]  = useState(today.getFullYear());
  const [navMonth, setNavMonth] = useState(today.getMonth() + 1);

  // Navigateur registre des pertes
  const [lossDay,   setLossDay]   = useState(today.toISOString().slice(0, 10));
  const [lossMonth, setLossMonth] = useState(today.getMonth() + 1);
  const [lossYear,  setLossYear]  = useState(today.getFullYear());

  const isNavCurrentMonth = navYear === today.getFullYear() && navMonth === today.getMonth() + 1;
  const isNavCurrentYear  = navYear === today.getFullYear();
  const navMonthLabel = new Date(navYear, navMonth - 1, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const goPrevMonth = () => {
    if (navMonth === 1) { setNavMonth(12); setNavYear(y => y - 1); }
    else setNavMonth(m => m - 1);
  };
  const goNextMonth = () => {
    if (isNavCurrentMonth) return;
    if (navMonth === 12) { setNavMonth(1); setNavYear(y => y + 1); }
    else setNavMonth(m => m + 1);
  };

  const isCustom = canFilterByDate && Boolean(dateFrom && dateTo);
  const fetchPeriod: ReportPeriod = isCustom ? 'custom' : period === 'day' ? 'day' : 'custom';

  const fetchOpts = (() => {
    if (isCustom) return { date_from: dateFrom, date_to: dateTo, section: 'materiel' as const };
    if (period === 'month') {
      const mm      = String(navMonth).padStart(2, '0');
      const lastDay = new Date(navYear, navMonth, 0).getDate();
      return { date_from: `${navYear}-${mm}-01`, date_to: `${navYear}-${mm}-${lastDay}`, section: 'materiel' as const };
    }
    if (period === 'year') {
      return { date_from: `${navYear}-01-01`, date_to: `${navYear}-12-31`, section: 'materiel' as const };
    }
    return { section: 'materiel' as const };
  })();

  const { data, loading } = useReports(fetchPeriod, fetchOpts);

  // Calcule date_from / date_to selon le type de période sélectionné
  const lossParams = (() => {
    if (lossPeriodType === 'day') {
      return { period: 'custom', date_from: lossDay, date_to: lossDay };
    }
    if (lossPeriodType === 'month') {
      const lastDay = new Date(lossYear, lossMonth, 0).getDate();
      const mm = String(lossMonth).padStart(2, '0');
      return { period: 'custom', date_from: `${lossYear}-${mm}-01`, date_to: `${lossYear}-${mm}-${lastDay}` };
    }
    return { period: 'custom', date_from: `${lossYear}-01-01`, date_to: `${lossYear}-12-31` };
  })();

  const monthLabel = new Date(lossYear, lossMonth - 1, 1)
    .toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  const isCurrentMonth = lossYear === today.getFullYear() && lossMonth === today.getMonth() + 1;
  const isCurrentYear  = lossYear === today.getFullYear();

  const prevMonth = () => {
    if (lossMonth === 1) { setLossMonth(12); setLossYear(y => y - 1); }
    else setLossMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (isCurrentMonth) return;
    if (lossMonth === 12) { setLossMonth(1); setLossYear(y => y + 1); }
    else setLossMonth(m => m + 1);
  };

  useEffect(() => { setLossPage(1); }, [lossParams.date_from, lossParams.date_to]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOwner) return;
    setLossLoading(true);
    getLossRegistry(lossParams, lossPage)
      .then(({ results, count }) => { setLossRecords(results); setLossCount(count); })
      .catch(() => { setLossRecords([]); setLossCount(0); })
      .finally(() => setLossLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOwner, lossParams.date_from, lossParams.date_to, lossPage]);

  const mat = data?.materiel;
  const topCats = data?.top_categories  ?? [];
  const topProds: TopProduct[] = data?.top_products ?? [];
  const evo = data?.evolution_mat ?? [];
  const ruptureProducts: RuptureProduct[] = mat?.rupture_products ?? [];

  const isAnnual = period === 'year';

  return (
    <>
      <div>
        <ReportHeader
          title="Bilan Matériel"
          tabs={TABS}
          period={period}
          onPeriodChange={(p) => { setPeriod(p); setDateFrom(''); setDateTo(''); }}
          showDateFilter={canFilterByDate}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); }}
        >
          <p className="text-xs text-gray-400">Suivi des quantités et de la valeur physique du stock</p>
        </ReportHeader>

        {/* ── Navigateur mois / année ─────────────────────────────────── */}
        {period === 'month' && !isCustom && (
          <div className="flex items-center justify-center gap-3 mb-6 no-print">
            <button type="button" onClick={goPrevMonth} className="btn btn-sm btn-ghost">
              <ChevronLeft size={16} />
            </button>
            <span className="text-base font-semibold capitalize w-44 text-center">{navMonthLabel}</span>
            <button type="button" onClick={goNextMonth} disabled={isNavCurrentMonth}
              className="btn btn-sm btn-ghost disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        )}
        {period === 'year' && !isCustom && (
          <div className="flex items-center justify-center gap-3 mb-6 no-print">
            <button type="button" onClick={() => setNavYear(y => y - 1)} className="btn btn-sm btn-ghost">
              <ChevronLeft size={16} />
            </button>
            <span className="text-base font-semibold w-20 text-center">{navYear}</span>
            <button type="button" onClick={() => setNavYear(y => y + 1)} disabled={isNavCurrentYear}
              className="btn btn-sm btn-ghost disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-24">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : !mat ? (
          <p className="text-center text-gray-400 py-16">Aucune donnée disponible.</p>
        ) : (
          <div className="space-y-8">

            {/* ── KPI grid ────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              <KpiCard
                icon={<Package size={16} />}
                label="Valeur totale du stock"
                value={`${fmt(mat.stock_value)} F`}
                sub="Quantité × Prix d'achat"
                accent="border-indigo-200"
              />
              <KpiCard
                icon={<AlertTriangle size={16} />}
                label="Statut des articles"
                value={`${fmt(mat.articles_disponibles)} disponibles`}
                sub={`${fmt(mat.articles_rupture)} en rupture`}
                accent="border-amber-200"
              />
              <KpiCardFlux
                icon={<ArrowDown size={16} />}
                label="Flux de la période"
                entrees={{ value: `${fmt(mat.qty_entrees)} unités`, sub: 'reçus' }}
                vendues={{ value: `${fmt(mat.qty_vendues)} unités`, sub: 'vendues' }}
                dons={{ value: `${fmt(mat.qty_dons)} unités`, sub: 'donnés' }}
                accent="border-emerald-200"
              />
              <KpiCard
                icon={<TrendingDown size={16} />}
                label="Total Pertes & Dommages"
                value={`${fmt(mat.qty_pertes)} unités`}
                sub={`Valorisé : ${fmt(mat.valeur_pertes)} F`}
                accent="border-red-200"
              />
            </div>

            {/* ── Articles en rupture ─────────────────────────────────────── */}
            {ruptureProducts.length > 0 && (
              <details className="card bg-base-200 border border-amber-200 shadow-sm">
                <summary className="card-body py-3 px-4 cursor-pointer list-none">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
                      {ruptureProducts.length} article{ruptureProducts.length > 1 ? 's' : ''} en rupture de stock
                    </p>
                    <span className="ml-auto text-xs text-gray-400">Voir le détail ▾</span>
                  </div>
                </summary>
                <div className="px-4 pb-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
                    {ruptureProducts.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 bg-base-300 rounded-lg px-3 py-2">
                        <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
                        <span className="text-sm font-medium truncate">{p.product_name}</span>
                        <span className="ml-auto text-[11px] text-gray-400 shrink-0">{p.category || '—'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            )}

            {/* ── Donut + Top produits (journalier & mensuel) ─────────────── */}
            {!isAnnual && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card bg-base-200 border border-base-300 shadow-sm">
                  <div className="card-body">
                    <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                      Top 5 catégories vendues
                    </p>
                    <p className="text-xs text-gray-400 mb-4">Répartition par catégorie</p>
                    <DonutCategoryChart data={topCats} />
                  </div>
                </div>

                <div className="card bg-base-200 border border-base-300 shadow-sm">
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={14} className="text-amber-400" />
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Produits les plus vendus
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mb-5">Classement par quantité écoulée</p>
                    <TopProductsTable products={topProds} />
                  </div>
                </div>
              </div>
            )}

            {/* ── Vue annuelle : donut + courbe d'évolution + top produits ── */}
            {isAnnual && (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="card bg-base-200 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Top 5 catégories vendues
                      </p>
                      <p className="text-xs text-gray-400 mb-4">Répartition annuelle par catégorie</p>
                      <DonutCategoryChart data={topCats} />
                    </div>
                  </div>

                  <div className="card bg-base-200 border border-base-300 shadow-sm">
                    <div className="card-body">
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                        Évolution mensuelle du stock
                      </p>
                      <p className="text-xs text-gray-400 mb-4">Entrées vs Sorties sur 12 mois</p>
                      <StockEvolutionChart data={evo} />
                    </div>
                  </div>
                </div>

                <div className="card bg-base-200 border border-base-300 shadow-sm">
                  <div className="card-body">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy size={14} className="text-amber-400" />
                      <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                        Produits les plus vendus — Année complète
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mb-6">Top 10 produits classés par quantité vendue</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
                      {topProds.length === 0 ? (
                        <p className="text-sm text-gray-400 italic col-span-2 text-center py-6">
                          Aucune vente enregistrée cette année.
                        </p>
                      ) : topProds.map((p, i) => {
                        const maxQty = topProds[0].qty;
                        return (
                          <div key={p.id} className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              i === 0 ? 'bg-amber-400 text-white' :
                              i === 1 ? 'bg-gray-300 text-gray-700' :
                              i === 2 ? 'bg-orange-300 text-white' :
                                        'bg-base-300 text-gray-500'
                            }`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <p className="text-sm font-semibold truncate">{p.name}</p>
                                <span className="text-xs font-bold text-gray-500 ml-2 shrink-0">{p.qty} u.</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-base-300 rounded-full h-1.5">
                                  <div
                                    className="h-1.5 rounded-full bg-(--primary)"
                                    style={{ width: `${Math.round((p.qty / maxQty) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">{fmt(p.revenue)} F</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ── Registre Traçabilité des Pertes (Propriétaire uniquement) ── */}
            {isOwner && (
              <div className="card bg-base-200 border border-red-200 shadow-sm">
                <div className="card-body">

                  {/* En-tête + onglets */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <TrendingDown size={14} className="text-red-400" />
                      <p className="text-xs font-bold uppercase tracking-widest text-red-400">
                        Registre de Traçabilité des Pertes
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {(['day', 'month', 'year'] as const).map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setLossPeriodType(p)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                            lossPeriodType === p
                              ? 'bg-red-400 text-white'
                              : 'bg-base-300 text-gray-400 hover:bg-base-100'
                          }`}
                        >
                          {p === 'day' ? 'Jour' : p === 'month' ? 'Mois' : 'Année'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Navigateur de période */}
                  <div className="flex items-center gap-3 mb-4">
                    {lossPeriodType === 'day' && (
                      <input
                        type="date"
                        max={today.toISOString().slice(0, 10)}
                        value={lossDay}
                        onChange={(e) => setLossDay(e.target.value)}
                        className="input input-sm input-bordered"
                      />
                    )}

                    {lossPeriodType === 'month' && (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={prevMonth} className="btn btn-xs btn-ghost">
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-sm font-semibold w-36 text-center capitalize">{monthLabel}</span>
                        <button
                          type="button"
                          onClick={nextMonth}
                          disabled={isCurrentMonth}
                          className="btn btn-xs btn-ghost disabled:opacity-30"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}

                    {lossPeriodType === 'year' && (
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => setLossYear(y => y - 1)} className="btn btn-xs btn-ghost">
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-sm font-semibold w-16 text-center">{lossYear}</span>
                        <button
                          type="button"
                          onClick={() => setLossYear(y => y + 1)}
                          disabled={isCurrentYear}
                          className="btn btn-xs btn-ghost disabled:opacity-30"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}

                    <span className="text-xs text-gray-400 ml-auto">
                      {lossCount} perte{lossCount !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {lossLoading ? (
                    <div className="flex justify-center py-10">
                      <span className="loading loading-spinner loading-md" />
                    </div>
                  ) : (
                    <LossRegistryTable records={lossRecords} />
                  )}

                  {Math.ceil(lossCount / 20) > 1 && (
                    <div className="flex items-center justify-center gap-3 mt-4 no-print">
                      <button type="button" onClick={() => setLossPage(p => p - 1)} disabled={lossPage === 1}
                        className="btn btn-xs btn-ghost disabled:opacity-30">
                        <ChevronLeft size={14} />
                      </button>
                      <span className="text-xs">{lossPage} / {Math.ceil(lossCount / 20)}</span>
                      <button type="button" onClick={() => setLossPage(p => p + 1)} disabled={lossPage >= Math.ceil(lossCount / 20)}
                        className="btn btn-xs btn-ghost disabled:opacity-30">
                        <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </>
  );
}