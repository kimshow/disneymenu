import { FormControlLabel, Switch } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

/**
 * 販売状況フィルターコンポーネント
 *
 * Switchを使用して販売中のメニューのみを表示
 * URLクエリパラメータと同期
 */
export const AvailabilityFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const onlyAvailable = searchParams.get('only_available') === 'true';

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = new URLSearchParams(searchParams);
    if (event.target.checked) {
      params.set('only_available', 'true');
    } else {
      params.delete('only_available');
    }
    // ページをリセット
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={onlyAvailable}
          onChange={handleChange}
          color="primary"
        />
      }
      label="販売中のみ表示"
    />
  );
};
