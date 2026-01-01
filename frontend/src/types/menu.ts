/**
 * Disney Menu API Type Definitions
 */

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: PriceInfo;
  image_urls: string[];  // バックエンドモデルに合わせて修正
  thumbnail_url?: string;  // サムネイル画像URL
  restaurants: Restaurant[];
  categories: string[];
  tags: string[];
  keywords?: string[];
  characters?: string[];  // 関連キャラクター
  allergens?: string[];  // アレルゲン情報
  source_url: string;
  scraped_at: string;
  is_seasonal: boolean;  // 季節限定フラグ
  is_new: boolean;  // 新商品フラグ
  is_available: boolean;  // 販売中フラグ
  map_locations?: MapLocation[];  // マップ位置情報
}

export interface Restaurant {
  id: string;
  name: string;
  park: "tdl" | "tds";
  area: string;
  url: string;
  service_types?: string[];  // サービスタイプ
  availability?: AvailabilityPeriod;
}

export interface PriceInfo {
  amount: number;
  unit: string;
  tax_included?: boolean;  // 税込価格フラグ
}

export interface AvailabilityPeriod {
  start_date?: string;
  end_date?: string;
}

export interface MenuFilters {
  q?: string;
  restaurant?: string;  // レストラン名
  tags?: string | string[];  // タグ（文字列配列対応）
  categories?: string | string[];  // カテゴリ（文字列配列対応）
  min_price?: number;
  max_price?: number;
  park?: "tdl" | "tds";
  area?: string;
  character?: string;
  only_available?: boolean;
  sort?: 'price' | 'name' | 'scraped_at';  // ソート項目
  order?: 'asc' | 'desc';  // ソート順
  page?: number;
  limit?: number;
}

export interface SortOption {
  value: 'price' | 'name' | 'scraped_at';
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'scraped_at', label: '新着順' },
  { value: 'price', label: '価格順' },
  { value: 'name', label: '名前順' },
];

export interface MenuListResponse {
  success: boolean;
  data: MenuItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface MenuResponse {
  success: boolean;
  data: MenuItem;
}

export interface ListResponse<T> {
  success: boolean;
  data: T[];
}

export interface StatsData {
  total_menus: number;
  available_menus: number;
  total_tags: number;
  total_categories: number;
  total_restaurants: number;
  min_price?: number;
  max_price?: number;
  avg_price?: number;
  last_updated?: string;
}

export interface StatsResponse {
  success: boolean;
  data: StatsData;
}

/**
 * マップ位置情報
 */
export interface MapLocation {
  restaurant_id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  floor?: string;
  zone?: string;
  map_url?: string;
}
