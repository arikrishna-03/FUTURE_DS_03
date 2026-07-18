import React from 'react';
import { Target, ArrowRight, ShieldCheck } from 'lucide-react';
import { DashboardData } from '../types';
import { generateRecommendations } from '../utils/insightEngine';
import { motion } from 'framer-motion';

interface InsightsPanelProps {
  data: DashboardData;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ data }) => {
  const recommendations = generateRecommendations(data);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.04,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  // Group recommendations by impact for better hierarchy
  const highImpact = recommendations.filter(r => r.impact === 'High');
  const mediumImpact = recommendations.filter(r => r.impact === 'Medium');
  const lowImpact = recommendations.filter(r => r.impact === 'Low');

  const orderedRecommendations = [...highImpact, ...mediumImpact, ...lowImpact];

  return (
    <div className="border-t border-slate-200 dark:border-slate-800/80 pt-8 my-10" id="insights">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-850 dark:text-slate-105 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            Strategic Retention Playbooks
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Operational recommendations prioritized by business impact, targeting high-risk subscriber cohorts and revenue leaks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800/60 dark:text-slate-400 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>{recommendations.length} Active Recommendations</span>
        </div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {orderedRecommendations.map((rec) => {
          let impactBadgeColor = '';
          let impactBorderColor = '';
          if (rec.impact === 'High') {
            impactBadgeColor = 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-450';
            impactBorderColor = 'border-rose-100 dark:border-rose-950/60';
          } else if (rec.impact === 'Medium') {
            impactBadgeColor = 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400';
            impactBorderColor = 'border-amber-100 dark:border-amber-950/60';
          } else {
            impactBadgeColor = 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400';
            impactBorderColor = 'border-blue-100 dark:border-blue-950/60';
          }

          return (
            <motion.div
              key={rec.id}
              variants={itemVariants}
              className={`bg-white dark:bg-slate-900/40 border border-slate-250/60 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-350 dark:hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-200`}
            >
              <div>
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${impactBadgeColor} ${impactBorderColor}`}>
                    {rec.impact} Impact
                  </span>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                    Operational Play
                  </span>
                </div>
                
                <h4 className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-4 leading-snug">
                  {rec.title}
                </h4>
                
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {rec.text}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-850/40 flex justify-between items-center">
                <span className="text-[10px] font-medium text-slate-400 uppercase">Automated Playbook</span>
                <button className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-350 flex items-center gap-1 group">
                  {rec.actionLabel}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}

        {recommendations.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-12 col-span-3 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl">
            No recommendations available. Please check mapped metrics.
          </p>
        )}
      </motion.div>
    </div>
  );
};
