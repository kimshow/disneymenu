# Disney Menu

東京ディズニーリゾートのフードメニューを検索・閲覧できるWebアプリケーション

[![Deployment Status](https://img.shields.io/badge/status-ready-brightgreen)](https://github.com/kimshow/disneymenu)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 🌟 概要

東京ディズニーランド・ディズニーシーの全704件のフードメニュー情報を検索・フィルタリングできるモダンなWebアプリケーションです。

**主な特徴:**
- 高速検索とリアルタイムフィルタリング
- レスポンシブデザイン（PC/タブレット/スマホ対応）
- 複数条件の組み合わせ検索
- パーク・エリア連動フィルター
- URL共有可能（検索条件をURLに保存）

## ✨ 機能

### 検索・フィルター機能
- 🔍 **テキスト検索**: メニュー名・説明文の全文検索
- 🏷️ **タグフィルター**: 料理種類、ドリンク、キャラクター、エリア、特徴で絞り込み
- 📁 **カテゴリフィルター**: メインディッシュ、クイックミール、スイーツ等で分類
- 💰 **価格帯フィルター**: ¥0～¥17,000のスライダー
- 🏰 **パークフィルター**: ディズニーランド/ディズニーシー
- 🍴 **レストランフィルター**: 102のレストランから選択
- ✅ **販売状況フィルター**: 現在販売中のメニューのみ表示

### お気に入り機能
- ⭐ **お気に入り登録**: メニューをお気に入りに追加・削除
- 📋 **お気に入り一覧**: 専用ページでお気に入りメニューを一覧表示
- 🔄 **データ管理**: エクスポート/インポート機能（JSON形式）
- 📱 **永続化**: localStorage で最大500件まで保存
- 🎨 **レスポンシブ対応**: モバイル（1列）、タブレット（2列）、デスクトップ（3-5列）グリッド

### データ統計
- 総メニュー数: **704件**
- パーク: ディズニーランド（402件）、ディズニーシー（457件）
- 価格範囲: ¥110～¥16,300
- レストラン数: 102箇所

## 🚀 技術スタック

### バックエンド
- **FastAPI 0.115+**: 高速なPython Webフレームワーク
- **Pydantic 2.10+**: データバリデーション
- **BeautifulSoup4**: HTMLパーサー
- **aiohttp**: 非同期スクレイピング
- **pytest**: テストフレームワーク（カバレッジ100%）

### フロントエンド
- **React 19.2**: UIライブラリ
- **TypeScript 5.9**: 型安全性
- **Material-UI 7.3**: UIコンポーネント
- **TanStack Query**: データフェッチング・キャッシュ
- **React Router 7.11**: ルーティング
- **Vite 7.2**: 高速ビルドツール
- **Playwright**: E2Eテスト（20テスト全パス）

### デプロイ・インフラ
- **Vercel**: サーバーレスホスティング
- **Python 3.9+**: バックエンドランタイム
- **Node.js 18+**: フロントエンドビルド

## 📦 プロジェクト構造

```
disneymenu/
├── api/                       # バックエンド（FastAPI）
│   ├── index.py              # APIエンドポイント（7エンドポイント）
│   ├── models.py             # Pydanticモデル定義
│   ├── scraper.py            # スクレイピングロジック
│   ├── data_loader.py        # データローダー・フィルタリング
│   └── constants.py          # カテゴリ・タグ定義
├── frontend/                  # フロントエンド（React + TypeScript）
│   ├── src/
│   │   ├── components/       # Reactコンポーネント
│   │   │   ├── filters/      # フィルターコンポーネント（9種類）
│   │   │   ├── favorites/    # お気に入りコンポーネント
│   │   │   └── menu/         # メニュー表示コンポーネント
│   │   ├── contexts/         # React Context（お気に入り管理）
│   │   ├── pages/            # ページコンポーネント（MenuList, Favorites）
│   │   ├── services/         # APIクライアント、localStorage管理
│   │   ├── types/            # TypeScript型定義
│   │   └── constants/        # 定数定義
│   ├── tests/e2e/            # E2Eテスト（Playwright、20テスト）
│   └── package.json
├── scripts/                   # ユーティリティスクリプト
│   ├── scrape_menus.py       # メニュースクレイピング
│   ├── assign_categories.py  # カテゴリ自動割り当て
│   └── clean_tags.py         # タグ正規化
├── data/
│   └── menus.json            # メニューデータ（704件）
├── tests/                     # バックエンドテスト
│   ├── test_index.py         # APIテスト
│   ├── test_data_loader.py   # データローダーテスト
│   └── test_models.py        # モデルテスト
├── .env.example              # 環境変数テンプレート
├── DEPLOYMENT.md             # デプロイ手順書
├── requirements.txt          # Python依存関係
├── vercel.json              # Vercelデプロイ設定
└── README.md
```

## 🛠️ セットアップ

### 前提条件

- Python 3.9以上
- Node.js 18以上
- npm または yarn

### 1. リポジトリのクローン

```bash
git clone https://github.com/kimshow/disneymenu.git
cd disneymenu
```

### 2. バックエンドのセットアップ

```bash
# 仮想環境を作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 依存関係をインストール
pip install -r requirements.txt

# データが含まれているか確認
ls -lh data/menus.json  # 約2-3MB、704件のデータ
```

### 3. フロントエンドのセットアップ

```bash
cd frontend

# 依存関係をインストール
npm install

# または yarn
yarn install
```

### 4. 環境変数の設定（オプション）

```bash
# .env.exampleをコピー
cp .env.example .env

# 必要に応じて編集
# 開発環境ではデフォルト値で動作します
```

## 🚀 ローカル開発

### バックエンドの起動

```bash
# プロジェクトルートで実行
source venv/bin/activate
uvicorn api.index:app --reload --port 8000

# APIドキュメント: http://localhost:8000/docs
```

### フロントエンドの起動

```bash
cd frontend
npm run dev

# アプリケーション: http://localhost:5174
```

### データ収集（オプション）

```bash
# 既存データがあるため通常は不要

# 特定範囲のスクレイピング
python scripts/scrape_menus.py --start 1700 --end 1800 --output data/test.json

# 全データ更新（0000-9999、約50分）
python scripts/scrape_menus.py --start 0 --end 9999
```

## 🧪 テスト

### バックエンドテスト

```bash
# 全テスト実行
pytest tests/ -v

# カバレッジ付き
pytest tests/ -v --cov=api --cov-report=html

# 期待結果: 149 passed, 100% coverage
```

### フロントエンドE2Eテスト

```bash
cd frontend

# E2Eテスト実行
npm run test:e2e

# UIモードで実行
npm run test:e2e:ui

# 期待結果: 28 passed (1 skipped)
```

**テスト内訳:**
- 基本機能テスト: 11件
- お気に入り機能テスト: 9件（レスポンシブテスト含む）

## 📱 本番環境

**URL**: https://tdrmenu.vercel.app

**デプロイ情報:**
- プラットフォーム: Vercel
- 自動デプロイ: main ブランチへのプッシュで自動更新
- ビルド時間: 約56秒
- 最終デプロイ: 2026年1月2日

## 🎯 開発ロードマップ

### ✅ Phase 1-4: 完了済み
- ✅ Phase 1: プロジェクト初期化とバックエンド構築
- ✅ Phase 2: フロントエンド基礎構築
- ✅ Phase 3: 検索・フィルター・ソート機能実装
- ✅ Phase 4: 実データ収集（704件スクレイピング完了）
- ✅ Phase 4.5: お気に入り機能完全実装
  - ✅ お気に入り追加/削除機能
  - ✅ お気に入り一覧ページ
  - ✅ エクスポート/インポート機能
  - ✅ レスポンシブUI完全対応
  - ✅ E2Eテスト20件全パス

### 🚧 Phase 5: 次期開発予定
- 🔄 検索体験の向上
  - オートコンプリート機能
  - 検索履歴保存
  - 検索結果のハイライト表示
- 🗺️ マップビュー実装
  - パーク内レストラン位置表示
  - インタラクティブマップ
- 📊 データ分析機能
  - 価格分布グラフ
  - 人気メニューランキング
  - カテゴリ別統計

## 📡 API エンドポイント

### 基本情報

**ベースURL**: 
- 開発環境: `http://localhost:8000/api`
- 本番環境: `https://tdrmenu.vercel.app/api`

### エンドポイント一覧

#### 1. メニュー一覧取得
```http
GET /api/menus
```

**クエリパラメータ:**
| パラメータ | 型 | 説明 | デフォルト |
|----------|-----|------|----------|
| `q` | string | 検索クエリ（名前・説明文） | - |
| `tags` | string | タグフィルタ（カンマ区切り） | - |
| `categories` | string | カテゴリフィルタ（カンマ区切り） | - |
| `min_price` | integer | 最小価格 | - |
| `max_price` | integer | 最大価格 | - |
| `park` | string | パーク（`tdl`/`tds`） | - |
| `area` | string | エリア名 | - |
| `restaurant` | string | レストラン名 | - |
| `character` | string | キャラクター名 | - |
| `only_available` | boolean | 販売中のみ | `false` |
| `sort` | string | ソート項目（`price`/`name`/`scraped_at`） | - |
| `order` | string | ソート順（`asc`/`desc`） | `asc` |
| `page` | integer | ページ番号 | `1` |
| `limit` | integer | 1ページあたりの件数（1-100） | `50` |

**レスポンス例:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1779",
      "name": "シーフードカレー",
      "price": 1200,
      "category": "main_dish",
      "tags": ["カレー", "シーフード"],
      "restaurants": [
        {
          "name": "カスバ・フードコート",
          "park": "tds",
          "area": "アラビアンコースト"
        }
      ]
    }
  ],
  "meta": {
    "total": 704,
    "page": 1,
    "limit": 50,
    "pages": 15
  }
}
```

#### 2. 特定メニュー取得
```http
GET /api/menus/{menu_id}
```

#### 3. レストラン一覧
```http
GET /api/restaurants?park=tdl
```

#### 4. タグ一覧（グループ化）
```http
GET /api/tags/grouped?park=tdl
```

#### 5. カテゴリ一覧
```http
GET /api/categories
```

#### 6. 統計情報
```http
GET /api/stats
```

詳細は [APIドキュメント](http://localhost:8000/docs) を参照してください。

## 🚢 デプロイ

### Vercelへのデプロイ

詳細な手順は [DEPLOYMENT.md](DEPLOYMENT.md) を参照してください。

#### クイックスタート

```bash
# Vercel CLIをインストール
npm install -g vercel

