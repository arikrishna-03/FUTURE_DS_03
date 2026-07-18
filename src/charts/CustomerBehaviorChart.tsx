import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Globe, Smartphone, HelpCircle } from 'lucide-react';
import type { SegmentPerformance } from '../types';

interface CustomerBehaviorChartProps {
  deviceData: SegmentPerformance[];
  regionData: SegmentPerformance[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];

export const CustomerBehaviorChart: React.FC<CustomerBehaviorChartProps> = ({ deviceData, regionData }) => {
  
  // Custom tooltips
  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-350 shadow-xl backdrop-blur-md">
          <strong className="text-white block uppercase mb-1">{data.name}</strong>
          <div>Conversions: <span className="text-emerald-400 font-bold">{data.value.toLocaleString()}</span></div>
          <div>Conv. Rate: <span className="text-violet-400 font-bold">{data.rate.toFixed(2)}%</span></div>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const rate = payload[0].value as number;
      return (
        <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg text-xs text-slate-350 shadow-xl backdrop-blur-md">
          <strong className="text-white block uppercase mb-1">{label}</strong>
          <div>Conversion Rate: <span className="text-emerald-400 font-bold">{rate.toFixed(2)}%</span></div>
        </div>
      );
    }
    return null;
  };

  // Prepare Pie chart data
  const pieChartData = deviceData.map(item => ({
    name: item.segmentValue,
    value: item.conversions,
    rate: item.conversionRate
  }));

  // Limit regions to top 6
  const topRegions = [...regionData].sort((a, b) => b.conversionRate - a.conversionRate).slice(0, 6);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Device Analysis Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-400" /> Device Conversion Breakdown
          </h3>
          <p className="text-xs text-slate-450 mt-1">
            Distribution of campaign conversions and individual device rates (Desktop, Mobile, Tablet).
          </p>
        </div>

        <div className="h-56 w-full flex items-center justify-center relative my-4">
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#1e293b" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <span className="text-xs text-slate-550">No device data mapped</span>
          )}
        </div>

        {/* Device comparative summaries */}
        <div className="space-y-2.5">
          {deviceData.map((item, index) => (
            <div key={item.segmentValue} className="flex items-center justify-between text-xs p-2 bg-slate-950/40 rounded-lg border border-slate-900">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="font-semibold text-slate-300">{item.segmentValue}</span>
              </div>
              <div className="space-x-4">
                <span className="text-slate-450">Conversions: <strong className="text-slate-200">{item.conversions}</strong></span>
                <span className="text-violet-400 font-bold">{item.conversionRate.toFixed(1)}% Conv.</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Region Analysis Card */}
      <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-400" /> Geographic Performance Analysis
          </h3>
          <p className="text-xs text-slate-450 mt-1">
            Conversion efficiency rates ranked by geographical regions.
          </p>
        </div>

        <div className="h-56 w-full my-4">
          {topRegions.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topRegions} layout="vertical" margin={{ top: 10, right: 10, bottom: 5, left: -15 }}>
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={val => `${val}%`} />
                <YAxis type="category" dataKey="segmentValue" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar name="Conversion Rate" dataKey="conversionRate" fill="#10b981" radius={[0, 5, 5, 0]} maxBarSize={16}>
                  {topRegions.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-550">
              No region data mapped
            </div>
          )}
        </div>

        {/* Region footnote */}
        {topRegions.length > 0 && (
          <div className="text-[11px] text-slate-500 bg-slate-950/40 p-2.5 rounded-lg border border-slate-900 flex items-center gap-1.5 mt-2">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-500" />
            <span>
              Highest converting geo is <strong>"{topRegions[0].segmentValue}"</strong> at {topRegions[0].conversionRate.toFixed(1)}%, indicating solid local campaign resonance.
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
