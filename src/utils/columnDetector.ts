import { ColumnMapping, ChurnValueType, DataQualityReport } from '../types';

/**
 * Normalizes a header string for matching (lowercase, removes spaces, underscores, and hyphens).
 */
const normalizeHeader = (header: string): string => {
  return header.toLowerCase().replace(/[\s_-]/g, '');
};

/**
 * Analyzes headers and sample data to guess column roles.
 */
export const detectColumns = (headers: string[], data: any[]): ColumnMapping => {
  const mapping: ColumnMapping = {
    customerId: '',
    churn: '',
    tenure: '',
    monthlyCharges: '',
    totalCharges: '',
    categorical: [],
  };

  if (headers.length === 0 || data.length === 0) return mapping;

  const sampleRows = data.slice(0, Math.min(data.length, 100));

  // Heuristic patterns
  const customerIdPatterns = ['customerid', 'cid', 'id', 'uid', 'uuid', 'clientid', 'userid'];
  const churnPatterns = ['churn', 'churned', 'exited', 'left', 'status', 'cancelled', 'churnflag'];
  const tenurePatterns = ['tenure', 'months', 'monthsinservice', 'customerage', 'period', 'duration', 'monthsactive'];
  const monthlyChargePatterns = ['monthlycharges', 'monthlyspend', 'monthlycharge', 'charge', 'rate', 'revenue', 'spend', 'monthlyamount'];
  const totalChargePatterns = ['totalcharges', 'totalspend', 'totalrevenue', 'totalcharge', 'accumulatedspend'];

  // 1. Detect core mappings
  headers.forEach((header) => {
    const norm = normalizeHeader(header);

    // Churn check
    if (!mapping.churn && churnPatterns.some(p => norm.includes(p) || p.includes(norm))) {
      mapping.churn = header;
      return;
    }

    // Tenure check
    if (!mapping.tenure && tenurePatterns.some(p => norm === p || norm.includes(p))) {
      mapping.tenure = header;
      return;
    }

    // Monthly Charges check
    if (!mapping.monthlyCharges && monthlyChargePatterns.some(p => norm === p || norm.includes(p))) {
      // Exclude total charges match
      if (!norm.includes('total')) {
        mapping.monthlyCharges = header;
        return;
      }
    }

    // Total Charges check
    if (!mapping.totalCharges && totalChargePatterns.some(p => norm === p || norm.includes(p))) {
      mapping.totalCharges = header;
      return;
    }

    // Customer ID check
    if (!mapping.customerId && customerIdPatterns.some(p => norm === p || norm === 'id')) {
      mapping.customerId = header;
      return;
    }
  });

  // Fallbacks if not detected by strict name matching
  if (!mapping.churn) {
    // Look for any binary-like column with "churn" in it or named exit, etc.
    const churnFallback = headers.find(h => normalizeHeader(h).includes('churn'));
    if (churnFallback) mapping.churn = churnFallback;
  }

  // 2. Identify potential categorical columns
  headers.forEach((header) => {
    // Skip already mapped columns
    if (
      header === mapping.customerId ||
      header === mapping.churn ||
      header === mapping.tenure ||
      header === mapping.monthlyCharges ||
      header === mapping.totalCharges
    ) {
      return;
    }

    const norm = normalizeHeader(header);
    
    // Ignore numeric indices or IDs
    if (norm.includes('id') || norm === 'uuid' || norm === 'guid') return;

    // Collect all unique values in this column for sample rows
    const uniqueValues = new Set<string>();
    let numericCount = 0;
    let nonNumericCount = 0;

    sampleRows.forEach((row) => {
      const val = row[header];
      if (val === undefined || val === null || val === '') return;
      
      const valStr = String(val).trim();
      uniqueValues.add(valStr);

      if (!isNaN(Number(valStr)) && valStr !== '') {
        numericCount++;
      } else {
        nonNumericCount++;
      }
    });

    const cardinality = uniqueValues.size;

    // Categorical heuristics:
    // - Low cardinality (between 2 and 15 unique values in the sample)
    // - Or predominantly string/text values
    if (cardinality >= 2 && cardinality <= 15) {
      mapping.categorical.push(header);
    } else if (nonNumericCount > numericCount && cardinality <= 30) {
      mapping.categorical.push(header);
    }
  });

  return mapping;
};

