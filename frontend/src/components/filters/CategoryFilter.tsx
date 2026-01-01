import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useCategories } from '../../hooks/useMenus';

/**
 * カテゴリフィルターコンポーネント
 *
 * Chipを使用して複数のカテゴリを選択
 * URLクエリパラメータと同期
 */
export const CategoryFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: categories, isLoading } = useCategories();

  const selectedCategories = searchParams.get('categories')?.split(',').filter(Boolean) || [];

  const toggleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams);
    let newCategories: string[];

    if (selectedCategories.includes(category)) {
      newCategories = selectedCategories.filter(c => c !== category);
    } else {
      newCategories = [...selectedCategories, category];
    }

    if (newCategories.length > 0) {
      params.set('categories', newCategories.join(','));
    } else {
      params.delete('categories');
    }

    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  if (!categories || categories.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        カテゴリが見つかりません
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {categories.map((category) => (
        <Chip
          key={category}
          label={category}
          onClick={() => toggleCategory(category)}
          color={selectedCategories.includes(category) ? 'primary' : 'default'}
          variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      ))}
    </Box>
  );
};
