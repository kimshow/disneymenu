/**
 * メニュー一覧ページ
 */
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Pagination,
} from '@mui/material';
import { useMenus } from '../hooks/useMenus';
import { useDebounce } from '../hooks/useDebounce';
import { MenuCard } from '../components/MenuCard';
import { MenuDetailModal } from '../components/menu/MenuDetailModal';
import { SearchBar } from '../components/search/SearchBar';
import type { MenuFilters, MenuItem } from '../types/menu';

export function MenuListPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // URLからパラメータを読み取り
  const qParam = searchParams.get('q') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');
  const sortParam = searchParams.get('sort') || undefined;
  const orderParam = searchParams.get('order') || undefined;

  const [searchQuery, setSearchQuery] = useState(qParam);
  const [page, setPage] = useState(pageParam);

  // 検索クエリをデバウンス（300ms）
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // フィルター構築
  const filters: MenuFilters = {
    q: debouncedSearchQuery || undefined,
    sort: sortParam,
    order: orderParam as 'asc' | 'desc' | undefined,
    page,
    limit: 12,
    only_available: false,  // すべてのメニューを表示
  };

  // モーダル状態管理
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading, error } = useMenus(filters);

  // URLクエリパラメータを更新
  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearchQuery) {
      params.set('q', debouncedSearchQuery);
    }
    if (page > 1) {
      params.set('page', page.toString());
    }
    if (sortParam) {
      params.set('sort', sortParam);
    }
    if (orderParam) {
      params.set('order', orderParam);
    }

    setSearchParams(params, { replace: true });
  }, [debouncedSearchQuery, page, sortParam, orderParam, setSearchParams]);

  // URLパラメータが変更されたら状態を同期
  useEffect(() => {
    const newQParam = searchParams.get('q') || '';
    const newPageParam = parseInt(searchParams.get('page') || '1');

    if (newQParam !== searchQuery) {
      setSearchQuery(newQParam);
    }
    if (newPageParam !== page) {
      setPage(newPageParam);
    }
  }, [searchParams]);

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setPage(1); // 検索時は1ページ目に戻る
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        メニュー一覧
      </Typography>

      {/* 検索バー */}
      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
      />

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
            md: 'repeat(3, 1fr)',
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

      {/* 詳細モーダル */}
      <MenuDetailModal
        menu={selectedMenu}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </Container>
  );
}
