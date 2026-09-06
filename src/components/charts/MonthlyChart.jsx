import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const completed = payload.find((p) => p.dataKey === 'completed')?.value ?? 0;
    const pending = payload.find((p) => p.dataKey === 'pending')?.value ?? 0;
    const total = completed + pending;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return (
      <div className="bg-gray-900/95 backdrop-blur border border-emerald-500/30 rounded-2xl p-4 shadow-2xl min-w-[150px]">
        <p className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider mb-3">{label}</p>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Done
            </span>
            <span className="text-sm font-bold text-emerald-400">{completed}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Pending
            </span>
            <span className="text-sm font-bold text-amber-400">{pending}</span>
          </div>
          {total > 0 && (
            <div className="pt-2 border-t border-gray-700/60 flex items-center justify-between">
              <span className="text-xs text-gray-500">Rate</span>
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
  // Only show days that have some activity or keep all for month shape
  const maxVal = Math.max(...data.map((d) => (d.completed ?? 0) + (d.pending ?? 0)), 1);

  // avg daily completed
  const withActivity = data.filter((d) => (d.completed ?? 0) + (d.pending ?? 0) > 0);
  const avgCompleted =
    withActivity.length > 0
      ? +(withActivity.reduce((s, d) => s + (d.completed ?? 0), 0) / withActivity.length).toFixed(1)
      : 0;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 16, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="mnCompGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.55} />
              <stop offset="70%" stopColor="#10b981" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="mnPendGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.0} />
            </linearGradient>
          </defs>

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
              stroke="#6366f1"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{
                value: `avg ${avgCompleted}`,
                position: 'right',
                fontSize: 10,
                fill: '#6366f1',
                fontWeight: 700,
              }}
            />
          )}

          <XAxis
            dataKey="day"
            stroke="transparent"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval={4}
            tick={{ fill: '#9ca3af', fontWeight: 600 }}
            tickFormatter={(v) => v.replace('Day ', 'D')}
          />
          <YAxis
            stroke="transparent"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            tick={{ fill: '#9ca3af' }}
            width={24}
            domain={[0, Math.ceil(maxVal * 1.3) || 5]}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 3' }}
          />

          {/* Pending area (bottom layer) */}
          <Area
            type="monotone"
            dataKey="pending"
            stroke="#f59e0b"
            strokeWidth={1.5}
            strokeDasharray="4 3"
            fill="url(#mnPendGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#f59e0b', stroke: '#111827', strokeWidth: 2 }}
            animationDuration={1000}
          />

          {/* Completed area (top layer — the main wave) */}
          <Area
            type="monotone"
            dataKey="completed"
            stroke="#10b981"
            strokeWidth={3}
            fill="url(#mnCompGrad)"
            dot={false}
            activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2.5 }}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
