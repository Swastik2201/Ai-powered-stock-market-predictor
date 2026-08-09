export type AssetType = 'stock' | 'etf' | 'mutual_fund' | 'index' | 'commodity' | 'ipo';

export interface AssetItem {
  symbol: string;
  name: string;
  asset_type: AssetType;
  category?: string;
  current_price: number;
  day_change_pct: number;
}

export type MainTab = 'indices' | 'equities' | 'mutual_funds' | 'commodities' | 'ipos';

export interface SearchFilter {
  query?: string;
  assetType?: AssetType;
  category?: string;
}
