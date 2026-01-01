# フロントエンド空白ページ問題 - 詳細修正指示書

## 📋 問題の概要

フロントエンド（React + Vite）を起動しても、ブラウザに何も表示されない問題が発生しています。

**症状:**
- `npm run dev` でフロントエンドは起動する
- ブラウザで `http://localhost:5173` または `http://localhost:5174` にアクセスしても空白ページが表示される
- Playwright E2Eテストが12/13件失敗する

**根本原因:**
1. **バックエンドAPIへの接続失敗** - フロントエンドが `http://localhost:8000/api` に直接アクセスしようとするが、バックエンドが起動していないか、CORSやネットワークエラーが発生
2. **Viteプロキシ設定の欠如** - 開発環境でAPIリクエストをプロキシする設定がないため、異なるポート間の通信が不安定
3. **エラー情報の不足** - API接続エラーが発生しても、具体的なエラー内容が画面やコンソールに表示されない

---

## 🎯 修正目標

- ✅ バックエンドAPIとの通信を確実に確立
- ✅ 開発環境でのCORS問題を解消
- ✅ エラー発生時に詳細な情報を表示
- ✅ フロントエンドがバックエンドの起動状態を検知
- ✅ E2Eテストが安定して動作

---

## 🔧 修正手順

⚠️ **重要**: Phase 0は前提条件として既に実装済みと想定しています。Phase 1-2は必ずセットで実装してください。

---

### Phase 0: データ構造の修正（前提条件・既に実装済み）

このPhaseは既に完了していることを想定していますが、未実施の場合は最初に実装してください。

#### ファイル: `frontend/src/types/menu.ts`

**修正内容**:
- `images?: string[]` → `image_urls: string[]`
- `thumbnail_url?: string` を追加
- `is_seasonal: boolean`, `is_new: boolean`, `is_available: boolean` を追加
- `characters?: string[]`, `allergens?: string[]` を追加

#### ファイル: `frontend/src/components/MenuCard.tsx`

**修正内容**:
- `menu.og_image || menu.images?.[0]` → `menu.thumbnail_url || menu.image_urls?.[0]`
- `is_seasonal`, `is_new` フィールドを使用したChip表示を追加

✅ **このPhaseは既に完了済みです。**

---

### Phase 1-2: Viteプロキシ設定とAPI統一（最重要・同時実装必須）

⚠️ **Phase 1とPhase 2は相互依存しているため、必ず同時に実装してください。**

#### ファイル1: `frontend/vite.config.ts`

**現在のコード:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
```

**修正後のコード:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.error('Proxy error:', err);
          });
          proxy.on('proxyReq', (_proxyReq, req, _res) => {
            console.log('Proxying:', req.method, req.url, '-> http://localhost:8000' + req.url);
          });
        },
      },
    },
  },
})
```

**説明:**
- `proxy['/api']`: `/api/*` へのすべてのリクエストを `http://localhost:8000` にプロキシ
- `changeOrigin: true`: ホストヘッダーをターゲットURLに変更（CORS対策）
- `secure: false`: HTTPS証明書の検証をスキップ（ローカル開発用）
- `configure`: プロキシのエラーとリクエストをログ出力（デバッグ用）
- 未使用のパラメータには `_` プレフィックスを付けて型エラーを回避

**効果:**
- フロントエンドの `http://localhost:5174/api/menus` が自動的に `http://localhost:8000/api/menus` に転送される
- CORSエラーが発生しない
- バックエンドが停止している場合、明確なエラーメッセージが出る

#### ファイル2: `frontend/playwright.config.ts`

