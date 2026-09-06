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

// Custom dot to highlight today (last data point)
const CustomDot = (props) => {
  const { cx, cy, index, data } = props;
  if (index === (data?.length ?? 0) - 1) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={7} fill="#6366f1" stroke="#fff" strokeWidth={2.5} />
        <circle cx={cx} cy={cy} r={12} fill="#6366f1" fillOpacity={0.2} />
      </g>
    );
  }
  return <circle cx={cx} cy={cy} r={4} fill="#6366f1" stroke="#fff" strokeWidth={2} />;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0]?.value ?? 0;
    return (
      <div className="bg-gray-900/95 backdrop-blur border border-indigo-500/30 rounded-2xl p-4 shadow-2xl min-w-[130px]">
        <p className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider mb-2">{label}</p>
        <div className="flex items-end gap-2">
          <span className="text-3xl font-extrabold text-white font-outfit">{val}</span>
          <span className="text-xs text-gray-400 mb-1">habit{val !== 1 ? 's' : ''}</span>
        </div>
        <p className="text-[10px] text-indigo-400 mt-1">
          {val === 0 ? 'No habits completed' : val >= 5 ? '🔥 Great streak!' : '✅ Keep going!'}
        </p>
      </div>
    );
  }
  return null;
};

export const WeeklyChart = ({ data = [] }) => {
  const maxVal = Math.max(...data.map((d) => d.completed ?? 0), 1);
  // avg line
  const totalCompleted = data.reduce((s, d) => s + (d.completed ?? 0), 0);
  const avgCompleted = data.length > 0 ? +(totalCompleted / data.length).toFixed(1) : 0;

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 16, right: 16, left: -12, bottom: 0 }}
        >
          <defs>
            <linearGradient id="wkGradTop" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
              <stop offset="60%" stopColor="#818cf8" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#374151"
            opacity={0.18}
            vertical={false}
          />

          {/* Average reference line */}
          {avgCompleted > 0 && (
            <ReferenceLine
              y={avgCompleted}
              stroke="#f59e0b"
              strokeDasharray="5 4"
              strokeWidth={1.5}
              label={{
                value: `avg ${avgCompleted}`,
                position: 'right',
                fontSize: 10,
                fill: '#f59e0b',
                fontWeight: 700,
              }}
            />
          )}

          <XAxis
            dataKey="day"
            stroke="transparent"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#9ca3af', fontWeight: 700 }}
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

          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 3' }} />

          <Area
            type="monotoneX"
            dataKey="completed"
            stroke="#6366f1"
            strokeWidth={3}
            fill="url(#wkGradTop)"
            dot={<CustomDot data={data} />}
            activeDot={false}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
