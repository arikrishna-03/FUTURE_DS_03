import type { FunnelStageData, ChannelPerformance, CampaignPerformance, DashboardMetrics, SegmentPerformance } from '../types';

export interface DynamicInsight {
  id: string;
  text: string;
  type: 'success' | 'warning' | 'info';
}

export interface BusinessRecommendation {
  id: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  category: 'Funnel' | 'Channels' | 'Campaigns' | 'Device' | 'Region';
}

// Generate Funnel specific insights
export const getFunnelInsights = (funnelData: FunnelStageData[], kpis: DashboardMetrics): DynamicInsight[] => {
  const insights: DynamicInsight[] = [];
  if (funnelData.length < 2) return [];

  // Find biggest drop-off stage
  let maxDropOffStage = funnelData[1];
  let maxDropOffRate = funnelData[1].dropOffRate;

  for (let i = 2; i < funnelData.length; i++) {
    if (funnelData[i].dropOffRate > maxDropOffRate) {
      maxDropOffRate = funnelData[i].dropOffRate;
      maxDropOffStage = funnelData[i];
    }
  }

  insights.push({
    id: 'funnel_max_dropoff',
    text: `The largest drop-off in your customer journey occurs at the "${maxDropOffStage.stageName}" stage, where ${maxDropOffRate.toFixed(1)}% of users abandon the funnel.`,
    type: maxDropOffRate > 50 ? 'warning' : 'info'
  });

  insights.push({
    id: 'funnel_overall_conv',
    text: `Your overall funnel conversion rate is ${kpis.overallConversionRate.toFixed(2)}%, meaning that out of every 100 visitors, approximately ${Math.round(kpis.overallConversionRate)} become customers.`,
    type: kpis.overallConversionRate > 3 ? 'success' : 'warning'
  });

  // Calculate Lead-to-Customer conversion
  if (funnelData.length > 2) {
    const leadStageName = funnelData[1].stageName;
    insights.push({
      id: 'funnel_lead_cust',
      text: `Your "${leadStageName}" to customer conversion rate is ${kpis.leadToCustomerRate.toFixed(1)}%. Improving this middle-of-funnel velocity represents a major growth opportunity.`,
      type: kpis.leadToCustomerRate < 10 ? 'warning' : 'success'
    });
  }

  return insights;
};

// Generate Channel specific insights
export const getChannelInsights = (channels: ChannelPerformance[]): DynamicInsight[] => {
  const insights: DynamicInsight[] = [];
  if (channels.length === 0) return [];

  // 1. Highest ROI channel
  const validRoiChannels = channels.filter(c => c.spend > 0);
  if (validRoiChannels.length > 0) {
    const highestRoi = [...validRoiChannels].sort((a, b) => b.roi - a.roi)[0];
    if (highestRoi.roi > 0) {
      insights.push({
        id: 'channel_high_roi',
        text: `"${highestRoi.channel}" is your most profitable channel, achieving an outstanding ROI of ${highestRoi.roi.toFixed(1)}%.`,
        type: 'success'
      });
    }

    // 2. Highest CAC channel
    const highestCac = [...validRoiChannels].sort((a, b) => b.cac - a.cac)[0];
    if (highestCac.cac > 0) {
      insights.push({
        id: 'channel_high_cac',
        text: `"${highestCac.channel}" has your highest Customer Acquisition Cost (CAC) at $${highestCac.cac.toFixed(2)}. Review this channel's targeting or cost controls.`,
        type: 'warning'
      });
    }
  }

  // 3. Highest converting channel by volume / rate
  const highestConvRate = [...channels].sort((a, b) => b.conversionRate - a.conversionRate)[0];
  if (highestConvRate && highestConvRate.conversionRate > 0) {
    insights.push({
      id: 'channel_high_conv',
      text: `"${highestConvRate.channel}" delivers the highest lead quality, with a conversion rate of ${highestConvRate.conversionRate.toFixed(1)}%.`,
      type: 'success'
    });
  }

  return insights;
};

