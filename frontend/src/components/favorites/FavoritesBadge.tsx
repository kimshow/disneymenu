/**
 * お気に入り数バッジコンポーネント
 */

import { memo } from 'react';
import { Badge, Tooltip } from '@mui/material';
import { Favorite as FavoriteIcon } from '@mui/icons-material';
import { useFavorites } from '../../hooks/useFavorites';

interface FavoritesBadgeProps {
  /** アイコンのフォントサイズ */
  fontSize?: 'small' | 'medium' | 'large';
  /** バッジの色 */
  color?: 'default' | 'primary' | 'secondary' | 'error';
  /** 最大表示数（これを超えると「{max}+」表示） */
  max?: number;
}

/**
 * お気に入り数を表示するバッジコンポーネント
 *
 * @example
 * ```tsx
 * <FavoritesBadge fontSize="medium" color="error" max={99} />
 * ```
 */
export const FavoritesBadge = memo<FavoritesBadgeProps>(({
  fontSize = 'medium',
  color = 'error',
  max = 99,
}) => {
  const { count } = useFavorites();

  return (
    <Tooltip title={`お気に入り: ${count}件`}>
      <Badge
        badgeContent={count}
        color={color}
        max={max}
        showZero={false}
        sx={{
          '& .MuiBadge-badge': {
            fontSize: '0.7rem',
            fontWeight: 'bold',
          },
        }}
      >
        <FavoriteIcon
          fontSize={fontSize}
          sx={{
            color: count > 0 ? 'error.main' : 'action.disabled',
            transition: 'color 0.2s ease-in-out',
          }}
        />
      </Badge>
    </Tooltip>
  );
});

FavoritesBadge.displayName = 'FavoritesBadge';
