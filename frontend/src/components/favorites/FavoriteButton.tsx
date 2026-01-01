/**
 * お気に入りボタンコンポーネント
 */

import { memo } from 'react';
import { IconButton, Tooltip, Zoom } from '@mui/material';
import { Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon } from '@mui/icons-material';
import { useFavorites } from '../../hooks/useFavorites';

interface FavoriteButtonProps {
  /** メニューID */
  menuId: string;
  /** ボタンサイズ */
  size?: 'small' | 'medium' | 'large';
  /** アイコンのフォントサイズ */
  fontSize?: 'small' | 'medium' | 'large';
  /** カラー */
  color?: 'default' | 'primary' | 'secondary' | 'error';
  /** クリック時のコールバック（オプション） */
  onClick?: () => void;
}

/**
 * お気に入りボタンコンポーネント
 * 
 * @example
 * ```tsx
 * <FavoriteButton menuId="0123" size="medium" />
 * ```
 */
export const FavoriteButton = memo<FavoriteButtonProps>(({
  menuId,
  size = 'medium',
  fontSize = 'medium',
  color = 'error',
  onClick,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(menuId);

  const handleClick = (event: React.MouseEvent) => {
    // イベントの伝播を止める（親要素のクリックイベントを発火させない）
    event.stopPropagation();
    event.preventDefault();
    
    toggleFavorite(menuId);
    onClick?.();
  };

  return (
    <Tooltip 
      title={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
      TransitionComponent={Zoom}
      arrow
    >
      <IconButton
        onClick={handleClick}
        size={size}
        color={favorite ? color : 'default'}
        sx={{
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.1)',
          },
          '&:active': {
            transform: 'scale(0.95)',
          },
        }}
        aria-label={favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        data-testid={`favorite-button-${menuId}`}
      >
        {favorite ? (
          <FavoriteIcon 
            fontSize={fontSize} 
            data-testid="favorite-filled"
            sx={{
              animation: 'heartBeat 0.3s ease-in-out',
              '@keyframes heartBeat': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.3)' },
                '100%': { transform: 'scale(1)' },
              },
            }}
          />
        ) : (
          <FavoriteBorderIcon 
            fontSize={fontSize}
            data-testid="favorite-outline"
          />
        )}
      </IconButton>
    </Tooltip>
  );
});

FavoriteButton.displayName = 'FavoriteButton';
