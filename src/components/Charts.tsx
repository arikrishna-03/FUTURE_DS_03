import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { DashboardData, ThemeAccentColor } from '../types';

interface ChartsProps {
  data: DashboardData;
  themeColor?: ThemeAccentColor;
}

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

// Custom interactive glassmorphic tooltip
const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-3 rounded-xl shadow-xl">
        {label && <p className="text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wide">{label}</p>}
        {payload.map((item: any, index: number) => {
          const val = typeof item.value === 'number' ? item.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : item.value;
          return (
            <p key={index} className="text-sm font-semibold flex items-center gap-2" style={{ color: item.color || item.fill }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color || item.fill }} />
              {item.name}: {val}{unit}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export const Charts: React.FC<ChartsProps> = ({ data, themeColor = 'indigo' }) => {
  const { summary, categoricalAnalysis, tenureVsChurn, monthlyChargesVsChurn } = data;

  const ACCENT_HEX_MAP = {
    indigo: '#6366f1',
    blue: '#3b82f6',
    emerald: '#10b981',
    purple: '#a855f7',
    rose: '#f43f5e',
    amber: '#f59e0b'
  };
  const activeColor = ACCENT_HEX_MAP[themeColor];

  // Pie chart data
  const overallDistributionData = [
    { name: 'Retained Customers', value: summary.activeCustomers, color: '#10b981' },
    { name: 'Churned Customers', value: summary.churnedCustomers, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 my-6">
      
      {/* Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Overall Churn Distribution (Pie) */}
        <div className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[360px]">
          <div>
            <h3 className="text-base font-bold text-slate-200 flex items-center gap-1.5">
              Customer Retention Breakdown
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Overall distribution of active vs. exited customer accounts</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[220px]">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={overallDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {overallDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-xs font-medium text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-800/40">
            Total active cohort represents {summary.retentionRate.toFixed(1)}% of base.
          </div>
        </div>

        {/* Tenure vs Churn (Survival Cohorts) */}
        <div className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between min-h-[360px] lg:col-span-2">
          <div>
            <h3 className="text-base font-bold text-slate-200">
              Churn Rate by Tenure Cohort
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Exited percentage mapping against customer account longevity</p>
          </div>
          <div className="flex-1 min-h-[220px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={tenureVsChurn} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tenureColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937/40" vertical={false} />
                <XAxis 
                  dataKey="tenureBin" 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false} 
                  unit="%" 
                />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Area 
                  type="monotone" 
                  dataKey="churnRate" 
                  name="Churn Rate"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#tenureColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/40 flex justify-between">
            <span>Critical period: First 6 months</span>
            <span className="font-semibold text-rose-400">Highest Risk Cohort</span>
          </div>
        </div>

      </div>

      {/* Revenue & Charge Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Charges vs Churn Rate */}
        <div className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg min-h-[320px] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200">
              Bill Bracket Risk Mapping
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Comparing user churn rate across monthly billing ranges</p>
          </div>
          <div className="flex-1 min-h-[200px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChargesVsChurn} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="chargeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={activeColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={activeColor} stopOpacity={0.2}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937/40" vertical={false} />
                <XAxis 
                  dataKey="chargeBin" 
                  stroke="#6b7280" 
                  fontSize={9} 
                  tickLine={false} 
                />
                <YAxis 
                  stroke="#6b7280" 
                  fontSize={10} 
                  tickLine={false} 
                  unit="%" 
                />
                <Tooltip content={<CustomTooltip unit="%" />} />
                <Bar dataKey="churnRate" name="Churn Rate" fill="url(#chargeColor)" radius={[4, 4, 0, 0]}>
                  {monthlyChargesVsChurn.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.churnRate > 25 ? '#ef4444' : activeColor} fillOpacity={0.85} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/40">
            Note: Red bars highlight pricing cohorts exceeding 25% churn threshold.
          </div>
        </div>

        {/* Revenue Leakage Chart */}
        <div className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg min-h-[320px] flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-200">
              MRR Contribution vs Leakage
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Retained active customer revenue vs. total monthly revenue lost</p>
          </div>
          <div className="flex-1 min-h-[200px] mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Active MRR', value: summary.activeCustomers * summary.avgMonthlyCharges, color: '#10b981' },
                    { name: 'Lost MRR (At Risk)', value: summary.totalMonthlyRevenueLost, color: '#ef4444' },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={0}
                  outerRadius={75}
                  paddingAngle={0}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#10b981" />
                  <Cell fill="#ef4444" />
                </Pie>
                <Tooltip content={<CustomTooltip unit=" USD" />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-500 pt-2 border-t border-slate-800/40 text-center">
            Total monthly revenue lost: <strong className="text-rose-400">${summary.totalMonthlyRevenueLost.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong>
          </div>
        </div>

      </div>

      {/* Dynamic Categorical Breakdown Charts */}
      {categoricalAnalysis.length > 0 && (
        <div>
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
            <span>Segment Risk Breakdowns</span>
            <span className="text-xs font-normal text-slate-400 bg-slate-800 px-2.5 py-0.5 border border-slate-700 rounded-full">Auto-Generated Visualizations</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoricalAnalysis.map((cat) => (
              <div 
                key={cat.columnName} 
                className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg min-h-[300px] flex flex-col justify-between"
              >
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Churn by {cat.displayName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">Exiting comparison by different {cat.displayName.toLowerCase()} categories</p>
                </div>

                <div className="flex-1 min-h-[180px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={cat.segments} 
                      layout="vertical" 
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937/40" horizontal={false} />
                      <XAxis 
                        type="number" 
                        stroke="#6b7280" 
                        fontSize={9} 
                        tickLine={false} 
                        unit="%" 
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#6b7280" 
                        fontSize={9} 
                        tickLine={false} 
                        width={80}
                      />
                      <Tooltip content={<CustomTooltip unit="%" />} />
                      <Bar dataKey="churnRate" name="Churn Rate" radius={[0, 4, 4, 0]}>
                        {cat.segments.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={COLORS[index % COLORS.length]} 
                            fillOpacity={0.8}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="text-[10px] text-slate-500 pt-2 border-t border-slate-800/40 flex justify-between">
                  <span>Categories: {cat.segments.length}</span>
                  <span>Highest risk: <strong className="text-rose-400">{[...cat.segments].sort((a,b) => b.churnRate - a.churnRate)[0]?.name || 'N/A'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
