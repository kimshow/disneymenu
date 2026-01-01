/**
 * Disney Menu API Client
 */
import axios from 'axios';
import type {
  MenuItem,
  Restaurant,
  MenuFilters,
  MenuListResponse,
  MenuResponse,
  ListResponse,
  StatsResponse,
} from '../types/menu';

// API Base URL (開発環境・本番環境ともにプロキシ経由で統一)
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => {
    // 成功時のログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log('API Success:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // 詳細なエラーログ
    if (error.response) {
      // サーバーがエラーレスポンスを返した場合
      console.error('API Error Response:', {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      // リクエストは送信されたが、レスポンスがない場合（バックエンド停止など）
      console.error('API No Response:', {
        url: error.config?.url,
        message: 'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。',
      });
    } else {
      // リクエスト設定時のエラー
      console.error('API Request Setup Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export const menuAPI = {
  /**
   * メニュー一覧を取得
   */
  getMenus: async (filters?: MenuFilters): Promise<MenuListResponse> => {
    // パラメータを明示的に構築
    const params: Record<string, any> = {
      page: filters?.page ?? 1,
      limit: filters?.limit ?? 50,
      only_available: filters?.only_available ?? false,
    };

    // オプショナルなパラメータを追加
    if (filters?.q) params.q = filters.q;
    if (filters?.restaurant) params.restaurant = filters.restaurant;
    if (filters?.tags) {
      // 配列の場合はカンマ区切りに変換
      params.tags = Array.isArray(filters.tags) ? filters.tags.join(',') : filters.tags;
    }
    if (filters?.categories) {
      // 配列の場合はカンマ区切りに変換
      params.categories = Array.isArray(filters.categories) ? filters.categories.join(',') : filters.categories;
    }
    if (filters?.min_price !== undefined) params.min_price = filters.min_price;
    if (filters?.max_price !== undefined) params.max_price = filters.max_price;
    if (filters?.park) params.park = filters.park;
    if (filters?.area) params.area = filters.area;
    if (filters?.character) params.character = filters.character;
    if (filters?.sort) params.sort = filters.sort;
    if (filters?.order) params.order = filters.order;

    // デバッグログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log('[API] getMenus request params:', params);
    }

    const response = await apiClient.get<MenuListResponse>('/menus', { params });

    // デバッグログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log('[API] getMenus response:', {
        total: response.data.meta?.total,
        page: response.data.meta?.page,
        count: response.data.data?.length,
      });
    }

    return response.data;
  },

  /**
   * 特定のメニューを取得
   */
  getMenu: async (id: string): Promise<MenuItem> => {
    const response = await apiClient.get<MenuResponse>(`/menus/${id}`);
    return response.data.data;
  },

  /**
   * レストラン一覧を取得
   */
  getRestaurants: async (park?: 'tdl' | 'tds'): Promise<Restaurant[]> => {
    const response = await apiClient.get<ListResponse<Restaurant>>('/restaurants', {
      params: park ? { park } : undefined,
    });
    return response.data.data;
  },

  /**
   * タグ一覧を取得
   */
  getTags: async (): Promise<string[]> => {
    const response = await apiClient.get<ListResponse<string>>('/tags');
    return response.data.data;
  },

  /**
   * カテゴリ一覧を取得
   */
  getCategories: async (): Promise<string[]> => {
    const response = await apiClient.get<ListResponse<string>>('/categories');
    return response.data.data;
  },

  /**
   * 統計情報を取得
   */
  getStats: async () => {
    const response = await apiClient.get<StatsResponse>('/stats');
    return response.data.data;
  },
};

export default menuAPI;
