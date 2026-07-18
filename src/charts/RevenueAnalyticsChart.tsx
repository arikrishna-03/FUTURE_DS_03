import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, Legend, Line } from 'recharts';
import { PiggyBank, Calendar } from 'lucide-react';
import type { DailyMetrics } from '../types';

interface RevenueAnalyticsChartProps {
  dailyTrends: DailyMetrics[];
}

export const RevenueAnalyticsChart: React.FC<RevenueAnalyticsChartProps> = ({ dailyTrends }) => {
  if (dailyTrends.length === 0) return null;

  // Custom tooltips
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as DailyMetrics;
      const profit = data.revenue - data.spend;
      return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs text-slate-350 space-y-1.5">
          <h4 className="font-bold text-slate-200 flex items-center gap-1.5 mb-2">
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            {label}
          </h4>
          <div className="flex justify-between gap-6">
            <span>Visitors Captured:</span>
            <strong className="text-white">{data.visitors.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Conversions:</span>
            <strong className="text-violet-400">{data.conversions.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between gap-6 pt-1.5 border-t border-slate-900">
            <span>Marketing Cost:</span>
            <strong className="text-rose-455">${data.spend.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Gross Revenue:</span>
            <strong className="text-cyan-400">${data.revenue.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Net Profit:</span>
            <strong className={`font-bold ${profit >= 0 ? 'text-emerald-450' : 'text-rose-450'}`}>
              ${profit.toLocaleString(undefined, { maximumFractionDigits: 1 })}
            </strong>
          </div>
        </div>
      );
    }
    return null;
  };

  const formatCurrency = (value: number) => {
    return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
  };

  // Calculate cumulative profit trends for display
  const calculatedTrends = dailyTrends.map(t => ({
    ...t,
    profit: t.revenue - t.spend
  }));

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md space-y-5">
      
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-cyan-400" /> Revenue & Profit Performance Trend
          </h3>
          <p className="text-xs text-slate-450 mt-1">
            Chronological performance overlay mapping customer sales volume, budget cost, and profit margins.
          </p>
        </div>
      </div>

      <div className="h-72 w-full relative">
        <svg className="hidden">
          <defs>
            <linearGradient id="revArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="profitArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
        </svg>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={calculatedTrends} margin={{ top: 15, right: 10, bottom: 5, left: -20 }}>
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            
            {/* Revenue Area */}
            <Area
              name="Gross Revenue"
              type="monotone"
              dataKey="revenue"
              stroke="#06b6d4"
              strokeWidth={2}
              fill="url(#revArea)"
            />

            {/* Profit Area */}
            <Area
              name="Net Profit"
              type="monotone"
              dataKey="profit"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#profitArea)"
            />

            {/* Spend Line */}
            <Line
              name="Ad Spend (Cost)"
              type="monotone"
              dataKey="spend"
              stroke="#f43f5e"
              strokeWidth={1.5}
              dot={{ fill: '#f43f5e', r: 2.5 }}
              strokeDasharray="4 4"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
