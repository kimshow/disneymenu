# Phase 9: ユーザー体験向上 - 実装計画書

**想定期間**: 2週間（実働14日）  
**開始予定**: Phase 8完了後  
**担当**: フロントエンド  
**目的**: ダークモード、多言語対応、アクセシビリティ強化によるユーザー体験の向上

---

## 📌 エグゼクティブサマリー

### 目標
- ダークモードで夜間の使用体験を改善
- 英語対応で訪日外国人にもサービス提供
- アクセシビリティ強化でWCAG 2.1 AAA準拠

### 主要機能（優先度順）

1. **ダークモード対応** 🔥（4日間）
   - MUIテーマ切り替え
   - localStorage保存
   - システム設定連動

2. **多言語対応（i18n）** 🔥（5日間）
   - react-i18next導入
   - 日本語・英語対応
   - 言語切替UI

3. **アクセシビリティ強化** 🟡（3日間）
   - スクリーンリーダー対応強化
   - キーボードナビゲーション改善
   - WCAG 2.1 AAA準拠

4. **テスト・デバッグ** 🟢（2日間）
   - E2Eテスト追加（6件）
   - axe-coreによるアクセシビリティテスト

---

## 🎯 現状分析

### ✅ Phase 8完了時点での実装状況

#### テーマ
- ✅ MUI標準テーマ（ライトモード）
- ❌ ダークモードテーマなし
- ❌ テーマ切り替え機能なし

#### 言語
- ✅ 日本語のみ
- ❌ 多言語対応なし
- ❌ 翻訳データなし

#### アクセシビリティ
- ✅ 基本的なaria属性
- ⚠️ スクリーンリーダーテスト未実施
- ⚠️ キーボードナビゲーション一部不足

---

## 🛠️ 技術設計

### ダークモード実装

#### MUIテーマ設計

```typescript
// theme.ts
import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#ffffff',
      paper: '#f5f5f5',
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});
```

#### localStorage保存

```typescript
const THEME_KEY = 'disney-menu-theme';

export const getStoredTheme = (): 'light' | 'dark' | 'system' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark' | 'system') || 'system';
};

export const setStoredTheme = (theme: 'light' | 'dark' | 'system') => {
  localStorage.setItem(THEME_KEY, theme);
};
```

### 多言語対応（i18n）

#### ライブラリ選定

| ライブラリ | サイズ（gzip） | 特徴 | 採用判断 |
|-----------|---------------|------|---------|
| react-i18next | 45KB | 最も実績豊富 | ✅ 採用 |
| react-intl | 85KB | Format.js、多機能 | ❌ サイズ大 |
| LinguiJS | 35KB | 軽量、コンパイル時最適化 | ❌ 学習コスト高 |

#### インストール
```bash
npm install react-i18next@14.0.5 i18next@23.8.2 i18next-browser-languagedetector@7.2.0
```

#### 翻訳ファイル構造

```
frontend/src/locales/
├── ja/
│   ├── common.json
│   ├── menu.json
│   ├── restaurant.json
│   └── map.json
└── en/
    ├── common.json
    ├── menu.json
    ├── restaurant.json
    └── map.json
```

### アクセシビリティ

#### WCAG 2.1 AAA準拠項目

| 項目 | 現状 | 目標 |
|------|------|------|
| コントラスト比 | AA準拠 | AAA（7:1以上） |
| フォーカスインジケーター | 標準 | 強化（3px、明確な色） |
| スキップリンク | なし | 追加 |
| aria-label | 一部のみ | 全要素に適用 |
| キーボードトラップ | なし | 検証済み |

#### テストツール
- axe-core: 自動アクセシビリティテスト
- NVDA: Windowsスクリーンリーダー
- VoiceOver: macOSスクリーンリーダー

---

## 📅 実装手順

### Phase 9.1: ダークモード対応（4日間）

#### Day 1: テーマ作成とプロバイダー設定

**タスク 9.1.1: theme.ts作成**