**現在のコード:**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
  },
})
```

**修正後のコード:**
```typescript
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5174',  // 5173 → 5174 に変更
  },
  webServer: {
    command: 'npm run dev',
**環境変数による設定（オプション）:**

より柔軟な設定が必要な場合は、環境変数を使用できます。

`.env.development` ファイルを作成:
```env
# 開発環境用API設定
VITE_API_BASE_URL=/api
VITE_BACKEND_URL=http://localhost:8000
```

`.env.production` ファイルを作成:
```env
# 本番環境用API設定
VITE_API_BASE_URL=/api
```

`api.ts` で環境変数を使用:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

⚠️ **注意**: 環境変数を変更した場合は、必ず開発サーバーを再起動してください（`Ctrl+C` → `npm run dev`）。

#### ✅ Phase 1-2 完了後の検証

1. **開発サーバーを再起動**:
   ```bash
   cd /Users/kimurashoya/disneymenu/frontend
   npm run dev
   ```

2. **プロキシログを確認**:
   - ブラウザで http://localhost:5174/ を開く
   - ブラウザConsoleで「Proxying: GET /api/menus -> http://localhost:8000/api/menus」のようなログが表示されることを確認

3. **ネットワークタブで確認**:
   - F12キー → Network タブ → XHR/Fetch
   - Request URL が `/api/menus` (相対パス) になっていることを確認
   - Status が `200 OK` または `Proxy error` (バックエンド停止時) を確認

4. **APIクライアントの動作確認**:
   ```javascript
   // ブラウザConsoleで実行
   fetch('/api/stats').then(r => r.json()).then(console.log)
   
   // 期待される出力:
   // {success: true, data: {total_menus: 3, ...}}
   ```

---

### Phase 3-4: エラーハンドリングの強化（同時実装推奨）rt.meta.env.PROD
  ? '/api'
  : 'http://localhost:8000/api';
```

**修正後のコード:**
```typescript
// 開発環境・本番環境ともにプロキシ経由で統一
const API_BASE_URL = '/api';

// または環境変数を使用する場合:
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
```

**説明:**
- 開発環境でも `/api` を使用することで、Viteプロキシ経由でバックエンドにアクセス
- 直接 `http://localhost:8000/api` にアクセスしないため、CORSやネットワークエラーが発生しにくい
- 本番環境（Vercel）でも同じパスで動作する

**追加設定（オプション）:**

`.env.development` ファイルを作成:
```env
VITE_API_BASE_URL=/api
```

**説明:**
- 開発環境では詳細なエラーメッセージと対処方法を表示
- 本番環境では簡潔なメッセージのみ表示（セキュリティ対策）
- コンソールにもエラーログを出力

#### ファイル2: `frontend/src/services/api.ts` - インターセプター改善ge.tsx`

**現在のエラー表示:**
```tsx
if (error) {
  return (
    <Container sx={{ py: 4 }}>
      <Alert severity="error">
        メニューの読み込みに失敗しました。もう一度お試しください。
      </Alert>
    </Container>
  );
}
```

**修正後のエラー表示:**
```tsx
if (error) {
  console.error('MenuListPage Error:', error);
  
  return (
    <Container sx={{ py: 4 }}>
      <Alert severity="error">
        <Typography variant="h6" gutterBottom>
          メニューの読み込みに失敗しました
        </Typography>
        
        {/* 開発環境でのみ詳細を表示 */}
        {import.meta.env.DEV && (
          <>
            <Typography variant="body2" sx={{ mt: 2, fontFamily: 'monospace' }}>
              エラー詳細:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {error instanceof Error ? error.message : JSON.stringify(error, null, 2)}
            </Typography>
            
            <Typography variant="body2" sx={{ mt: 2 }}>
              <strong>対処方法:</strong>
            </Typography>
            <Typography variant="body2" component="div" sx={{ mt: 1 }}>
              <ol>
                <li>バックエンドが起動しているか確認: <code>lsof -ti:8000</code></li>
                <li>バックエンドを起動: <code>cd api && uvicorn index:app --reload --port 8000</code></li>
                <li>APIが応答するか確認: <code>curl http://localhost:8000/api/menus</code></li>
              </ol>
            </Typography>
          </>
        )}
        
        {/* 本番環境では簡潔なメッセージのみ */}
        {!import.meta.env.DEV && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            もう一度お試しください。問題が解決しない場合は、管理者にお問い合わせください。
**説明:**
- エラーの種類を判別して詳細なログを出力
- バックエンド未起動の場合は明確なメッセージを表示
- デバッグが容易になる

#### ✅ Phase 3-4 完了後の検証

1. **エラー表示の確認**:
   - バックエンドを停止: `Ctrl+C` (port 8000のプロセス)
   - ブラウザをリロード: `F5`
   - 詳細なエラーメッセージが表示されることを確認

2. **Consoleログの確認**:
   - F12キー → Console タブ
   - 「API No Response」のような詳細ログが出力されることを確認
   - 対処方法が表示されることを確認

---

### Phase 5: React Query DevToolsの追加（オプション・デバッグ用）
**説明:**
- 開発環境では詳細なエラーメッセージと対処方法を表示
- 本番環境では簡潔なメッセージのみ表示（セキュリティ対策）
- コンソールにもエラーログを出力

---

### Phase 4: APIインターセプターの改善

#### ファイル: `frontend/src/services/api.ts`

**現在のインターセプター:**
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
```

**修正後のインターセプター:**
```typescript
// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => {
    // 成功時のログ（開発環境のみ）
    if (import.meta.env.DEV) {
      console.log('API Success:', response.config.url, response.status);
    }
    return response;
  },
  (error) => {
    // 詳細なエラーログ
    if (error.response) {
      // サーバーがエラーレスポンスを返した場合
      console.error('API Error Response:', {
        url: error.config?.url,
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    } else if (error.request) {
      // リクエストは送信されたが、レスポンスがない場合（バックエンド停止など）
      console.error('API No Response:', {
        url: error.config?.url,
        message: 'バックエンドサーバーに接続できません。サーバーが起動しているか確認してください。',
      });
    } else {
      // リクエスト設定時のエラー
      console.error('API Request Setup Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);
---

### Phase 6: APIヘルスチェックコンポーネントの追加（オプション・UX向上）

#### 新規ファイル: `frontend/src/components/ApiHealthCheck.tsx`

```tsx
/**
 * APIヘルスチェックコンポーネント
 * バックエンドが起動していない場合に警告を表示
 */
import { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

export function ApiHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkHealth = async () => {
    setStatus('checking');
    try {
      // ⚠️ 修正: プロキシ経由で統一（/api/stats を使用）
      const response = await axios.get('/api/stats', {
        timeout: 3000,
      });
      console.log('Backend health check:', response.status);
      setStatus('ok');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus('error');
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          setErrorMessage('バックエンドサーバーに接続できません。');
        } else {
          setErrorMessage(`接続エラー: ${error.message}`);
        }
      } else {
        setErrorMessage('不明なエラーが発生しました。');
      }
    }
  };rt { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // 失敗時のリトライ回数を1回に制限
      refetchOnWindowFocus: false, // ウィンドウフォーカス時の自動再取得を無効化
      staleTime: 5 * 60 * 1000, // 5分間はデータを新鮮とみなす
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      {/* 開発環境でのみReact Query DevToolsを表示 */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </StrictMode>,
)
```

**追加パッケージのインストール:**
```bash
cd frontend
npm install @tanstack/react-query-devtools
```

**説明:**
- React Query DevToolsで、データ取得の状態をビジュアルに確認できる
- クエリのキャッシュ、エラー、ローディング状態を簡単に確認可能
- 開発環境でのみ表示される

---

### Phase 6: APIヘルスチェックコンポーネントの追加（オプション）

#### 新規ファイル: `frontend/src/components/ApiHealthCheck.tsx`

```tsx
/**
 * APIヘルスチェックコンポーネント
 * バックエンドが起動していない場合に警告を表示
 */
import { useEffect, useState } from 'react';
import { Alert, AlertTitle, Box, Button, CircularProgress } from '@mui/material';
import axios from 'axios';

export function ApiHealthCheck() {
  const [status, setStatus] = useState<'checking' | 'ok' | 'error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const checkHealth = async () => {
    setStatus('checking');
    try {
      const response = await axios.get('http://localhost:8000/', {
        timeout: 3000,
      });
      console.log('Backend health check:', response.status);
      setStatus('ok');
    } catch (error) {
      console.error('Backend health check failed:', error);
      setStatus('error');
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
          setErrorMessage('バックエンドサーバーに接続できません。');
        } else {
          setErrorMessage(`接続エラー: ${error.message}`);
        }
      } else {
        setErrorMessage('不明なエラーが発生しました。');
      }
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (status === 'checking') {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 1,
          boxShadow: 3,
        }}
      >
        <CircularProgress size={20} />
      </Box>
    );
  }

  if (status === 'error') {
    return (
      <Box
        sx={{
**説明:**
- バックエンドの起動状態をプロキシ経由でチェック（CORS問題を回避）
- 未起動の場合、画面上部に警告を表示
- 「再試行」ボタンで再チェック可能
- 本番環境でも動作する設計

---

## 📊 実装順序の推奨

### 必須実装（この順序で）

```
1. Phase 0: データ構造修正 ✅ (既に完了済み)
   ↓
2. Phase 1-2: プロキシ設定 + API統一 🔴 (同時実装必須)
   ├─ vite.config.ts
   ├─ playwright.config.ts
   └─ api.ts
   ↓
3. Phase 3-4: エラーハンドリング 🟡 (同時実装推奨)
   ├─ MenuListPage.tsx
   └─ api.ts (インターセプター)
```

### オプション実装（必要に応じて）

```
4. Phase 5: React Query DevTools 🟢 (デバッグ用)
   └─ main.tsx
   
5. Phase 6: APIヘルスチェック 🟢 (UX向上)
   ├─ ApiHealthCheck.tsx (新規作成)
   └─ App.tsx
```

**依存関係**:
- Phase 1-2 は相互依存 → 必ず同時実装
- Phase 3-4 は Phase 1-2 の完了後に実装
- Phase 5-6 は Phase 1-2 の完了後なら任意のタイミングで実装可能

---

## 🧪 動作確認手順rt
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={checkHealth}>
              再試行
            </Button>
          }
        >
          <AlertTitle>バックエンドサーバーエラー</AlertTitle>
          {errorMessage}
          <br />
          <strong>起動コマンド:</strong>
          <br />
          <code style={{ fontSize: '0.85em' }}>
            cd api && uvicorn index:app --reload --port 8000
          </code>
        </Alert>
      </Box>
    );
  }

  // 正常時は何も表示しない
  return null;
}
```

#### ファイル: `frontend/src/App.tsx`

**修正（ApiHealthCheckを追加）:**
```tsx
import { Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { MenuListPage } from './pages/MenuListPage';
import { ApiHealthCheck } from './components/ApiHealthCheck';  // 追加

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
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {import.meta.env.DEV && <ApiHealthCheck />}  {/* 開発環境でのみ表示 */}
      <Routes>
        <Route path="/" element={<MenuListPage />} />
        <Route path="/menus" element={<MenuListPage />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
```

**説明:**
- バックエンドの起動状態をチェック
- 未起動の場合、画面上部に警告を表示
- 「再試行」ボタンで再チェック可能

---

## 🧪 動作確認手順

### ステップ1: バックエンド起動

```bash
# ターミナル1: バックエンド
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**期待される出力:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Application startup complete.
```

**確認コマンド:**
```bash
# 別ターミナルで
curl http://localhost:8000/api/stats

# 期待される出力:
# {"success":true,"data":{"total_menus":3,...}}
```

---

### ステップ2: フロントエンド起動

```bash
# ターミナル2: フロントエンド
cd /Users/kimurashoya/disneymenu/frontend
npm run dev
```

**期待される出力:**
```
VITE v7.3.0  ready in 500 ms

  ➜  Local:   http://localhost:5174/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

### ステップ3: ブラウザで確認

1. **ブラウザを開く**: http://localhost:5174/

2. **期待される表示**:
   - 「メニュー一覧」のタイトル
   - 3つのメニューカード
   - 各カードに画像、名前、価格、レストラン情報が表示

3. **開発者ツールで確認** (`F12`キー):
   
   **Console タブ:**
   ```
   API Success: /api/menus 200
   ```
   
   **Network タブ:**
   - `menus` リクエスト: Status `200 OK`
   - Response に JSON データが表示される

---

### ステップ4: エラー状態の確認

**バックエンドを停止した状態でテスト:**

---

### 問題4: データが表示されない（カードが空）

**原因**: データ構造の不一致（Phase 0で修正済み）

**確認方法**:
1. ブラウザのConsoleで以下を実行:
   ```javascript
   fetch('/api/menus').then(r => r.json()).then(console.log)
   ```
2. `data` 配列内のオブジェクト構造を確認
3. `image_urls`, `is_seasonal`, `is_new`, `is_available` フィールドが存在するか確認

---

### 問題5: 「Cannot find module '@mui/material'」エラー

### 🔴 必須項目

- [ ] **Phase 0**: データ構造修正（既に完了済みと想定）
  - [ ] `frontend/src/types/menu.ts` 修正確認
  - [ ] `frontend/src/components/MenuCard.tsx` 修正確認

- [ ] **Phase 1-2**: プロキシ設定とAPI統一（同時実装）
  - [ ] `frontend/vite.config.ts` にプロキシ設定を追加
  - [ ] `frontend/playwright.config.ts` のポートを5174に変更
  - [ ] `frontend/src/services/api.ts` のAPI_BASE_URLを `/api` に変更
  - [ ] 開発サーバーを再起動して動作確認
  - [ ] プロキシログをConsoleで確認
  - [ ] NetworkタブでRequest URLが相対パスになっていることを確認

- [ ] **Phase 3-4**: エラーハンドリング強化（同時実装推奨）
  - [ ] `frontend/src/pages/MenuListPage.tsx` のエラー表示を強化
  - [ ] `frontend/src/services/api.ts` のインターセプターを改善
  - [ ] バックエンド停止状態でエラー表示を確認

### 🟡 オプション項目

- [ ] **Phase 5**: React Query DevTools（デバッグ用）
  - [ ] `npm install @tanstack/react-query-devtools`
  - [ ] `frontend/src/main.tsx` にDevToolsを追加
  - [ ] ブラウザでDevToolsが表示されることを確認

- [ ] **Phase 6**: APIヘルスチェック（UX向上）
  - [ ] `frontend/src/components/ApiHealthCheck.tsx` を作成
  - [ ] `frontend/src/App.tsx` にApiHealthCheckを追加
  - [ ] バックエンド停止時に警告バナーが表示されることを確認

### ✅ 最終確認

- [ ] バックエンドを起動して動作確認（port 8000）
- [ ] フロントエンドを起動して画面表示確認（port 5174）
- [ ] ブラウザConsoleでエラーがないことを確認
- [ ] NetworkタブでAPI通信が成功していることを確認
- [ ] メニューカードが正しく表示されることを確認
- [ ] E2Eテストを実行して13/13テストがパスすることを確認

**解決策**:
```bash
# 型チェック
cd /Users/kimurashoya/disneymenu/frontend
npm run type-check

# または
npx tsc --noEmit
```

エラーが表示された場合は、該当ファイルを確認して修正してください。

---

### 問題7: 「Port 8000 is already in use」

**確認**:
```bash
lsof -ti:8000
```

**解決策**:
```bash
# 既存のプロセスを停止
kill -9 $(lsof -ti:8000)

# バックエンドを再起動
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**別のポートを使用する場合**:
```bash
# バックエンドを別のポートで起動
PYTHONPATH=. uvicorn api.index:app --reload --port 8001

# vite.config.ts のプロキシも変更:
proxy: {
  '/api': {
    target: 'http://localhost:8001',  // ← 8001に変更
    // ...
  }
}
```

---

## 📝 チェックリスト
- 13/13 テストがパス
- HTMLレポートが自動的に開く

---

## 📊 修正前後の比較

| 項目 | 修正前 | 修正後 |
|------|--------|--------|
| API接続方式 | 直接 `http://localhost:8000/api` | Viteプロキシ経由 `/api` |
| CORS問題 | 発生する可能性あり | プロキシにより解決 |
| エラー表示 | 簡潔なメッセージのみ | 詳細なエラー情報と対処方法 |
| デバッグ | Console手動確認が必要 | React Query DevTools使用可能 |
| バックエンド監視 | なし | ApiHealthCheckで自動監視 |
| E2Eテスト | 12/13 失敗 | 13/13 パス（期待値） |

---

## 🐛 トラブルシューティング

### 問題1: 「Proxy error」がConsoleに出る

**原因**: バックエンドが起動していない

**解決策**:
```bash
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

---

### 問題2: 「Module not found: @tanstack/react-query-devtools」

**原因**: DevToolsパッケージがインストールされていない

**解決策**:
```bash
cd /Users/kimurashoya/disneymenu/frontend
npm install @tanstack/react-query-devtools
```

---

### 問題3: ポート5174が既に使用中

**確認**:
```bash
lsof -ti:5174
```

**解決策**:
```bash
kill -9 $(lsof -ti:5174)
npm run dev
```

または、`vite.config.ts` でポートを変更:
```typescript
server: {
  port: 5175,  // 別のポートを指定
  proxy: { ... }
}
```

---

### 問題4: データが表示されない（カードが空）

**原因**: データ構造の不一致（既に修正済み）

**確認方法**:
1. ブラウザのConsoleで以下を実行:
   ```javascript
   fetch('/api/menus').then(r => r.json()).then(console.log)
   ```
2. `data` 配列内のオブジェクト構造を確認
3. `image_urls`, `is_seasonal`, `is_new`, `is_available` フィールドが存在するか確認

---

## 📝 チェックリスト

修正作業の完了確認:

- [ ] `frontend/vite.config.ts` にプロキシ設定を追加
- [ ] `frontend/src/services/api.ts` のAPI_BASE_URLを `/api` に変更
- [ ] `frontend/src/pages/MenuListPage.tsx` のエラー表示を強化
- [ ] `frontend/src/services/api.ts` のインターセプターを改善
- [ ] （オプション）`frontend/src/main.tsx` にReact Query DevToolsを追加
- [ ] （オプション）`frontend/src/components/ApiHealthCheck.tsx` を作成
- [ ] （オプション）`frontend/src/App.tsx` にApiHealthCheckを追加
- [ ] バックエンドを起動して動作確認
- [ ] フロントエンドを起動して画面表示確認
- [ ] ブラウザConsoleとNetworkタブでエラーがないか確認
- [ ] E2Eテストを実行して全テストがパスすることを確認

---

## 🎯 期待される最終状態

### 正常動作時

1. **バックエンド**: `http://localhost:8000` で起動中
2. **フロントエンド**: `http://localhost:5174` で起動中
3. **ブラウザ**:
   - メニュー一覧が表示される
   - 3つのメニューカードが正しくレンダリングされる
   - 画像、名前、価格、レストラン情報が表示される
   - タグチップが表示される（「季節限定」「新商品」など）
4. **Console**: エラーなし、`API Success` ログのみ
5. **Network**: `/api/menus` リクエストが `200 OK`

### エラー時（バックエンド停止）

1. **画面上部**: 赤い警告バナーが表示
2. **メイン画面**: エラーメッセージと対処方法が表示
3. **Console**: 詳細なエラーログが出力
4. **Network**: `/api/menus` リクエストが失敗

---

## 📚 参考資料

- [Vite Server Options - Proxy](https://vitejs.dev/config/server-options.html#server-proxy)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Axios Interceptors](https://axios-http.com/docs/interceptors)
- [Material-UI Alert Component](https://mui.com/material-ui/react-alert/)

---

**作成日**: 2025年12月29日  
**対象プロジェクト**: Disney Menu - React + FastAPI  
**対象バージョン**: Vite 7.3.0, React 18.2.0, FastAPI 0.115.0
