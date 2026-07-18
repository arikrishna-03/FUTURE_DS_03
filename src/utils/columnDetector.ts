import type { ColumnMapping } from '../types';

// Helper to check if a header matches search patterns
const matchHeader = (headers: string[], patterns: string[]): string => {
  const normalizedHeaders = headers.map(h => ({
    original: h,
    normalized: h.toLowerCase().trim().replace(/[\s_-]/g, '')
  }));

  for (const pattern of patterns) {
    const matched = normalizedHeaders.find(nh => nh.normalized.includes(pattern) || pattern.includes(nh.normalized));
    if (matched) return matched.original;
  }
  return '';
};

export const detectColumns = (headers: string[], rows: Record<string, string>[]): ColumnMapping => {
  const leadId = matchHeader(headers, ['leadid', 'id', 'customerid', 'userid', 'uid', 'contactid']);
  const date = matchHeader(headers, ['date', 'timestamp', 'createdat', 'created', 'time', 'datetime']);
  const channel = matchHeader(headers, ['channel', 'source', 'utmsource', 'trafficsource', 'medium']);
  const campaign = matchHeader(headers, ['campaign', 'utmcampaign', 'adcampaign', 'promo']);
  const device = matchHeader(headers, ['device', 'platform', 'os', 'devicecategory', 'browser']);
  const region = matchHeader(headers, ['region', 'country', 'city', 'location', 'state', 'geo']);
  const spend = matchHeader(headers, ['spend', 'cost', 'adspend', 'adcost', 'budget', 'marketingcost']);
  const revenue = matchHeader(headers, ['revenue', 'value', 'sales', 'amount', 'income', 'salesprice']);
  const conversionFlag = matchHeader(headers, ['converted', 'purchase', 'purchased', 'iscustomer', 'customer', 'conversion', 'sale']);
  const funnelStage = matchHeader(headers, ['stage', 'funnelstage', 'status', 'step', 'state']);

  // Auto-detect multi-column funnel. Look for columns that represent funnel progression.
  // Common funnel progression terms in order
  const stageKeywords = [
    ['visitor', 'visit', 'visited', 'session', 'click', 'clicks'],
    ['signup', 'signedup', 'registered', 'lead', 'leads', 'optin'],
    ['qualified', 'mql', 'sql', 'nurtured'],
    ['opp', 'opportunity', 'proposal', 'demo', 'trial'],
    ['cart', 'addtocart', 'checkout'],
    ['purchase', 'purchased', 'converted', 'customer', 'sale', 'sales']
  ];

  const detectedMultiStages: string[] = [];
  
  // Search headers that look like binary/flag steps in order
  for (const keywords of stageKeywords) {
    for (const header of headers) {
      const normalizedHeader = header.toLowerCase().trim().replace(/[\s_-]/g, '');
      const isMatch = keywords.some(keyword => normalizedHeader === keyword || normalizedHeader.includes(keyword));
      
      if (isMatch && !detectedMultiStages.includes(header)) {
        // Let's verify if the column values look boolean (0/1, true/false, yes/no)
        // We check first few rows
        let looksBoolean = true;
        let countNonEmpty = 0;
        
        for (let i = 0; i < Math.min(rows.length, 50); i++) {
          const val = String(rows[i][header] || '').toLowerCase().trim();
          if (val) {
            countNonEmpty++;
            if (val !== '0' && val !== '1' && val !== 'true' && val !== 'false' && val !== 'yes' && val !== 'no') {
              looksBoolean = false;
              break;
            }
          }
        }
        
        if (looksBoolean && countNonEmpty > 0) {
          detectedMultiStages.push(header);
          break; // move to the next keyword list
        }
      }
    }
  }

  // If we detected 2 or more multi-stage columns, let's suggest a multi-column funnel
  const isMultiColumnFunnel = detectedMultiStages.length >= 2 && !funnelStage;

  return {
    leadId,
    date,
    channel,
    campaign,
    device,
    region,
    spend,
    revenue,
    conversionFlag,
    isMultiColumnFunnel,
    funnelStage,
    multiColumnStages: detectedMultiStages
  };
};
