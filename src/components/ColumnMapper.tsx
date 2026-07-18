import React, { useState, useEffect } from 'react';

import { ArrowRight, Table, Settings, ArrowUp, ArrowDown, HelpCircle, Layers, CheckCircle2 } from 'lucide-react';
import { detectColumns } from '../utils/columnDetector';
import type { CSVDataPreview, ColumnMapping } from '../types';

interface ColumnMapperProps {
  previewData: CSVDataPreview;
  onMappingConfirmed: (mapping: ColumnMapping, orderedStages: string[]) => void;
  onCancel: () => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({ previewData, onMappingConfirmed, onCancel }) => {
  const { headers, rows } = previewData;
  
  // 1. Core Config States
  const [mapping, setMapping] = useState<ColumnMapping>({
    leadId: '',
    date: '',
    channel: '',
    campaign: '',
    device: '',
    region: '',
    spend: '',
    revenue: '',
    conversionFlag: '',
    isMultiColumnFunnel: false,
    funnelStage: '',
    multiColumnStages: []
  });

  // For managing ordered steps in single-column funnel or multi-column checkbox selections
  const [singleColumnStages, setSingleColumnStages] = useState<string[]>([]);
  const [selectedMultiStages, setSelectedMultiStages] = useState<string[]>([]);

  // Sample data preview length
  const previewRows = rows.slice(0, 10);

  // Auto-detect mappings on load
  useEffect(() => {
    const detected = detectColumns(headers, rows);
    setMapping(detected);

    if (detected.isMultiColumnFunnel) {
      setSelectedMultiStages(detected.multiColumnStages);
    } else if (detected.funnelStage) {
      // Find all unique stages in that column
      const col = detected.funnelStage;
      const unique = Array.from(new Set(rows.map(r => r[col]).filter(Boolean)));
      // Standardize ordering heuristic
      const sorted = getLogicalStageOrderHeuristic(unique);
      setSingleColumnStages(sorted);
    }
  }, [previewData]);

  // Fallback heuristic if funnelEngine's sort isn't imported, let's replicate or design a clean one
  const getLogicalStageOrderHeuristic = (stages: string[]): string[] => {
    const stageWeights: Record<string, number> = {
      visitor: 1, visit: 1, session: 1, click: 1, awareness: 1, landing: 1.5,
      signup: 2, register: 2, interest: 2, lead: 3, mql: 3, qualified: 3.5, sql: 3.7,
      opportunity: 4, demo: 4, trial: 4, proposal: 4.2, cart: 4.5, checkout: 4.7,
      purchase: 5, purchased: 5, converted: 5, customer: 5, closed: 5, sale: 5
    };

    const getWeight = (stageName: string): number => {
      const normalized = stageName.toLowerCase().replace(/[\s_-]/g, '');
      for (const key of Object.keys(stageWeights)) {
        if (normalized.includes(key) || key.includes(normalized)) {
          return stageWeights[key];
        }
      }
      return 10;
    };

    return [...stages].sort((a, b) => getWeight(a) - getWeight(b));
  };

  // Re-detect stages if funnel stage column mapping changes
  const handleFunnelStageColChange = (colName: string) => {
    setMapping(prev => ({ ...prev, funnelStage: colName }));
    if (colName) {
      const unique = Array.from(new Set(rows.map(r => r[colName]).filter(Boolean)));
      setSingleColumnStages(getLogicalStageOrderHeuristic(unique));
    } else {
      setSingleColumnStages([]);
    }
  };

  // Toggle multi column funnel checkbox
  const handleMultiColumnStageCheckbox = (colName: string) => {
    setSelectedMultiStages(prev => {
      if (prev.includes(colName)) {
        return prev.filter(c => c !== colName);
      } else {
        return [...prev, colName];
      }
    });
  };

  // Save changes and generate
  const handleGenerate = () => {
    const finalMapping = {
      ...mapping,
      multiColumnStages: mapping.isMultiColumnFunnel ? selectedMultiStages : []
    };
    const finalStages = mapping.isMultiColumnFunnel ? selectedMultiStages : singleColumnStages;
    onMappingConfirmed(finalMapping, finalStages);
  };

  // Reorder stages functions
  const moveStage = (index: number, direction: 'up' | 'down', isMulti: boolean) => {
    const list = isMulti ? [...selectedMultiStages] : [...singleColumnStages];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIdx < 0 || targetIdx >= list.length) return;
    
    // Swap
    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    if (isMulti) {
      setSelectedMultiStages(list);
    } else {
      setSingleColumnStages(list);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto my-6 px-4">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-violet-400" /> Data Calibration & Mapping
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Review parsed columns and auto-detected metrics. Override any guesses to configure the analytics charts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 transition duration-200 cursor-pointer"
          >
            Upload Different File
          </button>
          <button
            onClick={handleGenerate}
            className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-lg hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition duration-200 flex items-center gap-2 cursor-pointer"
          >
            Generate Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Column Mapping Selector Forms */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Primary Dimensions */}
          <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-violet-950 text-violet-400 text-xs font-bold border border-violet-800/50">1</span>
              Primary Marketing Dimensions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Lead ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Lead ID / Visitor ID</label>
                <select
                  value={mapping.leadId}
                  onChange={(e) => setMapping(prev => ({ ...prev, leadId: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Timestamp / Date</label>
                <select
                  value={mapping.date}
                  onChange={(e) => setMapping(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Acquisition Channel */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Marketing Channel / Source</label>
                <select
                  value={mapping.channel}
                  onChange={(e) => setMapping(prev => ({ ...prev, channel: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Campaign */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Ad Campaign Name</label>
                <select
                  value={mapping.campaign}
                  onChange={(e) => setMapping(prev => ({ ...prev, campaign: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Device */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Device / Platform</label>
                <select
                  value={mapping.device}
                  onChange={(e) => setMapping(prev => ({ ...prev, device: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Region / Geography</label>
                <select
                  value={mapping.region}
                  onChange={(e) => setMapping(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Financial Mappings */}
          <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-5.5 h-5.5 rounded-full bg-emerald-950 text-emerald-400 text-xs font-bold border border-emerald-900/40">2</span>
              Financial & Conversion Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Campaign Cost */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Campaign Spend / Ad Spend</label>
                <select
                  value={mapping.spend}
                  onChange={(e) => setMapping(prev => ({ ...prev, spend: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Revenue */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Revenue Generated</label>
                <select
                  value={mapping.revenue}
                  onChange={(e) => setMapping(prev => ({ ...prev, revenue: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Conversion Flag */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Conversion Flag (0/1)</label>
                <select
                  value={mapping.conversionFlag}
                  onChange={(e) => setMapping(prev => ({ ...prev, conversionFlag: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                >
                  <option value="">-- Choose (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: CSV Data Table Preview */}
          <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Table className="w-5 h-5 text-slate-400" />
              Source CSV Preview (First 5 Rows)
            </h3>
            
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="min-w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-slate-400 font-semibold uppercase">
                    {headers.slice(0, 7).map(h => (
                      <th key={h} className="px-4 py-3 font-semibold">{h}</th>
                    ))}
                    {headers.length > 7 && <th className="px-4 py-3 font-semibold text-violet-400">+{headers.length - 7} more</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850 bg-slate-900/20 text-slate-300">
                  {previewRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      {headers.slice(0, 7).map(h => (
                        <td key={h} className="px-4 py-2.5 truncate max-w-[120px]">{row[h] || <span className="text-slate-600 font-italic">null</span>}</td>
                      ))}
                      {headers.length > 7 && <td className="px-4 py-2.5 text-slate-500">...</td>}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Side: Funnel Configuration Panel */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-850 shadow-lg sticky top-6">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-violet-400" />
              Funnel Schema Design
            </h3>

            {/* Toggle funnel structure */}
            <div className="bg-slate-950 p-1 rounded-lg flex border border-slate-800/80 mb-6">
              <button
                type="button"
                onClick={() => setMapping(prev => ({ ...prev, isMultiColumnFunnel: false }))}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                  !mapping.isMultiColumnFunnel
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Stage Column
              </button>
              <button
                type="button"
                onClick={() => setMapping(prev => ({ ...prev, isMultiColumnFunnel: true }))}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition ${
                  mapping.isMultiColumnFunnel
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Binary Step Columns
              </button>
            </div>

            {/* Content: Mode 1 - Single stage column selection */}
            {!mapping.isMultiColumnFunnel ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Funnel Stage Column</label>
                  <select
                    value={mapping.funnelStage}
                    onChange={(e) => handleFunnelStageColChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500 transition"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <p className="mt-2 text-[11px] text-slate-500 flex items-start gap-1">
                    <HelpCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    For CSVs where each record represents a lead, containing a single stage label (e.g. "MQL", "Closed Deal").
                  </p>
                </div>

                {singleColumnStages.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Sort Funnel Sequence</label>
                    <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                      {singleColumnStages.map((stage, index) => (
                        <div key={stage} className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-lg border border-slate-850 hover:border-slate-800 text-xs text-slate-300">
                          <span className="font-medium truncate max-w-[140px]">{stage}</span>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={index === 0}
                              onClick={() => moveStage(index, 'up', false)}
                              className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={index === singleColumnStages.length - 1}
                              onClick={() => moveStage(index, 'down', false)}
                              className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Content: Mode 2 - Select multiple binary flag columns
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Funnel Columns</label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto border border-slate-850 bg-slate-950 p-2 rounded-lg pr-1">
                    {headers.map(col => (
                      <label key={col} className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-slate-900 cursor-pointer text-xs text-slate-300">
                        <input
                          type="checkbox"
                          checked={selectedMultiStages.includes(col)}
                          onChange={() => handleMultiColumnStageCheckbox(col)}
                          className="rounded border-slate-800 text-violet-500 focus:ring-violet-500/20 bg-slate-950"
                        />
                        <span className="truncate">{col}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500 flex items-start gap-1">
                    <HelpCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    For CSVs where a user has separate indicator columns for steps (e.g. Visitors=1, Leads=1, Customers=0).
                  </p>
                </div>

                {selectedMultiStages.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Order Funnel Steps</label>
                    <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                      {selectedMultiStages.map((stage, index) => (
                        <div key={stage} className="flex items-center justify-between px-3 py-2 bg-slate-950 rounded-lg border border-slate-850 hover:border-slate-800 text-xs text-slate-300">
                          <span className="font-medium truncate max-w-[140px]">{stage}</span>
                          <div className="flex items-center gap-1">
                            <button
                              disabled={index === 0}
                              onClick={() => moveStage(index, 'up', true)}
                              className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              disabled={index === selectedMultiStages.length - 1}
                              onClick={() => moveStage(index, 'down', true)}
                              className="p-1 hover:bg-slate-800 rounded disabled:opacity-30 disabled:hover:bg-transparent text-slate-400 hover:text-white"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Validation indicators */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2.5">
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className={`w-4 h-4 ${mapping.channel ? 'text-emerald-500' : 'text-slate-650'}`} />
                <span className={mapping.channel ? 'text-slate-300' : 'text-slate-500'}>Marketing Channel mapped</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <CheckCircle2 className={`w-4 h-4 ${(mapping.isMultiColumnFunnel ? selectedMultiStages.length >= 2 : singleColumnStages.length >= 2) ? 'text-emerald-500' : 'text-slate-650'}`} />
                <span className={(mapping.isMultiColumnFunnel ? selectedMultiStages.length >= 2 : singleColumnStages.length >= 2) ? 'text-slate-300' : 'text-slate-500'}>At least 2 funnel steps defined</span>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              className="w-full mt-6 py-3 text-center text-sm font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 rounded-xl hover:shadow-[0_4px_15px_rgba(99,102,241,0.2)] active:scale-[0.98] transition cursor-pointer"
            >
              Confirm Calibration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
