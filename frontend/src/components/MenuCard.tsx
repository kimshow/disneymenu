/**
 * メニューカードコンポーネント
 */
import { memo } from 'react';
import { Card, CardContent, CardMedia, Typography, Chip, Box, Stack } from '@mui/material';
import type { MenuItem } from '../types/menu';
import { ParkChip } from './menu/ParkChip';
import { CategoryChips } from './menu/CategoryChips';
import { RestaurantList } from './menu/RestaurantList';

interface MenuCardProps {
  menu: MenuItem;
  onClick?: () => void;
}

export const MenuCard = memo<MenuCardProps>(({ menu, onClick }) => {
  // thumbnail_urlまたはimage_urlsの最初の画像を取得
  const imageUrl = menu.thumbnail_url || menu.image_urls?.[0];
  // ユニークなパークを取得
  const parks = [...new Set(menu.restaurants.map(r => r.park))];

  return (
    <Card
      data-testid="menu-card"
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
        position: 'relative',
      }}
    >
      {/* 販売状況バッジ */}
      {!menu.is_available && (
        <Chip
          label="販売終了"
          size="small"
          color="default"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        />
      )}

      {menu.is_seasonal && (
        <Chip
          label="季節限定"
          size="small"
          color="success"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
          }}
        />
      )}

      {/* 画像 */}
      {imageUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={menu.name}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            画像なし
          </Typography>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* メニュー名 */}
        <Typography variant="h6" component="h2" gutterBottom>
          {menu.name}
        </Typography>

        {/* 価格 */}
        <Typography variant="h5" color="primary" gutterBottom>
          ¥{menu.price.amount.toLocaleString()}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            / {menu.price.unit}
          </Typography>
        </Typography>

        {/* パークタグ */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 1 }} flexWrap="wrap">
          {parks.map((park) => (
            <ParkChip key={park} park={park} />
          ))}
        </Stack>

        {/* カテゴリータグ */}
        <Box sx={{ mb: 1 }}>
          <CategoryChips categories={menu.categories} />
        </Box>

        {/* レストランリスト */}
        <Box sx={{ mt: 'auto' }}>
          <RestaurantList restaurants={menu.restaurants} />
        </Box>
      </CardContent>
    </Card>
  );
}, (prevProps, nextProps) => {
  // menu.idが同じ場合は再レンダリングをスキップ
  return prevProps.menu.id === nextProps.menu.id && prevProps.onClick === nextProps.onClick;
});
