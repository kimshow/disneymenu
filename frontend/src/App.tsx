/**
 * Disney Menu App
 */
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, CircularProgress } from '@mui/material';
import { FavoritesProvider } from './contexts/FavoritesContext';

// Code Splitting: 各ページを遅延読み込み
const MenuListPage = lazy(() => import('./pages/MenuListPage').then(m => ({ default: m.MenuListPage })));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage').then(m => ({ default: m.FavoritesPage })));

// ローディング表示コンポーネント
const LoadingFallback = () => (
  <Box 
    display="flex" 
    justifyContent="center" 
    alignItems="center" 
    minHeight="60vh"
    role="progressbar"
    aria-label="ページを読み込んでいます"
  >
    <CircularProgress />
  </Box>
);

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <FavoritesProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/" element={<MenuListPage />} />
            <Route path="/menus" element={<MenuListPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </Suspense>
      </ThemeProvider>
    </FavoritesProvider>
  );
}

export default App;
