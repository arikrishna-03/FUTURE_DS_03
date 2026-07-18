import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { LineChart as ChartIcon, AlertTriangle, Calendar } from 'lucide-react';
import type { DailyMetrics } from '../types';
import type { DecliningChannelShift } from '../utils/insightEngine';

interface TrendChartProps {
  dailyTrends: DailyMetrics[];
  decliningShifts: DecliningChannelShift[];
  currentBucket: 'day' | 'week' | 'month';
  onBucketChange: (bucket: 'day' | 'week' | 'month') => void;
}

export const TrendChart: React.FC<TrendChartProps> = ({ 
  dailyTrends, 
  decliningShifts, 
  currentBucket, 
  onBucketChange 
}) => {

  // Prepare chart data: calculate conversion rate percentage for each data point
  const chartData = dailyTrends.map(t => {
    const convRate = t.visitors > 0 ? (t.conversions / t.visitors) * 100 : 0;
    return {
      date: t.date,
      visitors: t.visitors,
      conversions: t.conversions,
      conversionRate: parseFloat(convRate.toFixed(1))
    };
  });

  // Safe formatting for dates
  const formatDateLabel = (dateStr: string) => {
    if (!dateStr || dateStr === 'Undated') return 'Undated';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      if (currentBucket === 'month') {
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short' });
      }
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  // Custom tooltips
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0E0E0E] text-white border-2 border-[#0E0E0E] p-4 rounded-xl shadow-[4px_4px_0px_rgba(255,93,56,0.2)] text-xs">
          <h4 className="font-black uppercase tracking-wider mb-2 border-b border-white/10 pb-1.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#FF5D38]" /> {formatDateLabel(data.date)}
          </h4>
          <div className="space-y-1.5 font-bold">
            <div className="flex items-center justify-between gap-6">
              <span className="text-slate-400">Total Visits:</span>
              <span>{data.visitors.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-slate-400">Conversions:</span>
              <span>{data.conversions.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between gap-6 text-[#FF5D38]">
              <span>Conversion Rate:</span>
              <span>{data.conversionRate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="w-full bg-[#FFFDFC] border-3 border-[#0E0E0E] rounded-3xl p-8 shadow-[6px_6px_0px_rgba(14,14,14,1)]">
      
      {/* Header and Filter Bucket Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b-2 border-slate-100">
        <div>
          <span className="inline-block px-3 py-1 bg-[#FF5D38] text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
            TIMELINE TRENDS
          </span>
          <h2 className="text-3xl font-black text-[#0E0E0E] uppercase tracking-tight font-display flex items-center gap-2">
            <ChartIcon className="w-7 h-7 text-[#FF5D38]" /> Conversion Over Time
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Observe shifts in daily, weekly, or monthly progression cycles to isolate growth anomalies.
          </p>
        </div>

        {/* Bucket controls */}
        <div className="bg-slate-100 p-1.5 rounded-xl flex border-2 border-[#0E0E0E] self-start md:self-auto">
          {(['day', 'week', 'month'] as const).map(b => (
            <button
              key={b}
              onClick={() => onBucketChange(b)}
              className={`px-3 py-1.5 text-xs font-black uppercase tracking-wider rounded-lg transition ${
                currentBucket === b 
                  ? 'bg-[#0E0E0E] text-white shadow' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {b}ly
            </button>
          ))}
        </div>
      </div>

      {/* Conversion Rate Line Graph */}
      <div className="h-80 w-full relative">
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400 font-bold">No date timeline coordinates found.</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 15, right: 15, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis 
                dataKey="date" 
                tickFormatter={formatDateLabel} 
                stroke="#0E0E0E" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                dy={10}
                fontFamily="Outfit, sans-serif"
                fontWeight="bold"
              />
              <YAxis 
                stroke="#0E0E0E" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                fontFamily="Outfit, sans-serif"
                fontWeight="bold"
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'Outfit' }}
              />
              
              <Line 
                name="Overall Conversion Rate (%)"
                type="monotone" 
                dataKey="conversionRate" 
                stroke="#FF5D38" 
                strokeWidth={3} 
                dot={{ fill: '#FF5D38', stroke: '#0E0E0E', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 7, strokeWidth: 1 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Decline Alerts / Shifts (Impossible to miss warnings) */}
      {decliningShifts.length > 0 && (
        <div className="mt-8 p-6 rounded-2xl bg-rose-50 border-2 border-rose-600 shadow-[4px_4px_0px_rgba(225,29,72,1)] space-y-4">
          <h4 className="text-base font-black text-rose-950 uppercase tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-600 animate-pulse" /> Channel Conversion Decay Flags
          </h4>
          <p className="text-xs font-semibold text-rose-900 leading-relaxed">
            The growth engine scanned the timeline and detected acquisition channels whose recent conversion rates dropped significantly compared to their historical baselines. Review ad creatives or budget limits immediately.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {decliningShifts.map(shift => (
              <div 
                key={shift.channel} 
                className="p-4 bg-white border-2 border-[#0E0E0E] rounded-xl flex items-center justify-between gap-3 shadow-[2px_2px_0px_rgba(14,14,14,1)]"
              >
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition channel</span>
                  <h5 className="text-sm font-black text-[#0E0E0E] uppercase mt-0.5">{shift.channel}</h5>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-black uppercase rounded mb-1">
                    -{shift.dropRelative.toFixed(0)}% Shift
                  </span>
                  <div className="text-xs font-bold text-slate-700">
                    {shift.historicalRate.toFixed(1)}% → <strong className="text-rose-600 font-extrabold">{shift.recentRate.toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </section>
  );
};
export default TrendChart;
