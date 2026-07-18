import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, ArrowUpRight, Zap, Target, Sliders, MapPin, Laptop, Search, HelpCircle } from 'lucide-react';
import type { BusinessRecommendation } from '../utils/insightEngine';

interface RecommendationsPanelProps {
  recommendations: BusinessRecommendation[];
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({ recommendations }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Funnel', 'Channels', 'Campaigns', 'Device', 'Region'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Funnel':
        return <ClipboardList className="w-4 h-4 text-violet-400" />;
      case 'Channels':
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case 'Campaigns':
        return <Target className="w-4 h-4 text-rose-400" />;
      case 'Device':
        return <Laptop className="w-4 h-4 text-amber-400" />;
      case 'Region':
        return <MapPin className="w-4 h-4 text-cyan-400" />;
      default:
        return <Sliders className="w-4 h-4 text-slate-400" />;
    }
  };

  const filteredRecommendations = recommendations.filter(rec => {
    const matchesCategory = activeCategory === 'All' || rec.category === activeCategory;
    const matchesSearch = 
      rec.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      rec.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800/80 shadow-md space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5.5 h-5.5 text-violet-400" />
            Conversion Rate Optimization (CRO) Playbook
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            At least 10 priority growth actions generated dynamically from bottlenecks detected in your uploaded dataset.
          </p>
        </div>
        
        {/* Search bar inside recommendations */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="w-3.5 h-3.5 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Search playbook..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950/80 border border-slate-850 hover:border-slate-800 rounded-lg text-xs text-slate-355 focus:outline-none focus:border-violet-500/80 transition"
          />
        </div>
      </div>

      {/* Category selector */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition duration-200 cursor-pointer ${
              activeCategory === cat
                ? 'bg-violet-600 border-violet-500 text-white shadow-md'
                : 'bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-200 hover:border-slate-850'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.03 }}
            className="p-4 rounded-xl bg-slate-950/40 border border-slate-850 hover:border-slate-800/85 hover:bg-slate-950/80 transition duration-300 flex flex-col justify-between group shadow-sm select-none"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-2.5">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900 border border-slate-800 flex items-center gap-1">
                  {getCategoryIcon(rec.category)}
                  {rec.category}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    rec.impact === 'High' 
                      ? 'bg-emerald-950/30 text-emerald-450 border border-emerald-900/50' 
                      : rec.impact === 'Medium'
                      ? 'bg-amber-950/30 text-amber-450 border border-amber-900/50'
                      : 'bg-slate-900 text-slate-400 border border-slate-850'
                  }`}>
                    Impact: {rec.impact}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                    rec.effort === 'Low' 
                      ? 'bg-emerald-950/30 text-emerald-450 border border-emerald-900/50' 
                      : rec.effort === 'Medium'
                      ? 'bg-amber-950/30 text-amber-450 border border-amber-900/50'
                      : 'bg-rose-950/30 text-rose-450 border border-rose-900/50'
                  }`}>
                    Effort: {rec.effort}
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-slate-200 group-hover:text-violet-400 transition-colors flex items-center gap-1.5 mt-1">
                {rec.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                {rec.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-500">
              <span className="flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-600" /> Dynamic Action Plan
              </span>
              <span className="font-semibold text-violet-400 group-hover:underline flex items-center gap-0.5 cursor-pointer">
                Implement playbook <ArrowUpRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        ))}

        {filteredRecommendations.length === 0 && (
          <div className="col-span-2 text-center py-10 border border-dashed border-slate-850 rounded-xl">
            <ClipboardList className="w-8 h-8 text-slate-650 mx-auto" />
            <p className="text-slate-500 text-xs mt-2">No recommendations matches search or category filters.</p>
          </div>
        )}
      </div>

    </div>
  );
};
