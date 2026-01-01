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
- [x] pytest テストスイート作成（149テスト、100%カバレッジ達成）
  - `api/data_loader.py`: 100%
  - `api/index.py`: 100%
  - `api/models.py`: 100%
  - `api/scraper.py`: 100%
- [x] CORS 設定
- [x] テストデータ作成 (`data/menus.json` - 4件)
  - リトルグリーンまん（ID: 1779）追加
  - 複数レストラン対応
  - MapLocation型対応

#### フロントエンド開発
- [x] Vite + React + TypeScript プロジェクト初期化
- [x] Material-UI コンポーネントライブラリ導入
- [x] React Router セットアップ
- [x] React Query (TanStack Query) 導入
- [x] TypeScript 型定義 (`src/types/menu.ts`)
  - MapLocation型追加
  - 複数レストラン対応
- [x] API クライアント実装 (`src/services/api.ts`)
- [x] カスタムフック作成 (`src/hooks/useMenus.ts`)
- [x] コンポーネント実装
  - MenuCard コンポーネント（拡張版）
  - ParkChip - パーク表示
  - CategoryChips - カテゴリー表示
  - AllergenChips - アレルゲン表示
  - RestaurantItem - レストラン情報
  - RestaurantList - 複数レストラン表示
  - MenuImageGallery - 画像ギャラリー
  - MenuDetailModal - 詳細モーダル
- [x] MenuListPage ページ実装（拡張版）

#### デプロイ・CI/CD
- [x] Vercel 設定ファイル作成 (`vercel.json`)
- [x] Git Flow ブランチ戦略導入
  - `main` ブランチ（本番）
  - `develop` ブランチ（開発）
  - `feature/frontend-setup` ブランチ（マージ済み）

