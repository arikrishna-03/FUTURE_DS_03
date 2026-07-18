import React from 'react';
import { ResponsiveContainer, Bar, XAxis, YAxis, Tooltip, Cell, Line, ComposedChart, Area } from 'recharts';
import { ArrowDown, AlertTriangle, RefreshCw } from 'lucide-react';
import type { FunnelStageData } from '../types';

interface FunnelVisualizationProps {
  funnelData: FunnelStageData[];
}

export const FunnelVisualization: React.FC<FunnelVisualizationProps> = ({ funnelData }) => {
  if (funnelData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
        <RefreshCw className="w-8 h-8 text-slate-700 animate-spin mb-3" />
        <span className="text-xs text-slate-500 font-medium">Calibrating funnel data...</span>
      </div>
    );
  }

  // 1. Identify biggest drop-off stage
  let maxDropOffIdx = -1;
  let maxDropOffRate = -1;

  for (let i = 1; i < funnelData.length; i++) {
    if (funnelData[i].dropOffRate > maxDropOffRate) {
      maxDropOffRate = funnelData[i].dropOffRate;
      maxDropOffIdx = i;
    }
  }

  // Prepare data for Recharts composed chart
  const chartData = funnelData.map((stage, idx) => ({
    name: stage.stageName,
    volume: stage.count,
    conversion: parseFloat(stage.conversionRate.toFixed(1)),
    isWorstDropoff: idx === maxDropOffIdx
  }));

  const formatVolume = (val: number) => {
    return val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val.toString();
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const stageIdx = funnelData.findIndex(s => s.stageName === data.name);
      const stage = funnelData[stageIdx];
      
      return (
        <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl shadow-2xl backdrop-blur-md">
          <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2">{data.name}</h4>
          <div className="space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center justify-between gap-6">
              <span>Stage Volume:</span>
              <strong className="text-white">{stage.count.toLocaleString()} leads</strong>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span>Overall Conv. Rate:</span>
              <strong className="text-violet-400">{stage.conversionRate.toFixed(1)}%</strong>
            </div>
            {stageIdx > 0 && (
              <>
                <div className="flex items-center justify-between gap-6">
                  <span>Step-to-Step Conv:</span>
                  <strong className="text-emerald-400">{stage.stageToStageConversion.toFixed(1)}%</strong>
                </div>
                <div className="flex items-center justify-between gap-6">
                  <span>Stage Drop-off:</span>
                  <strong className="text-rose-450">{stage.dropOffRate.toFixed(1)}%</strong>
                </div>
              </>
            )}
          </div>
          {data.isWorstDropoff && (
            <div className="mt-3 pt-2.5 border-t border-rose-950 text-[10px] text-rose-350 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Highest drop-off bottleneck detected here!</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md space-y-6">
      
      <div>
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          Customer Funnel Conversion Waterfall
        </h3>
        <p className="text-xs text-slate-450 mt-1">
          Visualizes progress and leakage of marketing leads across designated stages.
        </p>
      </div>

      <div className="h-80 w-full relative">
        {/* Gradients */}
        <svg className="hidden">
          <defs>
            <linearGradient id="funnelGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.3} />
            </linearGradient>
            <linearGradient id="worstDropGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#be123c" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </svg>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 20, bottom: 5, left: -10 }}>
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatVolume}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Background area for smooth visuals */}
            <Area
              type="monotone"
              dataKey="volume"
              fill="url(#funnelGrad)"
              stroke="none"
              opacity={0.1}
            />

            {/* Stage Bar Volume */}
            <Bar dataKey="volume" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isWorstDropoff ? 'url(#worstDropGrad)' : 'url(#funnelGrad)'}
                  stroke={entry.isWorstDropoff ? '#f43f5e' : '#8b5cf6'}
                  strokeWidth={1}
                />
              ))}
            </Bar>
            
            {/* Conversion line overlay */}
            <Line
              type="monotone"
              dataKey="conversion"
              stroke="#f59e0b"
              strokeWidth={2.5}
              dot={{ fill: '#f59e0b', stroke: '#1e293b', strokeWidth: 1.5, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Drop-off metrics overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-850">
        {funnelData.slice(1).map((stage, idx) => {
          const isWorst = stage.stageName === funnelData[maxDropOffIdx]?.stageName;
          return (
            <div
              key={stage.stageName}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-300 ${
                isWorst
                  ? 'bg-rose-950/20 border-rose-900/40 shadow-[0_0_15px_rgba(244,63,94,0.05)]'
                  : 'bg-slate-950/40 border-slate-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider truncate max-w-[110px]">
                  {funnelData[idx].stageName} → {stage.stageName}
                </span>
                {isWorst && (
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold uppercase bg-rose-500 text-white flex items-center gap-0.5 animate-pulse">
                    <ArrowDown className="w-2.5 h-2.5" /> Leakage
                  </span>
                )}
              </div>
              <div className="mt-3.5 flex items-baseline gap-2">
                <span className={`text-xl font-extrabold tracking-tight ${isWorst ? 'text-rose-400' : 'text-slate-200'}`}>
                  -{stage.dropOffRate.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-550">drop-off</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1 leading-normal">
                Lost: {stage.dropOffCount.toLocaleString()} prospects
              </p>
            </div>
          );
        })}
      </div>

    </div>
  );
};
