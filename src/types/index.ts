export type ThemeAccentColor = 'indigo' | 'blue' | 'emerald' | 'purple' | 'rose' | 'amber';

export interface ColumnMapping {
  customerId: string;
  churn: string;
  tenure: string;
  monthlyCharges: string;
  totalCharges: string;
  categorical: string[]; // List of column names to treat as categorical attributes for segmentation
}

export type ChurnValueType = 'boolean' | 'string_yes_no' | 'numeric_0_1' | 'unknown';

export interface DataQualityReport {
  totalRows: number;
  validRows: number;
  droppedRows: number;
  missingValuesCount: Record<string, number>;
  churnValueInterpretation: {
    detectedType: ChurnValueType;
    positiveValues: string[];
    negativeValues: string[];
  };
}

export interface CustomerRecord {
  [key: string]: any;
}

export interface MetricCardData {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconName: string;
  description: string;
  sparklineData?: number[];
}

export interface ChurnRateSegment {
  name: string;
  churnRate: number;
  total: number;
  churnCount: number;
  retainedCount: number;
  avgMonthlyCharges: number;
}

export interface CategoricalAnalysis {
  columnName: string;
  displayName: string;
  segments: ChurnRateSegment[];
}

export interface DashboardData {
  originalData: CustomerRecord[];
  filteredData: CustomerRecord[];
  mapping: ColumnMapping;
  quality: DataQualityReport;
  summary: {
    totalCustomers: number;
    activeCustomers: number;
    churnedCustomers: number;
    churnRate: number;
    retentionRate: number;
    avgTenure: number;
    avgMonthlyCharges: number;
    avgTotalCharges: number;
    avgRevenuePerCustomer: number;
    customerLifetimeValue: number;
    totalMonthlyRevenueLost: number;
  };
  categoricalAnalysis: CategoricalAnalysis[];
  tenureVsChurn: {
    tenureBin: string;
    churnRate: number;
    total: number;
    churnCount: number;
  }[];
  monthlyChargesVsChurn: {
    chargeBin: string;
    churnRate: number;
    total: number;
    churnCount: number;
  }[];
}

export interface InsightItem {
  id: string;
  title: string;
  text: string;
  type: 'info' | 'warning' | 'success';
  metric?: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  text: string;
  impact: 'High' | 'Medium' | 'Low';
  actionLabel: string;
}
