import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6'];

type Props = { data: { category: string; qty: number }[] };

export default function DonutCategoryChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="h-60 flex items-center justify-center text-sm text-gray-400 italic">
        Aucune vente enregistrée sur cette période
      </div>
    );
  }

  const chartData = data.map((d) => ({ name: d.category, value: d.qty }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => [`${v} unités`, 'Quantité']} />
        <Legend iconType="circle" iconSize={8} />
      </PieChart>
    </ResponsiveContainer>
  );
}