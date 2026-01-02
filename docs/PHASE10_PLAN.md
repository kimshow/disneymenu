# Phase 10: パフォーマンス最適化 - 実装計画書

**想定期間**: 1週間（実働7日）  
**開始予定**: Phase 9完了後  
**担当**: フロントエンド + DevOps  
**目的**: アプリケーション全体のパフォーマンス最適化とPWA対応

---

## 📌 エグゼクティブサマリー

### 目標
- バンドルサイズを30%削減してページ読み込み速度を向上
- 画像最適化で初回表示を高速化
- PWA対応でオフライン利用を可能にする

### 主要機能（優先度順）

1. **バンドルサイズ削減** 🔥（2日間）
   - Code Splitting
   - Tree Shaking
   - Dynamic Import

2. **画像最適化** 🔥（2日間）
   - WebP対応
   - Lazy Loading
   - Responsive Images

3. **PWA対応** 🟡（2日間）
   - Service Worker
   - オフライン機能
   - インストール対応

4. **テスト・デバッグ** 🟢（1日間）
   - Lighthouseスコア測定
   - バンドル分析

---

## 🎯 現状分析

### ✅ Phase 9完了時点での実装状況

#### バンドルサイズ
- 総バンドルサイズ: 約1.2MB（gzip後: 350KB）
- 主な依存関係:
  - React + ReactDOM: 140KB
  - Material-UI: 320KB
  - Chart.js: 197KB
  - Google Maps: 45KB
  - その他: 498KB

#### パフォーマンス
- Lighthouse Performance: 85点
- FCP: 2.1秒
- LCP: 3.2秒
- TTI: 3.8秒

#### 画像
- 形式: JPEG/PNG
- 最適化: なし
- Lazy Loading: なし

---

## 🛠️ 技術設計

### バンドルサイズ削減戦略

#### Code Splitting

```typescript
// ルートベースのCode Splitting
const Home = lazy(() => import('./pages/Home'));
const MenuDetail = lazy(() => import('./pages/MenuDetail'));
const Restaurants = lazy(() => import('./pages/Restaurants'));
const Map = lazy(() => import('./pages/Map'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Favorites = lazy(() => import('./pages/Favorites'));

// コンポーネントレベルのCode Splitting
const Chart = lazy(() => import('./components/charts/PriceDistributionChart'));
```

#### Tree Shaking

```typescript
// ❌ 悪い例
import * as MuiIcons from '@mui/icons-material';

// ✅ 良い例
import FavoriteIcon from '@mui/icons-material/Favorite';
import SearchIcon from '@mui/icons-material/Search';
```

#### Dynamic Import

```typescript
// 条件付きインポート
if (isDarkMode) {
  const darkTheme = await import('./themes/dark');
  applyTheme(darkTheme.default);
}

// イベントハンドラでのインポート
const handleExport = async () => {
  const { exportToCSV } = await import('./utils/export');
  exportToCSV(data);
};
```

### 画像最適化

#### WebP変換

```bash
# 画像をWebPに変換
npm install -D imagemin imagemin-webp

# scripts/convert-to-webp.js
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');

imagemin(['public/images/*.{jpg,png}'], {
  destination: 'public/images/webp',
  plugins: [imageminWebp({ quality: 85 })]
});
```

#### Responsive Images

```typescript
<picture>
  <source
    srcSet={`${menu.imageUrl}.webp`}
    type="image/webp"
  />
  <source
    srcSet={`${menu.imageUrl}.jpg`}
    type="image/jpeg"
  />
  <img
    src={menu.imageUrl}
    alt={menu.name}
    loading="lazy"
  />
</picture>
```

### PWA対応

#### Service Worker

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'ディズニーメニュー検索',
        short_name: 'ディズニーメニュー',
        description: '東京ディズニーリゾートの全メニューを検索',
        theme_color: '#1976d2',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.disneymenu\.vercel\.app\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24時間
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30日間
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

## 📅 実装手順

### Phase 10.1: バンドルサイズ削減（2日間）

#### Day 1: Code Splittingとlazy loading

**タスク 10.1.1: ルートベースのCode Splitting**

