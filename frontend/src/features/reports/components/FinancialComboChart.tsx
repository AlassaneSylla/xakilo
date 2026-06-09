import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

function fmt(n: number) { return n.toLocaleString('fr-FR'); }

type Props = { data: { mois: number; ca_reel: number; charge_pertes: number }[] };

export default function FinancialComboChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-gray-400 italic">
        Données non disponibles
      </div>
    );
  }

  const chartData = data.map((d) => ({
    mois:     MONTH_LABELS[d.mois - 1],
    'CA réel':        d.ca_reel,
    'Charges pertes': d.charge_pertes,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="mois" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={65}
          tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => `${fmt(v)} F`} />
        <Legend iconType="circle" iconSize={8} />
        <Bar    dataKey="CA réel"        fill="var(--primary)" radius={[4,4,0,0]} barSize={18} />
        <Line   dataKey="Charges pertes" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
      </ComposedChart>
    </ResponsiveContainer>
  );
}