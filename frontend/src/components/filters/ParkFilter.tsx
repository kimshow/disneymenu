import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

/**
 * パークフィルターコンポーネント
 *
 * ToggleButtonGroupを使用してパークを選択
 * URLクエリパラメータと同期
 */
export const ParkFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const park = searchParams.get('park') || 'all';

  const handleChange = (_: React.MouseEvent<HTMLElement>, newPark: string | null) => {
    if (newPark === null) return;

    const params = new URLSearchParams(searchParams);
    if (newPark === 'all') {
      params.delete('park');
    } else {
      params.set('park', newPark);
    }
    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <ToggleButtonGroup
      value={park}
      exclusive
      onChange={handleChange}
      aria-label="パーク選択"
      fullWidth
      size="small"
    >
      <ToggleButton value="all" aria-label="すべて">
        すべて
      </ToggleButton>
      <ToggleButton value="tdl" aria-label="ランド">
        🏰 ランド
      </ToggleButton>
      <ToggleButton value="tds" aria-label="シー">
        🌊 シー
      </ToggleButton>
    </ToggleButtonGroup>
  );
};
