import { Box, Slider, Typography } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

/**
 * 価格範囲フィルターコンポーネント
 * 
 * Sliderを使用して価格範囲を指定
 * デバウンス処理でURLクエリパラメータと同期
 */
export const PriceRangeFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const minPriceParam = parseInt(searchParams.get('min_price') || '0');
  const maxPriceParam = parseInt(searchParams.get('max_price') || '13000');
  
  const [priceRange, setPriceRange] = useState<[number, number]>([minPriceParam, maxPriceParam]);
  const debouncedPriceRange = useDebounce(priceRange, 500);
  
  // URLパラメータ変更時にローカル状態を更新
  useEffect(() => {
    setPriceRange([minPriceParam, maxPriceParam]);
  }, [minPriceParam, maxPriceParam]);
  
  // デバウンス後にURLを更新
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (debouncedPriceRange[0] > 0) {
      params.set('min_price', debouncedPriceRange[0].toString());
    } else {
      params.delete('min_price');
    }
    
    if (debouncedPriceRange[1] < 13000) {
      params.set('max_price', debouncedPriceRange[1].toString());
    } else {
      params.delete('max_price');
    }
    
    // ページをリセット
    params.delete('page');
    
    setSearchParams(params, { replace: true });
  }, [debouncedPriceRange, setSearchParams]);
  
  const handleChange = (_: Event, newValue: number | number[]) => {
    setPriceRange(newValue as [number, number]);
  };
  
  const formatValue = (value: number) => {
    if (value === 0) return '¥0';
    return `¥${value.toLocaleString()}`;
  };
  
  return (
    <Box sx={{ px: 1 }}>
      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
        価格範囲
      </Typography>
      <Box sx={{ px: 1, pt: 1 }}>
        <Slider
          value={priceRange}
          onChange={handleChange}
          valueLabelDisplay="auto"
          valueLabelFormat={formatValue}
          min={0}
          max={13000}
          step={100}
          marks={[
            { value: 0, label: '¥0' },
            { value: 13000, label: '¥13,000' },
          ]}
          sx={{ mt: 1 }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
          {formatValue(priceRange[0])} - {formatValue(priceRange[1])}
        </Typography>
      </Box>
    </Box>
  );
};
