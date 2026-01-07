
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
  let ethernalsFloorSpecial = 0;
  let floorNftImage = "https://i.seadn.io/gae/84041d8e6c469f64989635741f22384a?w=500&auto=format"; // Standard fallback

  try {
    // 1. Fetch Collection Info (for reliable Fallback Image)
    // 2. Fetch Stats (for Price)
    // 3. Fetch Listings (for dynamic Item Image)

    const [collectionRes, statsRes, listingsRes] = await Promise.all([
      fetch("/opensea-api/collections/anichess-ethernals", { headers: { "x-api-key": OPENSEA_API_KEY } }),
      fetch("/opensea-api/collections/anichess-ethernals/stats", { headers: { "x-api-key": OPENSEA_API_KEY } }),
      fetch("/opensea-api/listings/collection/anichess-ethernals/all?limit=1&sort_by=price", { headers: { "x-api-key": OPENSEA_API_KEY } })
    ]);

    // A. Process Collection Info (Fallback Image & Contract Address)
    let contractAddress = "0x47392F8d55a305fD1C279093863777d13f181839"; // Default valid address
    if (collectionRes.ok) {
      const colData = await collectionRes.json();
      if (colData.image_url) {
        floorNftImage = colData.image_url;
      }
      // Extract dynamically to be safe
      if (colData.primary_asset_contracts && colData.primary_asset_contracts.length > 0) {
        contractAddress = colData.primary_asset_contracts[0].address;
        console.log("[MarketService] Found Contract Address:", contractAddress);
      }
    }

    // B. Process Stats (Price Source of Truth)
    if (statsRes.ok) {
      const stats = await statsRes.json();
      if (stats.total?.floor_price) {
        ethernalsFloorEth = stats.total.floor_price;
      }
    }

    // C. Process Listings (Preferred Dynamic Image)
    if (listingsRes.ok) {
      const data = await listingsRes.json();
      if (data.listings && data.listings.length > 0) {
        const best = data.listings[0];

        // 1. Try extraction from 'item' field (simplified)
        const meta = best.item?.metadata;
        const nft = best.item?.nft;

        let dynamicImg = meta?.image_preview_url ||
          meta?.image_thumbnail_url ||
          meta?.image_url ||
          nft?.image_preview_url ||
          nft?.image_thumbnail_url ||
          nft?.image_url;

        // 2. If missing, verify Token ID and fetch specific NFT
        if (!dynamicImg) {
          // Seaport structure: protocol_data.parameters.offer[0].identifierOrCriteria is Token ID
          const tokenId = best.protocol_data?.parameters?.offer?.[0]?.identifierOrCriteria;

          if (tokenId && contractAddress) {
            console.log("[MarketService] Image missing in listing, fetching Token ID:", tokenId, "from", contractAddress);
            try {
              const nftRes = await fetch(`/opensea-api/chain/ethereum/contract/${contractAddress}/nfts/${tokenId}`, {
                headers: { "x-api-key": OPENSEA_API_KEY }
              });
              if (nftRes.ok) {
                const nftData = await nftRes.json();
                const n = nftData.nft;
                dynamicImg = n?.image_url || n?.image_preview_url || n?.image_thumbnail_url;
              } else {
                console.warn("[MarketService] Failed to fetch NFT desc:", nftRes.status);
              }
            } catch (err) {
              console.error("Failed to fetch specific NFT image", err);
            }
          }
        }

        if (dynamicImg) {
          floorNftImage = dynamicImg;
        }
      }
    }

  } catch (e) {
    console.error("Floor fetch error", e);
  }

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
