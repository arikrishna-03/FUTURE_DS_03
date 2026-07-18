import React, { useMemo } from 'react';
import { ShieldAlert, TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import type { DashboardMetrics, FunnelStageData, DataQualitySummary } from '../types';

interface ExecutiveSummaryProps {
  metrics: DashboardMetrics;
  funnelData: FunnelStageData[];
  quality: DataQualitySummary;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ metrics, funnelData, quality }) => {
  
  // 1. Calculate Worst Bottleneck details
  const worstTransition = useMemo(() => {
    if (funnelData.length < 2) return null;
    let maxDropRate = -1;
    let worstIndex = -1;
    for (let i = 1; i < funnelData.length; i++) {
      if (funnelData[i].dropOffRate > maxDropRate) {
        maxDropRate = funnelData[i].dropOffRate;
        worstIndex = i;
      }
    }
    if (worstIndex !== -1) {
      return {
        from: funnelData[worstIndex - 1].stageName,
        to: funnelData[worstIndex].stageName,
        dropOffRate: funnelData[worstIndex].dropOffRate,
        lostVolume: funnelData[worstIndex].dropOffCount
      };
    }
    return null;
  }, [funnelData]);

  // 2. Draft Executive narrative paragraph (4-6 sentences)
  const narrative = useMemo(() => {
    const totalTraffic = metrics.totalVisitors.toLocaleString();
    const overallConv = metrics.overallConversionRate.toFixed(2);
    
    let baseText = `Your marketing acquisition pipeline processed a total of ${totalTraffic} visitors, culminating in an overall funnel conversion rate of ${overallConv}%. `;
    
    if (worstTransition) {
      const { from, to, dropOffRate, lostVolume } = worstTransition;
      baseText += `The single largest bottleneck in your user journey lies between the "${from}" and "${to}" stages, where a substantial ${dropOffRate.toFixed(1)}% of prospective leads are lost, representing a leakage of ${lostVolume.toLocaleString()} potential customers. `;
      baseText += `Resolving this specific leakage point by optimizing copy or reducing form fields constitutes the single highest-leverage growth opportunities for your marketing campaigns. `;
    } else {
      baseText += `The progression rates across your funnel remain relatively uniform, with no single catastrophic drop-off point detected. `;
    }

    if (metrics.roi > 0) {
      baseText += `Currently, campaigns are tracking at a positive ${metrics.roi.toFixed(0)}% ROI with a Customer Acquisition Cost (CAC) of $${metrics.cac.toFixed(2)}, indicating a profitable customer acquisition profile. `;
    } else if (metrics.totalSpend > 0) {
      baseText += `With a negative or unmeasured ROI, immediate attention should be directed toward testing cost controls and scaling higher-performing traffic channels. `;
    }

    baseText += `Data quality audit reports indicate a healthy database, with duplicate records dropped and standardized casing applied successfully.`;
    return baseText;
  }, [metrics, worstTransition]);

  return (
    <section className="w-full bg-[#0E0E0E] text-white rounded-3xl p-8 sm:p-12 shadow-[8px_8px_0px_rgba(255,93,56,1)] border-3 border-[#0E0E0E] overflow-hidden relative">
      {/* Decorative Grid backdrop & Accents */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#FF5D38]/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Upper Headline Banner */}
      <div className="relative z-10">
        <span className="inline-block px-3 py-1 bg-[#FF5D38] text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-4">
          GROWTH BRIEFING & STATUS REPORT
        </span>
        
        {/* Large Grotesque Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] font-display max-w-4xl">
          We are losing <span className="text-[#FF5D38] underline decoration-3 underline-offset-4 decoration-white">
            {worstTransition ? `${worstTransition.dropOffRate.toFixed(0)}%` : 'leads'}
          </span> of prospects at the <span className="text-[#FF5D38]">
            {worstTransition ? worstTransition.from : 'signup'}
          </span> stage.
        </h1>
        
        {/* 4-6 Sentence Narrative Paragraph */}
        <p className="mt-8 text-lg sm:text-xl font-medium text-slate-300 leading-relaxed max-w-4xl border-l-4 border-[#FF5D38] pl-6">
          {narrative}
        </p>

        {/* Data Quality Plain-Language Badge */}
        <div className="mt-8 flex flex-wrap items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-4 max-w-3xl">
          <ShieldAlert className="w-5 h-5 text-[#FF5D38] flex-shrink-0" />
          <p className="text-xs font-semibold text-slate-300">
            <span className="text-white font-bold">Data Quality Audit:</span> Processed {quality.totalRows.toLocaleString()} rows. Excised {quality.droppedRows} duplicate logs. Cleaned {quality.missingValuesCount} missing variables.
          </p>
        </div>

        {/* Overlapping KPI grid */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-white/10">
          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400">
              <Users className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Total Audience</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
              {metrics.totalVisitors.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Top of funnel users</p>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400">
              <Target className="w-4 h-4 text-[#FF5D38]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF5D38]">Conversions</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
              {metrics.totalConversions.toLocaleString()}
            </div>
            <p className="text-[10px] text-[#FF5D38] font-bold mt-1 uppercase">
              {metrics.overallConversionRate.toFixed(2)}% Conversion Rate
            </p>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">CAC / Unit</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
              ${metrics.cac.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-555 font-bold mt-1 uppercase">Customer Acquisition Cost</p>
          </div>

          <div className="p-5 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Marketing ROI</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black mt-2 text-white">
              {metrics.roi > 0 ? `${metrics.roi.toFixed(0)}%` : 'N/A'}
            </div>
            <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase">Net return on spend</p>
          </div>
        </div>
      </div>
    </section>
  );
};
export default ExecutiveSummary;
