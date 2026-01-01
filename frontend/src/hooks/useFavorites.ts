/**
 * お気に入り機能のカスタムフック
 */

import { useContext } from 'react';
import { FavoritesContext } from '../contexts/FavoritesContext';

/**
 * お気に入り機能を使用するためのカスタムフック
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { favorites, addFavorite, isFavorite, count } = useFavorites();
 *   
 *   return (
 *     <div>
 *       <p>お気に入り: {count}件</p>
 *       <button onClick={() => addFavorite('0123')}>
 *         お気に入りに追加
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useFavorites() {
  const context = useContext(FavoritesContext);
  
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  
  return context;
}
