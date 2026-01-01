/**
 * お気に入りエクスポート/インポートコンポーネント
 */

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Alert,
  Typography,
  IconButton,
} from '@mui/material';
import {
  FileDownload as FileDownloadIcon,
  FileUpload as FileUploadIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useFavorites } from '../../hooks/useFavorites';

interface FavoritesExportProps {
  open: boolean;
  onClose: () => void;
}

/**
 * お気に入りエクスポート/インポートダイアログ
 */
export function FavoritesExport({ open, onClose }: FavoritesExportProps) {
  const { count, exportFavorites, importFavorites } = useFavorites();
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // エクスポート処理
  const handleExport = () => {
    try {
      const jsonData = exportFavorites();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `disney-menu-favorites-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('エクスポートに失敗しました。');
    }
  };

  // インポート処理
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importFavorites(content);

        if (success) {
          setImportSuccess(true);
          setTimeout(() => {
            onClose();
          }, 2000);
        } else {
          setImportError('無効なファイル形式です。正しいお気に入りファイルを選択してください。');
        }
      } catch (error) {
        console.error('Import failed:', error);
        setImportError('ファイルの読み込みに失敗しました。');
      }
    };

    reader.onerror = () => {
      setImportError('ファイルの読み込みに失敗しました。');
    };

    reader.readAsText(file);

    // ファイル入力をリセット
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setImportError(null);
    setImportSuccess(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        お気に入りのバックアップ
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={3}>
          {/* エクスポート */}
          <Box>
            <Typography variant="h6" gutterBottom>
              エクスポート
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              お気に入りメニュー: {count}件
            </Typography>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExport}
              fullWidth
              disabled={count === 0}
            >
              JSONファイルをダウンロード
            </Button>
            {count === 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                お気に入りが0件のためエクスポートできません
              </Typography>
            )}
          </Box>

          {/* インポート */}
          <Box>
            <Typography variant="h6" gutterBottom>
              インポート
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              バックアップファイルからお気に入りを復元します。
            </Typography>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              style={{ display: 'none' }}
              id="favorites-import-input"
            />
            <label htmlFor="favorites-import-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<FileUploadIcon />}
                fullWidth
              >
                ファイルを選択
              </Button>
            </label>

            <Alert severity="warning" sx={{ mt: 2 }}>
              既存のお気に入りは上書きされます
            </Alert>

            {importError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {importError}
              </Alert>
            )}

            {importSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                インポートが完了しました！
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>閉じる</Button>
      </DialogActions>
    </Dialog>
  );
}

// Boxコンポーネントのimport追加
import { Box } from '@mui/material';
