/**
 * メニュー一覧ページ
 */
import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Pagination,
  Fab,
  IconButton,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useMenus } from '../hooks/useMenus';
import { MenuCard } from '../components/MenuCard';
import { MenuDetailModal } from '../components/menu/MenuDetailModal';
import { SearchBar } from '../components/search/SearchBar';
import { FilterPanel } from '../components/filters/FilterPanel';
import { SortControl } from '../components/sort/SortControl';
import { AppliedFilters } from '../components/filters/AppliedFilters';
import { FavoritesBadge } from '../components/favorites/FavoritesBadge';
import type { MenuFilters, MenuItem } from '../types/menu';

export function MenuListPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // URLからパラメータを読み取り
  const qParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');

  const [page, setPage] = useState(pageParam);
  const [filterOpen, setFilterOpen] = useState(!isMobile); // デスクトップはデフォルトで開く

  // フィルター構築
  const filters: MenuFilters = {
    q: qParam || undefined,
    park: searchParams.get('park') as 'tdl' | 'tds' | undefined,
    restaurant: searchParams.get('restaurant') || undefined,
    categories: searchParams.get('categories')?.split(',').filter(Boolean),
    tags: searchParams.get('tags')?.split(',').filter(Boolean),
    min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
    only_available: searchParams.get('only_available') === 'true',
    sort: searchParams.get('sort') as 'price' | 'name' | 'scraped_at' | undefined,
    order: searchParams.get('order') as 'asc' | 'desc' | undefined,
    page,
    limit: 12,
  };

  // モーダル状態管理
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useMenus(filters);

  // URLパラメータが変更されたらページを同期
  useEffect(() => {
    const newPageParam = parseInt(searchParams.get('page') || '1');
    if (newPageParam !== page) {
      setPage(newPageParam);
    }
  }, [searchParams]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    const params = new URLSearchParams(searchParams);
    if (value > 1) {
      params.set('page', value.toString());
    } else {
      params.delete('page');
    }
    window.history.pushState(null, '', `?${params.toString()}`);
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCardClick = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // アニメーション完了後にクリア
    setTimeout(() => setSelectedMenu(null), 300);
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    console.error('MenuListPage Error:', error);

    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          <Typography variant="h6" gutterBottom>
            メニューの読み込みに失敗しました
          </Typography>

          {/* 開発環境でのみ詳細を表示 */}
          {import.meta.env.DEV && (
            <>
              <Typography variant="body2" sx={{ mt: 2, fontFamily: 'monospace' }}>
                エラー詳細:
              </Typography>
              <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
              </Typography>

              <Typography variant="body2" sx={{ mt: 2 }}>
                <strong>対処方法:</strong>
              </Typography>
              <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                <ol>
                  <li>バックエンドが起動しているか確認: <code>lsof -ti:8000</code></li>
                  <li>バックエンドを起動: <code>cd api && uvicorn index:app --reload --port 8000</code></li>
                  <li>APIが応答するか確認: <code>curl http://localhost:8000/api/menus</code></li>
                </ol>
              </Typography>
            </>
          )}

          {/* 本番環境では簡潔なメッセージのみ */}
          {!import.meta.env.DEV && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              もう一度お試しください。問題が解決しない場合は、管理者にお問い合わせください。
            </Typography>
          )}
        </Alert>
      </Container>
    );
  }

  const menus = data?.data || [];
  const meta = data?.meta;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* フィルターパネル */}
      <FilterPanel
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        isMobile={isMobile}
      />

      {/* メインコンテンツ */}
      <Box sx={{ flexGrow: 1, width: '100%' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* ヘッダーとフィルター切替ボタン */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h4" component="h1">
              メニュー一覧
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* お気に入りボタン */}
              <Button
                variant="outlined"
                onClick={() => navigate('/favorites')}
                startIcon={<FavoritesBadge fontSize="small" />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'bold',
                }}
              >
                {!isMobile && 'お気に入り'}
              </Button>
              {!isMobile && (
                <IconButton
                  onClick={() => setFilterOpen(!filterOpen)}
                  aria-label={filterOpen ? 'フィルターを閉じる' : 'フィルターを開く'}
                >
                  {filterOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
                </IconButton>
              )}
            </Box>
          </Box>

          {/* 検索バー */}
          <SearchBar />

          {/* ソートコントロール */}
          <SortControl />

          {/* 適用中フィルター */}
          <AppliedFilters />

          {meta && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              全{meta.total}件中 {(meta.page - 1) * meta.limit + 1}-
              {Math.min(meta.page * meta.limit, meta.total)}件を表示
            </Typography>
          )}

          <Box
            sx={{
              mt: 2,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: filterOpen ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                lg: filterOpen ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)',
              },
              gap: 3,
            }}
          >
            {menus.map((menu) => (
              <MenuCard
                key={menu.id}
                menu={menu}
                onClick={() => handleCardClick(menu)}
              />
            ))}
          </Box>

          {menus.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                メニューが見つかりませんでした
              </Typography>
            </Box>
          )}

          {meta && meta.pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={meta.pages}
                page={page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </Container>
      </Box>

      {/* モバイル: フローティングボタン */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="フィルター"
          onClick={() => setFilterOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          <FilterListIcon />
        </Fab>
      )}

      {/* 詳細モーダル */}
      <MenuDetailModal
        menu={selectedMenu}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </Box>
  );
}
