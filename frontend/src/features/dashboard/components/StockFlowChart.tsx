import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { MonthlyBar } from '../hooks/useDashboard';

export default function StockFlowChart({ data }: { data: MonthlyBar[] }) {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="mois" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={35} />
          <Tooltip
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
          />
          <Legend iconType="circle" iconSize={8} />
          <Bar dataKey="in"  fill="var(--entries)"  name="Entrées" barSize={8} radius={[4,4,0,0]} />
          <Bar dataKey="out" fill="var(--removals)" name="Sorties" barSize={8} radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}