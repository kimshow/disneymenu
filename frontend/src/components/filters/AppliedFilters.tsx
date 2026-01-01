import { Box, Chip, Typography, Button } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { useSearchParams } from 'react-router-dom';

/**
 * 適用中フィルター表示コンポーネント
 *
 * 現在適用されているフィルターをChipで表示
 * 個別削除とすべてクリアの機能を提供
 */
export const AppliedFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 適用中のフィルターを取得
  const filters = {
    q: searchParams.get('q'),
    park: searchParams.get('park'),
    restaurant: searchParams.get('restaurant'),
    categories: searchParams.get('categories')?.split(',').filter(Boolean),
    tags: searchParams.get('tags')?.split(',').filter(Boolean),
    min_price: searchParams.get('min_price'),
    max_price: searchParams.get('max_price'),
    only_available: searchParams.get('only_available') === 'true',
  };

  // 価格フィルターがデフォルト値（0-17000）から変更されているかチェック
  const hasPriceFilter =
    (filters.min_price && parseInt(filters.min_price) > 0) ||
    (filters.max_price && parseInt(filters.max_price) < 17000);

  // フィルターが1つでも適用されているか確認
  const hasActiveFilters =
    filters.q ||
    filters.park ||
    filters.restaurant ||
    (filters.categories && filters.categories.length > 0) ||
    (filters.tags && filters.tags.length > 0) ||
    hasPriceFilter ||
    filters.only_available;

  if (!hasActiveFilters) {
    return null;
  }

  // 個別フィルター削除
  const removeFilter = (key: string, value?: string) => {
    const params = new URLSearchParams(searchParams);

    if (key === 'categories' || key === 'tags') {
      // 配列形式のフィルター
      const current = params.get(key)?.split(',').filter(Boolean) || [];
      const updated = current.filter(item => item !== value);

      if (updated.length > 0) {
        params.set(key, updated.join(','));
      } else {
        params.delete(key);
      }
    } else if (key === 'price_range') {
      // 価格範囲の場合は両方削除
      params.delete('min_price');
      params.delete('max_price');
    } else {
      params.delete(key);
    }

    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  // すべてのフィルターをクリア
  const clearAllFilters = () => {
    const params = new URLSearchParams();

    // ソートとページのみ保持
    const sort = searchParams.get('sort');
    const order = searchParams.get('order');

    if (sort) params.set('sort', sort);
    if (order) params.set('order', order);

    setSearchParams(params);
  };

  const getParkLabel = (park: string) => {
    return park === 'tdl' ? '🏰 ランド' : '🌊 シー';
  };

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        bgcolor: 'background.paper',
        borderRadius: 1,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mr: 2 }}>
          適用中のフィルター:
        </Typography>

        <Button
          size="small"
          onClick={clearAllFilters}
          startIcon={<ClearIcon />}
          sx={{ ml: 'auto' }}
        >
          すべてクリア
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {/* 検索クエリ */}
        {filters.q && (
          <Chip
            label={`検索: ${filters.q}`}
            onDelete={() => removeFilter('q')}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        {/* パーク */}
        {filters.park && (
          <Chip
            label={`パーク: ${getParkLabel(filters.park)}`}
            onDelete={() => removeFilter('park')}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        {/* レストラン */}
        {filters.restaurant && (
          <Chip
            label={`レストラン: ${filters.restaurant}`}
            onDelete={() => removeFilter('restaurant')}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        {/* 価格範囲 */}
        {hasPriceFilter && (
          <Chip
            label={`価格: ¥${filters.min_price || '0'} - ¥${filters.max_price || '17,000'}`}
            onDelete={() => removeFilter('price_range')}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}

        {/* カテゴリ */}
        {filters.categories?.map((category) => (
          <Chip
            key={`category-${category}`}
            label={`カテゴリ: ${category}`}
            onDelete={() => removeFilter('categories', category)}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}

        {/* タグ */}
        {filters.tags?.map((tag) => (
          <Chip
            key={`tag-${tag}`}
            label={`タグ: ${tag}`}
            onDelete={() => removeFilter('tags', tag)}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}

        {/* 販売中のみ */}
        {filters.only_available && (
          <Chip
            label="販売中のみ"
            onDelete={() => removeFilter('only_available')}
            size="small"
            color="primary"
            variant="outlined"
          />
        )}
      </Box>
    </Box>
  );
};
