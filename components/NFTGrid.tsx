
import React from 'react';
import { NFTAsset } from '../types';

interface NFTGridProps {
  nfts: NFTAsset[];
}

export const NFTGrid: React.FC<NFTGridProps> = ({ nfts }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {nfts.map((nft) => (
        <div key={nft.id} className="glass-panel rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all group cursor-pointer">
          <div className="aspect-square relative overflow-hidden">
            <img 
              src={nft.image} 
              alt={nft.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0f14] via-transparent to-transparent opacity-80" />
            <div className="absolute top-2 left-2 flex gap-1">
               <div className="px-1.5 py-0.5 bg-black/60 rounded text-[8px] font-black text-cyan-400 uppercase tracking-widest border border-cyan-500/20">
                  {nft.rarity || 'Common'}
               </div>
            </div>
          </div>
          <div className="p-4 bg-[#161b22]">
            <h4 className="text-xs font-black text-white uppercase tracking-tight truncate">{nft.name}</h4>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">Asset ID #{nft.id}</p>
          </div>
        </div>
      ))}
      <div className="glass-panel rounded-2xl border-dashed border-2 border-white/5 flex flex-col items-center justify-center p-6 text-slate-600 hover:text-cyan-400 transition-colors cursor-pointer group">
         <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">+</div>
         <span className="text-[10px] font-black uppercase tracking-widest">Mint New</span>
      </div>
    </div>
  );
};
