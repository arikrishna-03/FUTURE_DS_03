import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ComposedChart, Line } from 'recharts';
import { Sparkles, DollarSign, Target, Award } from 'lucide-react';
import type { ChannelPerformance } from '../types';

interface ChannelPerformanceChartProps {
  channelsData: ChannelPerformance[];
}

export const ChannelPerformanceChart: React.FC<ChannelPerformanceChartProps> = ({ channelsData }) => {
  const [activeTab, setActiveTab] = useState<'financial' | 'efficiency' | 'cac'>('financial');

  if (channelsData.length === 0) return null;

  // Custom currency formatting for Y-axis
  const formatCurrency = (value: number) => {
    return value >= 1000 ? `$${(value / 1000).toFixed(1)}k` : `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChannelPerformance;
      return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md text-xs text-slate-350 space-y-1.5">
          <h4 className="font-bold text-slate-200 uppercase tracking-wider mb-2">{label}</h4>
          <div className="flex justify-between gap-6">
            <span>Visitors:</span>
            <strong className="text-white">{data.visitors.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Leads:</span>
            <strong className="text-violet-400">{data.leads.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Conversions:</span>
            <strong className="text-emerald-405">{data.conversions.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between gap-6 pt-1.5 border-t border-slate-900">
            <span>Spend / Cost:</span>
            <strong className="text-rose-400">${data.spend.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>Revenue:</span>
            <strong className="text-cyan-400">${data.revenue.toLocaleString(undefined, { maximumFractionDigits: 1 })}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>CAC:</span>
            <strong className="text-pink-400">${data.cac.toFixed(2)}</strong>
          </div>
          <div className="flex justify-between gap-6">
            <span>ROI:</span>
            <strong className="text-emerald-400">{data.roi.toFixed(1)}%</strong>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md space-y-5">
      
      {/* Title & Interactive Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-850 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            Acquisition Channel Metrics
          </h3>
          <p className="text-xs text-slate-450 mt-1">
            Analyze lead quality, cost controls, and revenue distributions per traffic channel.
          </p>
        </div>
        
        {/* Navigation tabs */}
        <div className="bg-slate-950 p-1 rounded-lg flex border border-slate-850">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'financial'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" /> Finance
          </button>
          <button
            onClick={() => setActiveTab('efficiency')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'efficiency'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            <Target className="w-3.5 h-3.5" /> Conversion
          </button>
          <button
            onClick={() => setActiveTab('cac')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'cac'
                ? 'bg-violet-600 text-white'
                : 'text-slate-400 hover:text-slate-205'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> CAC & ROI
          </button>
        </div>
      </div>

      {/* Recharts Wrapper */}
      <div className="h-72 w-full">
        {activeTab === 'financial' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelsData} margin={{ top: 15, right: 10, bottom: 5, left: -20 }}>
              <XAxis dataKey="channel" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={formatCurrency} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar name="Revenue Generated" dataKey="revenue" fill="#06b6d4" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar name="Marketing Spend" dataKey="spend" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'efficiency' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={channelsData} margin={{ top: 15, right: 10, bottom: 5, left: -20 }}>
              <XAxis dataKey="channel" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar name="Leads Volume" dataKey="leads" fill="#8b5cf6" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar name="Final Conversions" dataKey="conversions" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'cac' && (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={channelsData} margin={{ top: 15, right: -10, bottom: 5, left: -20 }}>
              <XAxis dataKey="channel" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={val => `$${val}`} />
              <YAxis yAxisId="right" orientation="right" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={val => `${val}%`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar yAxisId="left" name="Customer Acquisition Cost (CAC)" dataKey="cac" fill="#ec4899" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Line yAxisId="right" name="Return on Investment (ROI)" type="monotone" dataKey="roi" stroke="#f59e0b" strokeWidth={2.5} dot={{ fill: '#f59e0b', r: 3.5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Spark Insight sentence */}
      {channelsData.length > 0 && (
        <div className="text-[11px] text-slate-500 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>
            {activeTab === 'financial' && `Top financial performer is "${[...channelsData].sort((a,b)=>b.revenue-a.revenue)[0]?.channel}" generating the highest revenue.`}
            {activeTab === 'efficiency' && `Highest conversion velocity is on "${[...channelsData].sort((a,b)=>b.conversionRate-a.conversionRate)[0]?.channel}" with ${[...channelsData].sort((a,b)=>b.conversionRate-a.conversionRate)[0]?.conversionRate.toFixed(1)}% rate.`}
            {activeTab === 'cac' && `Most CAC efficient acquisition source is "${[...channelsData].filter(c=>c.spend>0).sort((a,b)=>a.cac-b.cac)[0]?.channel || 'N/A'}" ($${[...channelsData].filter(c=>c.spend>0).sort((a,b)=>a.cac-b.cac)[0]?.cac.toFixed(2) || '0.00'}).`}
          </span>
        </div>
      )}

    </div>
  );
};
