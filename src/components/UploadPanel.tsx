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
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-3 py-1 text-xs font-semibold text-violet-400 bg-violet-950/50 border border-violet-800/60 rounded-full uppercase tracking-wider">
            Enterprise BI Platform
          </span>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-violet-400 bg-clip-text text-transparent">
            Funnel Insights Dashboard
          </h1>
          <p className="mt-3 text-lg text-slate-400 max-w-2xl mx-auto">
            Upload any marketing, product, or campaign CSV dataset. We will auto-detect your funnel, channel performance, and ROI metrics instantly.
          </p>
        </motion.div>
      </div>

      {/* Main Drag-Drop Upload Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`relative group rounded-2xl border border-dashed transition-all duration-300 backdrop-blur-md overflow-hidden ${
          isDragActive 
            ? 'border-violet-500 bg-violet-950/20 shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
            : 'border-slate-800 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60 shadow-xl'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Decorative Grid and Ambient Glows */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl group-hover:bg-violet-600/15 transition-all duration-500 pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-600/5 rounded-full blur-3xl group-hover:bg-emerald-600/10 transition-all duration-500 pointer-events-none" />

        <div className="flex flex-col items-center justify-center py-16 px-6 text-center cursor-pointer relative z-10" onClick={triggerFileInput}>
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
                <div className="absolute inset-0 border-4 border-violet-500/20 rounded-full" />
                <div className="absolute inset-0 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-violet-400 font-medium">Processing & cleaning CSV structure...</p>
            </div>
          ) : (
            <>
              <div className="p-4 bg-slate-950/80 border border-slate-800/80 rounded-2xl group-hover:scale-110 group-hover:border-violet-500/50 shadow-inner transition-all duration-300">
                <Upload className="w-8 h-8 text-slate-400 group-hover:text-violet-400 transition-colors duration-300" />
              </div>
              
              <h3 className="mt-6 text-xl font-semibold text-slate-200">
                Drag & drop your CSV file here
              </h3>
              <p className="mt-2 text-sm text-slate-400 max-w-sm">
                or <span className="text-violet-400 hover:text-violet-300 font-medium">browse local files</span> to upload a marketing campaign log.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-slate-500">
                <span className="px-2.5 py-1 bg-slate-950/60 rounded-md border border-slate-800/50 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" /> Leads / Sessions CSV
                </span>
                <span className="px-2.5 py-1 bg-slate-950/60 rounded-md border border-slate-800/50">
                  Auto-Detect Schema
                </span>
                <span className="px-2.5 py-1 bg-slate-950/60 rounded-md border border-slate-800/50">
                  Custom Mappings
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
          className="mt-6 p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 text-rose-300 flex items-start gap-3 shadow-lg"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-rose-200">Processing Error</h4>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Load Sample Button Container */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-12 text-center"
      >
        <div className="flex items-center justify-center gap-4">
          <div className="h-px bg-slate-800 flex-grow max-w-xs" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600">OR</span>
          <div className="h-px bg-slate-800 flex-grow max-w-xs" />
        </div>

        <button
          onClick={loadSampleData}
          disabled={loading}
          className="mt-8 relative inline-flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold rounded-xl shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:shadow-[0_4px_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-violet-200 animate-pulse" />
          Explore With Sample Campaign Data
        </button>
        <p className="mt-3 text-xs text-slate-500 max-w-md mx-auto">
          Loads our synthetic enterprise campaign funnel tracking (Google, Facebook, Social, Email) with costs, channels, and conversion stages.
        </p>
      </motion.div>
    </div>
  );
};
