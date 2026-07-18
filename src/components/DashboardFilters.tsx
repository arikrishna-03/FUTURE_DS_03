import React, { useState } from 'react';
import { Search, RotateCcw, Download, FileSpreadsheet, Upload, Filter } from 'lucide-react';

interface DashboardFiltersProps {
  channels: string[];
  campaigns: string[];
  regions: string[];
  devices: string[];
  
  selectedChannels: string[];
  selectedCampaigns: string[];
  selectedRegions: string[];
  selectedDevices: string[];
  startDate: string;
  endDate: string;
  searchQuery: string;

  onFilterChange: (type: 'channels' | 'campaigns' | 'regions' | 'devices', values: string[]) => void;
  onDateChange: (start: string, end: string) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  
  onReload: () => void;
  onExportPDF: () => void;
  onExportCSV: () => void;
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
  onExportCSV
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
      {/* Top Bar: Search, Actions */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white border-3 border-[#0E0E0E] p-4 rounded-2xl shadow-[4px_4px_0px_rgba(14,14,14,1)]">
        
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
            className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-[#0E0E0E] rounded-xl text-xs font-bold text-[#0E0E0E] focus:outline-none focus:border-[#FF5D38] transition"
          />
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Advanced Filters Button */}
          <button
            onClick={() => setShowAdvanceFilters(!showAdvanceFilters)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 flex items-center gap-1.5 transition cursor-pointer ${
              showAdvanceFilters || hasActiveFilters
                ? 'bg-[#FF5D38] border-[#0E0E0E] text-white'
                : 'bg-white border-slate-200 text-slate-700 hover:border-[#0E0E0E] hover:text-[#0E0E0E]'
            }`}
          >
            <Filter className="w-3.5 h-3.5" /> 
            {showAdvanceFilters ? 'Hide Filters' : 'Filter Segments'}
            {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-white animate-ping" />}
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border-2 border-[#0E0E0E] rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" /> Export CSV
          </button>

          {/* Export PDF (Print) */}
          <button
            onClick={onExportPDF}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 border-2 border-[#0E0E0E] rounded-xl text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#FF5D38]" /> Print Audit
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border-2 border-rose-600 text-rose-700 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}

          {/* Upload New file */}
          <button
            onClick={onReload}
            className="px-4 py-2.5 bg-[#0E0E0E] hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#FF5D38]" /> Upload New
          </button>
        </div>
      </div>

      {/* Advanced Filter Drawers */}
      {showAdvanceFilters && (
        <div className="bg-white border-3 border-[#0E0E0E] p-6 rounded-2xl shadow-[4px_4px_0px_rgba(14,14,14,1)] grid grid-cols-1 md:grid-cols-4 gap-6 animate-fadeIn">
          
          {/* Channels Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-[#0E0E0E] uppercase tracking-wider border-b-2 border-slate-100 pb-1.5">Acquisition Source</h4>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {channels.map(chan => (
                <label key={chan} className="flex items-center gap-2 cursor-pointer py-0.5 font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedChannels.includes(chan)}
                    onChange={() => handleMultiSelect('channels', chan)}
                    className="w-4 h-4 rounded border-[#0E0E0E] text-[#FF5D38] focus:ring-[#FF5D38]/20 bg-white"
                  />
                  <span>{chan}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Campaigns Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-[#0E0E0E] uppercase tracking-wider border-b-2 border-slate-100 pb-1.5">Active Campaign</h4>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {campaigns.map(camp => (
                <label key={camp} className="flex items-center gap-2 cursor-pointer py-0.5 font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedCampaigns.includes(camp)}
                    onChange={() => handleMultiSelect('campaigns', camp)}
                    className="w-4 h-4 rounded border-[#0E0E0E] text-[#FF5D38] focus:ring-[#FF5D38]/20 bg-white"
                  />
                  <span>{camp}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Geography Filter */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-[#0E0E0E] uppercase tracking-wider border-b-2 border-slate-100 pb-1.5">Territory Region</h4>
            <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-xs">
              {regions.map(reg => (
                <label key={reg} className="flex items-center gap-2 cursor-pointer py-0.5 font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={selectedRegions.includes(reg)}
                    onChange={() => handleMultiSelect('regions', reg)}
                    className="w-4 h-4 rounded border-[#0E0E0E] text-[#FF5D38] focus:ring-[#FF5D38]/20 bg-white"
                  />
                  <span>{reg}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Time & Device Filter */}
          <div className="space-y-4">
            {/* Device Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-[#0E0E0E] uppercase tracking-wider border-b-2 border-slate-100 pb-1.5">Device Platform</h4>
              <div className="flex flex-wrap gap-2">
                {devices.map(dev => {
                  const isSel = selectedDevices.includes(dev);
                  return (
                    <button
                      key={dev}
                      onClick={() => handleMultiSelect('devices', dev)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border-2 transition ${
                        isSel
                          ? 'bg-[#0E0E0E] border-[#0E0E0E] text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:border-[#0E0E0E] hover:text-[#0E0E0E]'
                      }`}
                    >
                      {dev}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date filter inputs */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-[#0E0E0E] uppercase tracking-wider border-b-2 border-slate-100 pb-1.5">Custom Date Range</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onDateChange(e.target.value, endDate)}
                    className="w-full p-2 bg-white border-2 border-[#0E0E0E] rounded-lg text-xs font-bold text-[#0E0E0E]"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onDateChange(startDate, e.target.value)}
                    className="w-full p-2 bg-white border-2 border-[#0E0E0E] rounded-lg text-xs font-bold text-[#0E0E0E]"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
export default DashboardFilters;
