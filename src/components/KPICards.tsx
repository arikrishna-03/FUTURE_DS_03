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

  const kpis = [
    {
      title: 'Total Customers',
      value: summary.totalCustomers.toLocaleString(),
      icon: Users,
      color: 'from-blue-500/10 to-indigo-500/10 border-blue-500/30 text-blue-400',
      description: 'Total accounts analyzed',
      sparkline: sparklineTenure.map(r => 100 - r), // Retention sparkline
      sparklineColor: '#3b82f6',
      trend: { label: 'Active base', isPositive: true },
    },
    {
      title: 'Active Customers',
      value: summary.activeCustomers.toLocaleString(),
      icon: UserCheck,
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-500/30 text-emerald-400',
      description: 'Currently retained accounts',
      sparkline: sparklineTenure.map(r => 100 - r),
      sparklineColor: '#10b981',
      trend: { label: `${summary.retentionRate.toFixed(1)}% rate`, isPositive: true },
    },
    {
      title: 'Churned Customers',
      value: summary.churnedCustomers.toLocaleString(),
      icon: UserX,
      color: 'from-rose-500/10 to-pink-500/10 border-rose-500/30 text-rose-400',
      description: 'Lost customer accounts',
      sparkline: sparklineTenure,
      sparklineColor: '#f43f5e',
      trend: { label: `${summary.churnRate.toFixed(1)}% rate`, isPositive: false },
    },
    {
      title: 'Monthly Revenue Lost',
      value: `$${summary.totalMonthlyRevenueLost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      icon: ShieldAlert,
      color: 'from-red-500/10 to-orange-500/10 border-red-500/30 text-red-400',
      description: 'Monthly MRR lost to churn',
      sparkline: sparklineTenure.map((v, i) => v * (i + 1)), // Multiplier proxy
      sparklineColor: '#ef4444',
      trend: { label: 'MRR Impact', isPositive: false },
    },
    {
      title: 'Avg Monthly Charge',
      value: `$${summary.avgMonthlyCharges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: CreditCard,
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-500/30 text-indigo-400',
      description: 'Average monthly subscription bill',
      sparkline: [20, 45, 28, 80, 59, 90, 75],
      sparklineColor: '#6366f1',
      trend: { label: 'Bill average', isPositive: true },
    },
    {
      title: 'Avg Customer Lifetime',
      value: `${summary.avgTenure.toFixed(1)} Mo`,
      icon: Clock,
      color: 'from-amber-500/10 to-yellow-500/10 border-amber-500/30 text-amber-400',
      description: 'Average active tenure length',
      sparkline: sparklineTenure.map((_, i) => i * 15),
      sparklineColor: '#f59e0b',
      trend: { label: 'Retention longevity', isPositive: true },
    },
    {
      title: 'Customer Lifetime Value',
      value: `$${summary.customerLifetimeValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/30 text-purple-400',
      description: 'Avg CLV (Tenure × Monthly)',
      sparkline: sparklineTenure.map((v, i) => (100 - v) * (i + 1)),
      sparklineColor: '#a855f7',
      trend: { label: 'Estimated return', isPositive: true },
    },
    {
      title: 'Avg Total Charges',
      value: `$${summary.avgTotalCharges.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: BarChart3,
      color: 'from-teal-500/10 to-emerald-500/10 border-teal-500/30 text-teal-400',
      description: 'Avg total invoice billing',
      sparkline: [100, 300, 700, 1200, 2000, 3500, 5000],
      sparklineColor: '#14b8a6',
      trend: { label: 'Cumulative spend', isPositive: true },
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
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6"
    >
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        const isUp = kpi.trend.isPositive;

        return (
          <motion.div
            key={idx}
            variants={cardVariants}
            className="bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-5 shadow-lg hover:border-slate-700/80 transition-all duration-300 relative overflow-hidden group hover:scale-[1.01]"
          >
            {/* Background color glow on hover */}
            <div className={`absolute -right-16 -top-16 w-32 h-32 rounded-full bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-40 transition-opacity duration-500 blur-2xl pointer-events-none`} />

            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {kpi.title}
                </p>
                <h4 className="text-2xl md:text-3xl font-extrabold text-slate-100 tracking-tight mt-1">
                  {kpi.value}
                </h4>
              </div>
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${kpi.color} border flex items-center justify-center`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            {/* Sparkline & Trend */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/50">
              <span className="text-xs text-slate-500">
                {kpi.description}
              </span>
              <div className="flex items-center gap-3">
                {/* Sparkline SVG */}
                {kpi.sparkline && (
                  <svg className="w-16 h-7 opacity-70 group-hover:opacity-100 transition-opacity duration-300" viewBox="0 0 100 30">
                    <path
                      d={getSparklinePath(kpi.sparkline, 100, 30)}
                      fill="none"
                      stroke={kpi.sparklineColor}
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
                
                <span className={`text-xs font-bold flex items-center gap-0.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {kpi.trend.label}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