# Vercelにログイン
vercel login

# プロジェクトをデプロイ
vercel --prod
```

#### GitHub連携デプロイ

1. GitHubリポジトリをVercelにインポート
2. 自動ビルド・デプロイ設定
3. `main`ブランチへのpushで自動デプロイ

### 環境変数（Vercel）

```bash
DEBUG=false
VITE_API_BASE_URL=/api
DATA_PATH=data/menus.json
```

## 📊 パフォーマンス

- **初回ロード**: 1.03秒（目標: 3秒以内）✨
- **ページ遷移**: 243ms（目標: 1秒以内）✨
- **APIレスポンス**: 50-200ms
- **バンドルサイズ**: 約500KB（gzip圧縮後）
- **Lighthouseスコア**: 90点以上

## 🧰 開発ツール

### コード品質

```bash
# Python linting
flake8 api/

# TypeScript type checking
cd frontend && npm run typecheck

# フォーマット
black api/
cd frontend && npm run lint
```

### データ管理

```bash
# カテゴリ自動割り当て
python scripts/assign_categories.py

# タグクリーニング
python scripts/clean_tags.py

# データ検証
python scripts/validate_data.py
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

Issue・Pull Requestを歓迎します！

## 📧 お問い合わせ

- GitHub Issues: https://github.com/kimshow/disneymenu/issues
- Email: [your-email@example.com]

