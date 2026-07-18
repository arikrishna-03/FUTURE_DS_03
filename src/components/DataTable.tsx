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
    <div className="w-full bg-[#FFFDFC] border-3 border-[#0E0E0E] rounded-3xl p-8 shadow-[6px_6px_0px_rgba(14,14,14,1)] space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b-2 border-slate-100 pb-5">
        <div>
          <span className="inline-block px-3 py-1 bg-[#FF5D38] text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
            AUDIT JOURNAL
          </span>
          <h3 className="text-3xl font-black text-[#0E0E0E] uppercase tracking-tight font-display flex items-center gap-2">
            <Eye className="w-7 h-7 text-[#FF5D38]" /> Cleaned Record Explorer
          </h3>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Browse and inspect cleaned and mapped lead journey events ({rows.length} total rows matched).
          </p>
        </div>
      </div>

      {/* Raw Table */}
      <div className="overflow-x-auto rounded-2xl border-2 border-[#0E0E0E] bg-white">
        <table className="min-w-full text-left border-collapse text-xs select-none">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-[#0E0E0E] text-[#0E0E0E] font-black uppercase tracking-wider">
              {displayHeaders.map(col => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-4 py-4 cursor-pointer hover:bg-slate-200 transition duration-150 font-black"
                >
                  <div className="flex items-center gap-1.5">
                    {col}
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-slate-800 font-medium">
            {currentRows.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                {displayHeaders.map(col => (
                  <td key={col} className="px-4 py-3 max-w-[150px] truncate">
                    {formatValue(col, row[col])}
                  </td>
                ))}
              </tr>
            ))}
            {currentRows.length === 0 && (
              <tr>
                <td colSpan={displayHeaders.length} className="text-center py-12 text-slate-400 font-bold uppercase tracking-wider">
                  No records matching active filter choices.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 text-xs font-bold text-slate-700">
          <span>
            Showing <strong className="text-[#0E0E0E]">{indexOfFirstRow + 1}</strong> to{' '}
            <strong className="text-[#0E0E0E]">{Math.min(indexOfLastRow, rows.length)}</strong> of{' '}
            <strong className="text-[#0E0E0E]">{rows.length}</strong> records
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 bg-white border-2 border-[#0E0E0E] hover:bg-slate-100 rounded-xl disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 text-[#0E0E0E]" />
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = currentPage;
              if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;
              
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`w-8 h-8 font-black rounded-xl transition border-2 cursor-pointer ${
                    currentPage === pageNum
                      ? 'bg-[#FF5D38] border-[#0E0E0E] text-white shadow-[2px_2px_0px_rgba(14,14,14,1)]'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-[#0E0E0E] hover:text-[#0E0E0E]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 bg-white border-2 border-[#0E0E0E] hover:bg-slate-100 rounded-xl disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 text-[#0E0E0E]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default DataTable;
