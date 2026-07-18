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
        return <ClipboardList className="w-3.5 h-3.5 text-[#FF5D38]" />;
      case 'Channels':
        return <Zap className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Campaigns':
        return <Target className="w-3.5 h-3.5 text-rose-600" />;
      case 'Device':
        return <Laptop className="w-3.5 h-3.5 text-amber-600" />;
      case 'Region':
        return <MapPin className="w-3.5 h-3.5 text-cyan-600" />;
      default:
        return <Sliders className="w-3.5 h-3.5 text-slate-500" />;
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
    <section className="w-full bg-[#FFFDFC] border-3 border-[#0E0E0E] rounded-3xl p-8 shadow-[6px_6px_0px_rgba(14,14,14,1)]">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b-2 border-slate-100 pb-6 mb-6">
        <div>
          <span className="inline-block px-3 py-1 bg-[#FF5D38] text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
            GROWTH STRATEGY
          </span>
          <h3 className="text-3xl font-black text-[#0E0E0E] uppercase tracking-tight font-display flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-[#FF5D38]" /> Playbook of Growth Initiatives
          </h3>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Dynamic, prioritized optimization actions computed from bottlenecks in your uploaded funnel logs.
          </p>
        </div>
        
        {/* Search bar inside recommendations */}
        <div className="relative max-w-xs w-full">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </span>
          <input
            type="text"
            placeholder="Search strategy..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2.5 bg-white border-2 border-[#0E0E0E] rounded-xl text-xs font-bold text-[#0E0E0E] focus:outline-none focus:border-[#FF5D38] transition"
          />
        </div>
      </div>

      {/* Category selector buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all duration-100 cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#0E0E0E] border-[#0E0E0E] text-white shadow'
                : 'bg-white border-slate-200 text-slate-600 hover:border-[#0E0E0E] hover:text-[#0E0E0E]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRecommendations.map((rec, index) => (
          <motion.div
            key={rec.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.03 }}
            className="p-6 rounded-2xl bg-white border-2 border-[#0E0E0E] hover:border-[#FF5D38] hover:shadow-[4px_4px_0px_rgba(14,14,14,1)] transition-all duration-150 flex flex-col justify-between shadow-[2px_2px_0px_rgba(14,14,14,1)] group"
          >
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-100 border border-slate-200 flex items-center gap-1.5 text-slate-700">
                  {getCategoryIcon(rec.category)}
                  {rec.category}
                </span>
                
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                    rec.impact === 'High' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : rec.impact === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-slate-100 text-slate-500 border-slate-300'
                  }`}>
                    Impact: {rec.impact}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                    rec.effort === 'Low' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                      : rec.effort === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-rose-50 text-rose-700 border-rose-300'
                  }`}>
                    Effort: {rec.effort}
                  </span>
                </div>
              </div>

              <h4 className="text-base font-black text-[#0E0E0E] uppercase tracking-tight group-hover:text-[#FF5D38] transition-colors mt-2">
                {rec.title}
              </h4>
              <p className="text-xs font-medium text-slate-750 leading-relaxed mt-2.5">
                {rec.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-slate-400" /> CRO Action Plan
              </span>
              <span className="text-[#FF5D38] group-hover:underline flex items-center gap-0.5 cursor-pointer font-black">
                Deploy Initiative <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </motion.div>
        ))}

        {filteredRecommendations.length === 0 && (
          <div className="col-span-2 text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
            <ClipboardList className="w-10 h-10 text-slate-400 mx-auto" />
            <p className="text-slate-500 font-bold text-sm mt-3 uppercase tracking-wider">No Playbook Matches Found</p>
            <p className="text-slate-400 text-xs mt-1">Refine your category tabs or search query variables.</p>
          </div>
        )}
      </div>

    </section>
  );
};
export default RecommendationsPanel;
