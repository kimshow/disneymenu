import { TextField, InputAdornment, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * 検索バーコンポーネント
 *
 * メニュー検索用のテキストフィールド
 *
 * @param value - 検索クエリ
 * @param onChange - 値変更時のコールバック
 * @param placeholder - プレースホルダーテキスト
 */
export const SearchBar = ({ value, onChange, placeholder = 'メニューを検索（例: カレー、ミッキー）' }: SearchBarProps) => {
  return (
    <TextField
      fullWidth
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
              onClick={() => onChange('')}
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