## 🙏 謝辞

- データソース: [東京ディズニーリゾート公式サイト](https://www.tokyodisneyresort.jp/)
- FastAPI, React, Material-UI等のオープンソースコミュニティ

---

**Disney Menu** - Made with ❤️ for Disney fans

### 統計情報
```
GET /api/stats
```

## スクレイピングガイドライン

- ✅ robots.txt 確認済み
- ✅ レート制限: 1秒1リクエスト
- ✅ 実行頻度: 週1回
- ✅ User-Agent設定済み

## 🌐 本番環境

**メインサイト**: https://tdrmenu.vercel.app  
**API**: https://tdrmenu.vercel.app/api/

詳細なデプロイ手順は [DEPLOYMENT.md](DEPLOYMENT.md) を参照してください。

## デプロイ

```bash
# Vercelにデプロイ
vercel --prod
```

## 🔄 データ更新

### 自動更新（GitHub Actions）

メニューデータは **毎週日曜日午前3時（JST）** に自動更新されます。

- **スケジュール**: 週1回（日曜日 3:00 JST）
- **更新範囲**: 全メニューID（0000-9999）
- **レート制限**: 1リクエスト/秒
- **自動コミット**: データ変更時のみプッシュ

#### 手動実行

GitHub Actionsから手動で実行することも可能です：

1. リポジトリの **Actions** タブに移動
2. **Weekly Menu Scraping** ワークフローを選択
3. **Run workflow** をクリック
4. 開始ID・終了IDを指定（オプション）して実行

### ローカルでの更新

```bash
# 全範囲スクレイピング（約5時間）
python scripts/scrape_menus_simple.py --start 0 --end 9999

# 特定範囲のみ
python scripts/scrape_menus_simple.py --start 1000 --end 2000

# データ検証
python scripts/validate_menus.py data/menus.json
```

## 開発ロードマップ

- [x] Phase 1: データ収集
  - [x] Pydanticモデル設計
  - [x] スクレイパー実装
  - [x] スクレイピングスクリプト
  - [x] 704件のメニューデータ収集
- [x] Phase 2: API実装
  - [x] FastAPIエンドポイント（7エンドポイント）
  - [x] データローダー・フィルタリング
  - [x] Vercel設定・本番デプロイ
- [x] Phase 3: フロントエンド
  - [x] React + TypeScript セットアップ
  - [x] Material-UI 統合
  - [x] メニュー一覧・詳細表示
  - [x] 検索・フィルター・ソート機能
  - [x] レスポンシブデザイン
- [x] Phase 4: 自動化
  - [x] GitHub Actions設定
  - [x] 週次スクレイピングワークフロー
- [x] Phase 5: データ品質向上
  - [x] カテゴリ自動割り当て
  - [x] タグ正規化・整理
  - [x] 料理種類タグ自動付与（12カテゴリ）
- [x] ドキュメント整備
  - [x] APIリファレンス
  - [x] コンポーネント設計書
  - [x] テストドキュメント（100%カバレッジ）
- [ ] Phase 6: 機能拡張（今後）
  - [ ] お気に入り機能
  - [ ] レストラン詳細ページ
  - [ ] パークマップ統合
  - [ ] ダークモード対応

## ドキュメント

- [API Reference](docs/API_REFERENCE.md) - 完全なAPI仕様書
- [Component Documentation](docs/components/) - アーキテクチャと設計書
  - [Data Models](docs/components/models.md) - Pydanticモデルとドメインオブジェクト
  - [Web Scraper](docs/components/scraper.md) - HTML解析とデータ抽出
  - [Data Loader](docs/components/data_loader.md) - データ管理とフィルタリング
  - [FastAPI App](docs/components/fastapi_app.md) - RESTエンドポイント

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 注意事項

このプロジェクトは非公式のファンプロジェクトです。東京ディズニーリゾートとは一切関係ありません。
