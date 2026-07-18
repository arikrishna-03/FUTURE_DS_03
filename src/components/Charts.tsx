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
  Label,
} from 'recharts';
import { DashboardData, ThemeAccentColor } from '../types';
import { generateInsights } from '../utils/insightEngine';
import { AlertTriangle } from 'lucide-react';

interface ChartsProps {
  data: DashboardData;
  themeColor?: ThemeAccentColor;
}

const CATEGORICAL_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#f43f5e', // Rose
];

// Custom interactive tooltip
const CustomTooltip = ({ active, payload, label, unit = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-lg">
        {label && <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">{label}</p>}
        {payload.map((item: any, index: number) => {
          const val = typeof item.value === 'number' ? item.value.toLocaleString(undefined, { maximumFractionDigits: 1 }) : item.value;
          return (
            <p key={index} className="text-xs font-semibold flex items-center gap-2" style={{ color: item.color || item.fill }}>
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

  // Track dark mode automatically for chart text contrast
  const [isDark, setIsDark] = React.useState(document.documentElement.classList.contains('dark'));
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const gridColor = isDark ? '#1e293b' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#475569';

  const ACCENT_HEX_MAP = {
    indigo: '#6366f1',
    blue: '#3b82f6',
    emerald: '#10b981',
    purple: '#a855f7',
    rose: '#f43f5e',
    amber: '#f59e0b'
  };
  const activeColor = ACCENT_HEX_MAP[themeColor] || '#6366f1';

  // Retrieve insights
  const insights = generateInsights(data);
  const getInsightById = (id: string) => insights.find(ins => ins.id === id);
  const getInsightByColName = (col: string) => 
    insights.find(ins => ins.id === `segment_insight_${col}` || ins.id.toLowerCase().includes(col.toLowerCase()));

  // Pie chart data
  const overallDistributionData = [
    { name: 'Retained Customers', value: summary.activeCustomers, color: '#10b981' },
    { name: 'Churned Customers', value: summary.churnedCustomers, color: '#f43f5e' },
  ];

  const renderInsightBox = (insight: any) => {
    if (!insight) return null;
    return (
      <div className={`mt-4 p-3 rounded-xl border text-xs flex items-start gap-2.5 leading-relaxed transition-all ${
        insight.type === 'warning'
          ? 'bg-rose-500/5 border-rose-200/50 text-rose-700 dark:border-rose-950/60 dark:text-rose-300'
          : insight.type === 'success'
          ? 'bg-emerald-500/5 border-emerald-200/50 text-emerald-700 dark:border-emerald-950/60 dark:text-emerald-300'
          : 'bg-indigo-500/5 border-indigo-200/50 text-indigo-700 dark:border-indigo-950/60 dark:text-indigo-300'
      }`}>
        <AlertTriangle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-[11px] mb-0.5 uppercase tracking-wide">{insight.title}</span>
          <span className="opacity-90">{insight.text}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-10 my-10">
      
      {/* SECTION 1: Executive Overview */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8" id="overview">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-105 flex items-center gap-2">
            Executive Retention Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Global distribution of active customer retention and monthly recurring revenue leak status.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Customer Retention Breakdown (Pie) */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Customer Account Distribution
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-550 mt-0.5">Active vs. exited subscriber accounts</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-950">
                  {summary.retentionRate.toFixed(1)}% Retained
                </span>
              </div>
            </div>
            
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={overallDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={6}
                    dataKey="value"
                  >
                    {overallDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={30} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-semibold text-slate-650 dark:text-slate-350">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {renderInsightBox(getInsightById('overall_churn'))}
          </div>

          {/* Revenue Leakage (Donut) */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Monthly Revenue (MRR) Breakdown
                  </h3>
                  <p className="text-[11px] text-slate-450 dark:text-slate-550 mt-0.5">Retained base contract values vs. lost charges</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-950">
                  ${summary.totalMonthlyRevenueLost.toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo lost
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active MRR', value: summary.activeCustomers * summary.avgMonthlyCharges, color: '#10b981' },
                      { name: 'Lost MRR (At Risk)', value: summary.totalMonthlyRevenueLost, color: '#f43f5e' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={0}
                    outerRadius={65}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f43f5e" />
                  </Pie>
                  <Tooltip content={<CustomTooltip unit=" USD" />} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={30} 
                    iconType="circle"
                    formatter={(value) => <span className="text-xs font-semibold text-slate-650 dark:text-slate-350">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {renderInsightBox(getInsightById('revenue_at_risk'))}
          </div>

        </div>
      </div>

      {/* SECTION 2: Cohort & Risk Factors */}
      <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8" id="segments">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-105 flex items-center gap-2">
            Retention Cohorts & Price Risk
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Analyzing customer risk against account lifespan (tenure) and billing scale.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Tenure vs Churn (Survival Cohorts) */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Churn Rate by Account Age
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-550 mt-0.5">Exited percentage vs. how many months account has been active</p>
            </div>
            <div className="flex-1 min-h-[180px] mt-6">
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={tenureVsChurn} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="tenureColor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="tenureBin" 
                    stroke={textColor} 
                    fontSize={10} 
                    tickLine={false} 
                  >
                    <Label value="Tenure Cohort (Months)" offset={-2} position="insideBottom" fill={textColor} fontSize={10} style={{ fontWeight: 500 }} />
                  </XAxis>
                  <YAxis 
                    stroke={textColor} 
                    fontSize={10} 
                    tickLine={false} 
                    unit="%" 
                  />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <Area 
                    type="monotone" 
                    dataKey="churnRate" 
                    name="Churn Rate"
                    stroke="#f43f5e" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#tenureColor)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {renderInsightBox(getInsightById('tenure_impact'))}
          </div>

          {/* Monthly Charges vs Churn Rate */}
          <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[380px]">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                Churn Rate by Monthly Billing Bracket
              </h3>
              <p className="text-[11px] text-slate-450 dark:text-slate-550 mt-0.5">Identifying price sensitivity across different charge limits</p>
            </div>
            <div className="flex-1 min-h-[180px] mt-6">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyChargesVsChurn} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                  <XAxis 
                    dataKey="chargeBin" 
                    stroke={textColor} 
                    fontSize={10} 
                    tickLine={false} 
                  >
                    <Label value="Monthly Charges ($)" offset={-2} position="insideBottom" fill={textColor} fontSize={10} style={{ fontWeight: 500 }} />
                  </XAxis>
                  <YAxis 
                    stroke={textColor} 
                    fontSize={10} 
                    tickLine={false} 
                    unit="%" 
                  />
                  <Tooltip content={<CustomTooltip unit="%" />} />
                  <Bar dataKey="churnRate" name="Churn Rate" fill={activeColor} radius={[4, 4, 0, 0]}>
                    {monthlyChargesVsChurn.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.churnRate > 25 ? '#f43f5e' : activeColor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {renderInsightBox(getInsightById('price_sensitivity'))}
          </div>

        </div>
      </div>

      {/* SECTION 3: Dynamic Categorical Breakdowns */}
      {categoricalAnalysis.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8" id="financial">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-850 dark:text-slate-105 flex items-center gap-2">
              Segment Risk Breakdowns
              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 border border-slate-200 dark:border-slate-700 rounded-full">Dynamic Dimensions</span>
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Automated analysis comparing churn weights across mapped category segments.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categoricalAnalysis.map((cat) => (
              <div 
                key={cat.columnName} 
                className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[340px]"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200">
                    Churn by {cat.displayName}
                  </h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-550 mt-0.5">Exiting comparison by different {cat.displayName.toLowerCase()} categories</p>
                </div>

                <div className="flex-1 min-h-[160px] mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={cat.segments} 
                      layout="vertical" 
                      margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
                      <XAxis 
                        type="number" 
                        stroke={textColor} 
                        fontSize={9} 
                        tickLine={false} 
                        unit="%" 
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke={textColor} 
                        fontSize={9} 
                        tickLine={false} 
                        width={90}
                      />
                      <Tooltip content={<CustomTooltip unit="%" />} />
                      <Bar dataKey="churnRate" name="Churn Rate" radius={[0, 4, 4, 0]}>
                        {cat.segments.map((_, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORICAL_COLORS[index % CATEGORICAL_COLORS.length]} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {renderInsightBox(getInsightByColName(cat.columnName))}
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
