import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, CheckSquare, DollarSign, TrendingUp, ShieldAlert, Award, PiggyBank } from 'lucide-react';
import type { DashboardMetrics } from '../types';

interface KPICardsProps {
  metrics: DashboardMetrics;
}

export const KPICards: React.FC<KPICardsProps> = ({ metrics }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${val.toFixed(2)}%`;
  };

  // Helper to draw a mock/mini sparkline path based on a seed
  const renderSparkline = (color: string, seed: number) => {
    // Generate simple wavy sparkline points
    const points = [15, 12, 18, 14, 22, 17, 25, 20, 28, 23, 30].map((y, idx) => {
      const x = idx * 9;
      const modY = 35 - (y * (0.8 + seed * 0.1)); // scale
      return `${x},${modY}`;
    }).join(' ');

    return (
      <svg className="w-18 h-8 opacity-75" viewBox="0 0 90 35">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  const cardConfig = [
    {
      title: 'Total Traffic / Visitors',
      value: metrics.totalVisitors.toLocaleString(),
      icon: <Users className="w-5 h-5 text-indigo-400" />,
      color: '#6366f1',
      sparkSeed: 0.8,
      trend: '+12.4% vs last week',
      isPositive: true,
      glow: 'shadow-[0_0_15px_rgba(99,102,241,0.05)]'
    },
    {
      title: 'Total Leads Generated',
      value: metrics.totalLeads.toLocaleString(),
      icon: <Target className="w-5 h-5 text-violet-400" />,
      color: '#8b5cf6',
      sparkSeed: 1.1,
      trend: '+8.3% vs last week',
      isPositive: true,
      glow: 'shadow-[0_0_15px_rgba(139,92,246,0.05)]'
    },
    {
      title: 'Customers / Conversions',
      value: metrics.totalConversions.toLocaleString(),
      icon: <CheckSquare className="w-5 h-5 text-emerald-400" />,
      color: '#10b981',
      sparkSeed: 1.4,
      trend: '+15.2% vs last week',
      isPositive: true,
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.05)]'
    },
    {
      title: 'Funnel Conversion Rate',
      value: formatPercent(metrics.overallConversionRate),
      icon: <Award className="w-5 h-5 text-amber-400" />,
      color: '#f59e0b',
      sparkSeed: 0.9,
      trend: '+0.45% MoM',
      isPositive: true,
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.05)]'
    },
    {
      title: 'Campaign Spend (Cost)',
      value: formatCurrency(metrics.totalSpend),
      icon: <DollarSign className="w-5 h-5 text-rose-400" />,
      color: '#f43f5e',
      sparkSeed: 1.3,
      trend: '-2.4% vs budget plan',
      isPositive: true, // green indicator for reducing or matching spend
      glow: 'shadow-[0_0_15px_rgba(244,63,94,0.05)]'
    },
    {
      title: 'Total Campaign Revenue',
      value: formatCurrency(metrics.totalRevenue),
      icon: <PiggyBank className="w-5 h-5 text-cyan-400" />,
      color: '#06b6d4',
      sparkSeed: 1.6,
      trend: '+24.1% vs target goal',
      isPositive: true,
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.05)]'
    },
    {
      title: 'Acquisition Return (ROI)',
      value: `${metrics.roi.toFixed(1)}%`,
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      color: '#10b981',
      sparkSeed: 1.5,
      trend: '+18.5% Net Profit yield',
      isPositive: metrics.roi > 0,
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.05)]'
    },
    {
      title: 'Customer Acquisition Cost (CAC)',
      value: metrics.cac > 0 ? formatCurrency(metrics.cac) : '$0.00',
      icon: <ShieldAlert className="w-5 h-5 text-pink-400" />,
      color: '#ec4899',
      sparkSeed: 0.7,
      trend: metrics.cac > 0 ? '-6.8% cost efficiency' : 'No conversions yet',
      isPositive: metrics.cac > 0,
      glow: 'shadow-[0_0_15px_rgba(236,72,153,0.05)]'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {cardConfig.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className={`p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700/80 transition-all duration-300 flex flex-col justify-between select-none relative overflow-hidden group ${card.glow}`}
        >
          {/* Ambient Glow behind icon */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-white/[0.02] to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                {card.title}
              </span>
              <span className="text-2xl font-extrabold text-white mt-2 block tracking-tight">
                {card.value}
              </span>
            </div>
            <div className="p-2.5 bg-slate-950/80 border border-slate-850 rounded-xl group-hover:scale-105 transition-all duration-300 shadow-inner">
              {card.icon}
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-850">
            <span className={`text-[11px] font-semibold flex items-center gap-1 ${card.isPositive ? 'text-emerald-400' : 'text-slate-400'}`}>
              {card.trend}
            </span>
            {renderSparkline(card.color, card.sparkSeed)}
          </div>
        </motion.div>
      ))}
    </div>
  );
};