```typescript
// App.tsx
import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';

const Home = lazy(() => import('./pages/Home'));
const MenuDetail = lazy(() => import('./pages/MenuDetail'));
const Restaurants = lazy(() => import('./pages/Restaurants'));
const Map = lazy(() => import('./pages/Map'));
const Statistics = lazy(() => import('./pages/Statistics'));
const Favorites = lazy(() => import('./pages/Favorites'));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
    <CircularProgress />
  </Box>
);

export const App = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu/:id" element={<MenuDetail />} />
        <Route path="/restaurants" element={<Restaurants />} />
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route path="/map" element={<Map />} />
        <Route path="/statistics" element={<Statistics />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </Suspense>
  );
};
```

**タスク 10.1.2: コンポーネントレベルのCode Splitting**

```typescript
// Statistics.tsx
const PriceDistributionChart = lazy(() => import('../components/charts/PriceDistributionChart'));
const CategoryDistributionChart = lazy(() => import('../components/charts/CategoryDistributionChart'));

export const Statistics = () => {
  return (
    <Container>
      <Suspense fallback={<CircularProgress />}>
        <PriceDistributionChart data={stats.priceDistribution} />
      </Suspense>
      <Suspense fallback={<CircularProgress />}>
        <CategoryDistributionChart data={stats.categoryDistribution} />
      </Suspense>
    </Container>
  );
};
```

#### Day 2: Tree ShakingとDynamic Import

**タスク 10.1.3: MUIアイコンの最適化**

```bash
# vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-core': ['@mui/material'],
          'mui-icons': ['@mui/icons-material'],
          'charts': ['chart.js', 'react-chartjs-2'],
          'maps': ['@react-google-maps/api'],
        },
      },
    },
  },
});
```

**タスク 10.1.4: 不要な依存関係の削除**

```bash
# package.jsonから未使用パッケージを特定
npx depcheck

# 未使用パッケージをアンインストール
npm uninstall <unused-packages>
```

**タスク 10.1.5: バンドル分析**

```bash
npm run build -- --analyze
```

目標:
- 初回バンドル: 300KB以下（gzip後）
- 各ルート: 100KB以下（gzip後）

---

### Phase 10.2: 画像最適化（2日間）

#### Day 3: WebP変換とResponsive Images

**タスク 10.2.1: imagemin-webpのセットアップ**

```bash
npm install -D imagemin imagemin-webp sharp
```

**タスク 10.2.2: 画像変換スクリプト**

