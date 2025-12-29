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
    const response = await apiClient.get<MenuListResponse>('/menus', {
      params: filters,
    });
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
