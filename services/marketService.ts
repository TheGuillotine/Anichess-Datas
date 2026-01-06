
const OPENSEA_API_KEY = "b4503581c4a44ecb94b1b0fb34889e40";

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
  try {
    // 1. Fetch current ETH and $CHECK prices with 24h change
    const cgResponse = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum,anichess&vs_currencies=usd&include_24hr_change=true"
    );
    const cgData = await cgResponse.json();
    const ethPrice = cgData.ethereum?.usd || 2400;
    const checkPrice = cgData.anichess?.usd || 0.892;
    const check24hChange = cgData.anichess?.usd_24h_change || 0;

    // 2. Fetch $CHECK 7-day history for the sparkline
    let checkHistory: { date: string; value: number }[] = [];
    try {
      const cgHistoryResponse = await fetch(
        "https://api.coingecko.com/api/v3/coins/anichess/market_chart?vs_currency=usd&days=7&interval=daily"
      );
      const cgHistoryData = await cgHistoryResponse.json();
      if (cgHistoryData.prices && cgHistoryData.prices.length > 0) {
        checkHistory = cgHistoryData.prices.map((p: [number, number]) => ({
          date: new Date(p[0]).toISOString(),
          value: p[1]
        }));
      }
    } catch (e) {
      console.warn("History fetch failed, using fallback");
    }

    // Fallback if history is empty (API rate limit or error)
    if (checkHistory.length === 0) {
      const base = checkPrice;
      checkHistory = Array(7).fill(0).map((_, i) => ({
        date: i.toString(),
        value: base * (0.95 + Math.random() * 0.1)
      }));
    }

    // 3. Fetch the lowest active listing to get the floor price and actual floor NFT image
    const osListingsResponse = await fetch(
      "https://api.opensea.io/api/v2/listings/collection/anichess-ethernals/all?limit=1",
      {
        headers: {
          "x-api-key": OPENSEA_API_KEY,
          "accept": "application/json"
        }
      }
    );
    const listingsData = await osListingsResponse.json();
    
    let floorPrice = 0.142;
    let floorImage = "https://i.seadn.io/s/raw/files/84041d8e6c469f64989635741f22384a.png";

    if (listingsData.listings && listingsData.listings.length > 0) {
      const bestListing = listingsData.listings[0];
      const priceValue = bestListing.price?.current?.value;
      const decimals = bestListing.price?.current?.decimals || 18;
      
      if (priceValue) {
        floorPrice = parseFloat(priceValue) / Math.pow(10, decimals);
      }
      floorImage = bestListing.item?.metadata?.image_url || bestListing.item?.nft?.image_url || floorImage;
    } else {
      const osStatsResponse = await fetch(
        "https://api.opensea.io/api/v2/collections/anichess-ethernals/stats",
        {
          headers: {
            "x-api-key": OPENSEA_API_KEY,
            "accept": "application/json"
          }
        }
      );
      const statsData = await osStatsResponse.json();
      floorPrice = statsData.total?.floor_price || floorPrice;
    }

    return {
      ethPrice,
      checkPrice,
      check24hChange,
      ethernalsFloorEth: floorPrice,
      floorNftImage: floorImage,
      checkHistory
    };
  } catch (error) {
    console.error("Market Data Fetch Error:", error);
    return {
      ethPrice: 2400,
      checkPrice: 0.892,
      check24hChange: 0,
      ethernalsFloorEth: 0.142,
      floorNftImage: "https://i.seadn.io/s/raw/files/84041d8e6c469f64989635741f22384a.png",
      checkHistory: Array(7).fill(0).map((_, i) => ({ 
        date: i.toString(), 
        value: 0.892 * (0.95 + Math.random() * 0.1) 
      }))
    };
  }
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
