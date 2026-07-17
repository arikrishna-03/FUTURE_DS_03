# Churn Insights Dashboard 📊

A dataset-agnostic customer retention & churn analytics platform, built for the **FUTURE_DS_02** Data Science & Analytics internship task. Instead of analyzing a single fixed dataset, this tool lets you upload *any* customer subscription or accounts CSV and automatically generates a full churn/retention dashboard from it — column mapping, KPIs, segment breakdowns, and data-driven recommendations included.

---

## 🧩 Business Problem

Customer churn is one of the most expensive problems for subscription and accounts-based businesses — acquiring a new customer typically costs far more than retaining an existing one. Most churn analyses are one-off: an analyst gets a specific dataset, writes specific code, and produces a report that can't be reused on the next dataset.

**Objective:** Build a reusable analytics tool that can take in any customer dataset with a churn flag and immediately surface: who is churning, why, which segments are highest-risk, and what revenue is at stake — without needing to rewrite analysis code for each new dataset.

---

## 🌟 Key Features

- **Dataset-agnostic upload** — drop in any customer CSV; no fixed schema required
- **Intelligent column auto-detection** — maps churn flag, tenure, monthly charges, and categorical segments automatically, with manual override if a guess is wrong
- **Data quality safeguards** — flags missing values, duplicate rows, and inconsistent churn encodings (yes/no, true/false, 1/0), and reports exactly what was cleaned
- **Dynamic KPI cards** — total customers, churn rate, retention rate, avg. tenure, avg. revenue per customer; any KPI whose source column wasn't found is hidden rather than shown as zero
- **Auto-generated segment charts** — one churn-rate-by-segment chart per categorical column detected in the data (contract type, payment method, gender, etc. — whatever exists in the uploaded file)
- **Revenue-at-risk estimate** — calculates the monthly revenue represented by churned customers
- **Data-driven insights & recommendations** — both are computed from the actual uploaded data (e.g. "Month-to-month customers churn at 42%, vs. 11% for annual contracts"), not static boilerplate text
- **Searchable, filterable data table** with CSV export
- **Interactive canvas background** with mouse-reactive particle effects and a 6-color accent theme switcher (Indigo, Blue, Emerald, Purple, Rose, Amber)

---

## 🛠️ Technology Stack

| Layer | Tools |
|---|---|
| Framework | React 18, Vite, TypeScript |
| Styling | Tailwind CSS (dark mode default, light mode supported) |
| Charts | Recharts |
| CSV Parsing | PapaParse |
| Animation | Framer Motion |
| Icons | Lucide React |

Runs entirely client-side — no backend, no data leaves the browser.

---

## 📂 Folder Structure

```text
FUTURE_DS_02/
├── sample-data/
│   └── telco_churn.csv        # Sample dataset for demoing the tool
├── src/
│   ├── components/
│   │   ├── UploadPanel.tsx        # File upload dropzone + sample data trigger
│   │   ├── ColumnMapper.tsx       # Schema preview & manual column override
│   │   ├── KPICards.tsx           # Executive metric tiles with sparklines
│   │   ├── Charts.tsx             # Segment & trend visualizations
│   │   ├── InsightsPanel.tsx      # Data-driven insights & recommendations
│   │   ├── DataTable.tsx          # Searchable, paginated records grid
│   │   └── InteractiveBackground.tsx  # Canvas particle background
│   ├── data/
│   │   └── telco_churn.ts         # Inline sample data for instant demo
│   ├── types/
│   │   └── index.ts                # Shared TypeScript interfaces
│   ├── utils/
│   │   ├── csvParser.ts            # PapaParse wrapper & row sanitization
│   │   ├── columnDetector.ts       # Header/value heuristics for auto-mapping
│   │   ├── churnEngine.ts          # Churn/retention aggregation logic
│   │   └── insightEngine.ts        # Rules-based insight & recommendation generator
│   ├── App.tsx                     # App state coordinator & filter logic
│   ├── index.css
│   └── main.tsx
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## ⚡ Installation & Local Setup

**Prerequisites:** Node.js v18+

```bash
# 1. Navigate to the project directory
cd FUTURE_DS_02

# 2. Install dependencies
npm install

# 3. Run the dev server
npm run dev
# Opens at http://localhost:3000 (or the port shown in your terminal)

# 4. Production build
npm run build
```

---

## 🔍 How the Core Engines Work

**Column auto-detection** (`columnDetector.ts`)
Scans CSV headers and sample values to identify:
- **Churn flag** — matches header patterns like `churn`, `exited`, `left`, `status`, `cancelled`, then inspects the actual values to interpret yes/no, true/false, or 1/0 encodings correctly
- **Tenure** — matches `tenure`, `months`, `duration`, `age`-style columns
- **Monthly charges** — matches `monthlycharges`, `spend`, `revenue`-style columns
- **Categorical segments** — any column with 2–15 unique string values is treated as a dynamic segment for charts and filters

**Churn & retention aggregation** (`churnEngine.ts`)
Recomputes churn rate, retention rate, tenure distribution, and per-segment breakdowns live whenever a filter is applied — so the whole dashboard responds to the active view of the data, not just the raw upload.

**Insight generation** (`insightEngine.ts`)
Runs statistical comparisons across detected segments (e.g. churn rate by contract type) and surfaces the highest-variance findings as plain-language insights, plus a prioritized list of retention recommendations tied to whichever segment shows the greatest risk in the *specific* uploaded dataset.

---

## 📊 Key Findings (Sample Dataset: Telco Customer Churn)

- Month-to-month contract customers show an elevated churn rate of **70.8%** (17 churned out of 24) compared to **0.0%** for one/two-year contracts.
- Customers with **Fiber Optic internet service** churn at a notably higher rate of **61.9%** (13 churned out of 21) compared to **23.1%** for DSL.
- The first 6 months of tenure account for the majority of churn events, with an early cohort churn rate of **63.2%** (12 churned out of 19).
- Estimated monthly revenue at risk from churned customers is **$1,410** (out of total monthly charges of $2,788).

---

## 💡 Business Recommendations

1. **Offer incentives to shift month-to-month subscribers onto annual contracts:** Introduce a bill credit or promo code discount, as annual commitments show complete historical retention (0% churn).
2. **Proactively flag early tenure customers:** Deploy automated concierges, welcome diagnostic calls, and checklist guides to mitigate the 63.2% churn risk in months 0-6.
3. **Bundle support and tech checks for Fiber Optic accounts:** Review diagnostic latency drops and pricing plans for Fiber Optic lines, which account for the highest service type risk.
4. **Promote Auto-Pay integrations:** Incentivize credit card or bank transfer signups to avoid administrative churn caused by check payments.

---

## 🚀 Future Improvements

- Client-side ML (ONNX) for predictive churn risk scoring in-browser
- Optional connectors for Snowflake / BigQuery / Salesforce for scheduled syncs
- User-configurable custom charts and multi-variable heatmaps

---

**Built as part of the Future Interns Data Science & Analytics internship (FUTURE_DS_02).**