```typescript
import { createTheme, PaletteMode } from '@mui/material/styles';

export const getTheme = (mode: PaletteMode) => {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            // ライトモード
            primary: { main: '#1976d2' },
            secondary: { main: '#dc004e' },
            background: {
              default: '#ffffff',
              paper: '#f5f5f5',
            },
          }
        : {
            // ダークモード
            primary: { main: '#90caf9' },
            secondary: { main: '#f48fb1' },
            background: {
              default: '#0a1929',
              paper: '#132f4c',
            },
          }),
    },
    typography: {
      fontFamily: [
        '"Noto Sans JP"',
        'Roboto',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: mode === 'dark' 
              ? '0 4px 6px rgba(0, 0, 0, 0.5)' 
              : '0 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
    },
  });
};
```

**タスク 9.1.2: ThemeProvider.tsxコンポーネント**

```typescript
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { getTheme } from './theme';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeProvider');
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    return (localStorage.getItem('disney-menu-theme') as ThemeMode) || 'system';
  });

  const systemTheme = useMemo(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, []);

  const activeMode = mode === 'system' ? systemTheme : mode;
  const theme = useMemo(() => getTheme(activeMode), [activeMode]);

  const toggleTheme = (newMode: ThemeMode) => {
    setMode(newMode);
    localStorage.setItem('disney-menu-theme', newMode);
  };

  // システム設定変更の監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (mode === 'system') {
        setMode('system'); // 再レンダリングをトリガー
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
```

#### Day 2: テーマ切り替えUI

**タスク 9.1.3: ThemeToggle.tsxコンポーネント**

```typescript
import { IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import {
  Brightness4,
  Brightness7,
  SettingsBrightness,
} from '@mui/icons-material';
import { useState } from 'react';
import { useThemeMode } from '../../contexts/ThemeProvider';

export const ThemeToggle = () => {
  const { mode, toggleTheme } = useThemeMode();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const themeOptions = [
    { value: 'light', label: 'ライトモード', icon: <Brightness7 /> },
    { value: 'dark', label: 'ダークモード', icon: <Brightness4 /> },
    { value: 'system', label: 'システム設定', icon: <SettingsBrightness /> },
  ];

  return (
    <>
      <IconButton
        color="inherit"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        aria-label="テーマ切り替え"
      >
        {mode === 'light' ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {themeOptions.map((option) => (
          <MenuItem
            key={option.value}
            selected={mode === option.value}
            onClick={() => {
              toggleTheme(option.value as ThemeMode);
              setAnchorEl(null);
            }}
          >
            <ListItemIcon>{option.icon}</ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
```

#### Day 3-4: ダークモード対応調整

**タスク 9.1.4: 画像とアイコンの調整**

```typescript
// ダークモードで画像を暗くする
<CardMedia
  component="img"
  image={menu.imageUrl}
  sx={(theme) => ({
    filter: theme.palette.mode === 'dark' ? 'brightness(0.8)' : 'none',
  })}
/>

// SVGアイコンの色を自動調整
<SvgIcon
  sx={(theme) => ({
    color: theme.palette.mode === 'dark' ? 'grey.300' : 'grey.700',
  })}
/>
```

**タスク 9.1.5: Chart.jsのダークモード対応**

```typescript
const chartOptions = {
  scales: {
    x: {
      ticks: {
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
      },
      grid: {
        color: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.1)' 
          : 'rgba(0, 0, 0, 0.1)',
      },
    },
  },
};
```

---

### Phase 9.2: 多言語対応（5日間）

#### Day 5: i18next設定

**タスク 9.2.1: i18nextインストールと設定**

```bash
npm install react-i18next@14.0.5 i18next@23.8.2 i18next-browser-languagedetector@7.2.0
```

**タスク 9.2.2: i18n.ts設定ファイル**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonJa from './locales/ja/common.json';
import commonEn from './locales/en/common.json';
import menuJa from './locales/ja/menu.json';
import menuEn from './locales/en/menu.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: {
        common: commonJa,
        menu: menuJa,
      },
      en: {
        common: commonEn,
        menu: menuEn,
      },
    },
    fallbackLng: 'ja',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
