import React from 'react';
import { ArrowRight, ArrowDown, HelpCircle } from 'lucide-react';
import type { FunnelStageData } from '../types';

interface FunnelHeroProps {
  funnelData: FunnelStageData[];
}

export const FunnelHero: React.FC<FunnelHeroProps> = ({ funnelData }) => {
  if (funnelData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 border-3 border-dashed border-[#0E0E0E] rounded-3xl bg-slate-50">
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Calibrating funnel progression...
        </span>
      </div>
    );
  }

  // Calculate maximum drop-off to highlight it
  let maxDropOffIdx = -1;
  let maxDropOffRate = -1;
  for (let i = 1; i < funnelData.length; i++) {
    if (funnelData[i].dropOffRate > maxDropOffRate) {
      maxDropOffRate = funnelData[i].dropOffRate;
      maxDropOffIdx = i;
    }
  }

  return (
    <section className="w-full bg-[#FFFDFC] border-3 border-[#0E0E0E] rounded-3xl p-8 shadow-[6px_6px_0px_rgba(14,14,14,1)] overflow-hidden">
      
      {/* Editorial Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b-2 border-slate-100">
        <div>
          <span className="inline-block px-3 py-1 bg-[#FF5D38] text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
            CONVERSION VISUALIZATION
          </span>
          <h2 className="text-3xl font-black text-[#0E0E0E] uppercase tracking-tight font-display">
            The Growth Funnel Waterfall
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Stage-by-stage progression from initial traffic to closed-won customer conversions.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-500 flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg p-2 max-w-xs">
          <HelpCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span>Stage widths are dynamically scaled to match their conversion ratios.</span>
        </div>
      </div>

      {/* Visual Funnel Row (Horizontal on desktop, stacked on mobile) */}
      <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4 py-8 lg:py-16 px-2">
        {funnelData.map((stage, idx) => {
          // Calculate scale factor for height (from 100% down to 35% minimum)
          const pct = stage.conversionRate;
          const scaleHeight = idx === 0 ? 100 : Math.max(35, pct);
          const isWorst = idx === maxDropOffIdx;

          return (
            <React.Fragment key={stage.stageName}>
              {/* Connector between stages */}
              {idx > 0 && (
                <div className="flex flex-col justify-center items-center py-4 lg:py-0 lg:px-2 flex-shrink-0">
                  {/* Large drop-off bubble */}
                  <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 border-[#0E0E0E] font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_rgba(14,14,14,1)] min-w-[110px] transition-all duration-300 ${
                    isWorst 
                      ? 'bg-rose-100 text-rose-600 border-rose-600 shadow-[3px_3px_0px_rgba(225,29,72,1)] animate-bounce' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Drop-off</span>
                    <span className="text-sm mt-0.5">-{stage.dropOffRate.toFixed(1)}%</span>
                  </div>

                  {/* Flow Arrow */}
                  <div className="mt-2 text-[#0E0E0E] flex items-center justify-center">
                    <ArrowRight className="w-5 h-5 hidden lg:block" />
                    <ArrowDown className="w-5 h-5 lg:hidden" />
                  </div>
                </div>
              )}

              {/* Stage Stepped Bar Block */}
              <div 
                className="flex-grow flex flex-col justify-center transition-all duration-500 ease-in-out"
                style={{ flexBasis: '0', flexGrow: 1 }}
              >
                {/* Stepped Container Box */}
                <div 
                  className={`relative p-6 rounded-3xl border-3 border-[#0E0E0E] transition-all duration-300 flex flex-col justify-between shadow-[4px_4px_0px_rgba(14,14,14,1)] ${
                    isWorst 
                      ? 'bg-rose-50 border-rose-600 hover:shadow-[6px_6px_0px_rgba(225,29,72,1)]' 
                      : 'bg-white hover:border-[#FF5D38] hover:shadow-[6px_6px_0px_rgba(255,93,56,1)]'
                  }`}
                  style={{
                    minHeight: '200px',
                    transform: `scaleY(${scaleHeight / 100})`,
                    transformOrigin: 'center'
                  }}
                >
                  {/* Cancel out scaling for text content readability */}
                  <div style={{ transform: `scaleY(${100 / scaleHeight})` }}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          Stage {idx + 1}
                        </span>
                        <h4 className="text-lg font-black text-[#0E0E0E] uppercase tracking-tight truncate mt-1">
                          {stage.stageName}
                        </h4>
                      </div>
                      
                      {/* Step index badge */}
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#0E0E0E] font-black text-xs ${
                        isWorst ? 'bg-rose-500 text-white border-rose-600' : 'bg-slate-100 text-[#0E0E0E]'
                      }`}>
                        {idx + 1}
                      </span>
                    </div>

                    {/* Conversions display */}
                    <div className="mt-8">
                      <span className="text-3xl sm:text-4xl font-black text-[#0E0E0E] tracking-tight">
                        {stage.conversionRate.toFixed(1)}%
                      </span>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                        Funnel Conversion
                      </p>
                    </div>

                    {/* Sub-Metrics details */}
                    <div className="mt-6 pt-4 border-t border-slate-100 space-y-1 text-xs font-bold text-slate-700">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Total Leads:</span>
                        <span className="text-[#0E0E0E] font-black">{stage.count.toLocaleString()}</span>
                      </div>
                      {idx > 0 && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Conversion Rate:</span>
                          <span className="text-[#FF5D38] font-black">{stage.stageToStageConversion.toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Summary Footer bar */}
      <div className="mt-8 pt-6 border-t-2 border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-bold text-slate-700">
        <div>
          <span>Total Funnel Conversion Rate:</span>
          <span className="text-[#FF5D38] font-black text-sm ml-1">
            {funnelData.length > 0 ? `${funnelData[funnelData.length - 1].conversionRate.toFixed(2)}%` : '0%'}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-white border-2 border-[#0E0E0E]" />
            <span>Normal Stage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded bg-rose-100 border-2 border-rose-600" />
            <span className="text-rose-600">Worst Leakage Bottleneck</span>
          </div>
        </div>
      </div>

    </section>
  );
};
export default FunnelHero;
