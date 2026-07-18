import { useState, useMemo, useEffect } from 'react';
import { UploadPanel } from './components/UploadPanel';
import { ColumnMapper } from './components/ColumnMapper';
import { KPICards } from './components/KPICards';
import { Charts } from './components/Charts';
import { InsightsPanel } from './components/InsightsPanel';
import { DataTable } from './components/DataTable';
import { InteractiveBackground } from './components/InteractiveBackground';
import { ColumnMapping, DashboardData, ThemeAccentColor } from './types';
import { parseCSV } from './utils/csvParser';
import { detectColumns } from './utils/columnDetector';
import { processDashboardData, applyFilters } from './utils/churnEngine';
import { 
  BarChart3, 
  Database, 
  RefreshCw, 
  Printer, 
  Moon, 
  Sun,
  Layers,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const [step, setStep] = useState<'upload' | 'mapping' | 'dashboard'>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  
  // Raw parsed CSV
  const [rawData, setRawData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Mappings
  const [mapping, setMapping] = useState<ColumnMapping>({
    customerId: '',
    churn: '',
    tenure: '',
    monthlyCharges: '',
    totalCharges: '',
    categorical: [],
  });

  // Base processed dashboard data (without active filter reductions)
  const [baseDashboardData, setBaseDashboardData] = useState<DashboardData | null>(null);

  // Active filters mapping: Column -> Selected Values
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});

  // Theme support
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showParticles, setShowParticles] = useState(false); // Calm UI default: false
  const [themeColor] = useState<ThemeAccentColor>('indigo'); // Cohesive standard palette

  // Keep theme dark class synchronized on mount and toggle
  useEffect(() => {
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Section Tracking via Intersection Observer
  const [activeSection, setActiveSection] = useState('overview');

  useEffect(() => {
    if (step !== 'dashboard') return;
    const sections = ['overview', 'segments', 'financial', 'insights', 'datatable'];
    const observers = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-25% 0px -55% 0px' }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observers.observe(el);
    });

    return () => observers.disconnect();
  }, [step]);

  // Parses uploaded CSV string and triggers mapping state
  const handleCSVText = async (csvText: string, filename: string) => {
    setIsLoading(true);
    setFileName(filename);
    try {
      const result = await parseCSV(csvText);
      setRawData(result.data);
      setHeaders(result.headers);

      // Guess columns
      const autoMapping = detectColumns(result.headers, result.data);
      setMapping(autoMapping);
      setStep('mapping');
    } catch (err) {
      console.error(err);
      alert("Failed to parse CSV file. Ensure it is formatted correctly.");
    } finally {
      setIsLoading(false);
    }
  };

  // Triggers final dashboard compilation
  const handleConfirmMapping = (confirmedMapping: ColumnMapping) => {
    setMapping(confirmedMapping);
    const data = processDashboardData(rawData, confirmedMapping);
    setBaseDashboardData(data);
    
    // Initialize active filters as empty arrays for all categorical columns
    const initialFilters: Record<string, string[]> = {};
    confirmedMapping.categorical.forEach((col) => {
      initialFilters[col] = [];
    });
    setActiveFilters(initialFilters);
    
    setStep('dashboard');
  };

  // Computes current filtered dashboard data
  const dashboardData = useMemo(() => {
    if (!baseDashboardData) return null;
    return applyFilters(baseDashboardData, activeFilters);
  }, [baseDashboardData, activeFilters]);

  // Extract unique segment options for filter selectors
  const filterOptions = useMemo(() => {
    if (!baseDashboardData) return {};
    
    const options: Record<string, string[]> = {};
    baseDashboardData.mapping.categorical.forEach((col) => {
      const values = new Set<string>();
      baseDashboardData.originalData.forEach((row) => {
        const val = row[col];
        values.add(String(val !== undefined && val !== null && String(val).trim() !== '' ? val : 'Not Specified'));
      });
      options[col] = Array.from(values).sort();
    });
    return options;
  }, [baseDashboardData]);

  // Toggle options inside filters
  const handleFilterToggle = (column: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[column] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return {
        ...prev,
        [column]: updated,
      };
    });
  };

  const resetFilters = () => {
    if (!baseDashboardData) return;
    const cleared: Record<string, string[]> = {};
    baseDashboardData.mapping.categorical.forEach((col) => {
      cleared[col] = [];
    });
    setActiveFilters(cleared);
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleReset = () => {
    setRawData([]);
    setHeaders([]);
    setBaseDashboardData(null);
    setActiveFilters({});
    setStep('upload');
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const SkeletonLoader = () => (
    <div className="space-y-8 animate-pulse my-8">
      <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-lg w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${isDarkMode ? 'bg-[#090d16] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <InteractiveBackground isDarkMode={isDarkMode} themeColor={themeColor} showParticles={showParticles} />
      
      <div className="relative z-20 flex flex-col min-h-screen">
      
        {/* Top Navbar */}
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
          isDarkMode ? 'bg-[#090d16]/80 border-slate-800/80' : 'bg-white/80 border-slate-200'
        } print:hidden`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-md">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold tracking-tight text-sm md:text-base text-indigo-600 dark:text-indigo-400">
                  ChurnInsights
                </span>
                <span className={`text-[10px] block font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  Enterprise Analytics Engine v1.0
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Particle Toggle Button (Calm UI vs Interactive Effects) */}
              <button
                onClick={() => setShowParticles(!showParticles)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showParticles 
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                    : isDarkMode 
                    ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-slate-350' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                }`}
                title="Toggle ambient background visual effects"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showParticles ? 'Effects: ON' : 'Effects: OFF'}</span>
              </button>

              {step === 'dashboard' && (
                <>
                  <button
                    onClick={handlePrint}
                    className={`p-2 rounded-xl border transition-colors ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-350' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                    }`}
                    title="Print Report"
                  >
                    <Printer className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleReset}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-350' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                    }`}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New Dataset
                  </button>
                </>
              )}

              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-colors ${
                  isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-yellow-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-650'
                }`}
                aria-label="Toggle light/dark theme"
              >
                {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </header>

        {/* Main Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SkeletonLoader />
              </motion.div>
            ) : step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <UploadPanel onCSVData={handleCSVText} isLoading={isLoading} themeColor={themeColor} />
                
                {/* Project Hero Details */}
                <div className="max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-200 dark:border-slate-850">
                  <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-slate-900/30 border-slate-800/60' : 'bg-white border-slate-200'} shadow-sm`}>
                    <h3 className="text-base font-bold mb-3 text-slate-800 dark:text-slate-200">Enterprise Dashboard Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-350 mb-1">Business Objectives:</p>
                        <p className="leading-relaxed">
                          Understand why subscribers churn, isolate service and billing risks, inspect average contract life expectancy, and compile concrete recommendations to minimize recurring revenue lost.
                        </p>
                        <p className="font-semibold text-slate-700 dark:text-slate-350 mt-4 mb-1">Technology Stack:</p>
                        <p>
                          React 18, Vite, TypeScript, Tailwind CSS, Recharts for charts, PapaParse client-side parser, Framer Motion transitions, and Lucide React icons.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-slate-700 dark:text-slate-350 mb-1">Project Portfolio Scope:</p>
                        <p className="leading-relaxed">
                          Built for Data Science and Analytics, showcasing clean frontend design, automated schemas mapping, real-time analytics aggregation, and high-fidelity insights computation.
                        </p>
                        <p className="font-semibold text-slate-700 dark:text-slate-350 mt-4 mb-1">Security & Deployment:</p>
                        <p className="leading-relaxed">
                          100% browser execution. No customer data leaves your computer or hits a server. Fully compatible with static hosts like GitHub Pages or Vercel.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'mapping' && (
              <motion.div
                key="mapping"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <ColumnMapper
                  headers={headers}
                  previewRows={rawData}
                  detectedMapping={mapping}
                  onConfirmMapping={handleConfirmMapping}
                  onCancel={handleReset}
                />
              </motion.div>
            )}

            {step === 'dashboard' && dashboardData && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                
                {/* Dashboard Hero Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800/80 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-650 dark:text-indigo-400">
                      <Database className="w-3.5 h-3.5" />
                      <span>Active File: {fileName}</span>
                    </div>
                    <h1 className="text-2.5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
                      Customer Retention & Churn Analytics
                    </h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Analyzed dataset with {baseDashboardData?.quality.totalRows.toLocaleString()} rows. Interactive filtering enabled.
                    </p>
                  </div>
                  
                  {/* Clean data quality display */}
                  <div className={`p-3 rounded-xl border flex items-center gap-4 text-xs leading-none ${
                    isDarkMode ? 'bg-slate-950/60 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                  }`}>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Data Quality</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 mt-1.5 block">
                        {dashboardData.quality.validRows.toLocaleString()} / {dashboardData.quality.totalRows.toLocaleString()} rows
                      </span>
                    </div>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800" />
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block text-[9px] uppercase font-bold tracking-wider">Dropped / Nulls</span>
                      <span className="font-semibold text-amber-600 dark:text-amber-500 mt-1.5 block">
                        {dashboardData.quality.droppedRows} rows
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dashboard Layout: Sidebar + Main Content Grid */}
                <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
                  
                  {/* LEFT STICKY SIDEBAR (Navigation & Segment Filters) */}
                  <aside className="lg:col-span-3 space-y-6 sticky top-24 print:hidden mb-6 lg:mb-0">
                    
                    {/* Navigation jumping widget */}
                    <div className={`rounded-2xl border p-4 ${
                      isDarkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                    }`}>
                      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2.5">
                        Navigation Sections
                      </h4>
                      <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 scrollbar-none whitespace-nowrap">
                        {[
                          { id: 'overview', name: 'Executive Overview' },
                          { id: 'segments', name: 'Tenure & Cost Analysis' },
                          { id: 'financial', name: 'Segment Risk factors' },
                          { id: 'insights', name: 'Strategic Playbooks' },
                          { id: 'datatable', name: 'Customer Explorer' },
                        ].map((section) => (
                          <button
                            key={section.id}
                            onClick={() => scrollToSection(section.id)}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left w-fit lg:w-full select-none cursor-pointer ${
                              activeSection === section.id
                                ? 'bg-indigo-50 border-indigo-100 text-indigo-650 dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-950/20'
                                : 'text-slate-500 hover:text-slate-800 dark:text-slate-450 dark:hover:text-slate-200'
                            }`}
                          >
                            {section.name}
                          </button>
                        ))}
                      </nav>
                    </div>

                    {/* Segment Filters Panel */}
                    {Object.keys(filterOptions).length > 0 && (
                      <div className={`p-4 rounded-2xl border ${
                        isDarkMode ? 'bg-slate-900/30 border-slate-800/80' : 'bg-white border-slate-200 shadow-sm'
                      }`}>
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-2.5 mb-3">
                          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-250 flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-indigo-650 dark:text-indigo-400" />
                            Segment Filters
                          </h3>
                          <button
                            onClick={resetFilters}
                            className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-bold uppercase transition-colors"
                          >
                            Clear
                          </button>
                        </div>
                        
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                          {Object.keys(filterOptions).map((col) => {
                            const selected = activeFilters[col] || [];
                            const displayName = col.replace(/([A-Z])/g, ' $1').trim();

                            return (
                              <div key={col} className="space-y-1.5">
                                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                  {displayName}
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {filterOptions[col].map((val) => {
                                    const isChecked = selected.includes(val);
                                    return (
                                      <button
                                        key={val}
                                        onClick={() => handleFilterToggle(col, val)}
                                        className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                          isChecked
                                            ? 'bg-indigo-50 border-indigo-200 text-indigo-600 dark:bg-indigo-500/10 dark:border-indigo-500/35 dark:text-indigo-300'
                                            : isDarkMode 
                                            ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                            : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100 hover:border-slate-350'
                                        }`}
                                      >
                                        {val}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  </aside>

                  {/* RIGHT MAIN VIEW (KPIs, Charts, Recommendations, Data Table) */}
                  <div className="lg:col-span-9 space-y-2">
                    
                    {/* KPI metrics row */}
                    <KPICards data={dashboardData} />

                    {/* Core Charts Section */}
                    <Charts data={dashboardData} themeColor={themeColor} />

                    {/* Operational Recommendations */}
                    <InsightsPanel data={dashboardData} />

                    {/* Customer record datatable */}
                    <DataTable data={dashboardData} />

                  </div>

                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="text-center py-8 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-800/80 mt-auto print:hidden">
          <p>© 2026 Churn Insights Dashboard. Built for Data Science & Analytics Internship Portfolio.</p>
          <p className="mt-1">Works client-side in the browser. Safe for confidential datasets.</p>
        </footer>
      </div>
    </div>
  );
}