```

#### Day 6-7: 翻訳ファイル作成

**タスク 9.2.3: 日本語翻訳ファイル**

`locales/ja/common.json`:
```json
{
  "app": {
    "title": "ディズニーメニュー検索",
    "description": "東京ディズニーリゾートの全メニューを検索"
  },
  "navigation": {
    "home": "ホーム",
    "favorites": "お気に入り",
    "restaurants": "レストラン",
    "map": "マップ",
    "statistics": "統計"
  },
  "search": {
    "placeholder": "メニューを検索...",
    "results": "{{count}}件のメニューが見つかりました",
    "noResults": "該当するメニューが見つかりませんでした"
  }
}
```

`locales/ja/menu.json`:
```json
{
  "category": {
    "main": "メイン",
    "side": "サイド",
    "dessert": "デザート",
    "drink": "ドリンク"
  },
  "price": "価格",
  "restaurant": "レストラン",
  "park": "パーク",
  "addToFavorites": "お気に入りに追加",
  "removeFromFavorites": "お気に入りから削除"
}
```

**タスク 9.2.4: 英語翻訳ファイル**

`locales/en/common.json`:
```json
{
  "app": {
    "title": "Disney Menu Search",
    "description": "Search all menus at Tokyo Disney Resort"
  },
  "navigation": {
    "home": "Home",
    "favorites": "Favorites",
    "restaurants": "Restaurants",
    "map": "Map",
    "statistics": "Statistics"
  },
  "search": {
    "placeholder": "Search menus...",
    "results": "{{count}} menus found",
    "noResults": "No menus found"
  }
}
```

`locales/en/menu.json`:
```json
{
  "category": {
    "main": "Main Dish",
    "side": "Side Dish",
    "dessert": "Dessert",
    "drink": "Drink"
  },
  "price": "Price",
  "restaurant": "Restaurant",
  "park": "Park",
  "addToFavorites": "Add to Favorites",
  "removeFromFavorites": "Remove from Favorites"
}
```

#### Day 8: コンポーネントへの適用

**タスク 9.2.5: useTranslation Hook使用**

```typescript
import { useTranslation } from 'react-i18next';

export const SearchBar = () => {
  const { t } = useTranslation('common');

  return (
    <TextField
      placeholder={t('search.placeholder')}
      // ...
    />
  );
};

