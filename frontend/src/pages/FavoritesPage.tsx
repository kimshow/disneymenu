/**
 * お気に入り一覧ページ
 */

import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid2,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Favorite as FavoriteIcon,
  DeleteSweep as DeleteSweepIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useMenus } from '../hooks/useMenus';
import { MenuCard } from '../components/MenuCard';
import type { FavoritesSortOption, SortOrder } from '../types/favorites';

export function FavoritesPage() {
  const navigate = useNavigate();
  const { favorites, clearAll, count } = useFavorites();
  const [sortBy, setSortBy] = useState<FavoritesSortOption>('addedAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // お気に入りのメニューIDを使ってメニューデータを取得
  const { data, isLoading, isError } = useMenus({
    ids: favorites.join(','),
  });

  // ソート処理
  const sortedMenus = useMemo(() => {
    if (!data?.data) return [];

    const menus = [...data.data];

    switch (sortBy) {
      case 'name':
        menus.sort((a, b) => a.name.localeCompare(b.name, 'ja'));
        break;
      case 'price':
        menus.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'addedAt':
      default:
        // お気に入りの追加順（favoritesの順序を維持）
        menus.sort((a, b) => {
          const indexA = favorites.indexOf(a.id);
          const indexB = favorites.indexOf(b.id);
          return indexA - indexB;
        });
        break;
    }

    if (sortOrder === 'desc') {
      menus.reverse();
    }

    return menus;
  }, [data, sortBy, sortOrder, favorites]);

  // すべてクリア確認
  const handleClearAll = () => {
    if (window.confirm(`すべてのお気に入り（${count}件）を削除しますか？`)) {
      clearAll();
    }
  };

  // 空状態
  if (count === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/menus')}
          sx={{ mb: 3 }}
        >
          メニュー一覧へ戻る
        </Button>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            textAlign: 'center',
          }}
        >
          <FavoriteIcon
            sx={{
              fontSize: 120,
              color: 'grey.300',
              mb: 3,
            }}
          />
          <Typography variant="h4" gutterBottom>
            お気に入りがありません
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            メニューのハートアイコンをタップして
            <br />
            お気に入りに追加しましょう！
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/menus')}
          >
            メニュー一覧へ戻る
          </Button>
        </Box>
      </Container>
    );
  }

  // ローディング状態
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // エラー状態
  if (isError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          お気に入りメニューの読み込みに失敗しました。
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/menus')}
          sx={{ mt: 2 }}
        >
          メニュー一覧へ戻る
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/menus')}
          sx={{ mb: 2 }}
        >
          メニュー一覧へ戻る
        </Button>

        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <FavoriteIcon color="error" sx={{ fontSize: 32 }} />
          <Typography variant="h4" component="h1">
            お気に入り
          </Typography>
          <Typography variant="h6" color="text.secondary">
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
          <Stack direction="row" spacing={2}>
            {/* ソート項目 */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
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
            <FormControl size="small" sx={{ minWidth: 120 }}>
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
          >
            すべてクリア
          </Button>
        </Stack>
      </Box>

      {/* メニュー一覧 */}
      <Grid2 container spacing={3}>
        {sortedMenus.map((menu) => (
          <Grid2 key={menu.id} size={{ xs: 12, sm: 6, md: 4 }}>
            <MenuCard menu={menu} />
          </Grid2>
        ))}
      </Grid2>
    </Container>
  );
}
