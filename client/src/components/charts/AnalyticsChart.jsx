import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function AnalyticsChart({ data, dataKey, nameKey, color = '#1e9e58' }) {
  if (!data || data.length === 0) {
    return <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No data yet.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} layout="vertical" margin={{ left: 16 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" allowDecimals={false} />
        <YAxis type="category" dataKey={nameKey} width={120} tick={{ fontSize: 12 }} />
        <Tooltip />
        <Bar dataKey={dataKey} fill={color} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