// Generate Campaign insights
export const getCampaignInsights = (campaigns: CampaignPerformance[]): DynamicInsight[] => {
  const insights: DynamicInsight[] = [];
  const activeCampaigns = campaigns.filter(c => c.visitors > 5);
  if (activeCampaigns.length === 0) return [];

  // Top revenue campaign
  const topRev = [...activeCampaigns].sort((a, b) => b.revenue - a.revenue)[0];
  if (topRev && topRev.revenue > 0) {
    insights.push({
      id: 'camp_top_revenue',
      text: `Campaign "${topRev.campaign}" generated the highest revenue ($${topRev.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}), contributing significantly to sales.`,
      type: 'success'
    });
  }

  // Lowest performing campaign
  const lowConv = [...activeCampaigns].sort((a, b) => a.conversionRate - b.conversionRate)[0];
  if (lowConv && lowConv.visitors > 20) {
    insights.push({
      id: 'camp_low_conv',
      text: `Campaign "${lowConv.campaign}" has the lowest conversion rate (${lowConv.conversionRate.toFixed(2)}%) despite receiving ${lowConv.visitors} visitors. Consider optimizing its landing page.`,
      type: 'warning'
    });
  }

  return insights;
};

// Generate Segment insights (device, region)
export const getSegmentInsights = (
  devices: SegmentPerformance[],
  regions: SegmentPerformance[]
): DynamicInsight[] => {
  const insights: DynamicInsight[] = [];

  // Device comparison
  if (devices.length >= 2) {
    const sorted = [...devices].sort((a, b) => b.conversionRate - a.conversionRate);
    const top = sorted[0];
    const bottom = sorted[sorted.length - 1];
    const ratio = bottom.conversionRate > 0 ? (top.conversionRate / bottom.conversionRate).toFixed(1) : '0';
    
    insights.push({
      id: 'segment_device_gap',
      text: `Users on "${top.segmentValue}" convert ${ratio}x better than users on "${bottom.segmentValue}" (${top.conversionRate.toFixed(1)}% vs. ${bottom.conversionRate.toFixed(1)}%).`,
      type: parseFloat(ratio) > 1.5 ? 'warning' : 'info'
    });
  }

  // Top Region
  if (regions.length > 0) {
    const topRegion = [...regions].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    insights.push({
      id: 'segment_top_region',
      text: `"${topRegion.segmentValue}" is the highest-converting region with a ${topRegion.conversionRate.toFixed(1)}% conversion rate.`,
      type: 'success'
    });
  }

  return insights;
};

// Generate Revenue Insights
export const getRevenueInsights = (kpis: DashboardMetrics): DynamicInsight[] => {
  const insights: DynamicInsight[] = [];
  
  if (kpis.totalRevenue > 0) {
    const profit = kpis.totalRevenue - kpis.totalSpend;
    insights.push({
      id: 'rev_summary',
      text: `Net Profit from campaign spend stands at $${profit.toLocaleString(undefined, { maximumFractionDigits: 0 })} with an overall marketing ROI of ${kpis.roi.toFixed(1)}%.`,
      type: kpis.roi > 0 ? 'success' : 'warning'
    });
  }

  if (kpis.cac > 0) {
    insights.push({
      id: 'cac_summary',
      text: `The average Customer Acquisition Cost (CAC) across all campaigns is $${kpis.cac.toFixed(2)}. Make sure this is lower than your average Customer Lifetime Value (LTV).`,
      type: 'info'
    });
  }

  return insights;
};

