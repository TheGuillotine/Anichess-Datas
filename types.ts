
export interface TokenAsset {
  symbol: string;
  name: string;
  balance: number;
  priceUsd: number;
  change24h: number;
  icon: string;
}

export interface NFTAsset {
  id: string;
  name: string;
  collection: string;
  image: string;
  rarity?: string;
}

export interface WatchedCollection {
  name: string;
  url: string;
  floorPrice?: string;
  volume?: string;
  description?: string;
  lastUpdated?: string;
}

export interface PortfolioData {
  address: string;
  tokens: TokenAsset[];
  nfts: NFTAsset[];
  watchedCollections: WatchedCollection[];
  totalValueUsd: number;
  history: { date: string; value: number }[];
}

export interface AIInsight {
  title: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
}
