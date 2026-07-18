import Papa from 'papaparse';
import type { CSVDataPreview } from '../types';

export const parseCSVFile = (file: File): Promise<CSVDataPreview> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // Parse as strings first; we will clean and cast manually
      complete: (results) => {
        const headers = results.meta.fields || [];
        // Trim headers
        const cleanedHeaders = headers.map(h => h.trim());
        const cleanedData = (results.data as Record<string, string>[]).map(row => {
          const cleanedRow: Record<string, string> = {};
          for (const key of Object.keys(row)) {
            cleanedRow[key.trim()] = String(row[key] === null || row[key] === undefined ? '' : row[key]).trim();
          }
          return cleanedRow;
        });
        resolve({ headers: cleanedHeaders, rows: cleanedData });
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};

export const parseCSVString = (csvString: string): CSVDataPreview => {
  const results = Papa.parse(csvString, {
    header: true,
    skipEmptyLines: 'greedy',
    dynamicTyping: false
  });
  
  const headers = results.meta.fields || [];
  const cleanedHeaders = headers.map(h => h.trim());
  const cleanedData = (results.data as Record<string, string>[]).map(row => {
    const cleanedRow: Record<string, string> = {};
    for (const key of Object.keys(row)) {
      cleanedRow[key.trim()] = String(row[key] === null || row[key] === undefined ? '' : row[key]).trim();
    }
    return cleanedRow;
  });

  return { headers: cleanedHeaders, rows: cleanedData };
};
