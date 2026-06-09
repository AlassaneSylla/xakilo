import {
  Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip,
} from 'recharts';
import type { CategorySlice } from '../hooks/useDashboard';

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#ec4899','#14b8a6','#f97316'];
const RADIAN = Math.PI / 180;

type PieLabelProps = { cx: number; cy: number; midAngle: number; innerRadius: number; outerRadius: number; percent: number };

const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: PieLabelProps) => {
  if ((percent ?? 0) < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-(midAngle ?? 0) * RADIAN);
  const y = cy + r * Math.sin(-(midAngle ?? 0) * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${((percent ?? 0) * 100).toFixed(0)}%`}
    </text>
  );
};

export default function CategoryPieChart({ data }: { data: CategorySlice[] }) {
  if (data.length === 0) {
    return (
      <div className="w-full h-72 flex items-center justify-center text-gray-400 text-sm">
        Aucune catégorie en stock
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={90}
            dataKey="value"
            strokeWidth={2}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value} unités`, name]}
            contentStyle={{ borderRadius: 8, fontSize: 13 }}
          />
          <Legend iconType="circle" iconSize={8} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}