import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 shadow-2xl min-w-[150px]">
        <p className="text-xs font-bold text-gray-300 mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center justify-between gap-3 text-xs mb-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-400">{entry.name}</span>
            </span>
            <span className="font-bold text-white">
              {entry.name === 'Completion %' ? `${entry.value}%` : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const MonthlyChart = ({ data = [] }) => {
  // Calculate rate from data if not present
  const enriched = data.map((d) => ({
    ...d,
    rate: d.rate ?? (d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0),
    // Shorten label for readability
    label: d.day ? d.day.replace('Day ', 'D') : d.day,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={enriched} margin={{ top: 10, right: 16, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="monthCompletedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.5} />
            </linearGradient>
            <linearGradient id="monthPendingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.7} />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity={0.3} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="label"
            stroke="#6b7280"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={3}
            tick={{ fill: '#9ca3af', fontWeight: 600 }}
          />
          <YAxis
            yAxisId="count"
            orientation="left"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: '#9ca3af' }}
            width={28}
          />
          <YAxis
            yAxisId="pct"
            orientation="right"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
            tick={{ fill: '#9ca3af' }}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={32}
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '11px', color: '#9ca3af', paddingBottom: '8px' }}
          />
          <Bar
            yAxisId="count"
            dataKey="completed"
            name="Completed"
            fill="url(#monthCompletedGrad)"
            radius={[4, 4, 0, 0]}
            maxBarSize={14}
          />
          <Bar
            yAxisId="count"
            dataKey="pending"
            name="Pending"
            fill="url(#monthPendingGrad)"
            radius={[4, 4, 0, 0]}
            maxBarSize={14}
          />
          <Line
            yAxisId="pct"
            type="monotone"
            dataKey="rate"
            name="Completion %"
            stroke="#6366f1"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, fill: '#6366f1', stroke: '#111827', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
