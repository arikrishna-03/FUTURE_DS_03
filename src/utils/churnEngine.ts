import { ColumnMapping, DashboardData, CustomerRecord, DataQualityReport, CategoricalAnalysis, ChurnRateSegment } from '../types';
import { inspectChurnValues } from './columnDetector';

/**
 * Clean data, process records, and calculate all dashboard metrics dynamically.
 */
export const processDashboardData = (
  rawData: CustomerRecord[],
  mapping: ColumnMapping
): DashboardData => {
  const missingValuesCount: Record<string, number> = {
    churn: 0,
    tenure: 0,
    monthlyCharges: 0,
    totalCharges: 0,
  };

  // Inspect churn values
  const churnInterpretation = mapping.churn 
    ? inspectChurnValues(rawData, mapping.churn)
    : { detectedType: 'unknown' as const, positiveValues: [], negativeValues: [] };

  const positiveLower = churnInterpretation.positiveValues.map(v => v.toLowerCase());

  // Clean data: drop completely empty rows or rows where essential columns are missing/malformed
  const cleanRecords: CustomerRecord[] = [];
  let droppedCount = 0;

  rawData.forEach((row) => {
    // Check if row is completely empty
    const keys = Object.keys(row);
    const hasValues = keys.some(k => row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '');
    if (!hasValues) {
      droppedCount++;
      return;
    }

    let isRowValid = true;

    // Track missing values
    if (mapping.churn) {
      const v = row[mapping.churn];
      if (v === undefined || v === null || String(v).trim() === '') {
        missingValuesCount.churn++;
        isRowValid = false;
      }
    } else {
      isRowValid = false;
    }

    if (mapping.tenure) {
      const v = row[mapping.tenure];
      const tenureVal = Number(String(v).trim());
      if (v === undefined || v === null || String(v).trim() === '' || isNaN(tenureVal)) {
        missingValuesCount.tenure++;
        isRowValid = false;
      }
    }

    if (mapping.monthlyCharges) {
      const v = row[mapping.monthlyCharges];
      const chargeVal = Number(String(v).trim());
      if (v === undefined || v === null || String(v).trim() === '' || isNaN(chargeVal)) {
        missingValuesCount.monthlyCharges++;
      }
    }

    if (isRowValid) {
      cleanRecords.push(row);
    } else {
      droppedCount++;
    }
  });

  const totalRows = rawData.length;
  const validRows = cleanRecords.length;

  const qualityReport: DataQualityReport = {
    totalRows,
    validRows,
    droppedRows: droppedCount,
    missingValuesCount,
    churnValueInterpretation: churnInterpretation,
  };

  // Standardize record values for metric calculation
  const processedRecords: CustomerRecord[] = cleanRecords.map((row) => {
    const rawChurn = String(row[mapping.churn] || '').trim().toLowerCase();
    // A customer is churned if their churn value matches any positive flag (case insensitive)
    const isChurned = positiveLower.includes(rawChurn);
    
    const tenure = Math.max(0, Number(String(row[mapping.tenure] || 0).trim()));
    const monthlyCharge = Math.max(0, Number(String(row[mapping.monthlyCharges] || 0).trim()));
    
    // If total charges is missing or invalid, calculate it as tenure * monthlyCharge
    let totalChargeStr = mapping.totalCharges ? String(row[mapping.totalCharges] || '').trim() : '';
    let totalCharge = Number(totalChargeStr);
    if (totalChargeStr === '' || isNaN(totalCharge)) {
      totalCharge = tenure * monthlyCharge;
      missingValuesCount.totalCharges++;
    } else {
      totalCharge = Math.max(0, totalCharge);
    }

    return {
      ...row,
      __isChurned: isChurned,
      __tenure: tenure,
      __monthlyCharges: monthlyCharge,
      __totalCharges: totalCharge,
    };
  });

  // Calculate Aggregated Metrics
  const totalCustomers = processedRecords.length;
  let churnedCustomers = 0;
  let totalTenure = 0;
  let totalMonthlyCharges = 0;
  let totalCharges = 0;
  let totalMonthlyRevenueLost = 0;

  processedRecords.forEach((row) => {
    if (row.__isChurned) {
      churnedCustomers++;
      totalMonthlyRevenueLost += row.__monthlyCharges;
    }
    totalTenure += row.__tenure;
    totalMonthlyCharges += row.__monthlyCharges;
    totalCharges += row.__totalCharges;
  });

  const activeCustomers = totalCustomers - churnedCustomers;
  const churnRate = totalCustomers > 0 ? (churnedCustomers / totalCustomers) * 100 : 0;
  const retentionRate = totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0;
  
  const avgTenure = totalCustomers > 0 ? totalTenure / totalCustomers : 0;
  const avgMonthlyCharges = totalCustomers > 0 ? totalMonthlyCharges / totalCustomers : 0;
  const avgTotalCharges = totalCustomers > 0 ? totalCharges / totalCustomers : 0;
  const avgRevenuePerCustomer = avgMonthlyCharges; // Monthly charges as MRR base

  // Customer Lifetime Value standard cohort approximation: Average Monthly Charges * Average Tenure
  // Or: Average Monthly Charges / Monthly Churn Rate. We use average tenure since it represents historical cohort actuals.
  const customerLifetimeValue = avgMonthlyCharges * avgTenure;

  const summary = {
    totalCustomers,
    activeCustomers,
    churnedCustomers,
    churnRate,
    retentionRate,
    avgTenure,
    avgMonthlyCharges,
    avgTotalCharges,
    avgRevenuePerCustomer,
    customerLifetimeValue,
    totalMonthlyRevenueLost,
  };

  // 3. Categorical Segments Churn Analysis
  const categoricalAnalysis: CategoricalAnalysis[] = [];

  mapping.categorical.forEach((col) => {
    // Group records by unique values of this column
    const groupMap: Record<string, { total: number; churn: number; charges: number }> = {};

    processedRecords.forEach((row) => {
      let rawVal = row[col];
      // Clean up boolean displays or empty segments
      if (rawVal === undefined || rawVal === null || String(rawVal).trim() === '') {
        rawVal = 'Not Specified';
      }
      const valStr = String(rawVal).trim();

      if (!groupMap[valStr]) {
        groupMap[valStr] = { total: 0, churn: 0, charges: 0 };
      }

      groupMap[valStr].total++;
      if (row.__isChurned) {
        groupMap[valStr].churn++;
      }
      groupMap[valStr].charges += row.__monthlyCharges;
    });

    const segments: ChurnRateSegment[] = Object.keys(groupMap).map((key) => {
      const g = groupMap[key];
      const churnRateVal = g.total > 0 ? (g.churn / g.total) * 100 : 0;
      return {
        name: key,
        churnRate: churnRateVal,
        total: g.total,
        churnCount: g.churn,
        retainedCount: g.total - g.churn,
        avgMonthlyCharges: g.total > 0 ? g.charges / g.total : 0,
      };
    });

    // Sort segments descending by total size to show major contributors first
    segments.sort((a, b) => b.total - a.total);

    categoricalAnalysis.push({
      columnName: col,
      displayName: col.replace(/([A-Z])/g, ' $1').trim(), // Add space before camelCase caps
      segments,
    });
  });

  // 4. Tenure Cohorts Analysis
  // Tenure in months bins
  const tenureBins = [
    { name: '0 - 6 Months', min: 0, max: 6 },
    { name: '7 - 12 Months', min: 7, max: 12 },
    { name: '1 - 2 Years', min: 13, max: 24 },
    { name: '2 - 3 Years', min: 25, max: 36 },
    { name: '3 - 4 Years', min: 37, max: 48 },
    { name: '4 - 5 Years', min: 49, max: 60 },
    { name: '5+ Years', min: 61, max: 9999 },
  ];

  const tenureVsChurn = tenureBins.map((bin) => {
    let total = 0;
    let churnCount = 0;

    processedRecords.forEach((row) => {
      const tenure = row.__tenure;
      if (tenure >= bin.min && tenure <= bin.max) {
        total++;
        if (row.__isChurned) {
          churnCount++;
        }
      }
    });

    return {
      tenureBin: bin.name,
      churnRate: total > 0 ? (churnCount / total) * 100 : 0,
      total,
      churnCount,
    };
  });

  // 5. Monthly Charges Cohorts Analysis
  // Auto-bin charges based on minimum/maximum values or standard divisions
  const chargeBins = [
    { name: 'Low Charge (<$30)', min: 0, max: 30 },
    { name: 'Moderate ($30-$60)', min: 30, max: 60 },
    { name: 'Medium High ($60-$90)', min: 60, max: 90 },
    { name: 'High Charge ($90-$120)', min: 90, max: 120 },
    { name: 'Premium (>$120)', min: 120, max: 9999 },
  ];

  const monthlyChargesVsChurn = chargeBins.map((bin) => {
    let total = 0;
    let churnCount = 0;

    processedRecords.forEach((row) => {
      const charge = row.__monthlyCharges;
      if (charge >= bin.min && charge < bin.max) {
        total++;
        if (row.__isChurned) {
          churnCount++;
        }
      }
    });

    return {
      chargeBin: bin.name,
      churnRate: total > 0 ? (churnCount / total) * 100 : 0,
      total,
      churnCount,
    };
  });

  return {
    originalData: rawData,
    filteredData: processedRecords, // Standardized records returned
    mapping,
    quality: qualityReport,
    summary,
    categoricalAnalysis,
    tenureVsChurn,
    monthlyChargesVsChurn,
  };
};

/**
 * Filter processed records in the dashboard based on active filters
 */
export const applyFilters = (
  dashboardData: DashboardData,
  filters: Record<string, string[]>
): DashboardData => {
  const { filteredData, mapping } = dashboardData;

  const activeFiltered = filteredData.filter((row) => {
    let matches = true;

    Object.keys(filters).forEach((col) => {
      const selectedVals = filters[col];
      if (selectedVals.length === 0) return; // Empty means all allowed

      const rowVal = String(row[col] ?? 'Not Specified').trim();
      if (!selectedVals.includes(rowVal)) {
        matches = false;
      }
    });

    return matches;
  });

  // Re-run standard aggregation on filtered items using mapping
  return processDashboardData(activeFiltered, mapping);
};
