# Disney Menu - 開発ガイド

## プロジェクト概要

Tokyo Disney Resort のフードメニューを検索・閲覧できるWebアプリケーション

- **バックエンド**: FastAPI (Python 3.9+)
- **フロントエンド**: React 18 + TypeScript + Vite + Material-UI
- **デプロイ**: Vercel Serverless Functions

---

## プロジェクト状況サマリー

### ✅ 完了済みタスク

#### バックエンド開発
- [x] FastAPI アプリケーション実装 (`api/index.py`)
- [x] Pydantic V2 データモデル定義 (`api/models.py`)
- [x] API エンドポイント実装
  - GET `/api/menus` - メニュー一覧取得（フィルタリング・ページネーション対応）
  - GET `/api/menus/{id}` - 特定メニュー取得
  - GET `/api/restaurants` - レストラン一覧
  - GET `/api/tags` - タグ一覧
  - GET `/api/categories` - カテゴリ一覧
  - GET `/api/stats` - 統計情報
- [x] pytest テストスイート作成（116テスト、96%カバレッジ）
- [x] CORS 設定
- [x] テストデータ作成 (`data/menus.json` - 3件)

#### フロントエンド開発
- [x] Vite + React + TypeScript プロジェクト初期化
- [x] Material-UI コンポーネントライブラリ導入
- [x] React Router セットアップ
- [x] React Query (TanStack Query) 導入
- [x] TypeScript 型定義 (`src/types/menu.ts`)
- [x] API クライアント実装 (`src/services/api.ts`)
- [x] カスタムフック作成 (`src/hooks/useMenus.ts`)
- [x] MenuCard コンポーネント実装
- [x] MenuListPage ページ実装

#### デプロイ・CI/CD
- [x] Vercel 設定ファイル作成 (`vercel.json`)
- [x] Git Flow ブランチ戦略導入
  - `main` ブランチ（本番）
  - `develop` ブランチ（開発）
  - `feature/frontend-setup` ブランチ（マージ済み）

#### E2Eテスト
- [x] Playwright インストールと設定
- [x] Chromium ブラウザダウンロード
- [x] E2Eテストスイート作成 (`frontend/tests/e2e/menu-list.spec.ts` - 14テスト)

### 🔧 進行中タスク

#### E2Eテスト実行
- [ ] **データ構造の不一致修正が必要**
  - 問題: `data/menus.json` のフィールド名がバックエンドモデルと不一致
    - JSON: `images` → モデル: `image_urls`
    - JSON に `is_seasonal`, `is_new`, `is_available` フィールドが欠落
  - 影響: フロントエンドがデータを正しく表示できない
  - 対処: データ構造の統一化が必要

- [ ] **フロントエンド開発サーバー起動**
  - 現在停止中（ポート5174）
  - Playwrightテスト実行に必要

### ❌ 未着手タスク

#### データ収集
- [ ] Webスクレイピングスクリプト実装 (`scripts/scrape_menus.py`)
- [ ] robots.txt 確認とレート制限実装
- [ ] GitHub Actions ワークフロー作成（週次スクレイピング）
- [ ] 実データ収集（4桁ID: 0000-9999）

#### フロントエンド機能拡張
- [ ] 検索機能実装
- [ ] フィルター機能実装（タグ、価格帯、パーク）
- [ ] メニュー詳細ページ実装
- [ ] レストラン詳細ページ実装
- [ ] レスポンシブデザイン最適化
- [ ] ローディング状態UI改善
- [ ] エラーハンドリングUI実装

#### その他
- [ ] API ドキュメント生成（OpenAPI/Swagger）
- [ ] パフォーマンス最適化
- [ ] アクセシビリティ対応
- [ ] SEO 対応
- [ ] 本番環境へのデプロイ

---

## 環境セットアップ

### 前提条件

- Python 3.9 以上
- Node.js 18 以上
- npm または yarn

### 初回セットアップ

```bash
# リポジトリクローン
git clone <repository-url>
cd disneymenu

# Python仮想環境作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Python依存関係インストール
pip install -r requirements.txt

# フロントエンド依存関係インストール
cd frontend
npm install
cd ..
```

---

## 起動手順

### 1. バックエンド起動

**手順:**

```bash
# プロジェクトルートに移動
cd /Users/kimurashoya/disneymenu

# 仮想環境を有効化
source venv/bin/activate

# PYTHONPATHを設定してuvicornを起動
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**確認方法:**

```bash
# 別のターミナルで
curl http://localhost:8000/api/stats

# 期待されるレスポンス:
# {"success":true,"data":{"total_menus":3,"available_menus":2,...}}
```

**API ドキュメント:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**起動状態確認:**

```bash
# ポート8000で動作中のプロセスを確認
lsof -ti:8000

# プロセスが返ってくればOK（例: 20722）
```

**停止方法:**

```bash
# プロセスID確認
lsof -ti:8000

# プロセス終了
kill -9 $(lsof -ti:8000)
```

---

### 2. フロントエンド起動

**手順:**

```bash
# frontendディレクトリに移動
cd /Users/kimurashoya/disneymenu/frontend

# 開発サーバー起動
npm run dev

