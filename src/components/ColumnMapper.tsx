import React, { useState, useEffect } from 'react';
import { Columns, Settings2, CheckCircle2, ChevronRight } from 'lucide-react';
import { ColumnMapping } from '../types';

interface ColumnMapperProps {
  headers: string[];
  previewRows: any[];
  detectedMapping: ColumnMapping;
  onConfirmMapping: (mapping: ColumnMapping) => void;
  onCancel: () => void;
}

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  previewRows,
  detectedMapping,
  onConfirmMapping,
  onCancel,
}) => {
  const [mapping, setMapping] = useState<ColumnMapping>({ ...detectedMapping });
  const [selectedCategorical, setSelectedCategorical] = useState<string[]>([...detectedMapping.categorical]);

  // Sync if props change
  useEffect(() => {
    setMapping({ ...detectedMapping });
    setSelectedCategorical([...detectedMapping.categorical]);
  }, [detectedMapping]);

  const handleFieldChange = (role: keyof Omit<ColumnMapping, 'categorical'>, value: string) => {
    setMapping((prev) => ({
      ...prev,
      [role]: value,
    }));

    // If we select a column for a core metric role, remove it from categorical options
    if (value) {
      setSelectedCategorical((prev) => prev.filter((col) => col !== value));
    }
  };

  const toggleCategorical = (column: string) => {
    setSelectedCategorical((prev) => {
      if (prev.includes(column)) {
        return prev.filter((c) => c !== column);
      } else {
        // Exclude currently mapped core columns
        if (
          column === mapping.customerId ||
          column === mapping.churn ||
          column === mapping.tenure ||
          column === mapping.monthlyCharges ||
          column === mapping.totalCharges
        ) {
          return prev;
        }
        return [...prev, column];
      }
    });
  };

  const handleConfirm = () => {
    onConfirmMapping({
      ...mapping,
      categorical: selectedCategorical,
    });
  };

  // Helper to check if mapping is valid
  const isValid = mapping.churn && mapping.tenure && mapping.monthlyCharges;

  return (
    <div className="max-w-6xl mx-auto my-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings2 className="w-6 h-6 text-indigo-400" />
            Column Mapping Configuration
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Review and adjust how the engine interprets your data fields. Red outline indicates required fields.
          </p>
        </div>
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-slate-800 rounded-lg transition-colors"
        >
          Cancel Upload
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapping Controls */}
        <div className="lg:col-span-1 bg-[#111827]/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl space-y-5">
          <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center gap-1.5">
            <Columns className="w-4 h-4 text-indigo-400" />
            Field Assignments
          </h3>

          {/* Customer ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Customer ID Column
            </label>
            <select
              value={mapping.customerId}
              onChange={(e) => handleFieldChange('customerId', e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 outline-none transition-colors"
            >
              <option value="">-- Autogenerate IDs --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Churn Flag (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Churn Flag Column <span className="text-rose-500">*</span></span>
              {mapping.churn && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </label>
            <select
              value={mapping.churn}
              onChange={(e) => handleFieldChange('churn', e.target.value)}
              className={`w-full bg-slate-950/80 border focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 outline-none transition-colors ${
                mapping.churn ? 'border-slate-800' : 'border-rose-900/80 bg-rose-950/10'
              }`}
            >
              <option value="">-- Select Churn Column --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Tenure (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Tenure (Months) Column <span className="text-rose-500">*</span></span>
              {mapping.tenure && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </label>
            <select
              value={mapping.tenure}
              onChange={(e) => handleFieldChange('tenure', e.target.value)}
              className={`w-full bg-slate-950/80 border focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 outline-none transition-colors ${
                mapping.tenure ? 'border-slate-800' : 'border-rose-900/80 bg-rose-950/10'
              }`}
            >
              <option value="">-- Select Tenure Column --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Monthly Charges (Required) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Monthly Spend / Spend Column <span className="text-rose-500">*</span></span>
              {mapping.monthlyCharges && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
            </label>
            <select
              value={mapping.monthlyCharges}
              onChange={(e) => handleFieldChange('monthlyCharges', e.target.value)}
              className={`w-full bg-slate-950/80 border focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 outline-none transition-colors ${
                mapping.monthlyCharges ? 'border-slate-800' : 'border-rose-900/80 bg-rose-950/10'
              }`}
            >
              <option value="">-- Select Revenue Column --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Total Charges */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Spend Column (Optional)
            </label>
            <select
              value={mapping.totalCharges}
              onChange={(e) => handleFieldChange('totalCharges', e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2 text-sm text-slate-200 outline-none transition-colors"
            >
              <option value="">-- Auto-calculate (Tenure × Monthly) --</option>
              {headers.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Action Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!isValid}
            className="w-full mt-6 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-900 border border-indigo-500/10 text-white font-semibold rounded-xl transition-all duration-300 shadow-xl flex items-center justify-center gap-2 group text-sm"
          >
            Generate Analytics Dashboard
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Data Preview & Segments Selection */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Categorical Segment Selectors */}
          <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4">
              Dashboard Segment Filters
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Select which categorical columns (e.g. contract term, services, demographic, region) to add to the dashboard. The system will automatically construct dynamic distribution and churn charts for each selected attribute.
            </p>
            <div className="flex flex-wrap gap-2">
              {headers.map((header) => {
                const isCore =
                  header === mapping.customerId ||
                  header === mapping.churn ||
                  header === mapping.tenure ||
                  header === mapping.monthlyCharges ||
                  header === mapping.totalCharges;

                if (isCore) return null;

                const isSelected = selectedCategorical.includes(header);

                return (
                  <button
                    key={header}
                    onClick={() => toggleCategorical(header)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${
                      isSelected
                        ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
                        : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {header}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dataset Row Preview */}
          <div className="bg-[#111827]/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col overflow-hidden">
            <h3 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3 mb-4 flex items-center justify-between">
              <span>Source Preview (First 5 rows)</span>
              <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-0.5 border border-indigo-500/20 rounded">CSV Schema</span>
            </h3>
            
            <div className="overflow-x-auto flex-1 border border-slate-800/60 rounded-xl bg-slate-950/20">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950/80 border-b border-slate-800/80 text-slate-400 font-semibold uppercase tracking-wider">
                    {headers.map((h) => {
                      const isChurn = h === mapping.churn;
                      const isTenure = h === mapping.tenure;
                      const isMonthly = h === mapping.monthlyCharges;
                      const isTotal = h === mapping.totalCharges;
                      const isId = h === mapping.customerId;

                      let badgeColor = '';
                      if (isChurn) badgeColor = 'text-rose-400 border border-rose-500/20 bg-rose-500/5';
                      if (isTenure) badgeColor = 'text-emerald-400 border border-emerald-500/20 bg-emerald-500/5';
                      if (isMonthly) badgeColor = 'text-indigo-400 border border-indigo-500/20 bg-indigo-500/5';
                      if (isTotal) badgeColor = 'text-purple-400 border border-purple-500/20 bg-purple-500/5';
                      if (isId) badgeColor = 'text-amber-400 border border-amber-500/20 bg-amber-500/5';

                      return (
                        <th key={h} className="px-4 py-3 min-w-[120px] align-middle">
                          <div className="flex flex-col gap-1">
                            <span className="text-slate-300 font-bold">{h}</span>
                            {badgeColor && (
                              <span className={`px-1.5 py-0.5 rounded text-[10px] w-fit font-medium text-center ${badgeColor}`}>
                                {isChurn && 'CHURN'}
                                {isTenure && 'TENURE'}
                                {isMonthly && 'REV/MONTH'}
                                {isTotal && 'REV/TOTAL'}
                                {isId && 'CUSTOMER ID'}
                              </span>
                            )}
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/40 text-slate-300">
                  {previewRows.slice(0, 5).map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-900/30 transition-colors">
                      {headers.map((h) => (
                        <td key={h} className="px-4 py-3.5 truncate max-w-[160px]">
                          {row[h] !== undefined && row[h] !== null ? String(row[h]) : '-'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
