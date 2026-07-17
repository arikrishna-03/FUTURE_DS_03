import React from 'react';
import { Sparkles, Target, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { DashboardData } from '../types';
import { generateInsights, generateRecommendations } from '../utils/insightEngine';
import { motion } from 'framer-motion';

interface InsightsPanelProps {
  data: DashboardData;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ data }) => {
  const insights = generateInsights(data);
  const recommendations = generateRecommendations(data);

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-8">
      
      {/* Insights Section */}
      <div className="lg:col-span-1 bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Statistical Insights
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            Machine-computed correlations derived from the loaded schema, identifying key churn indicators and risk hotspots.
          </p>

          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3.5"
          >
            {insights.map((insight) => (
              <motion.div
                key={insight.id}
                variants={itemVariants}
                className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/80 flex items-start gap-3 hover:border-slate-700/60 transition-colors"
              >
                <div className={`p-2 rounded-lg mt-0.5 ${
                  insight.type === 'warning' 
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25' 
                    : insight.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/25'
                }`}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start gap-1">
                    <h4 className="text-xs font-bold text-slate-200">{insight.title}</h4>
                    {insight.metric && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        insight.type === 'warning' 
                          ? 'bg-rose-500/10 text-rose-300' 
                          : insight.type === 'success'
                          ? 'bg-emerald-500/10 text-emerald-300'
                          : 'bg-indigo-500/10 text-indigo-300'
                      }`}>
                        {insight.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{insight.text}</p>
                </div>
              </motion.div>
            ))}

            {insights.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No statistical correlations detected. Make sure columns are fully mapped.</p>
            )}
          </motion.div>
        </div>

        <div className="pt-4 border-t border-slate-800/40 mt-4 text-[10px] text-slate-500 text-center">
          Analysis generated on {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Actionable Recommendations Section */}
      <div className="lg:col-span-2 bg-[#111827]/40 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
          <Target className="w-5 h-5 text-indigo-400" />
          Strategic Retain Actions (at least 10 recommendations)
        </h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          Operational priorities recommended by the analytics engine. These proposals specifically address segments exhibiting high churn weights and revenue at risk.
        </p>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {recommendations.map((rec) => (
            <motion.div
              key={rec.id}
              variants={itemVariants}
              className="p-4 rounded-xl bg-slate-950/30 border border-slate-800/60 flex flex-col justify-between hover:border-slate-700/60 transition-colors"
            >
              <div>
                <div className="flex justify-between items-center gap-2">
                  <span className={`text-[9px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded ${
                    rec.impact === 'High'
                      ? 'bg-rose-500/10 text-rose-300 border border-rose-500/15'
                      : rec.impact === 'Medium'
                      ? 'bg-amber-500/10 text-amber-300 border border-amber-500/15'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/15'
                  }`}>
                    {rec.impact} Impact
                  </span>
                  
                  <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> Actionable
                  </span>
                </div>
                
                <h4 className="text-xs font-bold text-slate-200 mt-2.5">
                  {rec.title}
                </h4>
                
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  {rec.text}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/40 flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Operation Plan</span>
                <button className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 group">
                  {rec.actionLabel}
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}

          {recommendations.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-6 col-span-2">No recommendations available. Please check mapped metrics.</p>
          )}
        </motion.div>
      </div>

    </div>
  );
};
