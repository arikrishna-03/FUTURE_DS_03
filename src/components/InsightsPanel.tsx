import React from 'react';
import { Lightbulb, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import type { DynamicInsight } from '../utils/insightEngine';

interface InsightsPanelProps {
  insights: DynamicInsight[];
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights }) => {
  if (insights.length === 0) return null;

  const getStyles = (type: 'success' | 'warning' | 'info') => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        };
      case 'warning':
        return {
          bg: 'bg-rose-950/20 border-rose-900/40 text-rose-300',
          icon: <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-cyan-950/20 border-cyan-900/40 text-cyan-300',
          icon: <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        };
    }
  };

  return (
    <div className="mt-4 p-4 rounded-xl bg-slate-900/40 border border-slate-850/80 shadow-sm space-y-2.5">
      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
        <Lightbulb className="w-3.5 h-3.5 text-violet-400" />
        Data Analytics Insights
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {insights.map((insight) => {
          const styles = getStyles(insight.type);
          return (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border text-xs leading-relaxed flex items-start gap-2.5 shadow-sm transition duration-300 hover:brightness-105 ${styles.bg}`}
            >
              {styles.icon}
              <span>{insight.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
