import React, { useState } from 'react';
import { Eye, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface DataTableProps {
  rows: Record<string, any>[];
  headers: string[];
}

export const DataTable: React.FC<DataTableProps> = ({ rows, headers }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [rowsPerPage] = useState(10);

  // Filter columns that we want to display as key insights in the main table
  const displayHeaders = headers.slice(0, 10);

  // Handle sorting
  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const sortedRows = [...rows].sort((a, b) => {
    if (!sortField) return 0;
    
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }

    const aStr = String(aVal || '').toLowerCase();
    const bStr = String(bVal || '').toLowerCase();
    
    if (aStr < bStr) return sortOrder === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  // Pagination Math
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedRows.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const formatValue = (key: string, val: any) => {
    if (val === undefined || val === null || val === '') return '-';
    
    // Currency format for spend / cost / revenue
    const lowerKey = key.toLowerCase();
    if (lowerKey.includes('revenue') || lowerKey.includes('spend') || lowerKey.includes('cost')) {
      const parsed = parseFloat(val);
      if (!isNaN(parsed)) {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(parsed);
      }
    }
    return String(val);
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md space-y-4">
      <div className="flex items-center justify-between border-b border-slate-850 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Eye className="w-5.5 h-5.5 text-slate-450" /> Campaign Records Database
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Browse and audit cleaned, mapped user session logs ({rows.length} total rows matched).
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-850 bg-slate-950/20">
        <table className="min-w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-semibold uppercase tracking-wider">
              {displayHeaders.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-3.5 cursor-pointer hover:bg-slate-900 hover:text-white transition duration-150 font-semibold"
                >
                  <div className="flex items-center gap-1.5">
                    {col}
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-550" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850 text-slate-300">
            {currentRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-900/40 transition">
                {displayHeaders.map(col => (
                  <td key={col} className="px-4 py-3 font-medium max-w-[150px] truncate">
                    {formatValue(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={displayHeaders.length} className="text-center py-8 text-slate-550 font-medium">
                  No records to display.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3 text-xs">
          <span className="text-slate-400 font-medium">
            Showing <strong className="text-slate-200">{indexOfFirstRow + 1}</strong> to{' '}
            <strong className="text-slate-200">{Math.min(indexOfLastRow, rows.length)}</strong> of{' '}
            <strong className="text-slate-200">{rows.length}</strong> records
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              // Calculate page numbers around current
              let pageNum = currentPage;
              if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-7.5 h-7.5 font-bold rounded-lg transition border cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-violet-600 border-violet-500 text-white shadow'
                      : 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-800 hover:text-slate-200'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
