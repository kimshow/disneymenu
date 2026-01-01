import { Box, Chip, CircularProgress, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTags } from '../../hooks/useMenus';

/**
 * タグフィルターコンポーネント
 *
 * Chipを使用して複数のタグを選択
 * URLクエリパラメータと同期
 */
export const TagFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: tags, isLoading } = useTags();

  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    let newTags: string[];

    if (selectedTags.includes(tag)) {
      newTags = selectedTags.filter(t => t !== tag);
    } else {
      newTags = [...selectedTags, tag];
    }

    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }

    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  if (isLoading) {
    return <CircularProgress size={24} />;
  }

  if (!tags || tags.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        タグが見つかりません
      </Typography>
    );
  }

  // タグが多い場合は最初の20件のみ表示
  const displayTags = tags.slice(0, 20);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflow: 'auto' }}>
      {displayTags.map((tag) => (
        <Chip
          key={tag}
          label={tag}
          onClick={() => toggleTag(tag)}
          color={selectedTags.includes(tag) ? 'primary' : 'default'}
          variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
          size="small"
          sx={{ cursor: 'pointer' }}
        />
      ))}
      {tags.length > 20 && (
        <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mt: 1 }}>
          他 {tags.length - 20} 個のタグ
        </Typography>
      )}
    </Box>
  );
};
