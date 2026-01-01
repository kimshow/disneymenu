import { Box, FormControl, InputLabel, Select, MenuItem, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface Category {
  key: string;
  label: string;
  description: string;
  count: number;
}

/**
 * カテゴリフィルターコンポーネント
 *
 * Selectドロップダウンを使用して単一のカテゴリを選択
 * URLクエリパラメータと同期
 */
export const CategoryFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // カテゴリ一覧をAPIから取得
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/categories');
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10分間キャッシュ
  });

  const selectedCategory = searchParams.get('categories') || '';

  const handleChange = (event: { target: { value: string } }) => {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set('categories', value);
    } else {
      params.delete('categories');
    }

    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 1 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (!categories || categories.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        カテゴリが見つかりません
      </Typography>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <FormControl fullWidth size="small">
        <InputLabel id="category-filter-label">カテゴリ</InputLabel>
        <Select
          labelId="category-filter-label"
          id="category-filter"
          value={selectedCategory}
          label="カテゴリ"
          onChange={handleChange}
        >
          <MenuItem value="">
            <em>すべて</em>
          </MenuItem>
          {categories.map((category) => (
            <MenuItem key={category.key} value={category.key}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography component="span" sx={{ flexGrow: 1 }}>
                  {category.label}
                </Typography>
                <Typography
                  component="span"
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  ({category.count})
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};