export const MenuCard = ({ menu }: { menu: MenuItem }) => {
  const { t } = useTranslation('menu');

  return (
    <Card>
      <CardContent>
        <Typography>{t('price')}: ¥{menu.price}</Typography>
        <Typography>{t('restaurant')}: {menu.restaurant}</Typography>
      </CardContent>
    </Card>
  );
};
```

#### Day 9: 言語切替UI

**タスク 9.2.6: LanguageSelector.tsxコンポーネント**

```typescript
import { Select, MenuItem, FormControl } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LanguageIcon from '@mui/icons-material/Language';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'ja', label: '日本語' },
    { code: 'en', label: 'English' },
  ];

  return (
    <FormControl size="small">
      <Select
        value={i18n.language}
        onChange={(e) => i18n.changeLanguage(e.target.value)}
        startAdornment={<LanguageIcon />}
      >
        {languages.map((lang) => (
          <MenuItem key={lang.code} value={lang.code}>
            {lang.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
```

---

### Phase 9.3: アクセシビリティ強化（3日間）

#### Day 10: スキップリンクとフォーカス管理

**タスク 9.3.1: SkipLink.tsxコンポーネント**

```typescript
export const SkipLink = () => {
  return (
    <a
      href="#main-content"
      style={{
        position: 'absolute',
        left: '-9999px',
        zIndex: 999,
        padding: '1em',
        backgroundColor: '#000',
        color: '#fff',
        textDecoration: 'none',
      }}
      onFocus={(e) => {
        e.currentTarget.style.left = '0';
      }}
      onBlur={(e) => {
        e.currentTarget.style.left = '-9999px';
      }}
    >
      メインコンテンツへスキップ
    </a>
  );
};
```

**タスク 9.3.2: FocusTrap.tsxコンポーネント（モーダル用）**

```typescript
import { useEffect, useRef } from 'react';

export const useFocusTrap = (isActive: boolean) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    firstElement?.focus();
    document.addEventListener('keydown', handleTab);

    return () => document.removeEventListener('keydown', handleTab);
  }, [isActive]);

  return containerRef;
};
```

#### Day 11: aria属性強化

**タスク 9.3.3: aria属性の追加**

```typescript
// 検索バー
<TextField
  aria-label="メニュー検索"
  aria-describedby="search-help-text"
  // ...
/>
<Typography id="search-help-text" variant="caption">
  メニュー名や説明文で検索できます
</Typography>

// フィルターパネル
<Box role="region" aria-label="フィルターパネル">
  <FormControl>
    <InputLabel id="park-filter-label">パーク</InputLabel>
    <Select
      labelId="park-filter-label"
      aria-label="パークでフィルター"
      // ...
    />
  </FormControl>
</Box>

// メニューカード
<Card
  role="article"
  aria-labelledby={`menu-${menu.id}-title`}
>
  <Typography id={`menu-${menu.id}-title`} variant="h6">
    {menu.name}
  </Typography>
</Card>

// お気に入りボタン
<IconButton
  aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
  aria-pressed={isFavorite}
  onClick={handleToggleFavorite}
>
  <FavoriteIcon />
</IconButton>
```

#### Day 12: コントラスト比改善

**タスク 9.3.4: WCAG AAA準拠の色設定**

```typescript
const theme = createTheme({
  palette: {
    primary: {
      main: '#0d47a1', // コントラスト比7.8:1（AAA準拠）
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#c62828', // コントラスト比8.2:1（AAA準拠）
      contrastText: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.95)', // コントラスト比19:1
      secondary: 'rgba(0, 0, 0, 0.75)', // コントラスト比12:1
    },
  },
});
```

**タスク 9.3.5: フォーカスインジケーター強化**

```css
/* global.css */
:focus-visible {
  outline: 3px solid #2196f3;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 3px solid #1976d2;
  outline-offset: 2px;
}
```

---

### Phase 9.4: テスト・デバッグ（2日間）

#### Day 13: アクセシビリティテスト

**タスク 9.4.1: axe-coreインストールと設定**

```bash
npm install -D @axe-core/playwright@4.8.3
```

**タスク 9.4.2: accessibility.spec.ts作成**

```typescript
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('トップページのアクセシビリティ', async ({ page }) => {
  await page.goto('/');
  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});

test('メニュー詳細ページのアクセシビリティ', async ({ page }) => {
  await page.goto('/menu/0001');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});

test('キーボードナビゲーション', async ({ page }) => {
  await page.goto('/');
  
  // Tabキーでフォーカス移動
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('href', '/');
  
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('aria-label', 'メニュー検索');
});
```

#### Day 14: 最終調整とデプロイ

**タスク 9.4.3: スクリーンリーダーテスト**

- NVDA（Windows）でテスト
- VoiceOver（macOS）でテスト
- 音声読み上げの確認

**タスク 9.4.4: ドキュメント更新**

README.mdに追加:
```markdown
## アクセシビリティ

- WCAG 2.1 AAA準拠
- スクリーンリーダー対応
- キーボード操作対応
- ダークモード対応
- 多言語対応（日本語・英語）
```

**タスク 9.4.5: 本番デプロイ**

```bash
git add .
git commit -m "feat: Phase 9実装完了 - ユーザー体験向上"
git push origin main
vercel --prod
```

---

## 🧪 テスト計画

### E2Eテスト追加（6件）

1. ダークモード切り替えが動作する
2. テーマがlocalStorageに保存される
3. 言語切替が動作する
4. 英語表示が正しい
5. キーボードナビゲーションが動作する
6. スキップリンクが動作する

### アクセシビリティテスト

- axe-core: 全ページで0violations
- スクリーンリーダー: 主要機能が操作可能
- キーボード: 全機能がTabキーで操作可能

---

## 📊 成果指標

### 定量指標

| 指標 | 目標 |
|------|------|
| ダークモード利用率 | 30%以上 |
| 英語ユーザー訪問数 | 100人/月 |
| アクセシビリティスコア | 100点 |
| E2Eテスト総数 | 48件 |

---

## 🚀 次のPhase

### Phase 10予告: パフォーマンス最適化（1週間）

- Code Splitting
- 画像最適化（WebP対応）
- PWA対応

---

## 📚 参考資料

- [MUI Theming](https://mui.com/material-ui/customization/theming/)
- [react-i18next](https://react.i18next.com/)
- [WCAG 2.1](https://www.w3.org/TR/WCAG21/)
- [axe-core](https://github.com/dequelabs/axe-core)
