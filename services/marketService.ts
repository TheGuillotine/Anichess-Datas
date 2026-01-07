
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
  ethernalsFloorSpecial: number; // New field
  floorNftImage: string;
  checkHistory: { date: string; value: number }[];
}

// ...

// Market Event Interface
export interface MarketEvent {
  id: string;
  type: 'sale' | 'listing' | 'transfer';
  assetName: string;
  price?: string;
  time: string;
  url: string;
  image?: string;
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
  let ethernalsFloorEth = 0.5374;
  let ethernalsFloorSpecial = 0; // Default to 0, will be fetched
  let floorNftImage = "https://openseauserdata.com/files/84041d8e6c469f64989635741f22384a.png";

  try {
    // 1. Fetch Key Stats & Special Listings in Parallel
    // We try to use the traits filter for Special Effect. 
    // JSON: [{"traitType":"Background","values":["Special Effect"]}]
    const traitParams = encodeURIComponent('[{"traitType":"Background","values":["Special Effect"]}]');

    const [statsRes, listingsRes, specialRes] = await Promise.all([
      // A. Collection Stats (Base Floor)
      fetch("/opensea-api/collections/anichess-ethernals/stats", {
        headers: { "x-api-key": OPENSEA_API_KEY, "accept": "application/json" }
      }),
      // B. General Listings (Image + Fallback)
      fetch("/opensea-api/listings/collection/anichess-ethernals/all?limit=1&sort_by=price", {
        headers: { "x-api-key": OPENSEA_API_KEY, "accept": "application/json" }
      }),
      // C. Special Effect Listings (Trait Floor)
      fetch(`/opensea-api/listings/collection/anichess-ethernals/all?limit=1&sort_by=price&traits=${traitParams}`, {
        headers: { "x-api-key": OPENSEA_API_KEY, "accept": "application/json" }
      }).catch(e => null)
    ]);

    // Process Stats (Base Floor)
    if (statsRes.ok) {
      const stats = await statsRes.json();
      if (stats.total?.floor_price) {
        ethernalsFloorEth = stats.total.floor_price;
      }
    }

    // Process General Listings (Image)
    if (listingsRes.ok) {
      const listingsData = await listingsRes.json();
      if (listingsData.listings?.[0]) {
        const best = listingsData.listings[0];
        // Image extraction
        const meta = best.item?.metadata;
        const nft = best.item?.nft;
        floorNftImage = meta?.image_preview_url || meta?.image_thumbnail_url || meta?.image_url ||
          nft?.image_preview_url || nft?.image_thumbnail_url || nft?.image_url || floorNftImage;
      }
    }

    // Process Special Effect Floor
    if (specialRes && specialRes.ok) {
      const specialData = await specialRes.json();
      if (specialData.listings?.[0]) {
        const bestSpecial = specialData.listings[0];
        const val = bestSpecial.price?.current?.value;
        const dec = bestSpecial.price?.current?.decimals || 18;
        if (val) {
          ethernalsFloorSpecial = parseFloat(val) / Math.pow(10, dec);
          console.log("[MarketService] Found Special Effect Floor:", ethernalsFloorSpecial);
        }
      }
    } else {
      console.warn("[MarketService] Failed to fetch Special Effect trait floor via API.");
    }

  } catch (e) {
    console.error("Floor fetch error", e);
  }

  // Fallback: If special floor still 0, strictly fallback to scalar in App.tsx (we pass 0)
  return { ethernalsFloorEth, ethernalsFloorSpecial, floorNftImage };
};

// Main function can now just combine them if needed, but we prefer using them separately
export const fetchMarketData = async (): Promise<MarketData> => {
  const [global, floor] = await Promise.all([fetchEthAndCheckPrice(), fetchFloorPrice()]);
  return { ...global, ...floor };
};

export const fetchMarketActivity = async (): Promise<MarketEvent[]> => {
  try {
    const response = await fetch(
      "/opensea-api/events/collection/anichess-ethernals?event_type=sale&event_type=listing&limit=10",
      {
        headers: {
          "x-api-key": OPENSEA_API_KEY,
          "accept": "application/json"
        }
      }
    );

    const data = await response.json();

    return (data.asset_events || []).slice(0, 5).map((ev: any) => {
      // Optimize Event Image
      const nft = ev.nft;
      const img = nft?.image_preview_url || nft?.image_thumbnail_url || nft?.image_url || ""; // Fallback to empty if none

      return {
        id: ev.id || Math.random().toString(),
        type: ev.event_type === 'item_sold' ? 'sale' : 'listing',
        assetName: ev.nft?.name || "Ethernal",
        price: ev.payment?.quantity
          ? (parseFloat(ev.payment.quantity) / Math.pow(10, ev.payment.decimals || 18)).toFixed(3)
          : undefined,
        time: new Date(ev.closing_date || ev.event_timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        url: ev.nft?.opensea_url || "#",
        image: img
      };
    });
  } catch (error) {
    console.error("Market Activity Error:", error);
    return [];
  }
};
