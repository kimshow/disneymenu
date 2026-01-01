/**
 * Custom hooks for menu data fetching with React Query
 */
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { menuAPI } from '../services/api';
import type {
  MenuItem,
  MenuFilters,
  MenuListResponse,
  Restaurant,
  StatsData,
} from '../types/menu';

/**
 * メニュー一覧を取得するフック
 */
export function useMenus(
  filters?: MenuFilters
): UseQueryResult<MenuListResponse> {
  return useQuery({
    queryKey: ['menus', filters],
    queryFn: () => menuAPI.getMenus(filters),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
  });
}

/**
 * 特定のメニューを取得するフック
 */
export function useMenu(id: string): UseQueryResult<MenuItem> {
  return useQuery({
    queryKey: ['menu', id],
    queryFn: () => menuAPI.getMenu(id),
    enabled: !!id, // idがある場合のみ実行
    staleTime: 10 * 60 * 1000, // 10分間キャッシュ
  });
}

/**
 * レストラン一覧を取得するフック
 */
export function useRestaurants(
  park?: 'tdl' | 'tds'
): UseQueryResult<Restaurant[]> {
  return useQuery({
    queryKey: ['restaurants', park],
    queryFn: () => menuAPI.getRestaurants(park),
    staleTime: 30 * 60 * 1000, // 30分間キャッシュ
  });
}

/**
 * タグ一覧を取得するフック
 */
export function useTags(): UseQueryResult<string[]> {
  return useQuery({
    queryKey: ['tags'],
    queryFn: () => menuAPI.getTags(),
    staleTime: 60 * 60 * 1000, // 1時間キャッシュ
  });
}

/**
 * カテゴリ一覧を取得するフック
 */
export function useCategories(): UseQueryResult<string[]> {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => menuAPI.getCategories(),
    staleTime: 60 * 60 * 1000, // 1時間キャッシュ
  });
}

/**
 * 統計情報を取得するフック
 */
export function useStats(): UseQueryResult<StatsData> {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => menuAPI.getStats(),
    staleTime: 15 * 60 * 1000, // 15分間キャッシュ
  });
}
