/**
 * Disney Menu API Type Definitions
 */

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: PriceInfo;
  image_urls: string[];
  thumbnail_url?: string;
  restaurants: Restaurant[];
  categories: string[];
  tags: string[];
  characters: string[];
  allergens: string[];
  nutritional_info?: Record<string, unknown>;
  source_url: string;
  scraped_at: string;
  last_updated?: string;
  is_seasonal: boolean;
  is_new: boolean;
  is_available: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  park: "tdl" | "tds";
  area: string;
  url: string;
  service_types: string[];
  availability?: AvailabilityPeriod;
}

export interface PriceInfo {
  amount: number;
  unit: string;
  tax_included: boolean;
}

export interface AvailabilityPeriod {
  start_date?: string;
  end_date?: string;
}

export interface MenuFilters {
  q?: string;
  tags?: string;
  categories?: string;
  min_price?: number;
  max_price?: number;
  park?: "tdl" | "tds";
  area?: string;
  character?: string;
  only_available?: boolean;
  page?: number;
  limit?: number;
}

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
