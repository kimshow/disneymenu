/**
 * Disney Menu App
 */
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { MenuListPage } from './pages/MenuListPage';
import { FavoritesPage } from './pages/FavoritesPage';

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
        <Routes>
          <Route path="/" element={<MenuListPage />} />
          <Route path="/menus" element={<MenuListPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
      </ThemeProvider>
    </FavoritesProvider>
  );
}

export default App;
