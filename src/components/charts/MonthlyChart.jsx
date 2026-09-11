import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const completed = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;
    const total = payload.find((p) => p.payload.total)?.payload.total ?? 0;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <div className="bg-gray-900/95 backdrop-blur border border-emerald-500/30 rounded-2xl p-4 shadow-2xl min-w-[150px]">
        <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-3">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Completed
            </span>
            <span className="text-lg font-bold text-emerald-400">{completed}</span>
          </div>
          {total > 0 && (
            <div className="pt-2 border-t border-gray-700/60 flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500">Success Rate</span>
              <span className={`text-sm font-extrabold ${rate >= 70 ? 'text-emerald-400' : rate >= 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                {rate}%
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyChart = ({ data = [] }) => {
  const maxVal = Math.max(...data.map((d) => d.total ?? 1), 1);

  // avg daily completed
  const withActivity = data.filter((d) => (d.total ?? 0) > 0);
  const avgCompleted =
    withActivity.length > 0
      ? +(withActivity.reduce((s, d) => s + (d.completed ?? 0), 0) / withActivity.length).toFixed(1)
      : 0;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 16, right: 16, left: -12, bottom: 0 }}
          barSize={8}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            opacity={0.15}
            vertical={false}
          />

          {/* Daily avg completed reference */}
          {avgCompleted > 0 && (
            <ReferenceLine
              y={avgCompleted}
              stroke="#10b981"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: `avg ${avgCompleted}`,
                position: 'right',
                fontSize: 10,
                fill: '#10b981',
                fontWeight: 600,
              }}
            />
          )}

          <XAxis
            dataKey="day"
            stroke="transparent"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={2}
            tick={{ fill: '#9ca3af', fontWeight: 600 }}
            tickFormatter={(v) => v.replace('Day ', '')}
          />
          <YAxis
            stroke="transparent"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: '#9ca3af' }}
            width={24}
            domain={[0, Math.ceil(maxVal * 1.2) || 5]}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: '#374151', opacity: 0.15 }}
          />

          <Bar
            dataKey="completed"
            fill="#10b981"
            radius={[4, 4, 4, 4]}
            animationDuration={1000}
            minPointSize={3}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.completed === 0 ? '#1f2937' : entry.completed >= avgCompleted ? '#10b981' : '#34d399'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