/**
 * Analyzes a column to determine its churn flag format.
 */
export const inspectChurnValues = (data: any[], churnHeader: string): DataQualityReport['churnValueInterpretation'] => {
  const uniqueValues = new Set<string>();
  
  data.forEach((row) => {
    const val = row[churnHeader];
    if (val !== undefined && val !== null) {
      uniqueValues.add(String(val).trim().toLowerCase());
    }
  });

  let detectedType: ChurnValueType = 'unknown';
  let positiveValues: string[] = [];
  let negativeValues: string[] = [];

  const yesValues = ['yes', 'y', 'true', 't', '1', 'churned', 'yes_churn', 'exited', 'left', '1.0'];
  const noValues = ['no', 'n', 'false', 'f', '0', 'retained', 'no_churn', 'active', '0.0'];

  const hasYes = Array.from(uniqueValues).some(v => ['yes', 'y', 'churned', 'exited', 'left'].includes(v));
  const hasNo = Array.from(uniqueValues).some(v => ['no', 'n', 'retained', 'active'].includes(v));
  const hasTrue = Array.from(uniqueValues).some(v => ['true', 't'].includes(v));
  const hasFalse = Array.from(uniqueValues).some(v => ['false', 'f'].includes(v));
  const hasOne = Array.from(uniqueValues).some(v => ['1', '1.0'].includes(v));
  const hasZero = Array.from(uniqueValues).some(v => ['0', '0.0'].includes(v));

  if (hasYes || hasNo) {
    detectedType = 'string_yes_no';
    positiveValues = Array.from(uniqueValues).filter(v => yesValues.includes(v));
    negativeValues = Array.from(uniqueValues).filter(v => noValues.includes(v));
  } else if (hasTrue || hasFalse) {
    detectedType = 'boolean';
    positiveValues = Array.from(uniqueValues).filter(v => ['true', 't'].includes(v));
    negativeValues = Array.from(uniqueValues).filter(v => ['false', 'f'].includes(v));
  } else if (hasOne || hasZero) {
    detectedType = 'numeric_0_1';
    positiveValues = Array.from(uniqueValues).filter(v => ['1', '1.0'].includes(v));
    negativeValues = Array.from(uniqueValues).filter(v => ['0', '0.0'].includes(v));
  } else {
    // Default fallback
    detectedType = 'unknown';
    // Assume values that start with 'y', 't', '1' or 'ch' are positive
    Array.from(uniqueValues).forEach((val) => {
      const v = val.trim().toLowerCase();
      if (v.startsWith('y') || v.startsWith('t') || v === '1' || v.startsWith('ch') || v.startsWith('ex') || v.startsWith('le')) {
        positiveValues.push(val);
      } else {
        negativeValues.push(val);
      }
    });
  }

  // Ensure arrays contain the actual values, matching casing if possible
  const actualPositives: string[] = [];
  const actualNegatives: string[] = [];
  const lowerPositives = positiveValues.map(v => v.toLowerCase());
  const lowerNegatives = negativeValues.map(v => v.toLowerCase());

  data.forEach((row) => {
    const rawVal = String(row[churnHeader] || '').trim();
    const valLower = rawVal.toLowerCase();
    if (lowerPositives.includes(valLower) && !actualPositives.includes(rawVal)) {
      actualPositives.push(rawVal);
    } else if (lowerNegatives.includes(valLower) && !actualNegatives.includes(rawVal)) {
      actualNegatives.push(rawVal);
    }
  });

  return {
    detectedType,
    positiveValues: actualPositives,
    negativeValues: actualNegatives,
  };
};
