import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
  Legend,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 shadow-2xl min-w-[130px]">
        <p className="text-xs font-bold text-gray-300 mb-2">{label}</p>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: payload[0]?.payload?.color || '#6366f1' }}
            />
            <span className="text-gray-400">Habits</span>
          </span>
          <span className="font-bold text-white">{payload[0]?.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ x, y, width, value, fill }) => {
  if (!value || value === 0) return null;
  return (
    <text
      x={x + width / 2}
      y={y - 5}
      textAnchor="middle"
      fontSize={11}
      fontWeight={700}
      fill={fill || '#9ca3af'}
    >
      {value}
    </text>
  );
};

export const CategoryChart = ({ data = [] }) => {
  const filtered = data.filter((d) => d.count > 0);

  if (filtered.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center gap-3 text-gray-400">
        <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
          <span className="text-2xl">📂</span>
        </div>
        <p className="text-xs font-medium">No category data yet</p>
        <p className="text-[11px] text-gray-500">Add habits to categories to see distribution</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={filtered} margin={{ top: 22, right: 16, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9ca3af', fontWeight: 600 }}
          />
          <YAxis
            stroke="#6b7280"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: '#9ca3af' }}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} name="Habits" maxBarSize={48}>
            <LabelList
              dataKey="count"
              content={(props) => (
                <CustomLabel {...props} fill="#9ca3af" />
              )}
            />
            {filtered.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || '#6366f1'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
