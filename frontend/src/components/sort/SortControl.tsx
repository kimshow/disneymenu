import { Box, FormControl, InputLabel, Select, MenuItem, IconButton, Typography } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useSearchParams } from 'react-router-dom';

/**
 * ソートコントロールコンポーネント
 *
 * ソート項目と順序を選択するUI
 * URLクエリパラメータと自動同期
 */
export const SortControl = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const sort = searchParams.get('sort') || 'scraped_at';
  const order = searchParams.get('order') || 'desc';

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);

    // orderがまだ設定されていない場合はデフォルトを設定
    if (!params.has('order')) {
      params.set('order', 'desc');
    }

    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  const handleOrderToggle = () => {
    const params = new URLSearchParams(searchParams);
    const currentOrder = order === 'asc' ? 'desc' : 'asc';
    params.set('order', currentOrder);

    // sortがまだ設定されていない場合はデフォルトを設定
    if (!params.has('sort')) {
      params.set('sort', 'scraped_at');
    }

    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  const getSortLabel = (sortValue: string) => {
    switch (sortValue) {
      case 'price':
        return '価格順';
      case 'name':
        return '名前順';
      case 'scraped_at':
        return '新着順';
      default:
        return '新着順';
    }
  };

  const getOrderLabel = (orderValue: string) => {
    if (sort === 'price') {
      return orderValue === 'asc' ? '安い順' : '高い順';
    } else if (sort === 'name') {
      return orderValue === 'asc' ? 'あいうえお順' : '逆順';
    } else if (sort === 'scraped_at') {
      return orderValue === 'asc' ? '古い順' : '新しい順';
    }
    return orderValue === 'asc' ? '昇順' : '降順';
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        mb: 2,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 150 }}>
        <InputLabel id="sort-select-label">並び替え</InputLabel>
        <Select
          labelId="sort-select-label"
          id="sort-select"
          value={sort}
          label="並び替え"
          onChange={(e) => handleSortChange(e.target.value)}
          aria-label="並び替え"
        >
          <MenuItem value="scraped_at">新着順</MenuItem>
          <MenuItem value="price">価格順</MenuItem>
          <MenuItem value="name">名前順</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton
          size="small"
          onClick={handleOrderToggle}
          aria-label={order === 'asc' ? '昇順' : '降順'}
          color="primary"
        >
          {order === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
        </IconButton>

        <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
          {getOrderLabel(order)}
        </Typography>
      </Box>
    </Box>
  );
};
