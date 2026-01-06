
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

export const fetchMarketData = async (): Promise<MarketData> => {
  console.log("[MarketService] fetchMarketData via DexScreener called");

  // 1. Fetch ETH Price (using specific USDC/ETH pair 0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640)
  let ethPrice = 2400; // Default fallback
  try {
    const wethResponse = await fetch("https://api.dexscreener.com/latest/dex/pairs/ethereum/0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640");
    if (wethResponse.ok) {
      const data = await wethResponse.json();
      const pair = data.pair || data.pairs?.[0];
      if (pair) {
        ethPrice = parseFloat(pair.priceUsd);
        console.log("[MarketService] ETH Price (DexScreener Pair):", ethPrice);
      }
    } else {
      console.warn("[MarketService] ETH Price fetch failed:", wethResponse.status);
    }
  } catch (e) {
    console.warn("[MarketService] ETH Price fetch error:", e);
  }

  // 2. Fetch $CHECK data (DexScreener)
  let checkPrice = 0.000;
  let check24hChange = 0;

  try {
    const dexUrl = `https://api.dexscreener.com/latest/dex/tokens/${CHECK_ADDRESS}`;
    console.log("[MarketService] Fetching DexScreener (CHECK):", dexUrl);

    const checkResponse = await fetch(dexUrl);

    if (checkResponse.ok) {
      const data = await checkResponse.json();

      // Find a pair where CHECK is the BASE token to get its price
      // (DexScreener priceUsd is always for the base token)
      const bestPair = data.pairs?.find((p: any) => p.baseToken.address.toLowerCase() === CHECK_ADDRESS.toLowerCase());

      if (bestPair) {
        checkPrice = parseFloat(bestPair.priceUsd);
        check24hChange = bestPair.priceChange.h24;
        console.log("[MarketService] Parsed CHECK Price:", checkPrice);
      } else if (data.pairs?.[0]) {
        // Fallback: If CHECK is quote, we might need to invert, but usually DexScreener puts the main token as base in search
        // For now, let's log if we didn't find it as base
        console.warn("[MarketService] CHECK not found as Base Token in first pair. Base:", data.pairs[0].baseToken.symbol);
        // Attempt to use first pair anyway if we are desperate, but it might be wrong if CHECK is quote.
        if (data.pairs[0].baseToken.symbol === 'CHECK' || data.pairs[0].baseToken.symbol === 'Check') {
          checkPrice = parseFloat(data.pairs[0].priceUsd);
          check24hChange = data.pairs[0].priceChange.h24;
        }
      } else {
        console.warn("[MarketService] No pairs found for CHECK");
      }
    } else {
      console.warn("[MarketService] CHECK fetch failed:", checkResponse.status);
    }
  } catch (e) {
    console.error("[MarketService] CHECK fetch error:", e);
  }

  // 3. Mock History based on trend (since APIs are limited)
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

  // 4. Fetch Floor Price
  let floorPrice = 0.142;
  let floorImage = "https://i.seadn.io/s/raw/files/84041d8e6c469f64989635741f22384a.png";

  try {
    const osListingsResponse = await fetch(
      "https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1",
      {
        headers: {
          "x-api-key": OPENSEA_API_KEY,
          "accept": "application/json"
        }
      }
    );

    // Check if OpenSea response is okay before parsing
    if (osListingsResponse.ok) {
      const listingsData = await osListingsResponse.json();
      if (listingsData.listings && listingsData.listings.length > 0) {
        const bestListing = listingsData.listings[0];
        const priceValue = bestListing.price?.current?.value;
        const decimals = bestListing.price?.current?.decimals || 18;

        if (priceValue) {
          floorPrice = parseFloat(priceValue) / Math.pow(10, decimals);
        }
        floorImage = bestListing.item?.metadata?.image_url || bestListing.item?.nft?.image_url || floorImage;
      }
    } else {
      // Fallback to stats if listings fail
      const osStatsResponse = await fetch(
        "https://api.opensea.io/api/v2/collections/anichess-ethernals/stats",
        { headers: { "x-api-key": OPENSEA_API_KEY, "accept": "application/json" } }
      );
      if (osStatsResponse.ok) {
        const statsData = await osStatsResponse.json();
        floorPrice = statsData.total?.floor_price || floorPrice;
      }
    }
  } catch (error) {
    console.error("OpenSea Data Fetch Error:", error);
  }

  const finalResult = {
    ethPrice,
    checkPrice,
    check24hChange,
    ethernalsFloorEth: floorPrice,
    floorNftImage: floorImage,
    checkHistory
  };
  console.log("[MarketService] returning:", finalResult);
  return finalResult;
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