// Generate at least 10 Actionable Business Recommendations based on data
export const generateRecommendations = (
  funnelData: FunnelStageData[],
  channels: ChannelPerformance[],
  campaigns: CampaignPerformance[],
  devices: SegmentPerformance[],
  regions: SegmentPerformance[],
  kpis: DashboardMetrics
): BusinessRecommendation[] => {
  const recommendations: BusinessRecommendation[] = [];

  // 1. Analyze Funnel Dropoffs to give 3-4 funnel recommendations
  if (funnelData.length >= 2) {
    // Find the single worst drop-off
    const sortedStages = [...funnelData].slice(1).sort((a, b) => b.dropOffRate - a.dropOffRate);
    const worstStage = sortedStages[0];

    // Check where the worst stage lies
    const idx = funnelData.findIndex(s => s.stageName === worstStage.stageName);
    
    // Top funnel drop-off (Visitors -> Leads)
    recommendations.push({
      id: 'rec_top_funnel',
      title: 'Optimize Landing Page Content and Form Fields',
      description: `Your top of funnel has drop-off. Simplify signup pages, reduce the number of form fields, and load-test your site speed. Target: Increase Traffic → Lead rate.`,
      impact: idx === 1 ? 'High' : 'Medium',
      effort: 'Low',
      category: 'Funnel'
    });

    // Middle funnel drop-off (Leads -> Qualified Leads / Opportunities)
    recommendations.push({
      id: 'rec_mid_funnel',
      title: 'Implement Automated Lead Nurturing Email Sequence',
      description: `With a ${worstStage.dropOffRate.toFixed(1)}% drop-off at stage "${worstStage.stageName}", prospects are going cold. Build auto-drip email campaigns with case studies and interactive content.`,
      impact: idx > 1 && idx < funnelData.length - 1 ? 'High' : 'Medium',
      effort: 'Medium',
      category: 'Funnel'
    });

    // Bottom funnel drop-off (Opportunities -> Customers)
    recommendations.push({
      id: 'rec_bottom_funnel',
      title: 'Streamline Checkout Flow and Add Trust Signals',
      description: `Prospects are dropping off just before purchase. Add testimonials, money-back guarantees, clear pricing summaries, and alternative payment options (Apple Pay/Stripe).`,
      impact: idx === funnelData.length - 1 ? 'High' : 'Medium',
      effort: 'Low',
      category: 'Funnel'
    });

    // General Funnel monitoring
    recommendations.push({
      id: 'rec_funnel_monitor',
      title: 'Establish a Weekly Funnel Velocity Review',
      description: 'Create automated alerts for drop-off spikes in specific stages, allowing your growth teams to run rapid A/B testing on leakage points.',
      impact: 'Medium',
      effort: 'Low',
      category: 'Funnel'
    });
  }

  // 2. Channel Recommendations (2-3)
  if (channels.length > 0) {
    const validSpend = channels.filter(c => c.spend > 0);
    if (validSpend.length > 0) {
      const highestRoi = [...validSpend].sort((a, b) => b.roi - a.roi)[0];
      const lowestRoi = [...validSpend].sort((a, b) => a.roi - b.roi)[0];
      
      if (highestRoi.roi > lowestRoi.roi + 50) {
        recommendations.push({
          id: 'rec_budget_realloc',
          title: `Reallocate Budget from "${lowestRoi.channel}" to "${highestRoi.channel}"`,
          description: `Optimize ad spend by shifting budget from low ROI ${lowestRoi.channel} (${lowestRoi.roi.toFixed(1)}% ROI) to high-performing ${highestRoi.channel} (${highestRoi.roi.toFixed(1)}% ROI).`,
          impact: 'High',
          effort: 'Low',
          category: 'Channels'
        });
      }

      const lowestCac = [...validSpend].sort((a, b) => a.cac - b.cac)[0];
      recommendations.push({
        id: 'rec_channel_scaling',
        title: `Scale CAC-efficient Campaigns on "${lowestCac.channel}"`,
        description: `"${lowestCac.channel}" has the lowest Customer Acquisition Cost at $${lowestCac.cac.toFixed(2)}. Invest in increasing impression share on this channel to drive cheaper customer acquisition.`,
        impact: 'High',
        effort: 'Medium',
        category: 'Channels'
      });
    }

    // Add organic SEO recommendation if direct or organic search is high volume but low conversion
    recommendations.push({
      id: 'rec_organic_content',
      title: 'Invest in High-Intent SEO Content & Organic Marketing',
      description: `Organic channels capture top-of-funnel intent. Build comparison keywords and how-to guides to naturally drive high-intent visitors and lower your blended CAC (currently $${kpis.cac.toFixed(2)}).`,
      impact: 'Medium',
      effort: 'High',
      category: 'Channels'
    });
  }

  // 3. Device Recommendations (1-2)
  if (devices.length > 0) {
    const mobileSegment = devices.find(d => d.segmentValue.toLowerCase() === 'mobile');
    const desktopSegment = devices.find(d => d.segmentValue.toLowerCase() === 'desktop');
    
    if (mobileSegment && desktopSegment && desktopSegment.conversionRate > mobileSegment.conversionRate * 1.3) {
      recommendations.push({
        id: 'rec_mobile_optimize',
        title: 'Overhaul Mobile Interface and Touch-Target Sizes',
        description: `Mobile conversion (${mobileSegment.conversionRate.toFixed(2)}%) lags significantly behind Desktop (${desktopSegment.conversionRate.toFixed(2)}%). Design mobile-first forms, improve loading speed, and optimize responsive menus.`,
        impact: 'High',
        effort: 'Medium',
        category: 'Device'
      });
    } else {
      recommendations.push({
        id: 'rec_device_uniformity',
        title: 'Maintain Seamless Cross-Device Session Handoff',
        description: 'Provide features like "Save cart for later" or email links to continue sessions from mobile to desktop without restarting the funnel.',
        impact: 'Medium',
        effort: 'Medium',
        category: 'Device'
      });
    }
  }

  // 4. Region Recommendations (1-2)
  if (regions.length > 0) {
    const topReg = [...regions].sort((a, b) => b.conversionRate - a.conversionRate)[0];
    const bottomReg = [...regions].sort((a, b) => a.conversionRate - b.conversionRate)[0];

    if (regions.length >= 2) {
      recommendations.push({
        id: 'rec_region_targeting',
        title: `Localize Marketing Assets for "${bottomReg.segmentValue}"`,
        description: `Conversion in "${bottomReg.segmentValue}" is low (${bottomReg.conversionRate.toFixed(1)}%). Implement localized currencies, local trust banners, and region-specific copywriting to match the ${topReg.segmentValue} benchmark (${topReg.conversionRate.toFixed(1)}%).`,
        impact: 'Medium',
        effort: 'Medium',
        category: 'Region'
      });
    }
  }

  // 5. Campaign Recommendations (1)
  if (campaigns.length > 0) {
    const lowPerfCampaign = [...campaigns].filter(c => c.visitors > 15).sort((a, b) => a.conversionRate - b.conversionRate)[0];
    if (lowPerfCampaign) {
      recommendations.push({
        id: 'rec_campaign_retarget',
        title: `Pause or Re-target Underperforming Campaign: "${lowPerfCampaign.campaign}"`,
        description: `This campaign is underperforming at a ${lowPerfCampaign.conversionRate.toFixed(2)}% conversion rate. Shift the ad set budget to lookalike audiences or retarget prior visitors instead of broad cold targeting.`,
        impact: 'Medium',
        effort: 'Low',
        category: 'Campaigns'
      });
    }
  }

  // Fallback if list is short, ensuring we always have at least 10 recommendations!
  while (recommendations.length < 10) {
    const id = `rec_fallback_${recommendations.length}`;
    const fallbacks: BusinessRecommendation[] = [
      {
        id,
        title: 'Retarget Abandoned Funnel Visitors with Dynamic Ads',
        description: 'Set up Google and Meta retargeting pixels to show custom ads containing the exact items or pages that visitors abandoned at mid-funnel stages.',
        impact: 'High',
        effort: 'Medium',
        category: 'Funnel'
      },
      {
        id,
        title: 'Implement Exit-Intent Popups for Leaving Users',
        description: 'Catch users before they close the browser tab. Offer a discount, a free ebook, or subscription newsletter to capture the contact details of top-of-funnel traffic.',
        impact: 'Medium',
        effort: 'Low',
        category: 'Funnel'
      },
      {
        id,
        title: 'Implement A/B Testing on Call-to-Action (CTA) Buttons',
        description: 'Test CTA placement, colors, and wording (e.g. "Start Free Trial" vs. "See Dashboard") across all landing pages to incrementally lift funnel metrics.',
        impact: 'Medium',
        effort: 'Low',
        category: 'Funnel'
      }
    ];

    const nextFallback = fallbacks.find(fb => !recommendations.some(r => r.title === fb.title));
    if (nextFallback) {
      recommendations.push(nextFallback);
    } else {
      // Just in case, add generic unique ones
      recommendations.push({
        id,
        title: `Conduct Qualitative User Testing on Step ${recommendations.length - 6}`,
        description: 'Run weekly live user tests with real-world target profiles to spot logical friction or layout bugs in your core marketing checkout flow.',
        impact: 'Medium',
        effort: 'Medium',
        category: 'Funnel'
      });
    }
  }

  return recommendations;
};
