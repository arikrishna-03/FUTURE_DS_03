import React, { useState, useMemo } from 'react';
import { Database } from 'lucide-react';
import { UploadPanel } from './components/UploadPanel';
import { ColumnMapper } from './components/ColumnMapper';
import { ExecutiveSummary } from './components/ExecutiveSummary';
import { FunnelHero } from './components/FunnelHero';
import { DropoffDiagnosis } from './components/DropoffDiagnosis';
import { ChannelLeaderboard } from './components/ChannelLeaderboard';
import { TrendChart } from './components/TrendChart';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { DataTable } from './components/DataTable';
import { DashboardFilters } from './components/DashboardFilters';

// Utils
import { 
  cleanAndProcessData, 
  filterData, 
  calculateFunnelData, 
  calculateKPIs, 
  calculateChannelPerformance, 
  calculateCampaignPerformance, 
  calculateDailyTrends 
} from './utils/funnelEngine';

import { 
  generateRecommendations,
  detectDecliningChannels
} from './utils/insightEngine';

import type { CSVDataPreview, ColumnMapping } from './types';

export const App: React.FC = () => {
  // 1. Navigation & Data States
  const [csvData, setCsvData] = useState<CSVDataPreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [orderedStages, setOrderedStages] = useState<string[]>([]);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [fileName, setFileName] = useState<string>('sample_marketing_funnel.csv');

  // Time Bucket State
  const [currentBucket, setCurrentBucket] = useState<'day' | 'week' | 'month'>('day');

  // Active Filters State
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Event Callbacks
  const handleDataParsed = (data: CSVDataPreview) => {
    setCsvData(data);
    setIsCalibrated(false); // Recalibrate for any new upload
  };

  const handleLoadSample = () => {
    setFileName('marketing_funnel.csv');
  };

  const handleMappingConfirmed = (confirmedMapping: ColumnMapping, stages: string[]) => {
    setMapping(confirmedMapping);
    setOrderedStages(stages);
    setIsCalibrated(true);
  };

  const handleReload = () => {
    setCsvData(null);
    setMapping(null);
    setOrderedStages([]);
    setIsCalibrated(false);
    handleResetFilters();
  };

  const handleResetFilters = () => {
    setSelectedChannels([]);
    setSelectedCampaigns([]);
    setSelectedRegions([]);
    setSelectedDevices([]);
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
  };

  const handleFilterChange = (type: 'channels' | 'campaigns' | 'regions' | 'devices', values: string[]) => {
    if (type === 'channels') setSelectedChannels(values);
    if (type === 'campaigns') setSelectedCampaigns(values);
    if (type === 'regions') setSelectedRegions(values);
    if (type === 'devices') setSelectedDevices(values);
  };

  const handleDateChange = (start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
  };

  // 3. Dynamic Aggregation Pipeline (Memoized)
  const dataPipeline = useMemo(() => {
    if (!csvData || !mapping) return null;

    // A. Clean and process data (normalize, deduplicate, casing fix)
    const { cleanedRows, quality } = cleanAndProcessData(csvData.rows, mapping);

    // B. Extract filter selections from full cleaned dataset
    const uniqueChannels = Array.from(new Set(cleanedRows.map(r => r._channel).filter(Boolean))) as string[];
    const uniqueCampaigns = Array.from(new Set(cleanedRows.map(r => r._campaign).filter(Boolean))) as string[];
    const uniqueRegions = Array.from(new Set(cleanedRows.map(r => r._region).filter(Boolean))) as string[];
    const uniqueDevices = Array.from(new Set(cleanedRows.map(r => r._device).filter(Boolean))) as string[];

    // C. Apply active dashboard filters
    const filteredRows = filterData(cleanedRows, {
      startDate,
      endDate,
      channels: selectedChannels,
      campaigns: selectedCampaigns,
      regions: selectedRegions,
      devices: selectedDevices,
      searchQuery
    });

    // D. Run Aggregations
    const funnelData = calculateFunnelData(filteredRows, mapping, orderedStages);
    const kpis = calculateKPIs(filteredRows, funnelData, mapping);
    const channelsData = calculateChannelPerformance(filteredRows, mapping, funnelData);
    const campaignsData = calculateCampaignPerformance(filteredRows, mapping, funnelData);
    const dailyTrends = calculateDailyTrends(filteredRows, mapping, currentBucket);
    
    // Segment breakouts for recommendation rules
    const deviceBreakdown = filteredRows.reduce((acc: any[], row) => {
      const dev = row._device || 'Desktop';
      let existing = acc.find(item => item.segmentValue === dev);
      if (!existing) {
        existing = { segmentValue: dev, visitors: 0, conversions: 0 };
        acc.push(existing);
      }
      existing.visitors++;
      if (row._converted) existing.conversions++;
      return acc;
    }, []).map(item => ({
      ...item,
      conversionRate: item.visitors > 0 ? (item.conversions / item.visitors) * 100 : 0
    }));

    const regionBreakdown = filteredRows.reduce((acc: any[], row) => {
      const reg = row._region || 'Global';
      let existing = acc.find(item => item.segmentValue === reg);
      if (!existing) {
        existing = { segmentValue: reg, visitors: 0, conversions: 0 };
        acc.push(existing);
      }
      existing.visitors++;
      if (row._converted) existing.conversions++;
      return acc;
    }, []).map(item => ({
      ...item,
      conversionRate: item.visitors > 0 ? (item.conversions / item.visitors) * 100 : 0
    }));

    // E. Detect conversion rate shifts (notable shifts)
    const decliningShifts = detectDecliningChannels(filteredRows);

    // F. Generate Actionable recommendations (at least 10 items)
    const recommendations = generateRecommendations(
      funnelData,
      channelsData,
      campaignsData,
      deviceBreakdown,
      regionBreakdown,
      kpis
    );

    return {
      filteredRows,
      quality,
      filterChoices: {
        channels: uniqueChannels,
        campaigns: uniqueCampaigns,
        regions: uniqueRegions,
        devices: uniqueDevices
      },
      funnelData,
      kpis,
      channelsData,
      campaignsData,
      dailyTrends,
      decliningShifts,
      recommendations
    };
  }, [csvData, mapping, orderedStages, selectedChannels, selectedCampaigns, selectedRegions, selectedDevices, startDate, endDate, searchQuery, currentBucket]);

  // 4. Exporting Utilities
  const handleExportCSV = () => {
    if (!dataPipeline) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Metric,Value\n";
    
    const { kpis } = dataPipeline;
    csvContent += `Funnel KPI,Total Traffic,${kpis.totalVisitors}\n`;
    csvContent += `Funnel KPI,Total Leads,${kpis.totalLeads}\n`;
    csvContent += `Funnel KPI,Conversions,${kpis.totalConversions}\n`;
    csvContent += `Funnel KPI,Overall Conversion Rate,${kpis.overallConversionRate.toFixed(2)}%\n`;
    csvContent += `Funnel KPI,Total Spend,${kpis.totalSpend}\n`;
    csvContent += `Funnel KPI,Total Revenue,${kpis.totalRevenue}\n`;
    csvContent += `Funnel KPI,ROI,${kpis.roi.toFixed(1)}%\n`;
    csvContent += `Funnel KPI,CAC,${kpis.cac.toFixed(2)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `funnel_insights_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#FFFDFC] text-[#0E0E0E] selection:bg-[#FF5D38] selection:text-white pb-24 antialiased">
      {/* Decorative Grid Backdrop */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none z-0" />
      
      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Screening Navigation */}
        {!csvData ? (
          // SCREEN 1: File Uploader
          <UploadPanel 
            onDataParsed={handleDataParsed} 
            onLoadSample={handleLoadSample} 
          />
        ) : !isCalibrated ? (
          // SCREEN 2: Data Calibration & Dropdown Mapper
          <ColumnMapper
            previewData={csvData}
            onMappingConfirmed={handleMappingConfirmed}
            onCancel={handleReload}
          />
        ) : (
          // SCREEN 3: Active Analytics Case Study Dashboard
          dataPipeline && (
            <div className="space-y-12 animate-fadeIn print:space-y-8">
              
              {/* Header Navigation */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b-3 border-[#0E0E0E] pb-6 print:pb-3 print:border-none">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-[10px] font-black text-white bg-[#0E0E0E] rounded-md uppercase tracking-wider">
                      CASE STUDY REPORT
                    </span>
                    <span className="text-xs text-slate-500 font-bold truncate max-w-[200px] flex items-center gap-1">
                      <Database className="w-3.5 h-3.5 text-slate-400" /> {fileName}
                    </span>
                  </div>
                  <h1 className="text-4xl font-black tracking-tight text-[#0E0E0E] uppercase mt-2.5 font-display print:text-2xl leading-none">
                    Funnel Insights <span className="text-[#FF5D38]">Analysis</span>
                  </h1>
                </div>

                <div className="flex items-center gap-3 print:hidden">
                  <button
                    onClick={handleReload}
                    className="px-5 py-3 text-xs font-black uppercase tracking-wider text-slate-700 bg-white hover:bg-slate-50 border-2 border-[#0E0E0E] rounded-xl transition cursor-pointer"
                  >
                    Reload New CSV File
                  </button>
                </div>
              </div>

              {/* CHAPTER 1: Hero / Executive Summary */}
              <div id="executive-summary" className="scroll-mt-6">
                <ExecutiveSummary 
                  metrics={dataPipeline.kpis} 
                  funnelData={dataPipeline.funnelData}
                  quality={dataPipeline.quality}
                />
              </div>

              {/* Segment Filters Control */}
              <div className="print:hidden">
                <DashboardFilters
                  channels={dataPipeline.filterChoices.channels}
                  campaigns={dataPipeline.filterChoices.campaigns}
                  regions={dataPipeline.filterChoices.regions}
                  devices={dataPipeline.filterChoices.devices}
                  selectedChannels={selectedChannels}
                  selectedCampaigns={selectedCampaigns}
                  selectedRegions={selectedRegions}
                  selectedDevices={selectedDevices}
                  startDate={startDate}
                  endDate={endDate}
                  searchQuery={searchQuery}
                  onFilterChange={handleFilterChange}
                  onDateChange={handleDateChange}
                  onSearchChange={setSearchQuery}
                  onReset={handleResetFilters}
                  onReload={handleReload}
                  onExportPDF={handleExportPDF}
                  onExportCSV={handleExportCSV}
                />
              </div>

              {/* CHAPTER 2: The Funnel Centerpiece */}
              <div id="funnel-hero" className="scroll-mt-6">
                <FunnelHero funnelData={dataPipeline.funnelData} />
              </div>

              {/* CHAPTER 3: Diagnosis Leak Callout */}
              <div id="dropoff-diagnosis" className="scroll-mt-6">
                <DropoffDiagnosis 
                  funnelData={dataPipeline.funnelData} 
                  metrics={dataPipeline.kpis}
                />
              </div>

              {/* CHAPTER 4: Time-based trends & Channel Leaderboards */}
              <div className="grid grid-cols-1 gap-12">
                <div id="trend-chart" className="scroll-mt-6">
                  <TrendChart 
                    dailyTrends={dataPipeline.dailyTrends}
                    decliningShifts={dataPipeline.decliningShifts}
                    currentBucket={currentBucket}
                    onBucketChange={setCurrentBucket}
                  />
                </div>

                <div id="leaderboard" className="scroll-mt-6">
                  <ChannelLeaderboard 
                    channelsData={dataPipeline.channelsData}
                    campaignsData={dataPipeline.campaignsData}
                  />
                </div>
              </div>

              {/* CHAPTER 5: What To Do Next (Recommendations Playbook) */}
              <div id="playbook" className="scroll-mt-6 print:hidden">
                <RecommendationsPanel recommendations={dataPipeline.recommendations} />
              </div>

              {/* CHAPTER 6: Record Database */}
              <div id="database" className="scroll-mt-6 print:hidden">
                <DataTable 
                  rows={dataPipeline.filteredRows} 
                  headers={csvData.headers} 
                />
              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
};
export default App;
