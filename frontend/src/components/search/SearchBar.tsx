import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  placeholder?: string;
}

/**
 * 検索バーコンポーネント
 *
 * メニュー検索用のテキストフィールド
 * URLクエリパラメータと同期
 * Enterキーまたは検索ボタンクリックで検索実行
 *
 * @param placeholder - プレースホルダーテキスト
 */
export const SearchBar = ({ placeholder = 'メニューを検索（例: カレー、ミッキー）Enterで検索' }: SearchBarProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [value, setValue] = useState(searchParams.get('q') || '');

  // URLパラメータが外部から変更された場合に同期
  useEffect(() => {
    const qParam = searchParams.get('q') || '';
    if (qParam !== value) {
      setValue(qParam);
    }
  }, [searchParams.get('q')]);

  // 検索実行
  const executeSearch = useCallback(() => {
    const params = new URLSearchParams(searchParams);

    if (value.trim()) {
      params.set('q', value.trim());
    } else {
      params.delete('q');
    }

    // ページをリセット
    params.delete('page');

    setSearchParams(params);
  }, [value, searchParams, setSearchParams]);

  // Enterキー押下で検索
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  const handleClear = () => {
    setValue('');
    // クリア時は即座に検索をクリア
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onKeyDown={handleKeyDown}
      aria-label="メニュー検索"
      inputProps={{
        role: 'search',
        'aria-describedby': 'search-help-text',
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <IconButton
              size="small"
              onClick={executeSearch}
              aria-label="検索を実行"
              edge="start"
            >
              <SearchIcon color="action" />
            </IconButton>
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
