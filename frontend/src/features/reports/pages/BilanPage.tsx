import { useRef, useState } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Download, CalendarDays } from 'lucide-react';

import { useReports } from '../hooks/useReports';
import { usePermission } from '../../../shared/hooks/usePermission';
import type { ReportPeriod, ReportFinancier, ReportMateriel, WeeklyPoint, EvolutionPoint } from '../api/reportsApi';

function fmt(n: number | undefined | null) {
  return (n ?? 0).toLocaleString('fr-FR');
}

const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function KpiCard({ label, value, sub, color = 'border-base-300' }: {
  label: string; value: string; sub?: string; color?: string;
}) {
  return (
    <div className={`card bg-base-200 border ${color} shadow-sm`}>
      <div className="card-body py-4 px-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400 border-b border-base-300 pb-2 mb-4">
      {children}
    </h2>
  );
}

function FinancierSection({ fin, period }: { fin: ReportFinancier | null | undefined; period: ReportPeriod }) {
  if (!fin) return null;
  const diff = fin.ca_reel - (fin.prev_ca ?? 0);
  const pct  = fin.prev_ca ? Math.round((diff / fin.prev_ca) * 100) : null;
  return (
    <div className="space-y-4">
      <SectionTitle>💰 Rubrique Financière</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
        <KpiCard label="CA réel encaissé"   value={`${fmt(fin.ca_reel)} F`}       color="border-green-200" />
        <KpiCard label="Créances clients"    value={`${fmt(fin.creances)} F`}      color="border-orange-200" />
        <KpiCard label="Coût achats vendus"  value={`${fmt(fin.cout_achat)} F`}    color="border-blue-200" />
        <KpiCard label="Marge brute"         value={`${fmt(fin.marge_brute)} F`}   color="border-purple-200" />
        <KpiCard label="Charges pertes"      value={`${fmt(fin.charge_pertes)} F`} color="border-red-200" />
      </div>
      {period === 'month' && pct !== null && (
        <div className={`flex items-center gap-2 text-sm font-semibold ${diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>
          {diff >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          {diff >= 0 ? '+' : ''}{pct}% CA vs mois précédent ({fmt(fin.prev_ca)} F)
        </div>
      )}
    </div>
  );
}

function MaterielSection({ mat }: { mat: ReportMateriel | null | undefined }) {
  if (!mat) return null;
  return (
    <div className="space-y-4">
      <SectionTitle>📦 Rubrique Matérielle</SectionTitle>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Entrées"  value={`${fmt(mat.qty_entrees)} unités`} color="border-emerald-200" />
        <KpiCard label="Vendues"  value={`${fmt(mat.qty_vendues)} unités`} color="border-blue-200" />
        <KpiCard label="Pertes"   value={`${fmt(mat.qty_pertes)} unités`}  color="border-red-200" />
        <KpiCard label="Dons"     value={`${fmt(mat.qty_dons)} unités`}    color="border-gray-200" />
      </div>
    </div>
  );
}

function WeeklyChart({ weekly }: { weekly: WeeklyPoint[] }) {
  if (!weekly?.length) return null;
  const chartData = weekly.map((w) => ({ semaine: `S${w.week}`, CA: w.ca_reel }));
  return (
    <div>
      <SectionTitle>📈 Évolution hebdomadaire du CA</SectionTitle>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="semaine" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={65} />
          <Tooltip formatter={(v: number) => `${fmt(v)} F`} />
          <Bar dataKey="CA" fill="var(--primary)" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function YearlyEvolutionChart({ evolution }: { evolution: EvolutionPoint[] }) {
  if (!evolution?.length) return null;
  const chartData = evolution.map((m) => ({
    mois:             MONTH_LABELS[m.mois - 1],
    'CA réel':        m.ca_reel,
    'Charges pertes': m.charge_pertes,
  }));
  return (
    <div>
      <SectionTitle>📊 CA réel vs Charges pertes (12 mois)</SectionTitle>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} width={70} />
          <Tooltip formatter={(v: number) => `${fmt(v)} F`} />
          <Legend />
          <Line type="monotone" dataKey="CA réel"        stroke="var(--primary)" strokeWidth={2} dot={{ r: 4 }} />
          <Line type="monotone" dataKey="Charges pertes" stroke="#ef4444"         strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const ALL_TABS: { key: ReportPeriod; label: string }[] = [
  { key: 'day',   label: '📅 Journalier' },
  { key: 'month', label: '📆 Mensuel' },
  { key: 'year',  label: '📊 Annuel' },
];

export default function BilanPage() {
  const { canAccessMonthlyReport, canAccessAnnualReport, canFilterByDate, canExportReport, role } = usePermission();
  const printRef = useRef<HTMLDivElement>(null);

  const [period,     setPeriod]     = useState<ReportPeriod>('day');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [showFilter, setShowFilter] = useState(false);

  const isCustom    = canFilterByDate && Boolean(dateFrom && dateTo);
  const fetchOpts   = isCustom ? { date_from: dateFrom, date_to: dateTo } : undefined;
  const fetchPeriod = isCustom ? ('custom' as ReportPeriod) : period;

  const { data, loading } = useReports(fetchPeriod, fetchOpts);

  const tabs = ALL_TABS.filter((t) => {
    if (t.key === 'month') return canAccessMonthlyReport;
    if (t.key === 'year')  return canAccessAnnualReport;
    return true;
  });

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          #bilan-print { padding: 20px; }
        }
      `}</style>

      <div id="bilan-print" ref={printRef}>
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6 no-print">
          <h1 className="text-2xl font-bold uppercase">Bilan</h1>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Onglets période */}
            <div className="flex gap-1">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  onClick={() => { setPeriod(t.key); setDateFrom(''); setDateTo(''); setShowFilter(false); }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    period === t.key && !isCustom
                      ? 'bg-[var(--black)] text-white'
                      : 'bg-base-200 hover:bg-base-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Filtre plage de dates — OWNER uniquement */}
            {canFilterByDate && (
              <div className="relative">
                <button
                  onClick={() => setShowFilter((v) => !v)}
                  className={`btn btn-sm flex items-center gap-2 ${
                    isCustom ? 'bg-[var(--primary)] text-black' : 'bg-base-200 hover:bg-base-300'
                  }`}
                >
                  <CalendarDays size={14} />
                  {isCustom ? `${dateFrom} → ${dateTo}` : 'Filtre dates'}
                </button>
                {showFilter && (
                  <div className="absolute right-0 top-full mt-2 z-50 bg-base-100 border border-base-300 rounded-xl shadow-lg p-4 w-72">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Période personnalisée</p>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Du</label>
                        <input type="date" className="input input-sm w-full" value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Au</label>
                        <input type="date" className="input input-sm w-full" value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)} />
                      </div>
                      {isCustom && (
                        <button className="btn btn-xs btn-ghost w-full mt-1"
                          onClick={() => { setDateFrom(''); setDateTo(''); setShowFilter(false); }}>
                          Effacer le filtre
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export PDF — OWNER uniquement */}
            {canExportReport && (
              <button onClick={() => window.print()}
                className="btn btn-sm flex items-center gap-2 bg-base-200 hover:bg-base-300">
                <Download size={14} />
                Exporter PDF
              </button>
            )}
          </div>
        </div>

        {/* Avertissement employé */}
        {role === 'EMPLOYEE' && (
          <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-6 no-print">
            Accès restreint : vous consultez uniquement le bilan de la journée en cours.
          </p>
        )}

        {/* En-tête visible uniquement à l'impression */}
        <div className="hidden print:block text-center mb-8">
          <h1 className="text-2xl font-bold">Bilan Financier & Matériel</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isCustom ? `Du ${dateFrom} au ${dateTo}` :
             fetchPeriod === 'day'   ? 'Journalier' :
             fetchPeriod === 'month' ? 'Mensuel' : 'Annuel'}
            {' · '}Généré le {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Contenu */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : data ? (
          <div className="space-y-10">
            <FinancierSection fin={data.financier} period={fetchPeriod} />
            <MaterielSection  mat={data.materiel} />
            {data.weekly    && <WeeklyChart          weekly={data.weekly} />}
            {data.evolution && <YearlyEvolutionChart evolution={data.evolution} />}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-16">Aucune donnée disponible.</p>
        )}
      </div>
    </>
  );
}