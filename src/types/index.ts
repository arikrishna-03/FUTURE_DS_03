export interface ColumnMapping {
  leadId: string;
  date: string;
  channel: string;
  campaign: string;
  device: string;
  region: string;
  spend: string;
  revenue: string;
  conversionFlag: string; // column mapping for conversion (0/1 or true/false)
  
  // Funnel settings
  isMultiColumnFunnel: boolean;
  funnelStage: string; // single column holding the stage name
  multiColumnStages: string[]; // ordered list of boolean/binary columns
}

export interface CSVDataPreview {
  headers: string[];
  rows: Record<string, string>[];
}

export interface FunnelStageData {
  stageName: string;
  count: number;
  dropOffCount: number;
  dropOffRate: number; // % drop off from previous stage
  conversionRate: number; // % of initial traffic (first stage)
  stageToStageConversion: number; // % conversion from previous stage
}

export interface ChannelPerformance {
  channel: string;
  visitors: number;
  leads: number;
  conversions: number;
  conversionRate: number;
  spend: number;
  revenue: number;
  cac: number;
  roi: number;
}

export interface CampaignPerformance {
  campaign: string;
  visitors: number;
  leads: number;
  conversions: number;
  conversionRate: number;
  spend: number;
  revenue: number;
  cac: number;
  roi: number;
}

export interface SegmentPerformance {
  segmentValue: string;
  visitors: number;
  conversions: number;
  conversionRate: number;
}

export interface DailyMetrics {
  date: string;
  visitors: number;
  leads: number;
  conversions: number;
  spend: number;
  revenue: number;
}

export interface DashboardMetrics {
  totalVisitors: number;
  totalLeads: number;
  totalConversions: number;
  overallConversionRate: number;
  leadToCustomerRate: number;
  totalSpend: number;
  totalRevenue: number;
  roi: number;
  cac: number;
  costPerConversion: number;
  avgTimeInFunnel: number | null; // in days, if dates exist
}

export interface DataQualitySummary {
  totalRows: number;
  validRows: number;
  droppedRows: number;
  missingValuesCount: number;
  duplicateLeadsCount: number;
  interpretationNotes: string[];
}