```javascript
// scripts/optimize-images.js
const imagemin = require('imagemin');
const imageminWebp = require('imagemin-webp');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function optimizeImages() {
  const imageDir = 'public/images';
  const outputDir = 'public/images/optimized';

  // WebP変換
  await imagemin([`${imageDir}/*.{jpg,png}`], {
    destination: `${outputDir}/webp`,
    plugins: [
      imageminWebp({ quality: 85 }),
    ],
  });

  // レスポンシブ画像生成（3サイズ）
  const images = fs.readdirSync(imageDir);
  for (const img of images) {
    if (!/\.(jpg|png)$/.test(img)) continue;

    const inputPath = path.join(imageDir, img);
    const name = path.parse(img).name;

    await sharp(inputPath)
      .resize(400, 300)
      .toFile(path.join(outputDir, `${name}-sm.jpg`));

    await sharp(inputPath)
      .resize(800, 600)
      .toFile(path.join(outputDir, `${name}-md.jpg`));

    await sharp(inputPath)
      .resize(1200, 900)
      .toFile(path.join(outputDir, `${name}-lg.jpg`));
  }

  console.log('画像最適化完了');
}

optimizeImages();
```

**タスク 10.2.3: ResponsiveImage.tsxコンポーネント**

```typescript
interface ResponsiveImageProps {
  src: string;
  alt: string;
  sizes?: string;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  sizes = '(max-width: 600px) 400px, (max-width: 960px) 800px, 1200px',
}) => {
  const baseName = src.split('.')[0];

  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`
          ${baseName}-sm.webp 400w,
          ${baseName}-md.webp 800w,
          ${baseName}-lg.webp 1200w
        `}
        sizes={sizes}
      />
      <source
        type="image/jpeg"
        srcSet={`
          ${baseName}-sm.jpg 400w,
          ${baseName}-md.jpg 800w,
          ${baseName}-lg.jpg 1200w
        `}
        sizes={sizes}
      />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        style={{ width: '100%', height: 'auto' }}
      />
    </picture>
  );
};
```

#### Day 4: Lazy LoadingとプレースホルダーBlur

**タスク 10.2.4: IntersectionObserver Lazy Loading**

```typescript
import { useEffect, useRef, useState } from 'react';

export const useLazyImage = (src: string) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' } // 100px手前から読み込み開始
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return { imgRef, imageSrc };
};

// 使用例
export const LazyImage: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const { imgRef, imageSrc } = useLazyImage(src);

  return (
    <img
      ref={imgRef}
      src={imageSrc || '/placeholder.svg'}
      alt={alt}
      style={{ transition: 'opacity 0.3s', opacity: imageSrc ? 1 : 0.5 }}
    />
  );
};
```

**タスク 10.2.5: BlurHashプレースホルダー（オプション）**

```bash
npm install blurhash react-blurhash
```

```typescript
import { Blurhash } from 'react-blurhash';

export const ImageWithBlur: React.FC<{
  src: string;
  blurHash: string;
  alt: string;
}> = ({ src, blurHash, alt }) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      {!loaded && (
        <Blurhash
          hash={blurHash}
          width="100%"
          height="100%"
          resolutionX={32}
          resolutionY={32}
          punch={1}
        />
      )}
      <img
        src={src}
        alt={alt}
        onLoad={() => setLoaded(true)}
        style={{ opacity: loaded ? 1 : 0, transition: 'opacity 0.3s' }}
      />
    </div>
  );
};
```

---

### Phase 10.3: PWA対応（2日間）

#### Day 5: Service Worker設定

**タスク 10.3.1: vite-plugin-pwaインストール**

```bash
npm install -D vite-plugin-pwa
```

**タスク 10.3.2: vite.config.tsの設定**

```typescript
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'ディズニーメニュー検索',
        short_name: 'ディズニーメニュー',
        description: '東京ディズニーリゾートの全メニューを検索',
        theme_color: '#1976d2',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icons/icon-72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/icon-96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/icons/icon-144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/icon-152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/disneymenu\.vercel\.app\/api\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24時間
              },
              networkTimeoutSeconds: 10,
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30日間
              },
            },
          },
        ],
      },
    }),
  ],
});
```

#### Day 6: オフライン機能とインストールプロンプト

**タスク 10.3.3: オフライン通知コンポーネント**

```typescript
import { Snackbar, Alert } from '@mui/material';
import { useState, useEffect } from 'react';

export const OfflineNotification = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <Snackbar open={isOffline} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity="warning" sx={{ width: '100%' }}>
        オフラインモードで動作しています。一部機能が制限されます。
      </Alert>
    </Snackbar>
  );
};
```

**タスク 10.3.4: インストールプロンプトコンポーネント**

```typescript
import { Button, Snackbar, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useState, useEffect } from 'react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWAがインストールされました');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  return (
    <Snackbar
      open={showPrompt}
      message="アプリをホーム画面に追加しますか？"
      action={
        <>
          <Button color="primary" size="small" onClick={handleInstall}>
            追加
          </Button>
          <IconButton size="small" color="inherit" onClick={() => setShowPrompt(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </>
      }
    />
  );
};
```

**タスク 10.3.5: Service Worker登録**

```typescript
// main.tsx
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('SW registered: ', registration);
      },
      (error) => {
        console.log('SW registration failed: ', error);
      }
    );
  });
}
```

---

### Phase 10.4: テスト・デバッグ（1日間）

#### Day 7: パフォーマンステストと最終調整

**タスク 10.4.1: Lighthouseスコア測定**

```bash
npm run build
npm run preview

# 別のターミナルで
npx lighthouse http://localhost:4173 --view --output=json --output=html --output-path=./lighthouse-report
```

目標スコア:
- Performance: 95以上
- Accessibility: 98以上
- Best Practices: 95以上
- SEO: 95以上
- PWA: 100

**タスク 10.4.2: バンドル分析**

```bash
npm run build -- --analyze
```

目標:
- 初回バンドル: 250KB以下（gzip後）
- 各チャンク: 100KB以下（gzip後）
- Total JS: 800KB以下（gzip後）

**タスク 10.4.3: Core Web Vitals測定**

```typescript
// utils/webVitals.ts
import { onCLS, onFID, onFCP, onLCP, onTTFB } from 'web-vitals';

export function reportWebVitals() {
  onCLS(console.log);
  onFID(console.log);
  onFCP(console.log);
  onLCP(console.log);
  onTTFB(console.log);
}

// main.tsx
reportWebVitals();
```

目標値:
- FCP: 1.5秒以下
- LCP: 2.0秒以下
- CLS: 0.1以下
- FID: 50ms以下
- TTFB: 0.5秒以下

**タスク 10.4.4: キャッシュ戦略の検証**

```bash
# Chrome DevToolsで確認
# Application > Cache Storage

# オフラインテスト
# Network > Throttling > Offline
```

**タスク 10.4.5: ドキュメント更新と本番デプロイ**

README.mdに追加:
```markdown
## パフォーマンス

- Lighthouse Performance: 95点以上
- バンドルサイズ: 250KB（gzip後）
- PWA対応: オフライン利用可能
- 画像最適化: WebP + Lazy Loading
- Core Web Vitals: すべて緑
```

```bash
git add .
git commit -m "feat: Phase 10実装完了 - パフォーマンス最適化"
git push origin main
vercel --prod
```

---

## 🧪 テスト計画

### パフォーマンステスト

| 指標 | 目標 | 測定方法 |
|------|------|---------|
| Lighthouse Performance | 95以上 | Lighthouse CI |
| FCP | 1.5秒以下 | Web Vitals |
| LCP | 2.0秒以下 | Web Vitals |
| CLS | 0.1以下 | Web Vitals |
| バンドルサイズ | 250KB以下 | webpack-bundle-analyzer |

### PWAテスト

- ✅ オフライン動作確認
- ✅ インストール可能確認
- ✅ アイコン表示確認
- ✅ スプラッシュスクリーン確認

---

## 📊 成果指標

### パフォーマンス改善

| 項目 | Phase 9 | Phase 10 | 改善率 |
|------|---------|----------|--------|
| 初回読み込み | 350KB | 250KB | 28.6%↓ |
| FCP | 2.1秒 | 1.4秒 | 33.3%↓ |
| LCP | 3.2秒 | 1.9秒 | 40.6%↓ |
| Lighthouse | 85点 | 95点 | 11.8%↑ |

### 定量指標

| 指標 | 目標 |
|------|------|
| PWAインストール数 | 50人/月 |
| オフライン利用率 | 10%以上 |
| バウンス率 | 30%以下 |
| E2Eテスト総数 | 48件（変更なし） |

---

## 🚀 Phase 10完了後の展望

### 短期（1-2ヶ月）
- パフォーマンスモニタリング継続
- ユーザーフィードバック収集
- 小規模な改善とバグ修正

### 中期（3-6ヶ月）
- Phase 11: ユーザー機能（ログイン、レビュー）
- Phase 12: ソーシャル機能（共有、フォロー）
- A/Bテストの実施

### 長期（6-12ヶ月）
- Phase 13: AI機能（レコメンドエンジン）
- データ分析基盤の構築
- スケーラビリティ向上

---

## 📚 参考資料

### パフォーマンス最適化
- [Web.dev - Performance](https://web.dev/performance/)
- [Vite - Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
- [webpack Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

### 画像最適化
- [imagemin](https://github.com/imagemin/imagemin)
- [Sharp](https://sharp.pixelplumbing.com/)
- [WebP](https://developers.google.com/speed/webp)

### PWA
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [Workbox](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### Core Web Vitals
- [web-vitals](https://github.com/GoogleChrome/web-vitals)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
