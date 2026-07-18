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

  // Fallback heuristic for standard ordering
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
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b-3 border-[#0E0E0E] pb-6 mb-8">
        <div>
          <span className="inline-block px-3 py-1 bg-[#FF5D38] text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-1">
            Data Quality Audit
          </span>
          <h2 className="text-3xl font-black text-[#0E0E0E] uppercase tracking-tight flex items-center gap-2.5 font-display">
            <Settings className="w-8 h-8 text-[#FF5D38]" /> Schema Alignment
          </h2>
          <p className="text-sm font-medium text-slate-700 mt-1">
            Ensure acquisition channels, marketing spend, and conversions are calibrated correctly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 border-2 border-[#0E0E0E] rounded-xl transition duration-150 cursor-pointer"
          >
            Upload Different File
          </button>
          <button
            onClick={handleGenerate}
            className="px-5 py-3 text-xs font-black uppercase tracking-widest text-white bg-[#FF5D38] hover:bg-[#E54823] border-2 border-[#0E0E0E] rounded-xl shadow-[3px_3px_0px_rgba(14,14,14,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_rgba(14,14,14,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[1px_1px_0px_rgba(14,14,14,1)] transition-all duration-150 flex items-center gap-2 cursor-pointer"
          >
            Generate Case Study <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Column Mapping Selector Forms */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Card 1: Primary Dimensions */}
          <div className="p-6 rounded-2xl bg-white border-3 border-[#0E0E0E] shadow-[4px_4px_0px_rgba(14,14,14,1)]">
            <h3 className="text-xl font-black text-[#0E0E0E] uppercase tracking-tight mb-6 flex items-center gap-3 font-display">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0E0E0E] text-white text-sm font-black">1</span>
              User Acquisition Dimensions
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Lead ID */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Lead ID / Log ID</label>
                <select
                  value={mapping.leadId}
                  onChange={(e) => setMapping(prev => ({ ...prev, leadId: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Date / Timestamp</label>
                <select
                  value={mapping.date}
                  onChange={(e) => setMapping(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Acquisition Channel */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Traffic Channel / Source</label>
                <select
                  value={mapping.channel}
                  onChange={(e) => setMapping(prev => ({ ...prev, channel: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Campaign */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Campaign Name</label>
                <select
                  value={mapping.campaign}
                  onChange={(e) => setMapping(prev => ({ ...prev, campaign: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Device */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Device Category</label>
                <select
                  value={mapping.device}
                  onChange={(e) => setMapping(prev => ({ ...prev, device: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Region */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Region / Territory</label>
                <select
                  value={mapping.region}
                  onChange={(e) => setMapping(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Financial Mappings */}
          <div className="p-6 rounded-2xl bg-white border-3 border-[#0E0E0E] shadow-[4px_4px_0px_rgba(14,14,14,1)]">
            <h3 className="text-xl font-black text-[#0E0E0E] uppercase tracking-tight mb-6 flex items-center gap-3 font-display">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF5D38] text-white text-sm font-black">2</span>
              Spend & Revenue Metrics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Campaign Cost */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Campaign Spend / Cost</label>
                <select
                  value={mapping.spend}
                  onChange={(e) => setMapping(prev => ({ ...prev, spend: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Revenue */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Conversion Value / revenue</label>
                <select
                  value={mapping.revenue}
                  onChange={(e) => setMapping(prev => ({ ...prev, revenue: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              {/* Conversion Flag */}
              <div>
                <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Conversion indicator flag</label>
                <select
                  value={mapping.conversionFlag}
                  onChange={(e) => setMapping(prev => ({ ...prev, conversionFlag: e.target.value }))}
                  className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                >
                  <option value="">-- Choose Header (Optional) --</option>
                  {headers.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Card 3: CSV Data Table Preview */}
          <div className="p-6 rounded-2xl bg-white border-3 border-[#0E0E0E] shadow-[4px_4px_0px_rgba(14,14,14,1)]">
            <h3 className="text-xl font-black text-[#0E0E0E] uppercase tracking-tight mb-4 flex items-center gap-2 font-display">
              <Table className="w-6 h-6 text-slate-500" />
              Source Dataset Preview (First 5 Rows)
            </h3>
            
            <div className="overflow-x-auto rounded-xl border-2 border-[#0E0E0E]">
              <table className="min-w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b-2 border-[#0E0E0E] text-[#0E0E0E] font-black uppercase tracking-wider">
                    {headers.slice(0, 7).map(h => (
                      <th key={h} className="px-4 py-3 font-black">{h}</th>
                    ))}
                    {headers.length > 7 && <th className="px-4 py-3 font-black text-[#FF5D38]">+{headers.length - 7} more</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white text-slate-800 font-medium">
                  {previewRows.slice(0, 5).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      {headers.slice(0, 7).map(h => (
                        <td key={h} className="px-4 py-2.5 truncate max-w-[120px]">{row[h] || <span className="text-slate-400 font-italic">null</span>}</td>
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
          <div className="p-6 rounded-2xl bg-white border-3 border-[#0E0E0E] shadow-[6px_6px_0px_rgba(14,14,14,1)] sticky top-6">
            <h3 className="text-xl font-black text-[#0E0E0E] uppercase tracking-tight mb-4 flex items-center gap-2 font-display">
              <Layers className="w-6 h-6 text-[#FF5D38]" />
              Funnel Architecture
            </h3>

            {/* Toggle funnel structure */}
            <div className="bg-slate-100 p-1.5 rounded-xl flex border-2 border-[#0E0E0E] mb-6">
              <button
                type="button"
                onClick={() => setMapping(prev => ({ ...prev, isMultiColumnFunnel: false }))}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
                  !mapping.isMultiColumnFunnel
                    ? 'bg-[#0E0E0E] text-white shadow'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Categorical
              </button>
              <button
                type="button"
                onClick={() => setMapping(prev => ({ ...prev, isMultiColumnFunnel: true }))}
                className={`flex-1 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
                  mapping.isMultiColumnFunnel
                    ? 'bg-[#0E0E0E] text-white shadow'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Binary Flag Columns
              </button>
            </div>

            {/* Content: Mode 1 - Single stage column selection */}
            {!mapping.isMultiColumnFunnel ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Stage Mapping Header</label>
                  <select
                    value={mapping.funnelStage}
                    onChange={(e) => handleFunnelStageColChange(e.target.value)}
                    className="w-full bg-white border-2 border-[#0E0E0E] rounded-xl px-3.5 py-2.5 text-sm text-[#0E0E0E] font-bold focus:outline-none focus:border-[#FF5D38] transition"
                  >
                    <option value="">-- Select Column --</option>
                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <p className="mt-2.5 text-xs font-medium text-slate-500 flex items-start gap-1.5">
                    <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                    Recommended for files containing a stage label column (e.g. "Lead", "MQL", "SQL", "Won").
                  </p>
                </div>

                {singleColumnStages.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-slate-100">
                    <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-3">Sequence Priority (Drag/Order)</label>
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {singleColumnStages.map((stage, index) => (
                        <div key={stage} className="flex items-center justify-between px-3.5 py-2 bg-slate-50 rounded-xl border-2 border-[#0E0E0E] text-xs font-bold text-[#0E0E0E] shadow-[2px_2px_0px_rgba(14,14,14,1)]">
                          <span className="truncate max-w-[140px]">{stage}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={index === 0}
                              onClick={() => moveStage(index, 'up', false)}
                              className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30 text-[#0E0E0E]"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              disabled={index === singleColumnStages.length - 1}
                              onClick={() => moveStage(index, 'down', false)}
                              className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30 text-[#0E0E0E]"
                            >
                              <ArrowDown className="w-4 h-4" />
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
                  <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-2">Stage Flag Headers</label>
                  <div className="space-y-2 max-h-[160px] overflow-y-auto border-2 border-[#0E0E0E] bg-white p-2.5 rounded-xl pr-1">
                    {headers.map(col => (
                      <label key={col} className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-xs font-bold text-slate-700">
                        <input
                          type="checkbox"
                          checked={selectedMultiStages.includes(col)}
                          onChange={() => handleMultiColumnStageCheckbox(col)}
                          className="w-4 h-4 rounded border-[#0E0E0E] text-[#FF5D38] focus:ring-[#FF5D38]/20 bg-white"
                        />
                        <span className="truncate">{col}</span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2.5 text-xs font-medium text-slate-500 flex items-start gap-1.5">
                    <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-slate-400" />
                    Recommended if logs have multiple flag fields (e.g. Visited=1, Lead=1, Bought=0).
                  </p>
                </div>

                {selectedMultiStages.length > 0 && (
                  <div className="mt-4 pt-4 border-t-2 border-slate-100">
                    <label className="block text-xs font-black text-[#0E0E0E] uppercase tracking-widest mb-3">Order Funnel Steps</label>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {selectedMultiStages.map((stage, index) => (
                        <div key={stage} className="flex items-center justify-between px-3.5 py-2 bg-slate-50 rounded-xl border-2 border-[#0E0E0E] text-xs font-bold text-[#0E0E0E] shadow-[2px_2px_0px_rgba(14,14,14,1)]">
                          <span className="truncate max-w-[140px]">{stage}</span>
                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={index === 0}
                              onClick={() => moveStage(index, 'up', true)}
                              className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30 text-[#0E0E0E]"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <button
                              disabled={index === selectedMultiStages.length - 1}
                              onClick={() => moveStage(index, 'down', true)}
                              className="p-1 hover:bg-slate-200 rounded-md disabled:opacity-30 text-[#0E0E0E]"
                            >
                              <ArrowDown className="w-4 h-4" />
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
            <div className="mt-6 pt-4 border-t-2 border-slate-100 space-y-2.5">
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className={`w-4 h-4 ${mapping.channel ? 'text-[#FF5D38]' : 'text-slate-300'}`} />
                <span className={mapping.channel ? 'text-[#0E0E0E]' : 'text-slate-400'}>Traffic source column mapped</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs font-bold text-slate-700">
                <CheckCircle2 className={`w-4 h-4 ${(mapping.isMultiColumnFunnel ? selectedMultiStages.length >= 2 : singleColumnStages.length >= 2) ? 'text-[#FF5D38]' : 'text-slate-300'}`} />
                <span className={(mapping.isMultiColumnFunnel ? selectedMultiStages.length >= 2 : singleColumnStages.length >= 2) ? 'text-[#0E0E0E]' : 'text-slate-400'}>At least 2 funnel steps sorted</span>
              </div>
            </div>

            {/* Generate Action Button */}
            <button
              onClick={handleGenerate}
              className="w-full mt-6 py-4 text-center text-xs font-black uppercase tracking-wider text-white bg-[#FF5D38] hover:bg-[#E54823] border-2 border-[#0E0E0E] rounded-xl shadow-[4px_4px_0px_rgba(14,14,14,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(14,14,14,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_rgba(14,14,14,1)] transition-all duration-150 cursor-pointer"
            >
              Verify Calibration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
export default ColumnMapper;
