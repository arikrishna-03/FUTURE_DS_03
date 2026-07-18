import React, { useMemo } from 'react';
import { AlertOctagon, TrendingDown, Lightbulb } from 'lucide-react';
import type { FunnelStageData, DashboardMetrics } from '../types';

interface DropoffDiagnosisProps {
  funnelData: FunnelStageData[];
  metrics: DashboardMetrics;
}

export const DropoffDiagnosis: React.FC<DropoffDiagnosisProps> = ({ funnelData, metrics }) => {
  const diagnosis = useMemo(() => {
    if (funnelData.length < 2) return null;
    
    let maxDropRate = -1;
    let worstIdx = -1;
    for (let i = 1; i < funnelData.length; i++) {
      if (funnelData[i].dropOffRate > maxDropRate) {
        maxDropRate = funnelData[i].dropOffRate;
        worstIdx = i;
      }
    }

    if (worstIdx === -1) return null;

    const currentStage = funnelData[worstIdx];
    const prevStage = funnelData[worstIdx - 1];

    // Downstream Conversion Rate = total conversions / leads before drop-off
    const downstreamConvRate = prevStage.count > 0 ? metrics.totalConversions / prevStage.count : 0;
    
    // Average Order Value / Revenue per Customer
    const avgCustomerValue = metrics.totalConversions > 0 ? metrics.totalRevenue / metrics.totalConversions : 150; // fallback $150
    
    // Lost conversions = dropped leads * probability of converting if they stayed
    const lostConversions = Math.round(currentStage.dropOffCount * downstreamConvRate);
    const lostRevenueOpportunity = lostConversions * avgCustomerValue;

    return {
      fromStage: prevStage.stageName,
      toStage: currentStage.stageName,
      dropOffRate: currentStage.dropOffRate,
      dropOffCount: currentStage.dropOffCount,
      prevCount: prevStage.count,
      currentCount: currentStage.count,
      lostConversions,
      lostRevenueOpportunity,
      avgCustomerValue
    };
  }, [funnelData, metrics]);

  if (!diagnosis) return null;

  return (
    <section className="w-full bg-[#FFFDFC] border-3 border-[#0E0E0E] rounded-3xl p-8 shadow-[6px_6px_0px_rgba(225,29,72,1)] relative overflow-hidden">
      {/* Visual Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-rose-650/5 rounded-full blur-xl pointer-events-none" />

      <div className="flex flex-col lg:flex-row items-stretch gap-8">
        
        {/* Left Column: Massive Alert Box */}
        <div className="lg:w-3/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-rose-100 text-rose-700 text-xs font-black uppercase tracking-widest rounded-xl border border-rose-300">
              <AlertOctagon className="w-4 h-4 text-rose-600 animate-pulse" /> Critical Funnel Leak Detected
            </span>
            
            <h3 className="text-3xl sm:text-4xl font-black text-[#0E0E0E] uppercase tracking-tight font-display leading-none">
              Isolate the <span className="text-rose-600 font-black">{diagnosis.fromStage} → {diagnosis.toStage}</span> Transition
            </h3>
            
            <p className="text-base text-slate-700 font-medium leading-relaxed">
              We are losing <strong className="text-[#0E0E0E] font-black">{diagnosis.dropOffRate.toFixed(1)}%</strong> of users between these two consecutive stages. Out of {diagnosis.prevCount.toLocaleString()} leads who reached the <strong>{diagnosis.fromStage}</strong> stage, <strong className="text-rose-600">{diagnosis.dropOffCount.toLocaleString()} abandoned</strong> the journey before reaching <strong>{diagnosis.toStage}</strong>.
            </p>
          </div>

          {/* Quick Win checklist */}
          <div className="p-5 bg-slate-50 border-2 border-[#0E0E0E] rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <span className="text-xs font-black text-[#0E0E0E] uppercase tracking-wider">Recommended Diagnosis Audit Checklist:</span>
            </div>
            <ul className="text-xs text-slate-700 font-bold space-y-1.5 pl-5 list-disc">
              <li>Deploy form field analytics to check which input fields cause friction.</li>
              <li>A/B test value proposition headlines at this specific stage.</li>
              <li>Implement exit-intent triggers offering instant validation or direct chat assistance.</li>
              <li>Load-test landing pages on mobile to assure responsive rendering stability.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: High Impact Value Cards */}
        <div className="lg:w-2/5 flex flex-col gap-4 justify-between">
          
          {/* Lost Opportunity Card */}
          <div className="p-6 bg-rose-50 border-3 border-rose-600 rounded-3xl shadow-[4px_4px_0px_rgba(225,29,72,1)] flex flex-col justify-between flex-grow">
            <div>
              <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest">
                Estimated Loss Value
              </span>
              <div className="text-4xl sm:text-5xl font-black text-rose-600 tracking-tight mt-2 flex items-baseline gap-1">
                ${diagnosis.lostRevenueOpportunity.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <span className="text-xs text-rose-700 font-bold">USD</span>
              </div>
            </div>
            <p className="text-xs font-semibold text-rose-950 mt-4 leading-normal">
              Based on a downstream conversion probability of <strong>{(diagnosis.lostConversions / (diagnosis.dropOffCount || 1) * 100).toFixed(1)}%</strong> and an average client value of <strong>${diagnosis.avgCustomerValue.toFixed(0)}</strong>, recapturing these dropped leads would yield approximately <strong>+{diagnosis.lostConversions.toLocaleString()} conversions</strong>.
            </p>
          </div>

          {/* Help Callout */}
          <div className="p-5 bg-[#0E0E0E] text-white rounded-2xl border-2 border-[#0E0E0E] flex items-center gap-4">
            <div className="p-2.5 bg-[#FF5D38] rounded-xl text-white">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h5 className="text-sm font-black uppercase tracking-tight">Leakiest Transition Stage</h5>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                Plugs this leak first before scaling budgets or launching new campaigns.
              </p>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
export default DropoffDiagnosis;
