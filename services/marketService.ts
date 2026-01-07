
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
  image?: string;
}

// ... (fetchEthAndCheckPrice remains unchanged)

// Separate fetcher for Floor Price (Slower due to OpenSea)
export const fetchFloorPrice = async () => {
  console.log("[MarketService] Fetching Floor Price...");
  let ethernalsFloorEth = 0.142;
  let floorNftImage = "https://i.seadn.io/s/raw/files/84041d8e6c469f64989635741f22384a.png";

  try {
    // 1. Try to get real-time floor from listings (for best price accuracy)
    const osListingsResponse = await fetch(
      "https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1&sort_by=price",
      { headers: { "x-api-key": OPENSEA_API_KEY, "accept": "application/json" } }
    );

    if (osListingsResponse.ok) {
      const listingsData = await osListingsResponse.json();
      if (listingsData.listings?.[0]) {
        const best = listingsData.listings[0];
        const val = best.price?.current?.value;
        const dec = best.price?.current?.decimals || 18;
        if (val) ethernalsFloorEth = parseFloat(val) / Math.pow(10, dec);

        // Optimize Image: Prefer Preview > Thumbnail > Original
        const meta = best.item?.metadata;
        const nft = best.item?.nft;
        floorNftImage = meta?.image_preview_url || meta?.image_thumbnail_url || meta?.image_url ||
          nft?.image_preview_url || nft?.image_thumbnail_url || nft?.image_url || floorNftImage;
      }
    } else {
      // 2. Fallback to stats if listings fail
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

// ... (fetchMarketData remains unchanged or is just the composition)

export const fetchMarketActivity = async (): Promise<MarketEvent[]> => {
  try {
    const response = await fetch(
      "https://api.opensea.io/api/v2/events/collection/anichess-ethernals?event_type=sale&event_type=listing&limit=10",
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
