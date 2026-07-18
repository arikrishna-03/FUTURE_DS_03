import React, { useState, useMemo } from 'react';
import { Trophy, DollarSign, Percent, TrendingUp, Users } from 'lucide-react';
import type { ChannelPerformance, CampaignPerformance } from '../types';

interface ChannelLeaderboardProps {
  channelsData: ChannelPerformance[];
  campaignsData: CampaignPerformance[];
}

type SortMetric = 'conversionRate' | 'roi' | 'cac' | 'visitors';

export const ChannelLeaderboard: React.FC<ChannelLeaderboardProps> = ({ channelsData, campaignsData }) => {
  const [activeTab, setActiveTab] = useState<'channels' | 'campaigns'>('channels');
  const [sortBy, setSortBy] = useState<SortMetric>('conversionRate');

  // Sort channels
  const sortedChannels = useMemo(() => {
    return [...channelsData].sort((a, b) => {
      if (sortBy === 'cac') {
        // Lower CAC is better, but handle 0 CAC (make it go last)
        const valA = a.cac || Infinity;
        const valB = b.cac || Infinity;
        return valA - valB;
      }
      return b[sortBy] - a[sortBy];
    });
  }, [channelsData, sortBy]);

  // Sort campaigns
  const sortedCampaigns = useMemo(() => {
    return [...campaignsData].sort((a, b) => {
      if (sortBy === 'cac') {
        const valA = a.cac || Infinity;
        const valB = b.cac || Infinity;
        return valA - valB;
      }
      return b[sortBy] - a[sortBy];
    });
  }, [campaignsData, sortBy]);

  const currentList = activeTab === 'channels' ? sortedChannels : sortedCampaigns;

  // Maximum value for scaling the progress bar
  const maxValue = useMemo(() => {
    if (currentList.length === 0) return 1;
    if (sortBy === 'cac') {
      const validCacs = currentList.map(c => c.cac).filter(v => v > 0 && v !== Infinity);
      return validCacs.length > 0 ? Math.max(...validCacs) : 1;
    }
    return Math.max(...currentList.map(item => item[sortBy] || 0));
  }, [currentList, sortBy]);

  const formatKeyStat = (item: any) => {
    if (sortBy === 'conversionRate') {
      return `${item.conversionRate.toFixed(1)}% CR`;
    }
    if (sortBy === 'roi') {
      return item.spend > 0 ? `${item.roi.toFixed(0)}% ROI` : '0% ROI';
    }
    if (sortBy === 'cac') {
      return item.cac > 0 && item.cac !== Infinity ? `$${item.cac.toFixed(2)} CAC` : 'N/A';
    }
    return `${item.visitors.toLocaleString()} Visits`;
  };

  return (
    <section className="w-full bg-[#FFFDFC] border-3 border-[#0E0E0E] rounded-3xl p-8 shadow-[6px_6px_0px_rgba(14,14,14,1)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 pb-6 border-b-2 border-slate-100">
        <div>
          <span className="inline-block px-3 py-1 bg-[#FF5D38] text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-2">
            ACQUISITION LEADERBOARD
          </span>
          <h2 className="text-3xl font-black text-[#0E0E0E] uppercase tracking-tight font-display flex items-center gap-2">
            <Trophy className="w-7 h-7 text-[#FF5D38]" /> Channel Performance Standings
          </h2>
          <p className="text-sm font-medium text-slate-600 mt-1">
            Compare acquisition sources and active campaigns by traffic value, efficiency, and returns.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-slate-100 p-1 rounded-xl flex border-2 border-[#0E0E0E] self-start md:self-auto">
          <button
            onClick={() => setActiveTab('channels')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
              activeTab === 'channels' ? 'bg-[#0E0E0E] text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Channels
          </button>
          <button
            onClick={() => setActiveTab('campaigns')}
            className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition ${
              activeTab === 'campaigns' ? 'bg-[#0E0E0E] text-white shadow' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Campaigns
          </button>
        </div>
      </div>

      {/* Sorting filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-black text-slate-500 uppercase tracking-wider mr-2">Sort Standings By:</span>
        
        <button
          onClick={() => setSortBy('conversionRate')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition flex items-center gap-1.5 ${
            sortBy === 'conversionRate'
              ? 'bg-[#FF5D38]/10 text-[#FF5D38] border-[#FF5D38]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <Percent className="w-3.5 h-3.5" /> Conversion Quality
        </button>

        <button
          onClick={() => setSortBy('roi')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition flex items-center gap-1.5 ${
            sortBy === 'roi'
              ? 'bg-[#FF5D38]/10 text-[#FF5D38] border-[#FF5D38]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" /> ROI Yield
        </button>

        <button
          onClick={() => setSortBy('cac')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition flex items-center gap-1.5 ${
            sortBy === 'cac'
              ? 'bg-[#FF5D38]/10 text-[#FF5D38] border-[#FF5D38]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Lowest CAC
        </button>

        <button
          onClick={() => setSortBy('visitors')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition flex items-center gap-1.5 ${
            sortBy === 'visitors'
              ? 'bg-[#FF5D38]/10 text-[#FF5D38] border-[#FF5D38]'
              : 'bg-white text-slate-700 border-slate-200 hover:border-slate-400'
          }`}
        >
          <Users className="w-3.5 h-3.5" /> Lead Volume
        </button>
      </div>

      {/* Leaderboard Entries */}
      <div className="space-y-3">
        {currentList.length === 0 ? (
          <div className="text-center py-10 font-bold text-slate-400">No performance data matches current filters.</div>
        ) : (
          currentList.map((item, index) => {
            const rank = String(index + 1).padStart(2, '0');
            const name = activeTab === 'channels' ? (item as ChannelPerformance).channel : (item as CampaignPerformance).campaign;
            
            // Calculate bar percentage
            let barPct = 0;
            if (sortBy === 'cac') {
              barPct = item.cac > 0 && item.cac !== Infinity ? (item.cac / maxValue) * 100 : 0;
              // For CAC, we want a smaller bar to represent cheaper (better) CAC
              barPct = Math.max(10, 100 - barPct);
            } else {
              const val = item[sortBy] || 0;
              barPct = maxValue > 0 ? (val / maxValue) * 100 : 0;
            }

            return (
              <div 
                key={name} 
                className="flex items-center gap-4 p-4 bg-white border-2 border-[#0E0E0E] hover:border-[#FF5D38] hover:shadow-[4px_4px_0px_rgba(14,14,14,1)] rounded-2xl transition duration-150"
              >
                {/* Rank Number Badge */}
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#0E0E0E] text-white text-xs font-black flex-shrink-0">
                  {rank}
                </span>

                {/* Name & volume info */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-base font-black text-[#0E0E0E] uppercase tracking-tight truncate">
                      {name}
                    </span>
                    <span className="text-sm font-black text-[#FF5D38]">
                      {formatKeyStat(item)}
                    </span>
                  </div>

                  {/* Relative bar and details */}
                  <div className="flex items-center gap-4">
                    {/* Progress Bar Container */}
                    <div className="flex-grow h-3 bg-slate-100 border border-[#0E0E0E] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#FF5D38] border-r border-[#0E0E0E] transition-all duration-500 ease-out" 
                        style={{ width: `${barPct}%` }}
                      />
                    </div>
                    
                    {/* Traffic metrics text */}
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex-shrink-0">
                      {item.conversions.toLocaleString()} conversions / {item.visitors.toLocaleString()} visits
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </section>
  );
};
export default ChannelLeaderboard;