# 出力例:
# VITE v7.3.0  ready in 500 ms
# ➜  Local:   http://localhost:5174/
# ➜  Network: use --host to expose
```

**確認方法:**

ブラウザで http://localhost:5174/ にアクセス

**起動状態確認:**

```bash
# ポート5174で動作中のプロセスを確認
lsof -ti:5174

# プロセスが返ってくればOK
```

**停止方法:**

ターミナルで `Ctrl+C` を押す

---

### 3. 同時起動（推奨）

**ターミナル1（バックエンド）:**

```bash
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**ターミナル2（フロントエンド）:**

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run dev
```

**起動確認:**

```bash
# ターミナル3で確認
lsof -ti:8000  # バックエンド
lsof -ti:5174  # フロントエンド
```

---

## テスト実行

### バックエンドテスト

```bash
# プロジェクトルートで
cd /Users/kimurashoya/disneymenu
source venv/bin/activate

# 全テスト実行
pytest

# カバレッジ付き実行
pytest --cov=api --cov-report=html

# 特定のテストファイル実行
pytest tests/test_menus.py -v
```

### フロントエンド E2Eテスト（Playwright）

**前提条件:**
- バックエンドが http://localhost:8000 で起動中
- フロントエンドが起動していない場合、Playwrightが自動起動

```bash
cd /Users/kimurashoya/disneymenu/frontend

# E2Eテスト実行
npm run test:e2e

# UIモードで実行（デバッグ用）
npm run test:e2e:ui
```

**注意:** 現在、データ構造の不一致により12/13テストが失敗中

---

## 既知の問題

### 1. データ構造の不一致

**問題:**
- `data/menus.json` のフィールド名がバックエンドの `MenuItem` モデルと一致していない
- `images` → `image_urls` への変換が必要
- `is_seasonal`, `is_new`, `is_available` フィールドが欠落

**影響:**
- フロントエンドでメニューが表示されない
- E2Eテストが失敗する

**解決策:**
- `data/menus.json` を `MenuItem` モデルに合わせて修正
- または、バックエンドでデータ変換ロジックを追加

### 2. ポート競合

**現象:**
- ポート8000または5174が既に使用中の場合、起動失敗

**解決策:**

```bash
# プロセス確認
lsof -ti:8000  # または :5174

# プロセス終了
kill -9 $(lsof -ti:8000)
```

---

## ディレクトリ構造

```
disneymenu/
├── api/                      # バックエンド（FastAPI）
│   ├── index.py             # メインアプリケーション
│   ├── models.py            # Pydanticモデル
│   └── scraper.py           # スクレイピングロジック（未実装）
├── data/
│   └── menus.json           # メニューデータ（3件）
├── frontend/                 # フロントエンド（React）
│   ├── src/
│   │   ├── components/      # Reactコンポーネント
│   │   ├── hooks/           # カスタムフック
│   │   ├── pages/           # ページコンポーネント
│   │   ├── services/        # APIクライアント
│   │   └── types/           # TypeScript型定義
│   ├── tests/e2e/           # Playwrightテスト
│   ├── playwright.config.ts
│   ├── package.json
│   └── vite.config.ts
├── tests/                    # バックエンドテスト
│   ├── conftest.py
│   ├── test_menus.py
│   ├── test_restaurants.py
│   └── ...
├── scripts/                  # ユーティリティスクリプト
│   └── scrape_menus.py      # スクレイピング（未実装）
├── venv/                     # Python仮想環境
├── requirements.txt          # Python依存関係
├── vercel.json              # Vercelデプロイ設定
└── README.md
```

---

## 開発ワークフロー

### Git Flow

```bash
# 新機能開発
git checkout develop
git checkout -b feature/new-feature
# 開発作業...
git add .
git commit -m "feat: 新機能の説明"
git checkout develop
git merge feature/new-feature

# 本番リリース
git checkout main
git merge develop
git push origin main
```

### コミットメッセージ規約

- `feat:` 新機能
- `fix:` バグ修正
- `test:` テスト追加・修正
- `docs:` ドキュメント変更
- `refactor:` リファクタリング
- `style:` コードスタイル修正
- `chore:` ビルド・設定変更

---

## トラブルシューティング

### ModuleNotFoundError: No module named 'api'

**原因:** PYTHONPATHが設定されていない

**解決策:**
```bash
PYTHONPATH=. uvicorn api.index:app --reload
```

### ImportError: cannot import name 'ConfigDict' from 'pydantic'

**原因:** Pydantic V1とV2の互換性問題

**解決策:** requirements.txtで `pydantic>=2.0.0` を指定済み

### Playwright tests fail: element(s) not found

**原因:** 
1. 開発サーバーが起動していない
2. データ構造の不一致

**解決策:**
1. バックエンド・フロントエンド両方を起動
2. データ構造を修正（上記「既知の問題」参照）

---

## 次のステップ

1. **データ構造の統一** - `data/menus.json` を `MenuItem` モデルに合わせる
2. **E2Eテスト修正** - データ修正後、全テストをパス
3. **スクレイピング実装** - 実データ収集開始
4. **フィルター機能実装** - ユーザー体験向上
5. **本番デプロイ** - Vercelへデプロイ

---

## 参考リンク

- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Material-UI: https://mui.com/
- Playwright: https://playwright.dev/
- Vercel: https://vercel.com/docs
