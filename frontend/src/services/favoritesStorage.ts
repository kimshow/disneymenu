/**
 * お気に入りのlocalStorage操作を管理するサービス
 */

import type { FavoriteItem, FavoritesData, ExportData } from '../types/favorites';

const STORAGE_KEY = 'disney-menu-favorites';
const CURRENT_VERSION = '1.0';
const MAX_FAVORITES = 500; // 最大保存件数

/**
 * localStorageからお気に入りデータを読み込む
 */
export function loadFavorites(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data) as FavoritesData;

    // データの検証
    if (!validateFavoritesData(parsed)) {
      console.warn('Invalid favorites data format, resetting...');
      return [];
    }

    // メニューIDのみを返す
    return parsed.favorites.map(item => item.menuId);
  } catch (error) {
    console.error('Failed to load favorites from localStorage:', error);
    return [];
  }
}

/**
 * localStorageにお気に入りデータを保存
 */
export function saveFavorites(menuIds: string[]): void {
  try {
    // 最大件数チェック
    const trimmedIds = menuIds.slice(-MAX_FAVORITES);

    // FavoritesData形式に変換
    const data: FavoritesData = {
      version: CURRENT_VERSION,
      favorites: trimmedIds.map(menuId => ({
        menuId,
        addedAt: new Date().toISOString(),
      })),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      // ストレージ容量超過の場合
      console.error('localStorage quota exceeded');

      // 古いデータを削除して再試行
      const reducedIds = menuIds.slice(-400);
      try {
        const data: FavoritesData = {
          version: CURRENT_VERSION,
          favorites: reducedIds.map(menuId => ({
            menuId,
            addedAt: new Date().toISOString(),
          })),
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        // ユーザーに通知（呼び出し元でハンドリング）
        throw new Error('QUOTA_EXCEEDED');
      } catch (retryError) {
        console.error('Failed to save favorites even after reducing data:', retryError);
        throw retryError;
      }
    } else {
      console.error('Failed to save favorites to localStorage:', error);
      throw error;
    }
  }
}

/**
 * お気に入りを追加
 */
export function addFavorite(menuId: string): string[] {
  const favorites = loadFavorites();

  // 既に追加済みの場合は何もしない
  if (favorites.includes(menuId)) {
    return favorites;
  }

  // 末尾に追加（最新が最後）
  const updated = [...favorites, menuId];
  saveFavorites(updated);

  return updated;
}

/**
 * お気に入りから削除
 */
export function removeFavorite(menuId: string): string[] {
  const favorites = loadFavorites();
  const updated = favorites.filter(id => id !== menuId);
  saveFavorites(updated);

  return updated;
}

/**
 * お気に入りかどうかをチェック
 */
export function isFavorite(menuId: string): boolean {
  const favorites = loadFavorites();
  return favorites.includes(menuId);
}

/**
 * すべてのお気に入りをクリア
 */
export function clearAllFavorites(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear favorites:', error);
    throw error;
  }
}

/**
 * お気に入りをエクスポート（JSON文字列）
 */
export function exportFavorites(): string {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      // 空の場合もエクスポート可能
      const emptyData: ExportData = {
        version: CURRENT_VERSION,
        exportedAt: new Date().toISOString(),
        favorites: [],
      };
      return JSON.stringify(emptyData, null, 2);
    }

    const parsed = JSON.parse(data) as FavoritesData;

    // ExportData形式に変換
    const exportData: ExportData = {
      version: parsed.version,
      exportedAt: new Date().toISOString(),
      favorites: parsed.favorites,
    };

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Failed to export favorites:', error);
    throw error;
  }
}

/**
 * お気に入りをインポート
 * @returns 成功した場合はtrue、失敗した場合はfalse
 */
export function importFavorites(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString);

    // ExportData形式の検証
    if (!validateExportData(data)) {
      console.error('Invalid export data format');
      return false;
    }

    // FavoritesData形式に変換して保存
    const favoritesData: FavoritesData = {
      version: data.version,
      favorites: data.favorites,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favoritesData));
    return true;
  } catch (error) {
    console.error('Failed to import favorites:', error);
    return false;
  }
}

/**
 * FavoritesDataの型検証
 */
function validateFavoritesData(data: any): data is FavoritesData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.version === 'string' &&
    Array.isArray(data.favorites) &&
    data.favorites.every(
      (item: any) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.menuId === 'string' &&
        typeof item.addedAt === 'string'
    ) &&
    typeof data.updatedAt === 'string'
  );
}

/**
 * ExportDataの型検証
 */
function validateExportData(data: any): data is ExportData {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.version === 'string' &&
    typeof data.exportedAt === 'string' &&
    Array.isArray(data.favorites) &&
    data.favorites.every(
      (item: any) =>
        typeof item === 'object' &&
        item !== null &&
        typeof item.menuId === 'string' &&
        typeof item.addedAt === 'string'
    )
  );
}

/**
 * お気に入り詳細情報を取得（追加日時付き）
 */
export function getFavoriteDetails(): FavoriteItem[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      return [];
    }

    const parsed = JSON.parse(data) as FavoritesData;

    if (!validateFavoritesData(parsed)) {
      return [];
    }

    return parsed.favorites;
  } catch (error) {
    console.error('Failed to get favorite details:', error);
    return [];
  }
}
