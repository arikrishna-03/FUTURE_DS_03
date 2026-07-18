import React from 'react';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Target, Award } from 'lucide-react';
import type { CampaignPerformance } from '../types';

interface CampaignPerformanceChartProps {
  campaignsData: CampaignPerformance[];
}

export const CampaignPerformanceChart: React.FC<CampaignPerformanceChartProps> = ({ campaignsData }) => {
  // Take top 8 campaigns by revenue to prevent cluttering
  const topCampaigns = [...campaignsData]
    .filter(c => c.visitors > 2)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  if (topCampaigns.length === 0) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as CampaignPerformance;
      return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs text-slate-350 space-y-1.5">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">{label}</h4>
          <div className="flex justify-between gap-6">
            <span>Impressions / Visitors:</span>
            <strong className="text-white">{data.visitors.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Conversions:</span>
            <strong className="text-emerald-400">{data.conversions.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Conversion Rate:</span>
            <strong className="text-violet-400">{data.conversionRate.toFixed(2)}%</strong>
          </div>
          <div className="flex justify-between gap-6 pt-1.5 border-t border-slate-900">
            <span>Campaign Cost:</span>
            <strong className="text-rose-400">${data.spend.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Revenue Generated:</span>
            <strong className="text-cyan-400">${data.revenue.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Net Campaign ROI:</span>
            <strong className={`font-bold ${data.roi >= 0 ? 'text-emerald-400' : 'text-rose-455'}`}>
              {data.roi.toFixed(1)}%
            </strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md space-y-5">
      
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Ad Campaign Performance Comparison
          </h3>
          <p className="text-xs text-slate-450 mt-1">
            Compares gross revenue generated alongside percentage ROI across active marketing initiatives.
          </p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={topCampaigns} margin={{ top: 15, right: -10, bottom: 5, left: -20 }}>
            <XAxis
              dataKey="campaign"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={val => val.length > 12 ? `${val.slice(0, 10)}...` : val}
            />
            <YAxis
              yAxisId="left"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={val => val >= 1000 ? `$${(val / 1000).toFixed(0)}k` : `$${val}`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={val => `${val}%`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
            
            {/* Revenue Bar */}
            <Bar
              yAxisId="left"
              name="Campaign Revenue"
              dataKey="revenue"
              fill="#06b6d4"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
            />
            
            {/* ROI Line */}
            <Line
              yAxisId="right"
              name="Campaign ROI (%)"
              type="monotone"
              dataKey="roi"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign insight notes */}
      {topCampaigns.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10px] text-slate-500 pt-1">
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
            <span>
              Highest ROI: <strong>{topCampaigns.sort((a,b)=>b.roi-a.roi)[0]?.campaign}</strong> ({topCampaigns.sort((a,b)=>b.roi-a.roi)[0]?.roi.toFixed(1)}% ROI).
            </span>
          </div>
          <div className="bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span>
              Top Revenue: <strong>{topCampaigns.sort((a,b)=>b.revenue-a.revenue)[0]?.campaign}</strong> (${topCampaigns.sort((a,b)=>b.revenue-a.revenue)[0]?.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}).
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
