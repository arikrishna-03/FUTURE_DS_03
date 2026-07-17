import React, { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, Play, Info, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSampleCSVString } from '../data/telco_churn';

interface UploadPanelProps {
  onCSVData: (csvText: string, filename: string) => void;
  isLoading: boolean;
  themeColor?: 'indigo' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onCSVData, isLoading, themeColor = 'indigo' }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError("Unsupported file format. Please upload a valid .csv file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      onCSVData(text, file.name);
    };
    reader.onerror = () => {
      setError("Error reading file. Please try again.");
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const loadSampleData = () => {
    setError(null);
    onCSVData(getSampleCSVString(), 'telco_customer_churn_sample.csv');
  };

  // Color maps matching chosen theme accent for light/dark responsive layouts
  const theme = {
    indigo: {
      text: 'text-indigo-600 dark:text-indigo-400',
      logoGlow: 'from-indigo-500/5',
      dragBorder: 'border-indigo-400 dark:border-indigo-400 bg-indigo-50/10 dark:bg-indigo-500/5',
      loaderRing: 'border-indigo-200 dark:border-indigo-500/20 border-t-indigo-600 dark:border-t-indigo-500',
      iconBox: 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20',
      btnGradient: 'from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 shadow-indigo-500/10 dark:shadow-indigo-950/20',
    },
    blue: {
      text: 'text-blue-600 dark:text-blue-400',
      logoGlow: 'from-blue-500/5',
      dragBorder: 'border-blue-400 dark:border-blue-400 bg-blue-50/10 dark:bg-blue-500/5',
      loaderRing: 'border-blue-200 dark:border-blue-500/20 border-t-blue-600 dark:border-t-blue-500',
      iconBox: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20',
      btnGradient: 'from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 shadow-blue-500/10 dark:shadow-blue-950/20',
    },
    emerald: {
      text: 'text-emerald-600 dark:text-emerald-400',
      logoGlow: 'from-emerald-500/5',
      dragBorder: 'border-emerald-400 dark:border-emerald-400 bg-emerald-50/10 dark:bg-emerald-500/5',
      loaderRing: 'border-emerald-200 dark:border-emerald-500/20 border-t-emerald-600 dark:border-t-emerald-500',
      iconBox: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20',
      btnGradient: 'from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 shadow-emerald-500/10 dark:shadow-emerald-950/20',
    },
    purple: {
      text: 'text-purple-600 dark:text-purple-400',
      logoGlow: 'from-purple-500/5',
      dragBorder: 'border-purple-400 dark:border-purple-400 bg-purple-50/10 dark:bg-purple-500/5',
      loaderRing: 'border-purple-200 dark:border-purple-500/20 border-t-purple-600 dark:border-t-purple-500',
      iconBox: 'bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20',
      btnGradient: 'from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 shadow-purple-500/10 dark:shadow-purple-950/20',
    },
    rose: {
      text: 'text-rose-600 dark:text-rose-400',
      logoGlow: 'from-rose-500/5',
      dragBorder: 'border-rose-400 dark:border-rose-400 bg-rose-50/10 dark:bg-rose-500/5',
      loaderRing: 'border-rose-200 dark:border-rose-500/20 border-t-rose-600 dark:border-t-rose-500',
      iconBox: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20',
      btnGradient: 'from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 shadow-rose-500/10 dark:shadow-rose-950/20',
    },
    amber: {
      text: 'text-amber-600 dark:text-amber-400',
      logoGlow: 'from-amber-500/5',
      dragBorder: 'border-amber-400 dark:border-amber-400 bg-amber-50/10 dark:bg-amber-500/5',
      loaderRing: 'border-amber-200 dark:border-amber-500/20 border-t-amber-600 dark:border-t-amber-500',
      iconBox: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20',
      btnGradient: 'from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 shadow-amber-500/10 dark:shadow-amber-950/20',
    },
  }[themeColor];

  return (
    <div className="max-w-4xl mx-auto my-12 px-4">
      {/* Hero Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-block mb-3 border ${
            themeColor === 'indigo' ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 border-indigo-100 dark:border-indigo-500/20' :
            themeColor === 'blue' ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' :
            themeColor === 'emerald' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' :
            themeColor === 'purple' ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20' :
            themeColor === 'rose' ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' :
            'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
          }`}>
            Portfolio Project • Data Science & Analytics
          </span>
          <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-950 via-slate-700 dark:from-white dark:via-slate-200 ${
            themeColor === 'indigo' ? 'to-indigo-600 dark:to-indigo-400' :
            themeColor === 'blue' ? 'to-blue-600 dark:to-blue-400' :
            themeColor === 'emerald' ? 'to-emerald-600 dark:to-emerald-400' :
            themeColor === 'purple' ? 'to-purple-600 dark:to-purple-400' :
            themeColor === 'rose' ? 'to-rose-600 dark:to-rose-400' :
            'to-amber-600 dark:to-amber-400'
          } bg-clip-text text-transparent pb-1`}>
            Churn Insights Dashboard
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            A premium, dataset-agnostic customer retention and churn intelligence platform. Upload any subscription or customer CSV to reveal dynamic analytics.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Upload Card */}
        <div className="md:col-span-2 bg-white/80 dark:bg-[#111827]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
          <div className={`absolute inset-0 bg-gradient-to-tr ${theme.logoGlow} via-transparent to-transparent opacity-50 pointer-events-none`} />
          
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-4">
            <Upload className={`w-5 h-5 ${theme.text}`} />
            Upload Dataset
          </h2>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[220px] ${
              isDragActive
                ? theme.dragBorder
                : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950/60'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              className="hidden"
            />
            {isLoading ? (
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-4 animate-spin mb-4 ${theme.loaderRing}`} />
                <p className="text-slate-800 dark:text-slate-300 font-medium">Parsing dataset records...</p>
                <p className="text-xs text-slate-500 mt-1">Inspecting schema structure and checking value ranges</p>
              </div>
            ) : (
              <div className="text-center flex flex-col items-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300 ${theme.iconBox}`}>
                  <FileSpreadsheet className={`w-8 h-8 ${theme.text}`} />
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-semibold text-lg">
                  Drag and drop your CSV file here
                </p>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                  or <span className={`${theme.text} underline font-medium`}>browse local files</span>
                </p>
                <p className="text-slate-450 dark:text-slate-500 text-xs mt-4">
                  Supports comma-delimited columns (UTF-8)
                </p>
              </div>
            )}
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-50/50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-300 text-sm"
            >
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
        </div>

        {/* Info & Sample Demo Card */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/80 dark:bg-[#111827]/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-2xl flex-1 flex flex-col justify-between overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-50 pointer-events-none" />
            <div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 mb-3">
                <Play className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                Quick Demo
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                Don't have a dataset ready? Load our pre-configured high-fidelity Telco Customer Churn sample data to experience the engine immediately.
              </p>
            </div>
            <button
              onClick={loadSampleData}
              disabled={isLoading}
              className={`w-full py-3 px-4 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 text-sm bg-gradient-to-r ${theme.btnGradient}`}
            >
              <Play className="w-4 h-4 fill-current" />
              Load Sample Dataset
            </button>
          </div>

          <div className="bg-white/40 dark:bg-[#111827]/40 border border-slate-200 dark:border-slate-800/50 rounded-2xl p-5 text-xs text-slate-600 dark:text-slate-400 flex flex-col gap-3">
            <h4 className="font-semibold text-slate-800 dark:text-slate-300 flex items-center gap-1.5">
              <Info className={`w-3.5 h-3.5 ${theme.text}`} />
              How Auto-Detection Works
            </h4>
            <p>
              The dashboard scans headers to identify key variables:
            </p>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 dark:text-slate-500">
              <li><strong className="text-slate-700 dark:text-slate-400">Churn Flag:</strong> Matches status, churn, exited, left...</li>
              <li><strong className="text-slate-700 dark:text-slate-400">Tenure:</strong> Matches tenure, months active, age...</li>
              <li><strong className="text-slate-700 dark:text-slate-400">Monthly spend:</strong> Matches monthly charges, rate...</li>
              <li><strong className="text-slate-700 dark:text-slate-400">Segments:</strong> Automatically maps fields with 2-15 categories (e.g. Contract, PaymentMethod) to make them drill-down filters.</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
