
import React, { useState, useEffect, useCallback } from 'react';
import { ActivityList } from './components/ActivityList';
import { MarketChart } from './components/MarketChart';
import { fetchMarketData, fetchMarketActivity, fetchEthAndCheckPrice, fetchFloorPrice, MarketData, MarketEvent } from './services/marketService';

const STORAGE_KEY = 'anichess_market_data_v2';

const App: React.FC = () => {
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>([]);
  const [loadingFeeds, setLoadingFeeds] = useState(true);

  // Initialize state from LocalStorage if available
  const [market, setMarket] = useState<MarketData>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("Failed to load cache", e);
    }
    return {
      ethPrice: 2400,
      checkPrice: 0.000,
      check24hChange: 0,
      ethernalsFloorEth: 0.142,
      floorVoidEth: 1.65,
      floorSpecialEth: 0.8,
      floorNftImage: "https://openseauserdata.com/files/84041d8e6c469f64989635741f22384a.png",
      floorNftUrl: "https://opensea.io/collection/anichess-ethernals",
      checkHistory: [],
      totalVolume: 0,
      totalSales: 0,
      totalOwners: 0,
      averagePrice: 0
    };
  });

  const [isMarketLoading, setIsMarketLoading] = useState(() => {
    return !localStorage.getItem(STORAGE_KEY); // Loading only if no cache
  });

  const refreshMarket = useCallback(() => {
    // 1. Fetch ETH & CHECK (Fastest)
    fetchEthAndCheckPrice().then(data => {
      setMarket(prev => {
        const newState = { ...prev, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
      setIsMarketLoading(false);
    });

    // 2. Fetch Floor (Slower)
    fetchFloorPrice().then(data => {
      setMarket(prev => {
        const newState = { ...prev, ...data };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
        return newState;
      });
      setIsMarketLoading(false);
    });
  }, []);

  const refreshActivity = useCallback(async () => {
    setLoadingFeeds(true);
    const ev = await fetchMarketActivity();
    setMarketEvents(ev);
    setLoadingFeeds(false);
  }, []);

  useEffect(() => {
    refreshMarket();
    refreshActivity();
    const mktInterval = setInterval(refreshMarket, 60000); // 1 min
    const feedInterval = setInterval(refreshActivity, 10000); // 10s for live feel
    return () => {
      clearInterval(mktInterval);
      clearInterval(feedInterval);
    };
  }, [refreshMarket, refreshActivity]);

  const TIERS = [
    { name: 'Day/Night Ethernal', floorScale: 1, airdrop: 6000 },
    { name: 'Special Effect Ethernal', floorScale: 1.5, airdrop: 18000 },
    { name: 'Void Ethernal', floorScale: 2.2, airdrop: 30000 },
  ];

  const renderSkeleton = (className: string) => (
    <div className={`animate-pulse bg-white/10 rounded ${className}`} />
  );

  return (
    <div className="min-h-screen pb-20">
      {/* ... header ... */}
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
                <span className="text-6xl font-black text-white tabular-nums tracking-tighter flex items-center gap-4">
                  {isMarketLoading ? renderSkeleton("h-16 w-48") : market.ethernalsFloorEth.toFixed(4)}
                  <span className="text-2xl font-black text-slate-500">ETH</span>
                </span>
              </div>
              <div className="bg-white/5 px-4 py-2 rounded-xl inline-flex items-center gap-2 border border-white/5 w-fit">
                {isMarketLoading ? renderSkeleton("h-6 w-24") : (
                  <span className="text-xl font-black text-cyan-400">
                    ${(market.ethernalsFloorEth * market.ethPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">USD</span>
              </div>

              {/* New Buy Button */}
              <div className="mt-8">
                <a
                  href={market.floorNftUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-cyan-400 hover:bg-cyan-300 text-black px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-transform hover:scale-105 inline-flex items-center gap-2 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
                >
                  BUY THAT NFT NOW! ↗
                </a>
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
              <img src="/check_logo.png" alt="CK" className="w-10 h-10 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.3)]" />
              <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">$CHECK Token</h3>
            </div>

            <div className="flex items-center justify-between gap-4 h-24">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Market Value</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tabular-nums tracking-tighter flex items-center">
                    {isMarketLoading ? renderSkeleton("h-12 w-32") : `$${market.checkPrice.toFixed(4)}`}
                  </span>
                </div>
                {/* Evolution text for 24 hours */}
                {isMarketLoading ? renderSkeleton("h-4 w-20 mt-2") : (
                  <p className={`text-[11px] font-bold uppercase mt-1 flex items-center gap-1.5 ${market.check24hChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {market.check24hChange >= 0 ? '↑' : '↓'} {Math.abs(market.check24hChange).toFixed(2)}%
                    <span className="text-slate-500 font-medium ml-1">24H EVOL</span>
                  </p>
                )}
              </div>

              {/* Sparkline chart with fixed height for reliable rendering */}
              <div className="flex-1 h-16 max-w-[140px] opacity-90">
                {isMarketLoading || !market.checkHistory || market.checkHistory.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-full h-[2px] bg-cyan-400/20 animate-pulse" />
                  </div>
                ) : (
                  <MarketChart data={market.checkHistory} sparkline={true} />
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
            // Calculate Months Remaining
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth(); // 0 = Jan
            const currentDay = now.getDate();

            // Logic: End in August 2026. 
            // If we are in Jan 2026 (month 0):
            // Before 20th: 8 months (Jan, Feb, Mar, Apr, May, Jun, Jul, Aug)
            // After 20th: 7 months

            let monthsRemaining = 0;
            if (currentYear === 2026) {
              // August (7) is the last month. 
              // If strictly calculating 8 months from Jan 7th: Jan..Aug is 8 months.
              monthsRemaining = 7 - currentMonth;
              if (currentDay < 20) {
                monthsRemaining += 1;
              }
            } else if (currentYear < 2026) {
              monthsRemaining = 8; // Fallback helper or logic if year is previous? Assuming we are in 2026 as per user context.
            }
            if (monthsRemaining < 0) monthsRemaining = 0;

            let currentFloorEth = market.ethernalsFloorEth * tier.floorScale;
            // Use specific fetched floors if available, else fallback to scale (or 0 if not fetched yet, but better to fallback to scale)
            if (tier.name === 'Special Effect Ethernal' && market.floorSpecialEth > 0) {
              currentFloorEth = market.floorSpecialEth;
            } else if (tier.name === 'Void Ethernal' && market.floorVoidEth > 0) {
              currentFloorEth = market.floorVoidEth;
            }
            const floorEthStr = currentFloorEth.toFixed(4);
            const floorUsd = (currentFloorEth * market.ethPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });

            const airdropUsd = (tier.airdrop * market.checkPrice).toLocaleString(undefined, { maximumFractionDigits: 0 });

            const totalRemainingTokens = tier.airdrop * monthsRemaining;
            const totalRemainingValueUsd = totalRemainingTokens * market.checkPrice;

            const assetCostUsd = currentFloorEth * market.ethPrice;
            const roi = assetCostUsd > 0 ? (totalRemainingValueUsd / assetCostUsd) * 100 : 0;

            return (
              <div key={tier.name} className="glass-panel p-8 rounded-[28px] border-t-2 border-t-cyan-500/20 group hover:border-cyan-400/50 transition-all flex flex-col">
                <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-6">{tier.name}</h4>
                <div className="space-y-6 flex-1">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Floor Price</p>
                    <div className="flex items-baseline gap-2">
                      {isMarketLoading ? renderSkeleton("h-8 w-24") : <span className="text-2xl font-black text-white">{floorEthStr} ETH</span>}
                      {isMarketLoading ? null : <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">≈ ${floorUsd}</span>}
                    </div>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Monthly Airdrop <span className="text-cyan-400 ml-1">({monthsRemaining} months left)</span></p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-black text-cyan-400">{tier.airdrop.toLocaleString()} $CHECK</span>
                      {isMarketLoading ? renderSkeleton("h-4 w-16") : <span className="text-xs font-bold text-slate-500 uppercase tracking-tight">≈ ${airdropUsd}</span>}
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Yield (ROI)</p>
                        {isMarketLoading ? renderSkeleton("h-8 w-20") : <span className="text-2xl font-black text-green-400">{roi.toFixed(0)}%</span>}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Total Ret.</p>
                        {isMarketLoading ? renderSkeleton("h-4 w-16 ml-auto") : <span className="text-xs font-black text-white">${totalRemainingValueUsd.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Collection Stats Section (Replacing Live Feed) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
          <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-center items-center border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Volume</span>
            <span className="text-2xl font-black text-white">{market.totalVolume ? market.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '---'} <span className="text-xs text-slate-600">ETH</span></span>
          </div>
          <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-center items-center border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Sales</span>
            <span className="text-2xl font-black text-cyan-400">{market.totalSales ? market.totalSales.toLocaleString() : '---'}</span>
          </div>
          <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-center items-center border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Owners</span>
            <span className="text-2xl font-black text-white">{market.totalOwners ? market.totalOwners.toLocaleString() : '---'}</span>
          </div>
          <div className="glass-panel p-6 rounded-[24px] flex flex-col justify-center items-center border border-white/5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Avg Price</span>
            <span className="text-2xl font-black text-white">{market.averagePrice ? market.averagePrice.toFixed(3) : '---'} <span className="text-xs text-slate-600">ETH</span></span>
          </div>
        </div>
      </main>

      {/* Debug / Status Footer */}
      <footer className="fixed bottom-0 w-full px-8 py-2 bg-[#0d0f14]/90 backdrop-blur text-[10px] uppercase font-bold text-slate-600 flex justify-between items-center z-50">
        <div>
          Connection Status: <span className={import.meta.env.VITE_OPENSEA_API_KEY ? "text-green-400" : "text-red-500"}>
            {import.meta.env.VITE_OPENSEA_API_KEY ? "API KEY LOADED" : "MISSING API KEY (VITE_OPENSEA_API_KEY)"}
          </span>
        </div>
        <div>
          App Version: 1.0.4
        </div>
      </footer>
    </div>
  );
};

export default App;
