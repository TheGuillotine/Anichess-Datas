
import React from 'react';
import { ICONS } from '../constants';

interface AssetCardProps {
  symbol: string;
  value: string;
  change: string;
  color?: string;
}

export const AssetCard: React.FC<AssetCardProps> = ({ symbol, value, change }) => {
  return (
    <div className="card-dark p-6 rounded-[32px] flex flex-col justify-between h-[180px] relative overflow-hidden group hover:scale-[1.02] transition-transform cursor-pointer">
      <div className="flex justify-between items-start">
        {ICONS[symbol as keyof typeof ICONS]}
        <button className="text-slate-500 hover:text-white">
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
        </button>
      </div>
      
      <div className="flex justify-between items-end">
        <div>
          <h3 className="text-3xl font-bold text-white mt-2">${value}</h3>
          <p className="text-slate-500 text-sm mt-1">
            <span className="text-green-400 font-semibold">{change}</span> This week
          </p>
        </div>
        {/* Simple Sparkline SVG placeholder */}
        <div className="w-16 h-8">
          <svg viewBox="0 0 100 40" className="stroke-orange-400 fill-none stroke-[3]">
            <path d="M0 35 Q 20 10, 40 25 T 80 5 T 100 20" />
          </svg>
        </div>
      </div>
    </div>
  );
};
