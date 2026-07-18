import React, { useState, useMemo } from 'react';
import { Database, ShieldAlert, LineChart, Sparkles, LogOut } from 'lucide-react';
import { UploadPanel } from './components/UploadPanel';
import { ColumnMapper } from './components/ColumnMapper';
import { KPICards } from './components/KPICards';
import { DashboardFilters } from './components/DashboardFilters';
import { InsightsPanel } from './components/InsightsPanel';
import { RecommendationsPanel } from './components/RecommendationsPanel';
import { DataTable } from './components/DataTable';

// Charts
import { FunnelVisualization } from './charts/FunnelVisualization';
import { ChannelPerformanceChart } from './charts/ChannelPerformanceChart';
import { CampaignPerformanceChart } from './charts/CampaignPerformanceChart';
import { CustomerBehaviorChart } from './charts/CustomerBehaviorChart';
import { RevenueAnalyticsChart } from './charts/RevenueAnalyticsChart';

// Utils
import { cleanAndProcessData, filterData, calculateFunnelData, calculateKPIs, calculateChannelPerformance, calculateCampaignPerformance, calculateDailyTrends, calculateSegmentBreakdown } from './utils/funnelEngine';
import { getFunnelInsights, getChannelInsights, getCampaignInsights, getSegmentInsights, getRevenueInsights, generateRecommendations } from './utils/insightEngine';
import type { CSVDataPreview, ColumnMapping } from './types';

