import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp, Download, ShieldAlert, ShieldCheck, Filter } from 'lucide-react';
import { DashboardData } from '../types';

interface DataTableProps {
  data: DashboardData;
}

export const DataTable: React.FC<DataTableProps> = ({ data }) => {
  const { filteredData, mapping } = data;

  const [searchTerm, setSearchTerm] = useState('');
  const [churnFilter, setChurnFilter] = useState<'all' | 'retained' | 'churned'>('all');
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('__tenure');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  // Handles sort setup
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // Perform search, filter, and sort
  const processedRows = useMemo(() => {
    let rows = [...filteredData];

    // 1. Apply Search
    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      rows = rows.filter((row) => {
        const idMatch = mapping.customerId ? String(row[mapping.customerId] || '').toLowerCase().includes(term) : false;
        
        // Search through categorical values too
        const categoricalMatch = mapping.categorical.some((cat) => 
          String(row[cat] || '').toLowerCase().includes(term)
        );

        return idMatch || categoricalMatch;
      });
    }

    // 2. Apply Churn status filter
    if (churnFilter !== 'all') {
      const targetChurn = churnFilter === 'churned';
      rows = rows.filter((row) => row.__isChurned === targetChurn);
    }

    // 3. Apply Sorting
    rows.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle raw numbers
      if (typeof aVal === 'string' && !isNaN(Number(aVal))) aVal = Number(aVal);
      if (typeof bVal === 'string' && !isNaN(Number(bVal))) bVal = Number(bVal);

      if (aVal === undefined || aVal === null) return 1;
      if (bVal === undefined || bVal === null) return -1;

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return rows;
  }, [filteredData, searchTerm, churnFilter, sortField, sortDirection, mapping]);

  // Paginated chunk
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return processedRows.slice(startIdx, startIdx + rowsPerPage);
  }, [processedRows, currentPage]);

  const totalPages = Math.max(1, Math.ceil(processedRows.length / rowsPerPage));

  // CSV Export helper
  const exportToCSV = () => {
    const exportHeaders = [
      mapping.customerId || 'CustomerID',
      mapping.churn,
      mapping.tenure,
      mapping.monthlyCharges,
      mapping.totalCharges,
      ...mapping.categorical,
    ];

    const csvContent = [
      exportHeaders.join(','),
      ...processedRows.map((row) =>
        exportHeaders
          .map((h) => {
            let val = row[h];
            if (h === mapping.customerId && !mapping.customerId) {
              val = row['customerID'] || 'CUST-' + Math.random().toString(36).substr(2, 9).toUpperCase();
            }
            const cleanStr = String(val ?? '').replace(/"/g, '""');
            return `"${cleanStr}"`;
          })
          .join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `churn_insights_processed_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 opacity-30" />;
    return sortDirection === 'asc' 
      ? <ChevronUp className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
      : <ChevronDown className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />;
  };

  return (
    <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm my-10" id="datatable">
      
      {/* Controls Bar */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
            Customer Cohort Explorer
          </h3>
          <p className="text-xs text-slate-550 dark:text-slate-400 mt-0.5">Search, filter, and inspect specific customer accounts within the selected segments</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search Customer ID / Segments..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-800 dark:text-slate-250 outline-none transition-all"
            />
          </div>

          {/* Churn Filter */}
          <div className="relative w-full sm:w-48 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <select
              value={churnFilter}
              onChange={(e) => { setChurnFilter(e.target.value as any); setCurrentPage(1); }}
              className="bg-transparent text-slate-800 dark:text-slate-250 text-xs w-full outline-none border-none cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">All Accounts</option>
              <option value="retained" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">Retained (Active)</option>
              <option value="churned" className="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200">Churned (Exited)</option>
            </select>
          </div>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="w-full sm:w-auto py-2.5 px-4 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Table Frame */}
      <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/20">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-100/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider select-none">
              <th 
                onClick={() => handleSort(mapping.customerId || 'customerID')}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Customer ID
                  <SortIcon field={mapping.customerId || 'customerID'} />
                </div>
              </th>

              <th 
                onClick={() => handleSort('__isChurned')}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Status
                  <SortIcon field="__isChurned" />
                </div>
              </th>

              <th 
                onClick={() => handleSort('__tenure')}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Tenure
                  <SortIcon field="__tenure" />
                </div>
              </th>

              <th 
                onClick={() => handleSort('__monthlyCharges')}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Monthly Charges
                  <SortIcon field="__monthlyCharges" />
                </div>
              </th>

              <th 
                onClick={() => handleSort('__totalCharges')}
                className="px-5 py-3.5 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/30 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  Total Billing
                  <SortIcon field="__totalCharges" />
                </div>
              </th>

              {/* Dynamic Categorical Headings (render first 3 to prevent overflow) */}
              {mapping.categorical.slice(0, 3).map((cat) => (
                <th 
                  key={cat}
                  onClick={() => handleSort(cat)}
                  className="px-5 py-3.5 cursor-pointer hover:bg-slate-200/50 dark:hover:bg-slate-900/30 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {cat.replace(/([A-Z])/g, ' $1').trim()}
                    <SortIcon field={cat} />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40 text-slate-700 dark:text-slate-300">
            {paginatedRows.map((row, idx) => {
              const customerIdVal = mapping.customerId ? row[mapping.customerId] : row['customerID'] || `CUST-${idx}`;
              const isChurned = row.__isChurned;

              return (
                <tr key={idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/25 transition-colors">
                  {/* ID */}
                  <td className="px-5 py-3.5 font-mono text-slate-800 dark:text-slate-350 font-medium">
                    {customerIdVal}
                  </td>
                  
                  {/* Status Badge */}
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[10px] font-bold border select-none ${
                      isChurned
                        ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-950/60 dark:text-rose-450'
                        : 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-950/60 dark:text-emerald-400'
                    }`}>
                      {isChurned ? (
                        <>
                          <ShieldAlert className="w-3 h-3" />
                          Churned
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3 h-3" />
                          Active
                        </>
                      )}
                    </span>
                  </td>

                  {/* Tenure */}
                  <td className="px-5 py-3.5 font-medium">
                    {row.__tenure} months
                  </td>

                  {/* Monthly Charges */}
                  <td className="px-5 py-3.5 font-mono text-slate-900 dark:text-slate-200">
                    ${row.__monthlyCharges.toFixed(2)}
                  </td>

                  {/* Total Charges */}
                  <td className="px-5 py-3.5 font-mono text-slate-500 dark:text-slate-400">
                    ${row.__totalCharges.toFixed(2)}
                  </td>

                  {/* Dynamic Categoricals */}
                  {mapping.categorical.slice(0, 3).map((cat) => (
                    <td key={cat} className="px-5 py-3.5 text-slate-500 dark:text-slate-400 font-medium">
                      {row[cat] !== undefined && row[cat] !== null ? String(row[cat]) : 'Not Specified'}
                    </td>
                  ))}
                </tr>
              );
            })}

            {paginatedRows.length === 0 && (
              <tr>
                <td colSpan={5 + Math.min(3, mapping.categorical.length)} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No records match current search or filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5 text-xs text-slate-500">
        <div>
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{processedRows.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0}</span> to <span className="font-semibold text-slate-700 dark:text-slate-300">{Math.min(currentPage * rowsPerPage, processedRows.length)}</span> of <span className="font-semibold text-slate-700 dark:text-slate-300">{processedRows.length.toLocaleString()}</span> customers
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-35 disabled:pointer-events-none rounded-lg text-slate-600 dark:text-slate-400 transition-colors font-medium select-none cursor-pointer"
          >
            Previous
          </button>
          
          <span className="text-slate-600 dark:text-slate-400 px-3 font-semibold select-none">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 disabled:opacity-35 disabled:pointer-events-none rounded-lg text-slate-600 dark:text-slate-400 transition-colors font-medium select-none cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
};
