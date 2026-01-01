/**
 * お気に入り機能の型定義
 */

/**
 * お気に入りアイテム
 */
export interface FavoriteItem {
  /** メニューID */
  menuId: string;
  /** お気に入りに追加した日時（ISO 8601形式） */
  addedAt: string;
}

/**
 * お気に入りストレージデータ
 */
export interface FavoritesData {
  /** データフォーマットのバージョン */
  version: string;
  /** お気に入りアイテムの配列 */
  favorites: FavoriteItem[];
  /** 最終更新日時（ISO 8601形式） */
  updatedAt: string;
}

/**
 * お気に入りコンテキストの型定義
 */
export interface FavoritesContextType {
  /** お気に入りメニューIDの配列 */
  favorites: string[];
  /** お気に入りに追加 */
  addFavorite: (menuId: string) => void;
  /** お気に入りから削除 */
  removeFavorite: (menuId: string) => void;
  /** お気に入りのトグル（追加/削除を切り替え） */
  toggleFavorite: (menuId: string) => void;
  /** お気に入りかどうかを判定 */
  isFavorite: (menuId: string) => boolean;
  /** すべてのお気に入りをクリア */
  clearAll: () => void;
  /** お気に入りをJSONでエクスポート */
  exportFavorites: () => string;
  /** お気に入りをJSONからインポート */
  importFavorites: (data: string) => boolean;
  /** お気に入りの件数 */
  count: number;
}

/**
 * エクスポートデータの型定義
 */
export interface ExportData {
  /** データフォーマットのバージョン */
  version: string;
  /** エクスポート日時（ISO 8601形式） */
  exportedAt: string;
  /** お気に入りアイテムの配列 */
  favorites: FavoriteItem[];
}

/**
 * ソートオプション
 */
export type FavoritesSortOption = 'addedAt' | 'name' | 'price';

/**
 * ソート順
 */
export type SortOrder = 'asc' | 'desc';
