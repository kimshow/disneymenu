/**
 * メニュー一覧ページ
 */
import { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Pagination,
} from '@mui/material';
import { useMenus } from '../hooks/useMenus';
import { MenuCard } from '../components/MenuCard';
import { MenuFilters } from '../types/menu';

export function MenuListPage() {
  const [page, setPage] = useState(1);
  const [filters] = useState<MenuFilters>({
    page,
    limit: 12,
    only_available: true,
  });

  const { data, isLoading, error } = useMenus({ ...filters, page });

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          メニューの読み込みに失敗しました。もう一度お試しください。
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

      {meta && (
        <Typography variant="body2" color="text.secondary" gutterBottom>
          全{meta.total}件中 {(meta.page - 1) * meta.limit + 1}-
          {Math.min(meta.page * meta.limit, meta.total)}件を表示
        </Typography>
      )}

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {menus.map((menu) => (
          <Grid item xs={12} sm={6} md={4} key={menu.id}>
            <MenuCard menu={menu} />
          </Grid>
        ))}
      </Grid>

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
  );
}
