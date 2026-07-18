import React, { useState } from 'react';
import { Search, RotateCcw, Download, FileSpreadsheet, Sun, Moon, Upload, Filter, Calendar } from 'lucide-react';

interface DashboardFiltersProps {
  // Available filter choices
  channels: string[];
  campaigns: string[];
  regions: string[];
  devices: string[];
  
  // Selected values
  selectedChannels: string[];
  selectedCampaigns: string[];
  selectedRegions: string[];
  selectedDevices: string[];
  startDate: string;
  endDate: string;
  searchQuery: string;

  // Setters
  onFilterChange: (type: 'channels' | 'campaigns' | 'regions' | 'devices', values: string[]) => void;
  onDateChange: (start: string, end: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  
  // Header Actions
  onReload: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;

  // Theme
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  channels,
  campaigns,
  regions,
  devices,
  selectedChannels,
  selectedCampaigns,
  selectedRegions,
  selectedDevices,
  startDate,
  endDate,
  searchQuery,
  onFilterChange,
  onDateChange,
  onSearchChange,
  onReset,
  onReload,
  onExportPDF,
  onExportCSV,
  isDarkMode,
  onToggleTheme
}) => {
  const [showAdvanceFilters, setShowAdvanceFilters] = useState(false);

  const handleMultiSelect = (type: 'channels' | 'campaigns' | 'regions' | 'devices', value: string) => {
    let currentSelected: string[] = [];
    if (type === 'channels') currentSelected = [...selectedChannels];
    if (type === 'campaigns') currentSelected = [...selectedCampaigns];
    if (type === 'regions') currentSelected = [...selectedRegions];
    if (type === 'devices') currentSelected = [...selectedDevices];

    if (currentSelected.includes(value)) {
      currentSelected = currentSelected.filter(item => item !== value);
    } else {
      currentSelected.push(value);
    }

    onFilterChange(type, currentSelected);
  };

  const hasActiveFilters = 
    selectedChannels.length > 0 ||
    selectedCampaigns.length > 0 ||
    selectedRegions.length > 0 ||
    selectedDevices.length > 0 ||
    startDate !== '' ||
    endDate !== '' ||
    searchQuery !== '';

  return (
    <div className="w-full space-y-4">
      {/* Top Bar: Title, Search, Actions, Theme Toggle */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-slate-900/40 border border-slate-800/80 p-4 rounded-2xl backdrop-blur-md">
        
        {/* Left Search input */}
        <div className="relative flex-grow max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search channels, campaigns, regions..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-850 hover:border-slate-800 focus:border-violet-500/80 rounded-xl text-sm text-slate-200 focus:outline-none transition-colors"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle advance filters */}
          <button
            onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl border flex items-center gap-2 transition duration-200 cursor-pointer ${
              showAdvanceFilters
                ? 'bg-violet-950/50 text-violet-300 border-violet-800/60'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-800'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filters {hasActiveFilters && <span className="w-1.5 h-1.5 bg-violet-400 rounded-full" />}
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-850 text-rose-400 hover:bg-rose-950/10 hover:border-rose-900/50 hover:text-rose-300 transition duration-200 flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}

          {/* Upload New Data */}
          <button
            onClick={onReload}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-850 text-slate-300 hover:text-slate-100 hover:bg-slate-850 hover:border-slate-800 transition duration-200 flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-slate-450" /> New File
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-950 border border-slate-850 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-950/20 hover:border-emerald-900/60 transition duration-200 flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
          </button>

          {/* Export PDF */}
          <button
            onClick={onExportPDF}
            className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white transition duration-200 flex items-center gap-2 cursor-pointer shadow-[0_2px_10px_rgba(99,102,241,0.15)] hover:shadow-[0_2px_15px_rgba(99,102,241,0.3)]"
          >
            <Download className="w-3.5 h-3.5" /> Export PDF
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            className="p-2 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-450 hover:text-white rounded-xl transition duration-200 cursor-pointer"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-violet-400" />}
          </button>
        </div>
      </div>

      {/* Advance Dropdown filter section */}
      {showAdvanceFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-900/30 border border-slate-800/60 p-5 rounded-2xl backdrop-blur-sm animate-fadeIn">
          
          {/* Channel Multi-select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Acquisition Channel</label>
            <div className="max-h-[110px] overflow-y-auto space-y-1.5 border border-slate-850 bg-slate-950 p-2 rounded-lg pr-1">
              {channels.map(chan => (
                <label key={chan} className="flex items-center gap-2 px-1.5 py-1 text-xs text-slate-300 rounded hover:bg-slate-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(chan)}
                    onChange={() => handleMultiSelect('channels', chan)}
                    className="rounded border-slate-800 text-violet-500 focus:ring-violet-500/10 bg-slate-950"
                  />
                  <span className="truncate">{chan}</span>
                </label>
              ))}
              {channels.length === 0 && <span className="text-[11px] text-slate-650 block text-center py-2">No channels</span>}
            </div>
          </div>

          {/* Campaign Multi-select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Active Campaign</label>
            <div className="max-h-[110px] overflow-y-auto space-y-1.5 border border-slate-850 bg-slate-950 p-2 rounded-lg pr-1">
              {campaigns.map(camp => (
                <label key={camp} className="flex items-center gap-2 px-1.5 py-1 text-xs text-slate-300 rounded hover:bg-slate-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(camp)}
                    onChange={() => handleMultiSelect('campaigns', camp)}
                    className="rounded border-slate-800 text-violet-500 focus:ring-violet-500/10 bg-slate-950"
                  />
                  <span className="truncate">{camp}</span>
                </label>
              ))}
              {campaigns.length === 0 && <span className="text-[11px] text-slate-650 block text-center py-2">No campaigns</span>}
            </div>
          </div>

          {/* Device select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Device Categories</label>
            <div className="max-h-[110px] overflow-y-auto space-y-1.5 border border-slate-850 bg-slate-950 p-2 rounded-lg pr-1">
              {devices.map(dev => (
                <label key={dev} className="flex items-center gap-2 px-1.5 py-1 text-xs text-slate-300 rounded hover:bg-slate-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedDevices.includes(dev)}
                    onChange={() => handleMultiSelect('devices', dev)}
                    className="rounded border-slate-800 text-violet-500 focus:ring-violet-500/10 bg-slate-950"
                  />
                  <span className="truncate">{dev}</span>
                </label>
              ))}
              {devices.length === 0 && <span className="text-[11px] text-slate-650 block text-center py-2">No devices</span>}
            </div>
          </div>

          {/* Region Select */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Region</label>
            <div className="max-h-[110px] overflow-y-auto space-y-1.5 border border-slate-850 bg-slate-950 p-2 rounded-lg pr-1">
              {regions.map(reg => (
                <label key={reg} className="flex items-center gap-2 px-1.5 py-1 text-xs text-slate-300 rounded hover:bg-slate-900 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(reg)}
                    onChange={() => handleMultiSelect('regions', reg)}
                    className="rounded border-slate-800 text-violet-500 focus:ring-violet-500/10 bg-slate-950"
                  />
                  <span className="truncate">{reg}</span>
                </label>
              ))}
              {regions.length === 0 && <span className="text-[11px] text-slate-650 block text-center py-2">No regions</span>}
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-3">
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-450" /> Date Interval</label>
            <div className="space-y-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => onDateChange(e.target.value, endDate)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 text-xs text-slate-300 px-2 py-1.5 rounded-lg focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => onDateChange(startDate, e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 focus:border-violet-500 text-xs text-slate-300 px-2 py-1.5 rounded-lg focus:outline-none"
              />
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
