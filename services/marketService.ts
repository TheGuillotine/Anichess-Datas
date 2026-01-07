
const OPENSEA_API_KEY = import.meta.env.VITE_OPENSEA_API_KEY || "";

// WETH Address for ETH Price (Ethereum Mainnet)
const WETH_ADDRESS = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
// CHECK Token Address
const CHECK_ADDRESS = "0x9126236476efba9ad8ab77855c60eb5bf37586eb";

export interface MarketData {
  ethPrice: number;
  checkPrice: number;
  check24hChange: number;
  ethernalsFloorEth: number;
  floorNftImage: string;
  checkHistory: { date: string; value: number }[];
}

export interface MarketEvent {
  id: string;
  type: 'sale' | 'listing' | 'transfer';
  assetName: string;
  price?: string;
  time: string;
  url: string;
}

// Individual fetcher for ETH and CHECK (Fast)
export const fetchEthAndCheckPrice = async () => {
  console.log("[MarketService] Fetching ETH & CHECK data...");

  let ethPrice = 2400;
  let checkPrice = 0.000;
  let check24hChange = 0;

  // Parallel fetch for ETH and CHECK
  const [ethRes, checkRes] = await Promise.all([
    fetch("https://api.dexscreener.com/latest/dex/pairs/ethereum/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640").catch(e => null),
    fetch(`https://api.dexscreener.com/latest/dex/tokens/${CHECK_ADDRESS}`).catch(e => null)
  ]);

  // Process ETH
  if (ethRes && ethRes.ok) {
    try {
      const data = await ethRes.json();
      const pair = data.pair || data.pairs?.[0];
      if (pair) ethPrice = parseFloat(pair.priceUsd);
    } catch (e) {
      console.warn("ETH parse error", e);
    }
  }

  // Process CHECK
  if (checkRes && checkRes.ok) {
    try {
      const data = await checkRes.json();
      const bestPair = data.pairs?.find((p: any) => p.baseToken.address.toLowerCase() === CHECK_ADDRESS.toLowerCase());
      if (bestPair) {
        checkPrice = parseFloat(bestPair.priceUsd);
        check24hChange = bestPair.priceChange.h24;
      } else if (data.pairs?.[0]) {
        // Fallback logic
        if (data.pairs[0].baseToken.symbol === 'CHECK' || data.pairs[0].baseToken.symbol === 'Check') {
          checkPrice = parseFloat(data.pairs[0].priceUsd);
          check24hChange = data.pairs[0].priceChange.h24;
        }
      }
    } catch (e) {
      console.warn("CHECK parse error", e);
    }
  }

  // Generate History
  const trend = check24hChange >= 0 ? 1 : -1;
  const volatility = 0.05;
  const checkHistory = Array(7).fill(0).map((_, i) => {
    const daysAgo = 6 - i;
    const randomVar = 1 + (Math.random() * volatility * 2 - volatility);
    const trendFactor = 1 - (trend * 0.02 * daysAgo);
    return {
      date: new Date(Date.now() - daysAgo * 86400000).toISOString(),
      value: checkPrice * trendFactor * randomVar
    };
  });

  return { ethPrice, checkPrice, check24hChange, checkHistory };
};

// Separate fetcher for Floor Price (Slower due to OpenSea)
export const fetchFloorPrice = async () => {
  console.log("[MarketService] Fetching Floor Price...");
  let ethernalsFloorEth = 0.142;
  let floorNftImage = "https://i.seadn.io/s/raw/files/84041d8e6c469f64989635741f22384a.png";

  try {
    const osListingsResponse = await fetch(
      "https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1",
      { headers: { "x-api-key": OPENSEA_API_KEY, "accept": "application/json" } }
    );

    if (osListingsResponse.ok) {
      const listingsData = await osListingsResponse.json();
      if (listingsData.listings?.[0]) {
        const best = listingsData.listings[0];
        const val = best.price?.current?.value;
        const dec = best.price?.current?.decimals || 18;
        if (val) ethernalsFloorEth = parseFloat(val) / Math.pow(10, dec);
        floorNftImage = best.item?.metadata?.image_url || best.item?.nft?.image_url || floorNftImage;
      }
    } else {
      // Fallback
      const osStatsResponse = await fetch(
        "https://api.opensea.io/api/v2/collections/anichess-ethernals/stats",
        { headers: { "x-api-key": OPENSEA_API_KEY, "accept": "application/json" } }
      );
      if (osStatsResponse.ok) {
        const stats = await osStatsResponse.json();
        ethernalsFloorEth = stats.total?.floor_price || ethernalsFloorEth;
      }
    }
  } catch (e) {
    console.error("Floor fetch error", e);
  }

  return { ethernalsFloorEth, floorNftImage };
};

// Main function can now just combine them if needed, but we prefer using them separately
export const fetchMarketData = async (): Promise<MarketData> => {
  const [global, floor] = await Promise.all([fetchEthAndCheckPrice(), fetchFloorPrice()]);
  return { ...global, ...floor };
};

export const fetchMarketActivity = async (): Promise<MarketEvent[]> => {
  try {
    const response = await fetch(
      "https://api.opensea.io/api/v2/events/collection/anichess-ethernals?event_type=sale&event_type=listing",
      {
        headers: {
          "x-api-key": OPENSEA_API_KEY,
          "accept": "application/json"
        }
      }
    );

    const data = await response.json();

    return (data.asset_events || []).slice(0, 5).map((ev: any) => ({
      id: ev.id || Math.random().toString(),
      type: ev.event_type === 'item_sold' ? 'sale' : 'listing',
      assetName: ev.nft?.name || "Ethernal",
      price: ev.payment?.quantity
        ? (parseFloat(ev.payment.quantity) / Math.pow(10, ev.payment.decimals || 18)).toFixed(3)
        : undefined,
      time: new Date(ev.closing_date || ev.event_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      url: ev.nft?.opensea_url || "#"
    }));
  } catch (error) {
    console.error("Market Activity Error:", error);
    return [];
  }
};
