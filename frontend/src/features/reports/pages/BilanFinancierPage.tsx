import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Banknote, AlertTriangle, ShoppingCart, Scale, Receipt, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

import { useReports } from '../hooks/useReports';
import { usePermission } from '../../../shared/hooks/usePermission';
import ReportHeader from '../components/ReportHeader';
import FinancialComboChart from '../components/FinancialComboChart';
import { getUnpaidInvoices, addPayment } from '../../stock/removals/api/removalsApi';
import type { UnpaidInvoice } from '../../stock/removals/api/removalsApi';
import type { ReportPeriod } from '../api/reportsApi';

function fmt(n: number | undefined | null) {
  return (n ?? 0).toLocaleString('fr-FR');
}

function KpiCard({
  icon, label, value, sub, accent = 'border-base-300', positive,
}: {
  icon: React.ReactNode; label: string; value: string;
  sub?: string; accent?: string; positive?: boolean;
}) {
  return (
    <div className={`card bg-base-200 border ${accent} shadow-sm`}>
      <div className="card-body py-4 px-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">{label}</p>
            <p className={`text-base font-bold leading-tight ${
              positive === true ? 'text-green-600' : positive === false ? 'text-red-500' : ''
            }`}>
              {value}
            </p>
            {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
          </div>
          <div className="p-2 bg-base-300 rounded-lg opacity-70 shrink-0 ml-2">{icon}</div>
        </div>
      </div>
    </div>
  );
}

const ALL_TABS: { key: ReportPeriod; label: string }[] = [
  { key: 'day',   label: 'Journalier' },
  { key: 'month', label: 'Mensuel' },
  { key: 'year',  label: 'Annuel' },
];

export default function BilanFinancierPage() {
  const { canAccessMonthlyReport, canAccessAnnualReport, canFilterByDate, isManager } = usePermission();

  // ── Créances ─────────────────────────────────────────────────────────────
  const [unpaidInvoices, setUnpaidInvoices] = useState<UnpaidInvoice[]>([]);
  const [unpaidLoading,  setUnpaidLoading]  = useState(false);
  const [paying,         setPaying]         = useState<UnpaidInvoice | null>(null);
  const [payAmount,      setPayAmount]      = useState('');
  const [payMode,        setPayMode]        = useState<'especes' | 'mobile_money' | 'carte'>('especes');
  const [paySubmitting,  setPaySubmitting]  = useState(false);

  const fetchUnpaid = () => {
    if (!isManager) return;
    setUnpaidLoading(true);
    getUnpaidInvoices()
      .then(setUnpaidInvoices)
      .catch(() => setUnpaidInvoices([]))
      .finally(() => setUnpaidLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchUnpaid(); }, [isManager]);

  const openPayModal = (inv: UnpaidInvoice) => {
    setPaying(inv);
    setPayAmount(String(inv.balance_due));
    setPayMode('especes');
    (document.getElementById('pay-modal') as HTMLDialogElement)?.showModal();
  };

  const handlePay = async () => {
    if (!paying || !payAmount) return;
    setPaySubmitting(true);
    try {
      await addPayment(paying.id, { amount: Number(payAmount), mode: payMode });
      (document.getElementById('pay-modal') as HTMLDialogElement)?.close();
      fetchUnpaid();
    } finally {
      setPaySubmitting(false);
    }
  };

  const today = new Date();
  const [period,    setPeriod]    = useState<ReportPeriod>('day');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');
  const [navYear,   setNavYear]   = useState(today.getFullYear());
  const [navMonth,  setNavMonth]  = useState(today.getMonth() + 1);

  const tabs = ALL_TABS.filter((t) => {
    if (t.key === 'month') return canAccessMonthlyReport;
    if (t.key === 'year')  return canAccessAnnualReport;
    return true;
  });

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

  const isCustom    = canFilterByDate && Boolean(dateFrom && dateTo);
  const fetchPeriod: ReportPeriod = isCustom ? 'custom' : period === 'day' ? 'day' : 'custom';

  const fetchOpts = (() => {
    if (isCustom) return { date_from: dateFrom, date_to: dateTo, section: 'financier' as const };
    if (period === 'month') {
      const mm      = String(navMonth).padStart(2, '0');
      const lastDay = new Date(navYear, navMonth, 0).getDate();
      return { date_from: `${navYear}-${mm}-01`, date_to: `${navYear}-${mm}-${lastDay}`, section: 'financier' as const };
    }
    if (period === 'year') {
      return { date_from: `${navYear}-01-01`, date_to: `${navYear}-12-31`, section: 'financier' as const };
    }
    return { section: 'financier' as const };
  })();

  const { data, loading } = useReports(fetchPeriod, fetchOpts);
  const fin = data?.financier;
  const evo = data?.evolution_fin ?? [];

  const prevCa = fin?.prev_ca ?? 0;
  const diffCa = fin ? fin.ca_reel - prevCa : 0;
  const pctCa  = prevCa ? Math.round((diffCa / prevCa) * 100) : null;

  return (
    <>
      <div>
        <ReportHeader
          title="Bilan Financier"
          tabs={tabs}
          period={period}
          onPeriodChange={(p) => { setPeriod(p); setDateFrom(''); setDateTo(''); }}
          showDateFilter={canFilterByDate}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); }}
        >
          <p className="text-xs text-gray-400">
            Chiffre d'affaires réel, marges et créances clients
          </p>
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
        ) : !fin ? (
          <p className="text-center text-gray-400 py-16">Aucune donnée disponible.</p>
        ) : (
          <div className="space-y-10">

            {/* ── KPI grid ─────────────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">

              {/* CA RÉEL */}
              <div className={`card bg-base-200 border border-green-200 shadow-sm`}>
                <div className="card-body py-4 px-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">
                        CA réel encaissé
                      </p>
                      <p className="text-base font-bold leading-tight text-green-600">
                        {fmt(fin.ca_reel)} F
                      </p>
                      {pctCa !== null && (
                        <p className="text-[11px] text-gray-400 mt-1">
                          {pctCa >= 0 ? '+' : ''}{pctCa}% vs mois précédent
                        </p>
                      )}
                      {/* Répartition modes de paiement */}
                      {fin.paiements_par_mode && fin.ca_reel > 0 && (
                        <div className="flex gap-3 mt-2 flex-wrap">
                          {fin.paiements_par_mode.especes > 0 && (
                            <span className="text-[10px] text-gray-500 bg-base-300 rounded px-1.5 py-0.5">
                              Espèces : {fmt(fin.paiements_par_mode.especes)}
                            </span>
                          )}
                          {fin.paiements_par_mode.mobile_money > 0 && (
                            <span className="text-[10px] text-gray-500 bg-base-300 rounded px-1.5 py-0.5">
                              Mobile : {fmt(fin.paiements_par_mode.mobile_money)}
                            </span>
                          )}
                          {fin.paiements_par_mode.carte > 0 && (
                            <span className="text-[10px] text-gray-500 bg-base-300 rounded px-1.5 py-0.5">
                              Carte : {fmt(fin.paiements_par_mode.carte)}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-2 bg-base-300 rounded-lg opacity-70 shrink-0 ml-2">
                      <Banknote size={16} />
                    </div>
                  </div>
                </div>
              </div>

              <KpiCard
                icon={<ShoppingCart size={16} />}
                label="CAMV"
                value={`${fmt(fin.cout_achat)} F`}
                sub="Prix d'achat × quantités vendues"
                accent="border-blue-200"
              />
              <KpiCard
                icon={<Scale size={16} />}
                label="Marge brute"
                value={`${fmt(fin.marge_brute)} F`}
                sub={`${fmt(fin.ventes_totales)} facturé − ${fmt(fin.cout_achat)} achat`}
                accent="border-purple-200"
                positive={fin.marge_brute >= 0}
              />
              <KpiCard
                icon={<AlertTriangle size={16} />}
                label="Valorisation des pertes"
                value={`${fmt(fin.charge_pertes)} F`}
                sub={`${fmt(fin.qty_pertes)} unité(s) × Prix d'achat`}
                accent="border-red-200"
                positive={false}
              />
              <KpiCard
                icon={<Receipt size={16} />}
                label="Dépenses déclarées"
                value={`${fmt(fin.total_expenses)} F`}
                sub="Petites dépenses de la période"
                accent={(fin.total_expenses ?? 0) > 0 ? 'border-orange-300' : 'border-base-300'}
                positive={(fin.total_expenses ?? 0) === 0}
              />
              <KpiCard
                icon={(fin.benefice_net ?? 0) >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                label="Bénéfice net"
                value={`${fmt(fin.benefice_net)} F`}
                sub="Marge brute − Pertes − Dépenses"
                accent={(fin.benefice_net ?? 0) >= 0 ? 'border-emerald-300' : 'border-red-300'}
                positive={(fin.benefice_net ?? 0) >= 0}
              />
            </div>

            {/* Comparaison mois précédent */}
            {period === 'month' && pctCa !== null && (
              <div className={`flex items-center gap-2 text-sm font-semibold no-print ${
                diffCa >= 0 ? 'text-green-600' : 'text-red-500'
              }`}>
                {diffCa >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                CA {diffCa >= 0 ? '+' : ''}{pctCa}% vs mois précédent
                ({fmt(prevCa)} F)
              </div>
            )}

            {/* ── Graphique combiné (annuel uniquement) ───────────────────── */}
            {period === 'year' && evo.length > 0 && (
              <div className="card bg-base-200 border border-base-300 shadow-sm">
                <div className="card-body">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
                    CA réel vs Charges pertes
                  </p>
                  <p className="text-xs text-gray-400 mb-4">Évolution mensuelle sur l'année</p>
                  <FinancialComboChart data={evo} />
                </div>
              </div>
            )}

          </div>
        )}

        {/* ── Créances clients ─────────────────────────────────────────── */}
        {isManager && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-orange-400" />
                  <p className="text-xs font-bold uppercase tracking-widest text-orange-400">
                    Créances clients
                  </p>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Toutes les factures impayées ou partiellement réglées
                </p>
              </div>
              {!unpaidLoading && (
                <div className="flex items-center gap-5 text-right">
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Factures</p>
                    <p className="text-base font-bold">{unpaidInvoices.length}</p>
                  </div>
                  <div className="w-px h-8 bg-base-300" />
                  <div>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Total dû</p>
                    <p className="text-base font-bold text-orange-500">
                      {fmt(unpaidInvoices.reduce((s, i) => s + i.balance_due, 0))} F
                    </p>
                  </div>
                </div>
              )}
            </div>

            {unpaidLoading ? (
              <div className="flex justify-center py-10">
                <span className="loading loading-spinner loading-md" />
              </div>
            ) : unpaidInvoices.length === 0 ? (
              <div className="card bg-base-200 border border-base-300">
                <div className="card-body py-8 text-center">
                  <p className="text-sm text-gray-400 italic">Aucune créance en cours — toutes les factures sont soldées.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-orange-200">
                <table className="table table-sm w-full">
                  <thead className="bg-base-200">
                    <tr className="text-xs uppercase tracking-widest text-gray-400">
                      <th>N° Facture</th>
                      <th>Client</th>
                      <th>Date</th>
                      <th className="text-right">Total</th>
                      <th className="text-right">Payé</th>
                      <th className="text-right">Reste</th>
                      <th>Statut</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {unpaidInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-base-200/60 transition-colors">
                        <td className="font-mono text-xs">{inv.invoice_number}</td>
                        <td>
                          <p className="text-sm font-medium">{inv.client_name}</p>
                          {inv.client_phone && <p className="text-xs text-gray-400">{inv.client_phone}</p>}
                        </td>
                        <td className="text-xs text-gray-400 whitespace-nowrap">
                          {new Date(inv.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="text-right text-sm">{fmt(inv.total)} F</td>
                        <td className="text-right text-sm text-green-600">{fmt(inv.amount_paid)} F</td>
                        <td className="text-right text-sm font-bold text-orange-500">{fmt(inv.balance_due)} F</td>
                        <td>
                          <span className={`badge badge-sm ${inv.status === 'en_attente' ? 'badge-error' : 'badge-warning'}`}>
                            {inv.status === 'en_attente' ? 'En attente' : 'Partiel'}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => openPayModal(inv)}
                            className="btn btn-xs btn-warning"
                          >
                            Encaisser
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modal encaissement ──────────────────────────────────────────── */}
      <dialog id="pay-modal" className="modal">
        <div className="modal-box max-w-sm">
          <h3 className="font-bold text-base mb-1">Encaisser un règlement</h3>
          {paying && (
            <p className="text-xs text-gray-400 mb-4">
              {paying.invoice_number} · {paying.client_name} · Reste : <span className="font-bold text-orange-500">{fmt(paying.balance_due)} F</span>
            </p>
          )}

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Montant encaissé (F)</label>
              <input
                type="number"
                min={1}
                max={paying?.balance_due}
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                className="input input-bordered input-sm w-full mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Mode de paiement</label>
              <select
                value={payMode}
                onChange={e => setPayMode(e.target.value as typeof payMode)}
                className="select select-bordered select-sm w-full mt-1"
              >
                <option value="especes">Espèces</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="carte">Carte</option>
              </select>
            </div>
          </div>

          <div className="modal-action mt-5">
            <form method="dialog">
              <button className="btn btn-sm btn-ghost mr-2">Annuler</button>
            </form>
            <button
              type="button"
              onClick={handlePay}
              disabled={paySubmitting || !payAmount || Number(payAmount) <= 0}
              className="btn btn-sm btn-warning disabled:opacity-60"
            >
              {paySubmitting ? <span className="loading loading-spinner loading-xs" /> : 'Confirmer'}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop"><button>close</button></form>
      </dialog>
    </>
  );
}