export const App: React.FC = () => {
  // 1. Navigation & State Setup
  const [csvData, setCsvData] = useState<CSVDataPreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping | null>(null);
  const [orderedStages, setOrderedStages] = useState<string[]>([]);
  const [isCalibrated, setIsCalibrated] = useState(false);
  const [fileName, setFileName] = useState<string>('sample_marketing_funnel.csv');

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Filters State
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. CSV Parser Callbacks
  const handleDataParsed = (data: CSVDataPreview) => {
    setCsvData(data);
    setIsCalibrated(false); // require recalibration for a new upload
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
    // Reset filters
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

  // 3. Dynamic Calculation Pipeline (Memoized)
  const dataPipeline = useMemo(() => {
    if (!csvData || !mapping) return null;

    // A. Clean and process data (deduplicate, parse numbers, typecast)
    const { cleanedRows, quality } = cleanAndProcessData(csvData.rows, mapping);

    // B. Extract filter lists from the ENTIRE cleaned dataset (before filters are applied)
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
    const dailyTrends = calculateDailyTrends(filteredRows, mapping);
    
    // Segment breakouts
    const deviceBreakdown = calculateSegmentBreakdown(filteredRows, '_device');
    const regionBreakdown = calculateSegmentBreakdown(filteredRows, '_region');

    // E. Generate plain-English analytics insights
    const funnelInsights = getFunnelInsights(funnelData, kpis);
    const channelInsights = getChannelInsights(channelsData);
    const campaignInsights = getCampaignInsights(campaignsData);
    const segmentInsights = getSegmentInsights(deviceBreakdown, regionBreakdown);
    const revenueInsights = getRevenueInsights(kpis);

    // F. Generate actionable Recommendations Playbook (at least 10 items)
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
      deviceBreakdown,
      regionBreakdown,
      insights: {
        funnelInsights,
        channelInsights,
        campaignInsights,
        segmentInsights,
        revenueInsights
      },
      recommendations
    };
  }, [csvData, mapping, orderedStages, selectedChannels, selectedCampaigns, selectedRegions, selectedDevices, startDate, endDate, searchQuery]);

  // 4. Exporting Utilities
  const handleExportCSV = () => {
    if (!dataPipeline) return;

    // Construct a summarized CSV download payload
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Category,Metric,Value\n";
    
    const { kpis } = dataPipeline;
    csvContent += `KPI,Total Traffic,${kpis.totalVisitors}\n`;
    csvContent += `KPI,Total Leads,${kpis.totalLeads}\n`;
    csvContent += `KPI,Conversions,${kpis.totalConversions}\n`;
    csvContent += `KPI,Funnel Conversion Rate,${kpis.overallConversionRate.toFixed(2)}%\n`;
    csvContent += `KPI,Total Spend,${kpis.totalSpend}\n`;
    csvContent += `KPI,Total Revenue,${kpis.totalRevenue}\n`;
    csvContent += `KPI,ROI,${kpis.roi.toFixed(1)}%\n`;
    csvContent += `KPI,CAC,${kpis.cac.toFixed(2)}\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `funnel_dashboard_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    // Print styled dashboard cleanly
    window.print();
  };

  return (
    <div className={`min-h-screen font-sans antialiased transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-slate-950 text-slate-100 selection:bg-violet-650 selection:text-white' 
        : 'bg-slate-50 text-slate-900 selection:bg-violet-300 selection:text-slate-900'
    }`}>
      {/* Background glow meshes for dark theme */}
      {isDarkMode && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-violet-900/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-[450px] h-[450px] bg-emerald-950/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Global Wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Screen Router */}
        {!csvData ? (
          // SCREEN 1: File Uploader
          <UploadPanel onDataParsed={handleDataParsed} onLoadSample={handleLoadSample} />
        ) : !isCalibrated ? (
          // SCREEN 2: Column Mapper & Heuristic Calibration
          <ColumnMapper
            previewData={csvData}
            onMappingConfirmed={handleMappingConfirmed}
            onCancel={handleReload}
          />
        ) : (
          // SCREEN 3: Active Analytics Dashboard
          dataPipeline && (
            <div className="space-y-8 animate-fadeIn print:space-y-6">
              
              {/* SECTION 1: Dashboard Professional Header */}
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-b border-slate-800/80 pb-6 print:pb-3 print:border-none">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-bold text-violet-400 bg-violet-950/60 border border-violet-850 rounded-full uppercase tracking-wider">
                      Analytics Panel
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[200px] flex items-center gap-1">
                      <Database className="w-3 h-3 text-slate-600" /> {fileName}
                    </span>
                  </div>
                  <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-violet-400 bg-clip-text text-transparent mt-2 print:text-slate-900 print:bg-none print:text-2xl">
                    Marketing Funnel & Conversion Analytics
                  </h1>
                  <p className="text-xs text-slate-400 mt-1 print:hidden">
                    Assess customer progression velocity, channel spend allocation, and growth bottlenecks.
                  </p>
                </div>

                <div className="flex items-center gap-3 print:hidden">
                  <button
                    onClick={handleReload}
                    className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Reload New File
                  </button>
                </div>
              </div>

              {/* HERO METADATA CARD (Objectives & Stack info) */}
              <div className="p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
                <div className="space-y-1 md:col-span-1 border-r border-slate-850 pr-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-violet-400" /> Executive Goal
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    Map customer acquisition pipeline, isolate leaky stages, assess channels, and scale campaign profitability.
                  </p>
                </div>
                
                <div className="space-y-1 md:col-span-1 border-r border-slate-850 pr-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <Database className="w-3 h-3 text-emerald-400" /> Data Source Profile
                  </h4>
                  <div className="text-[11px] text-slate-350 space-y-0.5">
                    <div>Total Records: <strong>{dataPipeline.quality.totalRows}</strong></div>
                    <div>Valid Leads Mapped: <strong>{dataPipeline.quality.validRows}</strong></div>
                    <div>Duplicate Leads: <strong>{dataPipeline.quality.duplicateLeadsCount}</strong></div>
                  </div>
                </div>

                <div className="space-y-1 md:col-span-1 border-r border-slate-850 pr-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-rose-400" /> Data Quality Summary
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Dropped {dataPipeline.quality.droppedRows} duplicate logs. Found {dataPipeline.quality.missingValuesCount} missing points. Normalizing casing and currency inputs automatically.
                  </p>
                </div>

                <div className="space-y-1 md:col-span-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <LineChart className="w-3 h-3 text-cyan-400" /> Analytics Engine Stack
                  </h4>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['React', 'TypeScript', 'Tailwind', 'Recharts', 'PapaParse'].map(t => (
                      <span key={t} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850 text-[10px] text-slate-500 font-semibold">{t}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 9: Interactive Segment Filters */}
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
                  isDarkMode={isDarkMode}
                  onToggleTheme={() => setIsDarkMode(!isDarkMode)}
                />
              </div>

              {/* SECTION 2: Executive KPI Cards */}
              <KPICards metrics={dataPipeline.kpis} />

              {/* Double Column Grid: Funnel waterfall and Revenue Trend */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* SECTION 3: Marketing Funnel Visualization */}
                <div className="space-y-3">
                  <FunnelVisualization funnelData={dataPipeline.funnelData} />
                  <div className="print:hidden">
                    <InsightsPanel insights={dataPipeline.insights.funnelInsights} />
                  </div>
                </div>

                {/* SECTION 8: Revenue Analytics Trend */}
                <div className="space-y-3">
                  <RevenueAnalyticsChart dailyTrends={dataPipeline.dailyTrends} />
                  <div className="print:hidden">
                    <InsightsPanel insights={dataPipeline.insights.revenueInsights} />
                  </div>
                </div>
              </div>

              {/* SECTION 6: Channel Performance */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <ChannelPerformanceChart channelsData={dataPipeline.channelsData} />
                  <div className="print:hidden">
                    <InsightsPanel insights={dataPipeline.insights.channelInsights} />
                  </div>
                </div>

                {/* SECTION 5: Campaign Performance */}
                <div className="space-y-3">
                  <CampaignPerformanceChart campaignsData={dataPipeline.campaignsData} />
                  <div className="print:hidden">
                    <InsightsPanel insights={dataPipeline.insights.campaignInsights} />
                  </div>
                </div>
              </div>

              {/* SECTION 7: Segment / Behavior Breakdown (Device & Region) */}
              <div className="space-y-3">
                <CustomerBehaviorChart
                  deviceData={dataPipeline.deviceBreakdown}
                  regionData={dataPipeline.regionBreakdown}
                />
                <div className="print:hidden">
                  <InsightsPanel insights={dataPipeline.insights.segmentInsights} />
                </div>
              </div>

              {/* SECTION 11: Business Recommendations Playbook */}
              <div className="print:hidden">
                <RecommendationsPanel recommendations={dataPipeline.recommendations} />
              </div>

              {/* SECTION 12: Campaign database listing */}
              <div className="print:hidden">
                <DataTable rows={dataPipeline.filteredRows} headers={csvData.headers} />
              </div>

            </div>
          )
        )}

      </div>
    </div>
  );
};
export default App;
