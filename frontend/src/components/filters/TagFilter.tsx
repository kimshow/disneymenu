import { Box, Chip, CircularProgress, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSearchParams } from 'react-router-dom';
import { useTags } from '../../hooks/useMenus';

/**
 * タグフィルターコンポーネント
 *
 * カテゴリ別にタグをグループ化して表示
 * 同じカテゴリ内: OR条件（いずれか1つ）
 * 異なるカテゴリ間: AND条件（すべて満たす）
 * URLクエリパラメータと同期
 */

// タグカテゴリの定義（バックエンドのTAG_CATEGORIESと同期）
const TAG_CATEGORIES: Record<string, { label: string; tags: string[] }> = {
  food_type: {
    label: '料理の種類',
    tags: ['カレー', 'ピザ', 'ラーメン', 'うどん', 'そば', 'パスタ', 'ハンバーガー', 'サンドイッチ', '丼', '中華', '和食', '洋食']
  },
  drink_type: {
    label: 'ドリンクの種類',
    tags: ['ソフトドリンク', 'アルコール', 'ビール', 'カクテル', 'ワイン', 'チューハイ', 'ウイスキー', 'ノンアルコールカクテル', 'ノンアルコールビール', 'スペシャルドリンク']
  },
  character: {
    label: 'キャラクター',
    tags: ['キャラクターモチーフのメニュー', 'ダッフィーモチーフのメニュー', 'ミッキーモチーフのメニュー', 'ミニーモチーフのメニュー']
  },
  features: {
    label: '特徴',
    tags: ['ワンハンドメニュー', 'ホット', 'アイス', 'ベジタリアン', 'スーベニア付きメニュー']
  }
};

export const TagFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: allTags, isLoading } = useTags();

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

  if (!allTags || allTags.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        タグが見つかりません
      </Typography>
    );
  }

  // カテゴリ別にタグを分類
  const categorizedTags: Record<string, string[]> = {};
  const otherTags: string[] = [];

  for (const tag of allTags) {
    let found = false;
    for (const [categoryKey, category] of Object.entries(TAG_CATEGORIES)) {
      if (category.tags.includes(tag)) {
        if (!categorizedTags[categoryKey]) {
          categorizedTags[categoryKey] = [];
        }
        categorizedTags[categoryKey].push(tag);
        found = true;
        break;
      }
    }
    if (!found) {
      otherTags.push(tag);
    }
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
        💡 同じカテゴリ内は「OR」（いずれか）、異なるカテゴリ間は「AND」（すべて）で絞り込み
      </Typography>

      {/* カテゴリ別タグ */}
      {Object.entries(TAG_CATEGORIES).map(([categoryKey, category]) => {
        const categoryTags = categorizedTags[categoryKey] || [];
        if (categoryTags.length === 0) return null;

        const selectedCount = categoryTags.filter(tag => selectedTags.includes(tag)).length;

        return (
          <Accordion key={categoryKey} defaultExpanded={selectedCount > 0}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2">
                {category.label}
                {selectedCount > 0 && (
                  <Chip
                    label={selectedCount}
                    size="small"
                    color="primary"
                    sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                  />
                )}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {categoryTags.map((tag) => (
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
              </Box>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* その他のタグ（エリア、レストランなど） */}
      {otherTags.length > 0 && (
        <Accordion defaultExpanded={otherTags.some(tag => selectedTags.includes(tag))}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2">
              エリア・その他
              {otherTags.filter(tag => selectedTags.includes(tag)).length > 0 && (
                <Chip
                  label={otherTags.filter(tag => selectedTags.includes(tag)).length}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                />
              )}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, maxHeight: 200, overflow: 'auto' }}>
              {otherTags.slice(0, 30).map((tag) => (
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
              {otherTags.length > 30 && (
                <Typography variant="caption" color="text.secondary" sx={{ width: '100%', mt: 1 }}>
                  他 {otherTags.length - 30} 個のタグ
                </Typography>
              )}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};
