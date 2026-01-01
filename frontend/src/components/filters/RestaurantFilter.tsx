import { Autocomplete, TextField, CircularProgress } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useRestaurants } from '../../hooks/useMenus';
import type { Restaurant } from '../../types/menu';

/**
 * レストランフィルターコンポーネント
 *
 * Autocompleteを使用してレストランを選択
 * URLクエリパラメータと同期
 */
export const RestaurantFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: restaurants, isLoading } = useRestaurants();

  const selectedRestaurantName = searchParams.get('restaurant');
  const selectedRestaurant = restaurants?.find(r => r.name === selectedRestaurantName) || null;

  const handleChange = (_: unknown, value: Restaurant | null) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('restaurant', value.name);
    } else {
      params.delete('restaurant');
    }
    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <Autocomplete
      options={restaurants || []}
      getOptionLabel={(option) => {
        const parkLabel = option.park === 'tdl' ? 'ランド' : 'シー';
        return `${option.name} (${parkLabel} - ${option.area || ''})`;
      }}
      value={selectedRestaurant}
      onChange={handleChange}
      loading={isLoading}
      size="small"
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder="レストランを選択"
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      noOptionsText="レストランが見つかりません"
      clearText="クリア"
      openText="開く"
      closeText="閉じる"
    />
  );
};
