import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
  } from 'recharts';

  const data = [
    { mois: 'jan', in: 120, out: 80 },
    { mois: 'fév', in: 98, out: 65 },
    { mois: 'mar', in: 150, out: 130 },
    { mois: 'avr', in: 110, out: 95 },
    { mois: 'mai', in: 160, out: 120 },
    { mois: 'jui', in: 130, out: 100 },
    { mois: 'juil', in: 130, out: 100 },
    { mois: 'aou', in: 130, out: 70 },
    { mois: 'sep', in: 130, out: 40 },
    { mois: 'oct', in: 130, out: 90 },
    { mois: 'nov', in: 130, out: 40 },
    { mois: 'déc', in: 130, out: 100 },
  ];

export default function StockVenteChart() {
  return (
    <div className="w-full h-90">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mois" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="in" fill="var(--entries)" name="entrées" barSize={5} />
          <Bar dataKey="out" fill="var(--removals)" name="sorties" barSize={5} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}