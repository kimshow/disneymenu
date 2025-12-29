import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { MenuItem } from '../../types/menu';
import { ParkChip } from './ParkChip';
import { CategoryChips } from './CategoryChips';
import { AllergenChips } from './AllergenChips';
import { RestaurantItem } from './RestaurantItem';
import { MenuImageGallery } from './MenuImageGallery';

interface MenuDetailModalProps {
  menu: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

export function MenuDetailModal({ menu, open, onClose }: MenuDetailModalProps) {
  if (!menu) return null;

  const parks = [...new Set(menu.restaurants.map(r => r.park))];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="span">
            {menu.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* 画像ギャラリー */}
        <MenuImageGallery images={menu.image_urls} name={menu.name} />

        {/* 基本情報 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            ¥{menu.price.amount.toLocaleString()}
            <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
              / {menu.price.unit}
            </Typography>
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
            {parks.map((park) => (
              <ParkChip key={park} park={park} size="medium" />
            ))}
            {menu.is_seasonal && (
              <Chip label="季節限定" size="medium" color="success" />
            )}
            {!menu.is_available && (
              <Chip label="販売終了" size="medium" color="default" />
            )}
          </Stack>

          {menu.description && (
            <Typography variant="body1" paragraph>
              {menu.description}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* カテゴリー */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            カテゴリー
          </Typography>
          <CategoryChips categories={menu.categories} size="medium" />
        </Box>

        {/* アレルゲン情報 */}
        {menu.allergens && menu.allergens.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                アレルゲン情報
              </Typography>
              <AllergenChips allergens={menu.allergens} size="medium" />
            </Box>
          </>
        )}

        {/* 販売場所 */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6" gutterBottom>
            販売場所 ({menu.restaurants.length}店舗)
          </Typography>
          <Stack spacing={2}>
            {menu.restaurants.map((restaurant) => (
              <RestaurantItem key={restaurant.id} restaurant={restaurant} />
            ))}
          </Stack>
        </Box>

        {/* マップ情報（将来実装） */}
        {menu.map_locations && menu.map_locations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                マップ情報
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ※ マップ表示機能は今後実装予定です
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        <Button
          variant="contained"
          href={menu.source_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          公式ページで見る
        </Button>
      </DialogActions>
    </Dialog>
  );
}
