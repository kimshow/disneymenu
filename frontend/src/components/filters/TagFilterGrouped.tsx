import React, { memo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSearchParams } from 'react-router-dom';
import { PARK_AREAS, getParkByArea } from '../../constants/parkAreas';

interface TagGroup {
  label: string;
  tags: string[];
}

interface TagFilterGroupedProps {
  groupedTags: Record<string, TagGroup>;
}

export const TagFilterGrouped = memo<TagFilterGroupedProps>(({ groupedTags }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // 現在選択されているタグを取得
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];

  // 選択されているパークを取得
  const selectedPark = searchParams.get('park') || '';

  // タグの選択/解除
  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    const currentTags = params.get('tags')?.split(',').filter(Boolean) || [];

    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];

    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }

    params.delete('page'); // ページ番号をリセット
    setSearchParams(params);
  };

  // カテゴリの表示順序を定義（restaurantを除外）
  const categoryOrder = ['food_type', 'drink_type', 'character', 'area', 'features'];

  // カテゴリを順序に従ってソート（restaurantカテゴリは表示しない）
  const sortedCategories = Object.entries(groupedTags)
    .filter(([category]) => category !== 'restaurant') // レストランカテゴリを除外
    .sort((a, b) => {
      const indexA = categoryOrder.indexOf(a[0]);
      const indexB = categoryOrder.indexOf(b[0]);
      return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
    });

  return (
    <Box>
      {sortedCategories.map(([category, { label, tags }]) => {
        // パークが選択されている場合、エリアタグをフィルタリング
        let filteredTags = tags;
        if (category === 'area' && selectedPark) {
          const parkKey = selectedPark.toLowerCase() as 'disneyland' | 'disneysea' | 'tdl' | 'tds';
          const allowedAreas = PARK_AREAS[parkKey] || [];
          filteredTags = tags.filter(tag => allowedAreas.includes(tag));
        }

        // タグが0件の場合は表示しない
        if (filteredTags.length === 0) {
          return null;
        }

        return (
          <Accordion
            key={category}
            defaultExpanded={category === 'food_type'}
            sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
              <Typography variant="subtitle2">{label}</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ px: 0 }}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {filteredTags.map((tag) => (
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
    </Box>
  );
});

TagFilterGrouped.displayName = 'TagFilterGrouped';
