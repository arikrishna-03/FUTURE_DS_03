import { useState, useMemo } from 'react';
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
  FolderOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
const ACCENT_COLOR_MAPS = {
  indigo: {
    badge: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    gradient: 'from-indigo-500 to-purple-600',
    logoText: 'from-indigo-400 to-purple-400',
    activeBadge: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300',
    hoverText: 'hover:text-indigo-400',
    text: 'text-indigo-400',
  },
  blue: {
    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    gradient: 'from-blue-500 to-cyan-600',
    logoText: 'from-blue-400 to-cyan-400',
    activeBadge: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    hoverText: 'hover:text-blue-400',
    text: 'text-blue-400',
  },
  emerald: {
    badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    gradient: 'from-emerald-500 to-teal-600',
    logoText: 'from-emerald-400 to-teal-400',
    activeBadge: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
    hoverText: 'hover:text-emerald-400',
    text: 'text-emerald-400',
  },
  purple: {
    badge: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    gradient: 'from-purple-500 to-pink-600',
    logoText: 'from-purple-400 to-pink-400',
    activeBadge: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
    hoverText: 'hover:text-purple-400',
    text: 'text-purple-400',
  },
  rose: {
    badge: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    gradient: 'from-rose-500 to-red-600',
    logoText: 'from-rose-400 to-red-400',
    activeBadge: 'bg-rose-500/20 border-rose-500/40 text-rose-300',
    hoverText: 'hover:text-rose-400',
    text: 'text-rose-400',
  },
  amber: {
    badge: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    gradient: 'from-amber-500 to-orange-600',
    logoText: 'from-amber-400 to-orange-400',
    activeBadge: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
    hoverText: 'hover:text-amber-400',
    text: 'text-amber-400',
  }
};

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
  const [themeColor, setThemeColor] = useState<ThemeAccentColor>('indigo');

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
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
  };

  const handleReset = () => {
    setRawData([]);
    setHeaders([]);
    setBaseDashboardData(null);
    setActiveFilters({});
    setStep('upload');
  };

  return (
    <div className={`min-h-screen relative transition-colors duration-300 ${isDarkMode ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <InteractiveBackground isDarkMode={isDarkMode} themeColor={themeColor} />
      <div className="relative z-20">
      
      {/* Top Navbar */}
      <header className={`sticky top-0 z-50 backdrop-blur-xl border-b transition-colors duration-300 ${
        isDarkMode ? 'bg-[#030712]/80 border-slate-800/80' : 'bg-white/80 border-slate-200'
      } print:hidden`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${ACCENT_COLOR_MAPS[themeColor].gradient} flex items-center justify-center shadow-lg shadow-indigo-500/25`}>
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className={`font-extrabold tracking-tight text-sm md:text-base bg-gradient-to-r ${ACCENT_COLOR_MAPS[themeColor].logoText} bg-clip-text text-transparent`}>
                ChurnInsights
              </span>
              <span className={`text-[10px] block font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                Enterprise Analytics Engine v1.0
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Accent Dot Picker */}
            <div className="flex items-center gap-1.5 mr-2">
              {(['indigo', 'blue', 'emerald', 'purple', 'rose', 'amber'] as ThemeAccentColor[]).map((color) => {
                const colorBg = {
                  indigo: 'bg-indigo-500',
                  blue: 'bg-blue-500',
                  emerald: 'bg-emerald-500',
                  purple: 'bg-purple-500',
                  rose: 'bg-rose-500',
                  amber: 'bg-amber-500',
                }[color];
                return (
                  <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`w-3.5 h-3.5 rounded-full transition-all duration-300 ${colorBg} ${
                      themeColor === color ? 'ring-2 ring-slate-100 scale-110 ring-offset-2 ring-offset-[#030712]' : 'opacity-60 hover:opacity-100 hover:scale-105'
                    }`}
                    title={`Switch to ${color} theme`}
                  />
                );
              })}
            </div>
            {step === 'dashboard' && (
              <>
                <button
                  onClick={handlePrint}
                  className={`p-2 rounded-xl border transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                  title="Print Report"
                >
                  <Printer className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleReset}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-300' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  New Dataset
                </button>
              </>
            )}

            <button
              onClick={toggleTheme}
              className={`p-2.5 rounded-xl border transition-colors ${
                isDarkMode ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-yellow-400' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
            >
              <UploadPanel onCSVData={handleCSVText} isLoading={isLoading} themeColor={themeColor} />
              
              {/* Project Hero Details (Section 1) */}
              <div className="max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-800/40">
                <div className={`rounded-2xl p-6 border ${isDarkMode ? 'bg-[#111827]/30 border-slate-800/50' : 'bg-white border-slate-200'} shadow-lg`}>
                  <h3 className="text-lg font-bold mb-3">Enterprise Dashboard Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-400">
                    <div>
                      <p className="font-semibold text-slate-200 mb-1">Business Objectives:</p>
                      <p className="leading-relaxed text-xs">
                        Understand why subscribers churn, isolate service and billing risks, inspect average contract life expectancy, and compile concrete recommendations to minimize recurring revenue lost.
                      </p>
                      <p className="font-semibold text-slate-200 mt-4 mb-1">Technology Stack:</p>
                      <p className="text-xs">
                        React 18, Vite, TypeScript, Tailwind CSS, Recharts for charts, PapaParse client-side parser, Framer Motion transitions, and Lucide React icons.
                      </p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-200 mb-1">Project Portfolio Scope:</p>
                      <p className="leading-relaxed text-xs">
                        Built for Data Science and Analytics, showcasing clean frontend design, automated schemas mapping, real-time analytics aggregation, and high-fidelity insights computation.
                      </p>
                      <p className="font-semibold text-slate-200 mt-4 mb-1">Security & Deployment:</p>
                      <p className="text-xs leading-relaxed">
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
              className="space-y-6"
            >
              
              {/* Dashboard Hero Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-slate-800/40 gap-4">
                <div>
                  <div className={`flex items-center gap-2 text-xs font-semibold ${ACCENT_COLOR_MAPS[themeColor].text}`}>
                    <Database className="w-3.5 h-3.5" />
                    <span>Active File: {fileName}</span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-1">
                    Customer Retention & Churn Analytics
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzed dataset with {baseDashboardData?.quality.totalRows.toLocaleString()} rows. Interactive filtering enabled.
                  </p>
                </div>
                
                {/* Clean data quality display */}
                <div className={`p-3 rounded-xl border flex items-center gap-3 text-xs leading-none ${
                  isDarkMode ? 'bg-slate-950/60 border-slate-800' : 'bg-white border-slate-200'
                }`}>
                  <div className="text-right">
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Data Quality</span>
                    <span className="font-bold text-emerald-400 mt-1 block">
                      {dashboardData.quality.validRows.toLocaleString()} / {dashboardData.quality.totalRows.toLocaleString()} rows
                    </span>
                  </div>
                  <div className="h-6 w-[1px] bg-slate-800" />
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase font-bold">Dropped / Nulls</span>
                    <span className="font-semibold text-amber-500 mt-1 block">
                      {dashboardData.quality.droppedRows} rows
                    </span>
                  </div>
                </div>
              </div>

              {/* SECTION 8: Interactive Filters Panel */}
              {Object.keys(filterOptions).length > 0 && (
                <div className={`p-5 rounded-2xl border ${
                  isDarkMode ? 'bg-[#111827]/40 border-slate-800/80' : 'bg-white border-slate-200'
                } shadow-sm print:hidden`}>
                  <div className="flex items-center justify-between border-b border-slate-800/40 pb-3 mb-3">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                      <FolderOpen className={`w-4 h-4 ${ACCENT_COLOR_MAPS[themeColor].text}`} />
                      Dynamic Segment Filters
                    </h3>
                    <button
                      onClick={resetFilters}
                      className={`text-xs text-slate-500 ${ACCENT_COLOR_MAPS[themeColor].hoverText} transition-colors font-medium`}
                    >
                      Clear All Filters
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                    {Object.keys(filterOptions).map((col) => {
                      const selected = activeFilters[col] || [];
                      const displayName = col.replace(/([A-Z])/g, ' $1').trim();

                      return (
                        <div key={col} className="space-y-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            {displayName}
                          </span>
                          <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
                            {filterOptions[col].map((val) => {
                              const isChecked = selected.includes(val);
                              return (
                                <button
                                  key={val}
                                  onClick={() => handleFilterToggle(col, val)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                                    isChecked
                                      ? ACCENT_COLOR_MAPS[themeColor].activeBadge
                                      : isDarkMode 
                                      ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                                      : 'bg-slate-100 border-slate-200 text-slate-600 hover:border-slate-300'
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

              {/* KPI metrics row */}
              <KPICards data={dashboardData} />

              {/* Core Charts Section */}
              <Charts data={dashboardData} themeColor={themeColor} />

              {/* Statistical insights and prioritized operational recommendations */}
              <InsightsPanel data={dashboardData} />

              {/* Customer record datatable */}
              <DataTable data={dashboardData} />

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="text-center py-8 text-xs text-slate-500 border-t border-slate-800/40 mt-12 print:hidden">
        <p>© 2026 Churn Insights Dashboard. Built for Data Science & Analytics Internship Portfolio.</p>
        <p className="mt-1">Works client-side in the browser. Safe for confidential datasets.</p>
      </footer>
      </div>
    </div>
  );
}
