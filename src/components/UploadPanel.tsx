import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Sparkles, AlertCircle } from 'lucide-react';
import { parseCSVFile, parseCSVString } from '../utils/csvParser';
import { sampleCSVString } from '../data/sampleCSV';
import type { CSVDataPreview } from '../types';

interface UploadPanelProps {
  onDataParsed: (data: CSVDataPreview) => void;
  onLoadSample: () => void;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({ onDataParsed, onLoadSample }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const parsed = await parseCSVFile(file);
      if (parsed.rows.length === 0) {
        throw new Error('The CSV file appears to be empty.');
      }
      onDataParsed(parsed);
    } catch (err: any) {
      setError(err?.message || 'Failed to parse CSV file. Please check the file structure.');
    } finally {
      setLoading(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const onDragLeave = () => {
    setIsDragActive(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const loadSampleData = () => {
    setLoading(true);
    try {
      const parsed = parseCSVString(sampleCSVString);
      onDataParsed(parsed);
      onLoadSample();
    } catch (err: any) {
      setError('Failed to load sample dataset.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto my-12 px-4">
      {/* Title Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 text-xs font-black text-white bg-[#0E0E0E] rounded-full uppercase tracking-widest">
            GROWTH BI & ACQUISITION DELIVERABLE
          </span>
          <h1 className="mt-6 text-5xl sm:text-6xl font-black tracking-tight text-[#0E0E0E] uppercase font-display leading-[1.05]">
            Funnel Insights <br />
            <span className="text-[#FF5D38]">Dashboard</span>
          </h1>
          <p className="mt-4 text-lg font-medium text-slate-700 max-w-xl mx-auto">
            Upload marketing funnel exports, web traffic logs, or campaign reports. 
            Calibrate acquisition paths, isolate leakages, and scale profitability.
          </p>
        </motion.div>
      </div>

      {/* Main Drag-Drop Upload Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`relative group rounded-3xl border-3 transition-all duration-300 overflow-hidden cursor-pointer ${
          isDragActive 
            ? 'border-[#FF5D38] bg-[#FF5D38]/5 shadow-[8px_8px_0px_rgba(255,93,56,0.15)]' 
            : 'border-[#0E0E0E] bg-white hover:border-[#FF5D38] hover:shadow-[8px_8px_0px_rgba(14,14,14,1)]'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center relative z-10">
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept=".csv"
            className="hidden"
          />

          {loading ? (
            <div className="flex flex-col items-center">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-[#FF5D38]/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-[#FF5D38] border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-6 text-[#FF5D38] font-bold uppercase tracking-wider">Processing & cleaning schema...</p>
            </div>
          ) : (
            <>
              <div className="p-5 bg-white border-2 border-[#0E0E0E] rounded-2xl group-hover:bg-[#FF5D38] group-hover:text-white transition-colors duration-300 shadow-[4px_4px_0px_rgba(14,14,14,1)]">
                <Upload className="w-10 h-10 text-[#0E0E0E] group-hover:text-white transition-colors duration-300" />
              </div>
              
              <h3 className="mt-8 text-2xl font-black text-[#0E0E0E] uppercase tracking-tight">
                DRAG & DROP CSV JOURNAL HERE
              </h3>
              <p className="mt-2 text-base text-slate-700 font-medium max-w-sm">
                or <span className="text-[#FF5D38] underline decoration-2 underline-offset-4 font-black">browse local storage</span> to audit raw campaigns.
              </p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-slate-700 font-bold uppercase tracking-wider">
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-500" /> Leads / Sessions CSV
                </span>
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                  Heuristic Auto-Detect
                </span>
                <span className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200">
                  Manual Adjustments
                </span>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-5 rounded-2xl bg-rose-50 border-2 border-rose-600 text-rose-950 flex items-start gap-4 shadow-[4px_4px_0px_rgba(225,29,72,1)]"
        >
          <AlertCircle className="w-6 h-6 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-black text-lg uppercase tracking-tight text-rose-950">Data Extraction Halt</h4>
            <p className="text-sm font-medium mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Load Sample Button Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-16 text-center"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="h-0.5 bg-[#0E0E0E] flex-grow max-w-xs" />
          <span className="text-xs font-black tracking-widest text-[#0E0E0E] uppercase">OR DEMO THE SYSTEM</span>
          <div className="h-0.5 bg-[#0E0E0E] flex-grow max-w-xs" />
        </div>

        <button
          onClick={loadSampleData}
          disabled={loading}
          className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-[#FF5D38] hover:bg-[#E54823] text-white text-base font-black rounded-2xl shadow-[4px_4px_0px_rgba(14,14,14,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(14,14,14,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_rgba(14,14,14,1)] transition-all duration-150 cursor-pointer uppercase tracking-wider"
        >
          <Sparkles className="w-5 h-5 text-white animate-pulse" />
          Audit with Demo Campaign Data
        </button>
        <p className="mt-4 text-xs font-semibold text-slate-500 max-w-md mx-auto leading-relaxed">
          Instantly load synthetic traffic files tracking Google Ads, Meta Ads, Referral, and Organic channels alongside custom purchase event steps.
        </p>
      </motion.div>
    </div>
  );
};
export default UploadPanel;
