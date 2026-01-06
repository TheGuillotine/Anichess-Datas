
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityList } from './components/ActivityList';
import { MarketChart } from './components/MarketChart';
import { getAnichessTweets, TweetInsight } from './services/geminiService';
import { fetchMarketData, fetchMarketActivity, MarketData, MarketEvent } from './services/marketService';

const App: React.FC = () => {
  const [tweets, setTweets] = useState<TweetInsight[]>([]);
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);
  const [market, setMarket] = useState<MarketData>({
    ethPrice: 2400,
    checkPrice: 0.892,
    check24hChange: 0,
    ethernalsFloorEth: 0.142,
    floorNftImage: "https://i.seadn.io/s/raw/files/84041d8e6c469f64989635741f22384a.png",
    checkHistory: []
  });

  const refreshMarket = useCallback(async () => {
    const mkt = await fetchMarketData();
    setMarket(mkt);
  }, []);

  const refreshFeeds = useCallback(async () => {
    setLoadingFeeds(true);
    const [tw, ev] = await Promise.all([
      getAnichessTweets(),
      fetchMarketActivity()
    ]);
    setTweets(tw);
    setMarketEvents(ev);
    setLoadingFeeds(false);
  }, []);

  useEffect(() => {
    refreshMarket();
    refreshFeeds();
    const mktInterval = setInterval(refreshMarket, 60000);
    const feedInterval = setInterval(refreshFeeds, 300000); // 5 mins
    return () => {
      clearInterval(mktInterval);
      clearInterval(feedInterval);
    };
  }, [refreshMarket, refreshFeeds]);

  const TIERS = [
    { name: 'Day/Night Ethernal', floorScale: 1, airdrop: 6000 },
    { name: 'Special Effect Ethernal', floorScale: 1.5, airdrop: 18000 },
    { name: 'Void Ethernal', floorScale: 2.2, airdrop: 30000 },
  ];

  return (
    <div className="min-h-screen pb-20">
      <header className="fixed top-0 w-full z-50 px-8 py-4 flex items-center justify-between bg-[#0d0f14]/90 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-400 rounded flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(34,211,238,0.4)]">♞</div>
            <h1 className="text-xl font-black tracking-tighter text-white uppercase italic">Anichess <span className="text-[10px] text-cyan-400 align-top ml-1 uppercase">Datas</span></h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <a 
            href="https://anichess.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ani-button-primary px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] hover:scale-105 transition-transform"
          >
            PLAY ANICHESS NOW!
          </a>
        </div>
      </header>

      <main className="pt-28 px-8 max-w-[1500px] mx-auto space-y-8">
        
        {/* Market Hero Blocks */}
        <div className="grid grid-cols-12 gap-8">
          {/* Block 1: Ethernal Floor Price (Large) */}
          <div className="col-span-12 lg:col-span-8 glass-panel rounded-[32px] overflow-hidden p-8 flex border-l-4 border-l-cyan-400 min-h-[300px] relative">
            <div className="flex-1 flex flex-col justify-center relative z-10">
              <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Market Overview</p>
              <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-8">Ethernal Floor Price</h2>
              
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-6xl font-black text-white tabular-nums tracking-tighter">
                  {market.ethernalsFloorEth.toFixed(3)} <span className="text-2xl font-black text-slate-500">ETH</span>
                </span>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-white/5 w-fit">
                <span className="text-xl font-black text-cyan-400">
                  ${(market.ethernalsFloorEth * market.ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">USD</span>
              </div>
            </div>

            <div className="w-1/3 flex items-center justify-center relative z-10">
              <div className="aspect-square w-full max-w-[200px] rounded-2xl overflow-hidden border-4 border-white/5 shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500">
                <img 
                  src={market.floorNftImage} 
                  alt="Floor Ethernal" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="absolute right-[-20px] bottom-[-20px] text-[15rem] select-none text-white/[0.03] font-black pointer-events-none rotate-12">♞</div>
          </div>

          {/* Block 2: $CHECK Info (Small) */}
          <div className="col-span-12 lg:col-span-4 glass-panel rounded-[32px] overflow-hidden p-8 flex flex-col justify-center border-t-4 border-t-yellow-500/30 bg-gradient-to-br from-[#1c1e24] to-[#0d0f14]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center font-black text-black text-xs shadow-[0_0_15px_rgba(34,211,238,0.3)]">CK</div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">$CHECK Token</h3>
            </div>
            
            <div className="flex items-center justify-between gap-4 h-24">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Value</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tabular-nums tracking-tighter">
                    ${market.checkPrice.toFixed(3)}
                  </span>
                </div>
                {/* Evolution text for 24 hours */}
                <p className={`text-[11px] font-bold uppercase mt-1 flex items-center gap-1.5 ${market.check24hChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {market.check24hChange >= 0 ? '↑' : '↓'} {Math.abs(market.check24hChange).toFixed(2)}%
                  <span className="text-slate-500 font-medium ml-1">24H EVOL</span>
                </p>
              </div>
              
              {/* Sparkline chart with fixed height for reliable rendering */}
              <div className="flex-1 h-16 max-w-[140px] opacity-90">
                {market.checkHistory && market.checkHistory.length > 0 ? (
                  <MarketChart data={market.checkHistory} sparkline={true} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-[2px] bg-cyan-400/20 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-slate-600 uppercase">Status</span>
                <span className="text-[10px] font-black text-green-400 uppercase tracking-widest flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Live Trading
                </span>
              </div>
              <a 
                href="https://katapult.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black text-white uppercase tracking-widest transition-colors border border-white/5"
              >
                Buy Token
              </a>
            </div>
          </div>
        </div>

        {/* Tier Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TIERS.map((tier) => {
            const currentFloorEth = market.ethernalsFloorEth * tier.floorScale;
            const floorEthStr = currentFloorEth.toFixed(3);
            const floorUsd = (currentFloorEth * market.ethPrice).toLocaleString();
            const airdropUsd = (tier.airdrop * market.checkPrice).toLocaleString();
            const annualAirdropValueUsd = tier.airdrop * 12 * market.checkPrice;
            const assetCostUsd = currentFloorEth * market.ethPrice;
            const apr = assetCostUsd > 0 ? (annualAirdropValueUsd / assetCostUsd) * 100 : 0;
            
            return (
              <div key={tier.name} className="glass-panel p-8 rounded-[28px] border-t-2 border-t-cyan-500/20 group hover:border-cyan-400/50 transition-all flex flex-col">
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-6">{tier.name}</h4>
                <div className="space-y-6 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Floor Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-white">{floorEthStr} ETH</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">≈ ${floorUsd}</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Monthly Airdrop</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-cyan-400">{tier.airdrop.toLocaleString()} $CHECK</span>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">≈ ${airdropUsd}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Yield (APR)</p>
                        <span className="text-2xl font-black text-green-400">{apr.toFixed(2)}%</span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Yearly Ret.</p>
                        <span className="text-xs font-black text-white">${annualAirdropValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feeds Section */}
        <div className="grid grid-cols-12 gap-8 pt-8">
           <div className="col-span-12 lg:col-span-7 glass-panel p-8 rounded-[32px]">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                    <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    Anichess Timeline
                 </h3>
              </div>
              <div className="space-y-6">
                 {loadingFeeds ? (
                    [1,2,3].map(i => <div key={i} className="h-24 bg-white/5 rounded-2xl animate-pulse" />)
                 ) : tweets.length > 0 ? (
                    tweets.map((t, i) => (
                      <div key={i} className="p-5 bg-white/5 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex gap-3">
                           <div className="w-10 h-10 rounded-full bg-cyan-400 flex items-center justify-center font-black text-black">A</div>
                           <div className="flex-1">
                              <div className="flex items-center gap-1.5">
                                 <span className="text-sm font-black text-white">{t.author}</span>
                                 {t.verified && <span className="text-cyan-400">✓</span>}
                                 <span className="text-xs text-slate-500 font-bold ml-1">{t.handle} · {t.time}</span>
                              </div>
                              <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">{t.content}</p>
                           </div>
                        </div>
                      </div>
                    ))
                 ) : (
                    <p className="text-xs text-slate-500 italic text-center py-10">Waiting for next transmission...</p>
                 )}
              </div>
           </div>

           <div className="col-span-12 lg:col-span-5 glass-panel p-8 rounded-[32px]">
              <ActivityList events={marketEvents} loading={loadingFeeds} />
           </div>
        </div>
      </main>
    </div>
  );
};

export default App;
