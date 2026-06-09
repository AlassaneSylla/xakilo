import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const MONTH_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];

type Props = { data: { mois: number; entrees: number; sorties: number }[] };

export default function StockEvolutionChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-gray-400 italic">
        Données non disponibles sur cette période
      </div>
    );
  }

  const chartData = data.map((d) => ({
    mois:     MONTH_LABELS[d.mois - 1],
    Entrées:  d.entrees,
    Sorties:  d.sorties,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
        <XAxis dataKey="mois" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={40} />
        <Tooltip />
        <Legend iconType="circle" iconSize={8} />
        <Line type="monotone" dataKey="Entrées" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="Sorties" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}