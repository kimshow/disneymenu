/**
 * お気に入り一覧ページ
 */

import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  DeleteSweep as DeleteSweepIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { MenuCard } from '../components/MenuCard';
import { MenuDetailModal } from '../components/menu/MenuDetailModal';
import type { FavoritesSortOption, SortOrder } from '../types/favorites';
import type { MenuItem as MenuItemType } from '../types/menu';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { favoriteItems, clearAll, count } = useFavorites();
  const [sortBy, setSortBy] = useState<FavoritesSortOption>('addedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // モーダル状態管理
  const [selectedMenu, setSelectedMenu] = useState<MenuItemType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ソート処理（localStorageから直接取得したメニューデータを使用）
  const sortedMenus = useMemo(() => {
    if (favoriteItems.length === 0) return [];

    const menus = favoriteItems.map(item => item.menuData);

    switch (sortBy) {
      case 'name':
        menus.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        break;
      case 'price':
        menus.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'addedAt':
      default:
        // お気に入りの追加順（favoriteItemsの順序を維持）
        // 何もしない（すでに追加順）
        break;
    }

    if (sortOrder === 'desc') {
      menus.reverse();
    }

    return menus;
  }, [favoriteItems, sortBy, sortOrder]);

  // メニューカードクリック時の処理
  const handleCardClick = (menu: MenuItemType) => {
    setSelectedMenu(menu);
    setModalOpen(true);
  };

  // モーダルを閉じる
  const handleModalClose = () => {
    setModalOpen(false);
    // アニメーション完了後にクリア
    setTimeout(() => setSelectedMenu(null), 300);
  };

  // すべてクリア確認
  const handleClearAll = () => {
    if (window.confirm(`すべてのお気に入り（${count}件）を削除しますか？`)) {
      clearAll();
    }
  };

  // 空状態
  if (count === 0) {
    return (
      <Box sx={{
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: { xs: 2, sm: 4 },
        px: { xs: 2, sm: 3 },
      }}>
        <Box sx={{ width: '100%', maxWidth: 'xl', alignSelf: 'flex-start' }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/menus')}
            sx={{ mb: { xs: 2, sm: 3 } }}
            size="small"
          >
            メニュー一覧へ戻る
          </Button>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            textAlign: 'center',
            width: '100%',
            maxWidth: '500px',
          }}
        >
          <FavoriteIcon
            sx={{
              fontSize: { xs: 80, sm: 120 },
              color: 'grey.300',
              mb: { xs: 2, sm: 3 },
            }}
          />
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}
          >
            お気に入りがありません
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: { xs: 3, sm: 4 },
              fontSize: { xs: '0.875rem', sm: '1rem' },
            }}
          >
            メニューのハートアイコンをタップして
            <br />
            お気に入りに追加しましょう！
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/menus')}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              maxWidth: { xs: '300px', sm: 'none' },
            }}
          >
            メニュー一覧へ戻る
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      {/* ヘッダー */}
      <Box sx={{ mb: { xs: 3, sm: 4 } }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/menus')}
          sx={{ mb: 2 }}
          size="small"
        >
          メニュー一覧へ戻る
        </Button>

        <Stack direction="row" alignItems="center" spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 2, sm: 3 } }}>
          <FavoriteIcon color="error" sx={{ fontSize: { xs: 28, sm: 32 } }} />
          <Typography variant="h4" component="h1" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            お気に入り
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            ({count}件)
          </Typography>
        </Stack>

        {/* ソート・操作ボタン */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {/* ソート項目 */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
              <InputLabel>並び替え</InputLabel>
              <Select
                value={sortBy}
                label="並び替え"
                onChange={(e) => setSortBy(e.target.value as FavoritesSortOption)}
              >
                <MenuItem value="addedAt">追加日時</MenuItem>
                <MenuItem value="name">名前</MenuItem>
                <MenuItem value="price">価格</MenuItem>
              </Select>
            </FormControl>

            {/* ソート順 */}
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
              <InputLabel>順序</InputLabel>
              <Select
                value={sortOrder}
                label="順序"
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              >
                <MenuItem value="asc">昇順</MenuItem>
                <MenuItem value="desc">降順</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          {/* すべてクリアボタン */}
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteSweepIcon />}
            onClick={handleClearAll}
            sx={{
              width: { xs: '100%', sm: 'auto' },
              minWidth: { sm: 150 }
            }}
          >
            すべてクリア
          </Button>
        </Stack>
      </Box>

      {/* メニュー一覧 */}
      <Box
        data-testid="favorites-grid-container"
        sx={{
          mt: 2,
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(5, 1fr)',
          },
          gap: { xs: 2, sm: 3 },
        }}
      >
        {sortedMenus.map((menu) => (
          <MenuCard key={menu.id} menu={menu} onClick={() => handleCardClick(menu)} />
        ))}
      </Box>

      {/* メニュー詳細モーダル */}
      <MenuDetailModal
        menu={selectedMenu}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </Container>
  );
}
