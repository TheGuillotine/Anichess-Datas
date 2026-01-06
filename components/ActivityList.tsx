
import React from 'react';
import { MarketEvent } from '../services/marketService';

interface ActivityListProps {
  events: MarketEvent[];
  loading: boolean;
}

export const ActivityList: React.FC<ActivityListProps> = ({ events, loading }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-black text-white uppercase tracking-tighter">Market Activity</h3>
        <span className="text-[10px] font-black text-cyan-400 animate-pulse">LIVE</span>
      </div>
      <div className="space-y-3">
        {loading ? (
          [1,2,3].map(i => <div key={i} className="h-20 bg-white/5 rounded-2xl animate-pulse" />)
        ) : events.length > 0 ? (
          events.map((act) => (
            <a 
              key={act.id} 
              href={act.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-[#161b22]/40 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all group"
            >
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${act.type === 'sale' ? 'text-green-400 bg-green-400/10' : 'text-blue-400 bg-blue-400/10'}`}>
                    {act.type === 'sale' ? '💰' : '🏷️'}
                 </div>
                 <div>
                    <h4 className="text-xs font-black text-white uppercase truncate max-w-[120px]">{act.assetName}</h4>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{act.type === 'sale' ? 'Sale' : 'Listing'}</p>
                 </div>
              </div>
              <div className="text-right">
                 {act.price && (
                   <p className="text-sm font-black text-white">
                     {act.price} ETH
                   </p>
                 )}
                 <p className="text-[9px] text-slate-600 font-bold uppercase">{act.time}</p>
              </div>
            </a>
          ))
        ) : (
          <p className="text-xs text-slate-500 italic text-center py-10">No recent market activity found.</p>
        )}
      </div>
    </div>
  );
};
