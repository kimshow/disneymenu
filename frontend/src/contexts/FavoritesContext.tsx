/**
 * お気に入り機能のContextとProvider
 */

import { createContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { FavoritesContextType, FavoriteItem } from '../types/favorites';
import type { MenuItem } from '../types/menu';
import * as favoritesStorage from '../services/favoritesStorage';

export const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

/**
 * お気に入り機能を提供するProvider
 */
export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoriteItems, setFavoriteItems] = useState<FavoriteItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初期化: localStorageから読み込み
  useEffect(() => {
    try {
      const loadedItems = favoritesStorage.loadFavoriteItems();
      setFavoriteItems(loadedItems);
      setFavorites(loadedItems.map(item => item.menuId));
      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize favorites:', error);
      setFavorites([]);
      setFavoriteItems([]);
      setIsInitialized(true);
    }
  }, []);

  // お気に入りに追加
  const addFavorite = useCallback((menuId: string, menuData: MenuItem) => {
    try {
      const updated = favoritesStorage.addFavorite(menuId, menuData);
      setFavorites(updated);

      // アイテムも更新
      const updatedItems = favoritesStorage.loadFavoriteItems();
      setFavoriteItems(updatedItems);
    } catch (error) {
      console.error('Failed to add favorite:', error);

      // QUOTA_EXCEEDEDエラーの場合は通知
      if (error instanceof Error && error.message === 'QUOTA_EXCEEDED') {
        // TODO: ユーザーに通知を表示（Snackbar等）
        alert('お気に入りの保存容量が上限に達しました。古いデータを削除しました。');
      }
    }
  }, []);

  // お気に入りから削除
  const removeFavorite = useCallback((menuId: string) => {
    try {
      const updated = favoritesStorage.removeFavorite(menuId);
      setFavorites(updated);

      // アイテムも更新
      const updatedItems = favoritesStorage.loadFavoriteItems();
      setFavoriteItems(updatedItems);
    } catch (error) {
      console.error('Failed to remove favorite:', error);
    }
  }, []);

  // お気に入りのトグル
  const toggleFavorite = useCallback((menuId: string, menuData: MenuItem) => {
    if (favoritesStorage.isFavorite(menuId)) {
      removeFavorite(menuId);
    } else {
      addFavorite(menuId, menuData);
    }
  }, [addFavorite, removeFavorite]);

  // お気に入りかどうかを判定
  const isFavorite = useCallback((menuId: string): boolean => {
    return favorites.includes(menuId);
  }, [favorites]);

  // すべてのお気に入りをクリア
  const clearAll = useCallback(() => {
    try {
      favoritesStorage.clearAllFavorites();
      setFavorites([]);
      setFavoriteItems([]);
    } catch (error) {
      console.error('Failed to clear favorites:', error);
    }
  }, []);

  // お気に入りをエクスポート
  const exportFavorites = useCallback((): string => {
    try {
      return favoritesStorage.exportFavorites();
    } catch (error) {
      console.error('Failed to export favorites:', error);
      throw error;
    }
  }, []);

  // お気に入りをインポート
  const importFavorites = useCallback((data: string): boolean => {
    try {
      const success = favoritesStorage.importFavorites(data);
      if (success) {
        // インポート成功後、再読み込み
        const loadedItems = favoritesStorage.loadFavoriteItems();
        setFavoriteItems(loadedItems);
        setFavorites(loadedItems.map(item => item.menuId));
      }
      return success;
    } catch (error) {
      console.error('Failed to import favorites:', error);
      return false;
    }
  }, []);

  const value: FavoritesContextType = {
    favorites,
    favoriteItems,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearAll,
    exportFavorites,
    importFavorites,
    count: favorites.length,
  };

  // 初期化が完了するまで何も表示しない（ちらつき防止）
  if (!isInitialized) {
    return null;
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}
