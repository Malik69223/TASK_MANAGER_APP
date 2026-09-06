import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const RADIAN = Math.PI / 180;

// Render percentage label inside pie segments
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null; // hide label if slice too small
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const entry = payload[0];
    const total = payload[0].payload.total;
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-3 shadow-2xl min-w-[140px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.payload.color }} />
          <span className="text-sm font-bold text-white">{entry.name}</span>
        </div>
        <p className="text-xs text-gray-300">
          Count: <span className="font-bold text-white">{entry.value}</span>
        </p>
        <p className="text-xs text-gray-300">
          Share: <span className="font-bold text-white">{((entry.value / total) * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export const StatusPieChart = ({ completed = 0, pending = 0, overdue = 0 }) => {
  const total = completed + pending + overdue;

  const rawData = [
    { name: 'Completed', value: completed, color: '#10b981' },
    { name: 'Pending', value: pending, color: '#6366f1' },
    { name: 'Overdue', value: overdue, color: '#f43f5e' },
  ].filter((item) => item.value > 0).map((item) => ({ ...item, total }));

  if (rawData.length === 0) {
    return (
      <div className="w-full h-72 flex flex-col items-center justify-center gap-3 text-gray-400">
        <div className="w-20 h-20 rounded-full border-4 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
          <span className="text-2xl">📊</span>
        </div>
        <p className="text-xs font-medium">No habit data available yet</p>
        <p className="text-[11px] text-gray-500">Add some habits to see your breakdown</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={rawData}
            cx="50%"
            cy="46%"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
            animationBegin={0}
            animationDuration={800}
          >
            {rawData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            iconSize={9}
            formatter={(value, entry) => (
              <span style={{ color: entry.color, fontSize: '11px', fontWeight: 600 }}>
                {value} ({entry.payload.value})
              </span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
