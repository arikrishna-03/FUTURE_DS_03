import React from 'react';
import { Users, UserX, UserCheck, TrendingUp, TrendingDown, Clock, CreditCard, DollarSign, ShieldAlert, BarChart3 } from 'lucide-react';
import { DashboardData } from '../types';
import { motion } from 'framer-motion';

interface KPICardsProps {
  data: DashboardData;
}

export const KPICards: React.FC<KPICardsProps> = ({ data }) => {
  const { summary, tenureVsChurn } = data;

  const sparklineTenure = tenureVsChurn.map(t => t.churnRate);

  // Helper to generate sparkline SVG path
  const getSparklinePath = (values: number[], width = 100, height = 30) => {
    if (values.length < 2) return '';
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min === 0 ? 1 : max - min;
    
    return values
      .map((val, index) => {
        const x = (index / (values.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  // Primary High-Rank Metrics
  const primaryKpis = [
    {
      title: 'Churn Rate',
      value: `${summary.churnRate.toFixed(1)}%`,
      icon: UserX,
      color: 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/5 dark:border-rose-950/60 dark:text-rose-400',
      description: 'Lost customer accounts percentage',
      sparkline: sparklineTenure,
      sparklineColor: '#f43f5e',
      trend: { label: `${summary.churnedCustomers.toLocaleString()} accounts lost`, isPositive: false },
    },
    {
      title: 'Revenue Lost / At Risk',
      value: `$${summary.totalMonthlyRevenueLost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: ShieldAlert,
      color: 'bg-rose-50 border-rose-200 text-rose-600 dark:bg-rose-500/5 dark:border-rose-950/60 dark:text-rose-400',
      description: 'Monthly MRR lost to churn',
      sparkline: sparklineTenure.map((v, i) => v * (i + 1)),
      sparklineColor: '#ef4444',
      trend: { label: 'Direct MRR leakage', isPositive: false },
    },
    {
      title: 'Customer Lifetime Value',
      value: `$${summary.customerLifetimeValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/5 dark:border-indigo-950/60 dark:text-indigo-400',
      description: 'Avg CLV (Tenure × Monthly)',
      sparkline: sparklineTenure.map((v, i) => (100 - v) * (i + 1)),
      sparklineColor: '#6366f1',
      trend: { label: 'Estimated return', isPositive: true },
    },
  ];

  // Secondary Supporting Metrics
  const secondaryKpis = [
    {
      title: 'Total Customers',
      value: summary.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800/80 dark:text-slate-400',
      description: 'Total accounts analyzed',
      trend: { label: 'Base cohort size', isPositive: true },
    },
    {
      title: 'Active Customers',
      value: summary.activeCustomers.toLocaleString(),
      icon: UserCheck,
      color: 'bg-emerald-50 border-emerald-250 text-emerald-600 dark:bg-emerald-500/5 dark:border-emerald-950/60 dark:text-emerald-400',
      description: 'Currently retained accounts',
      trend: { label: `${summary.retentionRate.toFixed(1)}% retention`, isPositive: true },
    },
    {
      title: 'Avg Customer Lifetime',
      value: `${summary.avgTenure.toFixed(1)} Mo`,
      icon: Clock,
      color: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800/80 dark:text-slate-400',
      description: 'Average active tenure length',
      trend: { label: 'Customer longevity', isPositive: true },
    },
    {
      title: 'Avg Monthly Charge',
      value: `$${summary.avgMonthlyCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      color: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800/80 dark:text-slate-400',
      description: 'Average monthly subscription bill',
      trend: { label: 'Bill average', isPositive: true },
    },
    {
      title: 'Avg Total Spend',
      value: `$${summary.avgTotalCharges.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: BarChart3,
      color: 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-900/50 dark:border-slate-800/80 dark:text-slate-400',
      description: 'Avg total invoice billing',
      trend: { label: 'Spend average', isPositive: true },
    },
  ];

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="space-y-6 my-8">
      {/* Primary Metrics: Higher visual weight, larger sizes */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Primary Risk & Financial Impact Metrics
        </h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {primaryKpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            const isUp = kpi.trend.isPositive;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className={`bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm hover:border-slate-350 dark:hover:border-slate-700 transition-all duration-200 relative overflow-hidden group hover:-translate-y-0.5`}
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {kpi.title}
                    </p>
                    <h4 className="text-3.5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono">
                      {kpi.value}
                    </h4>
                  </div>
                  <div className={`p-3 rounded-xl border flex items-center justify-center ${kpi.color}`}>
                    <Icon className="w-5.5 h-5.5" />
                  </div>
                </div>

                {/* Sparkline & Trend */}
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100 dark:border-slate-850">
                  <span className="text-xs text-slate-500 dark:text-slate-400 leading-none">
                    {kpi.description}
                  </span>
                  <div className="flex items-center gap-3">
                    {kpi.sparkline && (
                      <svg className="w-16 h-7 opacity-75 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 100 30">
                        <path
                          d={getSparklinePath(kpi.sparkline, 100, 30)}
                          fill="none"
                          stroke={kpi.sparklineColor}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    )}
                    
                    <span className={`text-[11px] font-bold flex items-center gap-0.5 ${
                      kpi.title.toLowerCase().includes('churn') || kpi.title.toLowerCase().includes('lost')
                        ? 'text-rose-500'
                        : 'text-indigo-500 dark:text-indigo-400'
                    }`}>
                      {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {kpi.trend.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Secondary Metrics: Smaller grid, supporting data */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
          Cohort Size & Operational Averages
        </h3>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-5 gap-4"
        >
          {secondaryKpis.map((kpi, idx) => {
            const Icon = kpi.icon;

            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="bg-white dark:bg-slate-900/20 border border-slate-200/80 dark:border-slate-850/80 rounded-xl p-4 shadow-sm hover:border-slate-300 dark:hover:border-slate-800 transition-all duration-200 group hover:-translate-y-0.5"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1 min-w-0">
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider truncate">
                      {kpi.title}
                    </p>
                    <h5 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight font-mono truncate">
                      {kpi.value}
                    </h5>
                  </div>
                  <div className={`p-2 rounded-lg border flex items-center justify-center ${kpi.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-855/40 text-[10px] flex items-center justify-between">
                  <span className="text-slate-450 dark:text-slate-500 truncate mr-1">
                    {kpi.description}
                  </span>
                  <span className={`font-bold whitespace-nowrap ${
                    kpi.title.toLowerCase().includes('active')
                      ? 'text-emerald-500'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}>
                    {kpi.trend.label}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};