#### E2Eテスト
- [x] Playwright インストールと設定
- [x] Chromium ブラウザダウンロード
- [x] E2Eテストスイート作成 (`frontend/tests/e2e/menu-list.spec.ts` - 13テスト）
- [x] E2Eテスト全件合格（13/13）
- [x] テスト実行ガイド作成 (`docs/TESTS.md`)

#### ドキュメント
- [x] 開発ガイド作成 (`DEVELOPMENT.md`)
- [x] 起動手順書作成 (`STARTUP.md`)
- [x] テスト実行ガイド作成 (`docs/TESTS.md`)
- [x] 実装計画書作成 (`docs/IMPLEMENTATION_PLAN.md`)

### 🔧 進行中タスク

なし（Phase 4完了）

### ❌ 未着手タスク

#### データ収集（Phase 4 - 完了）
- [x] Webスクレイピングスクリプト実装完了
  - `scripts/scrape_menus.py` - aiohttp版（180行）
  - `scripts/scrape_menus_chrome.py` - Playwright版（新規作成）
  - `scripts/scrape_menus_simple.py` - **requests版（成功）**
- [x] データ検証スクリプト作成完了 (`scripts/validate_menus.py`)
- [x] **実データ収集完了: 704件**
  - 対象範囲: ID 0000-2000
  - 東京ディズニーランド: 402件
  - 東京ディズニーシー: 457件
  - 価格帯: ¥0 - ¥13,000（平均: ¥652円）
  - レストラン数: 102箇所
- [ ] GitHub Actions ワークフロー作成（週次スクレイピング）

#### Phase 5: CI/CD自動化
- [ ] GitHub Actions ワークフロー作成（週次スクレイピング）
- [ ] 自動テストワークフロー作成
- [ ] 自動デプロイワークフロー作成

#### フロントエンド機能拡張
- [ ] 検索機能実装（テキスト検索）
- [ ] 高度なフィルター機能実装
  - [ ] 価格範囲スライダー
  - [ ] エリアフィルター
  - [ ] キャラクターフィルター
  - [ ] アレルゲンフィルター
- [ ] ソート機能実装（価格、新着順など）
- [ ] お気に入り機能（ローカルストレージ）
- [ ] レストラン詳細ページ実装
- [ ] 地図表示機能（MapLocation活用）
- [ ] レスポンシブデザイン最適化
- [ ] ダークモード対応

#### バックエンド機能拡張
- [ ] 検索API最適化（全文検索エンジン導入検討）
- [ ] キャッシュ機構実装（Redis検討）
- [ ] レート制限実装
- [ ] 管理者API実装（データ更新用）

#### デプロイ・インフラ
- [ ] Vercel本番環境へのデプロイ
- [ ] カスタムドメイン設定
- [ ] 環境変数管理
- [ ] モニタリング・ログ設定

#### その他
- [ ] API ドキュメント改善（OpenAPI/Swagger）
- [ ] パフォーマンス最適化
  - [ ] 画像最適化（WebP対応、遅延読み込み）
  - [ ] バンドルサイズ削減
- [ ] アクセシビリティ対応（WCAG 2.1 AA準拠）
- [ ] SEO 対応（メタタグ、構造化データ）
- [ ] OGP（Open Graph Protocol）設定
- [ ] PWA化検討

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

### ✅ 解決済み

#### 1. データ構造の不一致（解決済み）

**問題:**
- `data/menus.json` のフィールド名がバックエンドの `MenuItem` モデルと一致していなかった

**解決:**
- データ構造を統一し、全フィールドをモデルに合わせて修正
- リトルグリーンまん（ID: 1779）を追加し、複数レストラン対応を実装
- E2Eテストのセレクタを修正し、全13テスト合格

#### 2. E2Eテストの失敗（解決済み）

**問題:**
- MUIクラスセレクタの不一致
- パーク情報の表示形式の違い
- エラーメッセージのstrict mode violation

**解決:**
- クラスセレクタを部分一致 `[class*="MuiCard-root"]` に変更
- パーク情報の正規表現を修正
- エラーメッセージのセレクタを見出しロールに限定

### ⚠️ 現在の制限事項

#### 1. データ件数が少ない

**現状:**
- メニューデータが4件のみ（テストデータ）

**影響:**
- ページネーション機能が十分にテストできない
- 検索・フィルター機能の効果が限定的

**対応予定:**
- Webスクレイピングで実データ収集（次のステップ）

#### 2. ポート競合

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

## 次のステップ

### 🎯 Phase 4: データ収集とスクレイピング実装（優先度：高）

#### 4.1 スクレイピングスクリプト開発

**目的:** 東京ディズニーリゾート公式サイトから実際のメニューデータを収集

**タスク:**

1. **robots.txt確認とコンプライアンス**
   ```bash
   # https://www.tokyodisneyresort.jp/robots.txt を確認
   # スクレイピング可能なURLパスを特定
   ```

2. **スクレイピングスクリプト実装** (`scripts/scrape_menus.py`)
   - [ ] BeautifulSoup/requests ベースの実装
   - [ ] レート制限実装（1リクエスト/秒）
   - [ ] エラーハンドリング（404、タイムアウト対応）
   - [ ] プログレスバー表示
   - [ ] ログ出力機能

3. **データバリデーション**
   - [ ] 取得データの型チェック
   - [ ] 必須フィールドの存在確認
   - [ ] データクレンジング処理

4. **実行とデータ収集**
   ```bash
   # 手動実行
   python scripts/scrape_menus.py
   
   # 範囲指定実行（例: ID 0000-0100）
   python scripts/scrape_menus.py --start 0 --end 100
   ```

**期待される成果:**
- 数百〜数千件のメニューデータ取得
- `data/menus.json` の更新

**所要時間見積もり:** 2-3日

---

### 🎯 Phase 5: CI/CD自動化（優先度：中）

#### 5.1 GitHub Actions ワークフロー作成

**タスク:**

1. **週次スクレイピングジョブ** (`.github/workflows/scrape.yml`)
   - [ ] cron スケジュール設定（毎週日曜日）
   - [ ] スクレイピング実行
   - [ ] データの差分確認
   - [ ] 自動コミット・プッシュ

2. **テストワークフロー** (`.github/workflows/test.yml`)
   - [ ] PR作成時の自動テスト実行
   - [ ] バックエンド・フロントエンド同時テスト
   - [ ] カバレッジレポート生成

3. **デプロイワークフロー** (`.github/workflows/deploy.yml`)
   - [ ] mainブランチマージ時の自動デプロイ
   - [ ] Vercel連携

**所要時間見積もり:** 1-2日

---

### 🎯 Phase 6: 高度なフィルタリング機能（優先度：中）

#### 6.1 検索・フィルター機能拡張

**タスク:**

1. **フロントエンド実装**
   - [ ] 検索バー追加（メニュー名・説明の全文検索）
   - [ ] 価格範囲スライダー（Material-UI Slider）
   - [ ] エリアフィルター（ドロップダウン）
   - [ ] キャラクターフィルター（チップ選択）
   - [ ] アレルゲンフィルター（複数選択）
   - [ ] ソート機能（価格順、新着順）

2. **バックエンド拡張**
   - [ ] 検索クエリ最適化
   - [ ] 複合フィルター対応
   - [ ] ソートパラメータ追加

3. **UX改善**
   - [ ] フィルター適用時のURL更新（共有可能）
   - [ ] フィルターリセットボタン
   - [ ] 適用中フィルターの表示

**所要時間見積もり:** 3-4日

---

### 🎯 Phase 7: Vercel本番デプロイ（優先度：高）

#### 7.1 デプロイ準備

**タスク:**

1. **環境設定**
   - [ ] Vercelアカウント作成・連携
   - [ ] 環境変数設定（本番用）
   - [ ] カスタムドメイン設定（オプション）

2. **ビルド最適化**
   - [ ] フロントエンドのビルドサイズ確認
   - [ ] 不要な依存関係の削除
   - [ ] 画像最適化

3. **デプロイ実行**
   ```bash
   # プレビューデプロイ
   vercel
   
   # 本番デプロイ
   vercel --prod
   ```

4. **デプロイ後検証**
   - [ ] 本番環境でのE2Eテスト実行
   - [ ] パフォーマンステスト（Lighthouse）
   - [ ] API動作確認

**所要時間見積もり:** 1日

---

### 🎯 Phase 8: SEO・OGP対応（優先度：低）

#### 8.1 メタタグ・構造化データ

**タスク:**

1. **SEO対応**
   - [ ] タイトルタグ最適化
   - [ ] メタディスクリプション追加
   - [ ] 構造化データ（JSON-LD）追加

2. **OGP設定**
   - [ ] og:image 設定
   - [ ] og:title, og:description 設定
   - [ ] Twitter Card 対応

3. **sitemap.xml生成**
   - [ ] 動的sitemap生成スクリプト
   - [ ] robots.txt 作成

**所要時間見積もり:** 1-2日

---

## 推奨作業順序

### Week 1-2: データ収集フェーズ
1. ✅ Phase 0-3: 基本機能実装（完了）
2. 🎯 **Phase 4: スクレイピング実装・実データ収集**
3. 🎯 **Phase 7: Vercel本番デプロイ（初回）**

### Week 3-4: 機能拡張フェーズ
4. 🎯 **Phase 6: 高度なフィルタリング機能**
5. 🎯 **Phase 5: CI/CD自動化**

### Week 5: 最適化フェーズ
6. 🎯 **Phase 8: SEO・OGP対応**
7. パフォーマンス最適化
8. アクセシビリティ対応

---

## 次の具体的アクション

### 今すぐ実行可能

1. **スクレイピングスクリプト作成**
   ```bash
   # scripts/scrape_menus.py を作成
   # robots.txt 確認
   # 少数データでテスト実行
   ```

2. **Vercelプレビューデプロイ**
   ```bash
   # Vercelアカウント連携
   vercel
   # プレビューURL確認
   ```

3. **GitHub Actions ワークフロー作成**
   ```bash
   # .github/workflows/test.yml 作成
   # PR時の自動テスト設定
   ```

---

## 長期ロードマップ

### Q1 2025（現在）
- ✅ MVP実装完了
- 🎯 実データ収集
- 🎯 本番デプロイ

### Q2 2025
- 高度な検索・フィルター機能
- レストラン詳細ページ
- 地図機能統合

### Q3 2025
- お気に入り機能
- ユーザーレビュー機能（検討）
- モバイルアプリ化（PWA）

### Q4 2025
- 多言語対応（英語）
- リアルタイム在庫情報（API連携）
- AI推薦機能（検討）

---

## 参考リンク

- FastAPI: https://fastapi.tiangolo.com/
- React: https://react.dev/
- Material-UI: https://mui.com/
- Playwright: https://playwright.dev/
- Vercel: https://vercel.com/docs
