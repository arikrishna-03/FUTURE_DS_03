# Marketing Funnel & Conversion Performance Analytics Dashboard

An enterprise-grade, dataset-agnostic Business Intelligence (BI) platform built for growth marketers, product managers, and data analysts. It analyzes user journey progression, campaign spend allocation, acquisition cost (CAC), and channel return on investment (ROI) from **any** uploaded campaign dataset (CSV).

---

## 1. Project Overview & Business Problem

In modern digital marketing, tracking traffic is easy, but measuring full-funnel health is challenging. Campaign logs are often messy, split across platforms (Google Ads, Facebook, organic traffic), and formatted inconsistently. Growth teams are forced to wait for data engineering sprints or manually cobble together Excel spreadsheets to calculate basic conversions, leakage, and ROI.

**The Solution:** The **Funnel Insights Dashboard** is a client-side analytics platform that empowers growth teams to upload any marketing lead or event CSV log, calibrate columns on the fly, and view high-fidelity funnel waterfalls, segment breakdowns, time-series financial trends, and dynamic AI-powered business recommendations.

---

## 2. Business Objectives

This dashboard resolves critical business questions:
- **Where are users leaking out?** Pinpoints the funnel stage with the largest relative drop-off.
- **Which traffic sources deliver efficiency?** Analyzes Visitors, Leads, and Customer Conversions by acquisition source to evaluate CAC and ROI.
- **Which campaigns yield profit?** Highlights top-grossing campaigns versus underperforming cohorts.
- **How does behavior differ across segments?** Compares mobile vs. desktop conversion rates and geographical regional performance.

---

## 3. Technology Stack

- **Framework**: React 19 + Vite + TypeScript (structured for zero-lag local computing)
- **Styling**: Tailwind CSS v4 (offering clean glassmorphism and modern dark theme meshes)
- **Visualization**: Recharts (fully interactive composed charts, tooltips, and highlights)
- **Animations**: Framer Motion (animated counters, slide-in card configurations)
- **CSV Engine**: PapaParse (robust, local client-side CSV parsing)
- **Icons**: Lucide React

---

## 4. How Column Auto-Detection & Fallbacks Work

### 4.1 Schema Detection
Upon CSV upload, the platform inspects headers and applies string-distance heuristics to map them automatically to marketing entities:
- **Date**: `date`, `timestamp`, `createdat`, `time`
- **Channel**: `channel`, `source`, `utm_source`, `traffic_source`, `medium`
- **Spend**: `spend`, `cost`, `adspend`, `budget`
- **Revenue**: `revenue`, `value`, `sales`, `amount`
- **Conversion Indicator**: `converted`, `purchase`, `purchased`, `customer`, `sale`

### 4.2 Multi-Column Boolean Funnel Fallback
Many real-world marketing datasets do not log user status in a single "Stage" column. Instead, they record milestones as a series of boolean flags across different columns (e.g. `Visited = 1`, `SignedUp = 1`, `AddedToCart = 0`, `Purchased = 0`).
- **Heuristic Fallback**: If no single "Stage" column is found, the system scans for multiple boolean columns containing stage-related keywords (`visitor`, `signup`, `qualified`, `opportunity`, `cart`, `purchase`).
- **Interactive Sorting**: The mapper switches to **Binary Step Columns** mode, enabling users to check or uncheck individual steps and order them (using Up/Down controls) to calibrate the funnel pipeline.

---

## 5. Dashboard Features

1. **Executive KPI Panel**: Total Traffic, Lead Count, Conversions, Conversion Rates, Campaign Spend, Revenue, CAC, and ROI.
2. **Funnel Waterfall Chart**: Interactive verticalcomposed bars mapping cumulative stage volumes, with the **largest drop-off stage dynamically highlighted in a glowing rose color**.
3. **Channel Performance Analytics**: A tabbed card showing Financials, Conversion Volume, and CAC & ROI charts.
4. **Campaign Performance Grid**: Grouped evaluations comparing campaign spends to final sales revenues and ROI.
5. **Customer Behavior Segmentations**: Centered donut charts comparing device share and geographical conversion bar maps.
6. **Chronological Trends**: Time-series charts tracing daily/weekly Spend, Revenue, and Gross Profit.
7. **Actionable Recommendations Playbook**: At least **10 business recommendations** computed on-the-fly based on active pipeline bottlenecks.
8. **Interactive Filters**: Dynamic date pickers, search input matching, and multi-select filters.
9. **Exports**: Instant PDF report exports (using print stylesheets) and serialized CSV summaries.

---

## 6. Folder Structure

```
FUTURE_DS_03/
├── public/
├── sample-data/
│   └── marketing_funnel.csv           # Reference sample dataset
├── src/
│   ├── assets/
│   ├── charts/
│   │   ├── CampaignPerformanceChart.tsx
│   │   ├── ChannelPerformanceChart.tsx
│   │   ├── CustomerBehaviorChart.tsx
│   │   ├── FunnelVisualization.tsx
│   │   └── RevenueAnalyticsChart.tsx
│   ├── components/
│   │   ├── ColumnMapper.tsx
│   │   ├── DashboardFilters.tsx
│   │   ├── DataTable.tsx
│   │   ├── InsightsPanel.tsx
│   │   ├── KPICards.tsx
│   │   ├── RecommendationsPanel.tsx
│   │   └── UploadPanel.tsx
│   ├── data/
│   │   └── sampleCSV.ts               # Inline string fallback for offline demo
│   ├── types/
│   │   └── index.ts                   # TypeScript interfaces
│   ├── utils/
│   │   ├── columnDetector.ts          # Schema regex matching
│   │   ├── csvParser.ts               # PapaParse bindings
│   │   ├── funnelEngine.ts            # Financial aggregations
│   │   └── insightEngine.ts           # Dynamic insights & recommendations
│   ├── App.tsx                        # Main state coordinator
│   ├── index.css                      # Global Tailwind import & print media styles
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 7. Installation Guide

Follow these steps to run the platform locally:

1. **Clone the repository**
   ```bash
   cd FUTURE_DS_03
   ```

2. **Install project dependencies**
   ```bash
   npm install
   ```

3. **Launch the development server**
   ```bash
   npm run dev
   ```

4. **Build production-ready package**
   ```bash
   npm run build
   ```

---

## 8. Business Recommendations Examples (Calculated Dynamically)
- **Top Funnel Optimization**: Simplify forms to capture top-of-funnel traffic.
- **Lead Nurturing**: Set up auto-drip email campaigns for middle-of-funnel leaks.
- **Budget Allocation**: Shift spend from low ROI channels to high-performing CAC channels.
- **Mobile responsiveness**: Redesign touch interfaces if mobile conversion lags behind desktop.

---

## 9. Future Improvements

- **Interactive A/B Testing Simulator**: Run virtual conversion lifts to see how optimizations would affect gross profit.
- **Funnel Velocity Over Time**: Track the speed (days) it takes for a lead to transition to a paying customer.
- **Integration Webhooks**: Direct upload connections for HubSpot, Google Analytics 4, or Stripe exports.
