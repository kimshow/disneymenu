import { memo } from 'react';
import { Box, Drawer, IconButton, Typography, Divider, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { RestaurantFilter } from './RestaurantFilter';
import { PriceRangeFilter } from './PriceRangeFilter';
import { ParkFilter } from './ParkFilter';
import { CategoryFilter } from './CategoryFilter';
import { TagFilterGrouped } from './TagFilterGrouped';
import { AvailabilityFilter } from './AvailabilityFilter';

interface FilterPanelProps {
  open: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

/**
 * フィルターパネルコンポーネント
 *
 * デスクトップ: サイドバー形式（左側固定）
 * モバイル: Drawer形式（一時的表示）
 *
 * @param open - パネルの開閉状態
 * @param onClose - パネルを閉じる時のコールバック
 * @param isMobile - モバイル表示かどうか
 */
export const FilterPanel = memo<FilterPanelProps>(({ open, onClose, isMobile: isMobileProp }) => {
  const theme = useTheme();
  const isMobile = isMobileProp ?? useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();

  // 選択されているパークを取得
  const selectedPark = searchParams.get('park') || '';

  // グループ化タグAPIを呼び出し（パークでフィルタリング）
  const { data: groupedTags, isLoading: isLoadingTags } = useQuery({
    queryKey: ['groupedTags', selectedPark],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedPark) {
        params.set('park', selectedPark);
      }
      const response = await axios.get(`http://localhost:8000/api/tags/grouped?${params.toString()}`);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10分間キャッシュ
  });

  const content = (
    <Box sx={{ p: 2, width: isMobile ? 320 : 280, height: '100%', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          フィルター
        </Typography>
        {isMobile && (
          <IconButton onClick={onClose} aria-label="フィルターを閉じる" edge="end">
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 価格範囲フィルター */}
      <Box sx={{ mb: 3 }}>
        <PriceRangeFilter />
      </Box>

      {/* パークフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          パーク
        </Typography>
        <ParkFilter />
      </Box>

      {/* カテゴリフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          カテゴリ
        </Typography>
        <CategoryFilter />
      </Box>

      {/* レストランフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
          レストラン
        </Typography>
        <RestaurantFilter />
      </Box>

      {/* タグフィルター（グループ化） */}
      <Box sx={{ mb: 3 }}>
        {isLoadingTags ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : groupedTags ? (
          <TagFilterGrouped groupedTags={groupedTags} />
        ) : null}
      </Box>

      {/* 販売状況フィルター */}
      <Box sx={{ mb: 3 }}>
        <AvailabilityFilter />
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 320,
          },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: open ? 280 : 0,
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        overflow: 'hidden',
        borderRight: open ? `1px solid ${theme.palette.divider}` : 'none',
        flexShrink: 0,
      }}
    >
      {open && content}
    </Box>
  );
});
