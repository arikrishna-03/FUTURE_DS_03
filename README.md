# Churn Insights Dashboard 📊

An enterprise-grade, portfolio-ready Customer Retention & Churn Analytics Dashboard built as a dataset-agnostic intelligence platform. Designed to resemble premium business intelligence dashboards like those from Microsoft Fabric, Stripe, Vercel, and Salesforce, this application operates 100% client-side to instantly parse, clean, map, and visualize customer churn data.

---

## 🌟 Live Demo & Portfolio Highlights

- **Dynamic Dataset Agnosticism:** Upload *any* customer subscription or accounts dataset (CSV).
- **Intelligent Schema Detector:** Automatically maps critical fields (churn flags, monthly spend, tenure lengths, IDs) and auto-generates segment distributions.
- **Data Quality Safeguards:** Identifies and handles missing values, inconsistent boolean states (1/0, yes/no, true/false), and displays a detailed data quality report.
- **Dynamic Insights Engine:** Computes correlation reports and issues over 10 operational customer retention recommendations on-the-fly based on uploaded data.
- **Dynamic Accent Color Customizer:** Switch between 6 premium enterprise styles (Indigo, Blue, Emerald, Purple, Rose, Amber). The borders, logos, badge tags, and Recharts color maps dynamically repaint to match your chosen aesthetic.
- **Awwwards-Nominated Backdrop Interactivity:** Implements an optimized HTML5 Canvas particle generator with mouse repulsion physics and Vercel-style cursor radial halo tracking (inspired by `skyclinics.al`).

---

## 🛠️ Technology Stack

- **Framework:** React 18, Vite, TypeScript
- **Styling:** Tailwind CSS (Dark Mode by default, support for Light Mode transitions)
- **Charts:** Recharts (Interactive SVG curves, gradients, and custom tooltips)
- **Parsing:** PapaParse (Fast client-side CSV processing)
- **Animations:** Framer Motion (Smooth page transitions and micro-interactions)
- **Icons:** Lucide React

---

## 📂 Folder Structure

```text
FUTURE_DS_02/
├── sample-data/
│   └── telco_churn.csv       # High-fidelity sample dataset for manual upload testing
├── src/
│   ├── components/
│   │   ├── UploadPanel.tsx   # File upload dropzone and sample triggers (light/dark responsive)
│   │   ├── ColumnMapper.tsx  # Dynamic dropdown mapping and CSV schema previewer
│   │   ├── KPICards.tsx      # Core executive metric tiles with custom SVG sparklines
│   │   ├── Charts.tsx        # Responsive Recharts visualizations & segment breakdowns
│   │   ├── InsightsPanel.tsx # Operational warnings and 10 prioritized retention actions
│   │   ├── DataTable.tsx     # Paginated and searchable records grid with CSV export
│   │   └── InteractiveBackground.tsx # Canvas particles and radial mouse halo overlays
│   ├── data/
│   │   └── telco_churn.ts    # Inline sample data for instant demo simulations
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions and interfaces
│   ├── utils/
│   │   ├── csvParser.ts      # PapaParse wrapper and row sanitization
│   │   ├── columnDetector.ts # Header heuristics and churn value interpreters
│   │   ├── churnEngine.ts    # Aggregator algorithms and cohort divisions
│   │   └── insightEngine.ts  # Rules-based statistical insights and recommendations
│   ├── App.tsx               # Application core state coordinator and filter logic
│   ├── index.css             # Tailwind setup and print layout styles
│   └── main.tsx              # React compiler bootstrapper
├── package.json              # Package manifest and npm script files
├── tailwind.config.js        # Theme color overrides and custom animations
├── tsconfig.json             # TypeScript compiler configurations
└── vite.config.ts            # Vite compile and path resolve config
```

---

## ⚡ Installation & Local Setup

Prerequisites: Make sure you have **Node.js** (v18+) installed.

1. **Clone or navigate to the project directory:**
   ```bash
   cd FUTURE_DS_02
   ```

2. **Install all dependencies:**
   ```bash
   npm install
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:3000` (or the port shown in your terminal).

4. **Compile production build:**
   ```bash
   npm run build
   ```

---

## 🔍 How the Engines Work

### 1. Column Auto-Detection
The `columnDetector.ts` utility evaluates the header names and sample records of the CSV files:
- **Churn Flag:** Matches header patterns containing `churn`, `exited`, `left`, `status`, or `cancelled`. It then scans unique values to automatically identify if the states are represented by yes/no strings, true/false booleans, or 1/0 numbers.
- **Tenure:** Matches patterns representing duration, like `tenure`, `months`, `duration`, or `age`.
- **Monthly Charges:** Identifies revenue and billing fields like `monthlycharges`, `spend`, or `revenue`.
- **Categorical Columns:** Extracts columns with 2 to 15 unique string values and treats them as dynamic segments for visualization and filters.

### 2. Live Filters & Survival Cohorts
When a filter selection changes, the `churnEngine.ts` recomputes the active dataset list, updating the overall churn rates, revenue leakage, tenure survival ranges, and segment distributions on-the-fly.

---

## 📈 Future Architecture Improvements
1. **Machine Learning Integrations:** Connect client-side ONNX models to run predictive churn risk classifications directly in the browser.
2. **Database Connectors:** Establish Snowflake, BigQuery, or Salesforce APIs for scheduled syncs.
3. **Custom Visualizations:** Enable users to add custom charts and map multi-variable heatmaps.
