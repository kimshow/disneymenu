import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchBarProps {
  placeholder?: string;
}

/**
 * 検索バーコンポーネント
 *
 * メニュー検索用のテキストフィールド
 * URLクエリパラメータと自動同期
 *
 * @param placeholder - プレースホルダーテキスト
 */
export const SearchBar = ({ placeholder = 'メニューを検索（例: カレー、ミッキー）' }: SearchBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');
  
  // デバウンス（300ms）
  const debouncedValue = useDebounce(value, 300);

  // デバウンスされた値をURLに反映
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    
    if (debouncedValue) {
      params.set('q', debouncedValue);
    } else {
      params.delete('q');
    }
    
    // ページをリセット
    params.delete('page');
    
    setSearchParams(params);
  }, [debouncedValue]);

  // URLパラメータが外部から変更された場合に同期
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    if (qParam !== value) {
      setValue(qParam);
    }
  }, [searchParams]);

  const handleClear = () => {
    setValue('');
  };

  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      aria-label="メニュー検索"
      inputProps={{
        role: 'search',
        'aria-describedby': 'search-help-text',
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: value && (
          <InputAdornment position="end">
            <IconButton
              size="small"
              onClick={handleClear}
              aria-label="検索をクリア"
              edge="end"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        ),
      }}
      sx={{
        maxWidth: { xs: '100%', md: '500px' },
        mb: 3,
      }}
    />
  );
};
