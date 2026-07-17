import Papa from 'papaparse';

export interface ParseResult {
  data: any[];
  headers: string[];
  errors: any[];
}

/**
 * Parses raw CSV string or file content using PapaParse.
 * Trims headers and cleans string values.
 */
export const parseCSV = (csvContent: string): Promise<ParseResult> => {
  return new Promise((resolve, reject) => {
    Papa.parse(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
      dynamicTyping: false, // We will handle conversions manually based on mapping to avoid losing leading zeroes or parsing flags oddly
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const cleanData = results.data.map((row: any) => {
          const cleanRow: any = {};
          Object.keys(row).forEach((key) => {
            const value = row[key];
            cleanRow[key] = typeof value === 'string' ? value.trim() : value;
          });
          return cleanRow;
        });

        // Extract clean headers
        const headers = results.meta.fields ? results.meta.fields.map(h => h.trim()) : [];

        resolve({
          data: cleanData,
          headers: headers,
          errors: results.errors,
        });
      },
      error: (err: any) => {
        reject(err);
      },
    });
  });
};
