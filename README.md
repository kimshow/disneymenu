# Disney Menu API

東京ディズニーリゾートのフードメニューを検索・閲覧できるWebアプリケーション

## 概要

このプロジェクトは、東京ディズニーランド・ディズニーシーのフードメニュー情報を提供するFastAPI + Reactアプリケーションです。メニューデータは公式サイトから週次でスクレイピングして収集し、検索やフィルタリング機能を提供します。

## 機能

- 🔍 メニュー検索（名前、説明文）
- 🏷️ タグ・カテゴリフィルタリング
- 💰 価格帯フィルタ
- 🏰 パーク・エリア別フィルタ
- 🎭 キャラクター・テーマ別フィルタ
- 📊 統計情報の表示

## 技術スタック

### バックエンド
- **FastAPI**: Python Web フレームワーク
- **Pydantic**: データバリデーション
- **BeautifulSoup4**: HTMLパーサー
- **aiohttp**: 非同期HTTPクライアント

### フロントエンド（予定）
- **React**: UIフレームワーク
- **TypeScript**: 型安全性
- **Axios**: APIクライアント

### デプロイ
- **Vercel**: サーバーレスホスティング

## プロジェクト構造

```
disneymenu/
├── api/
│   ├── index.py          # FastAPIアプリケーション
│   ├── models.py         # Pydanticモデル
│   ├── scraper.py        # スクレイピングロジック
│   └── data_loader.py    # データローダー
├── scripts/
│   └── scrape_menus.py   # スクレイピングスクリプト
├── data/
│   └── menus.json        # メニューデータ（自動生成）
├── docs/
│   ├── API_REFERENCE.md  # API仕様書
│   └── components/       # コンポーネント設計書
│       ├── models.md
│       ├── scraper.md
│       ├── data_loader.md
│       └── fastapi_app.md
├── requirements.txt      # Python依存関係
├── vercel.json          # Vercelデプロイ設定
└── README.md
```

## セットアップ

### 1. 依存関係のインストール

```bash
# 仮想環境を作成
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# パッケージをインストール
pip install -r requirements.txt
```

### 2. データ収集

```bash
# テストスクレイピング（ID 1700-1800）
python scripts/scrape_menus.py --start 1700 --end 1800

# 全データスクレイピング（0000-9999）
python scripts/scrape_menus.py
```

### 3. ローカル開発サーバー起動

```bash
# FastAPIを直接起動
cd api && uvicorn index:app --reload --port 8000

# または Vercel Dev
vercel dev
```

APIドキュメント: http://localhost:8000/docs

## API エンドポイント

### メニュー一覧取得
```
GET /api/menus?q=カレー&park=tdl&min_price=500&max_price=1000&page=1&limit=50
```

**パラメータ:**
- `q`: 検索クエリ
- `tags`: タグフィルタ（カンマ区切り）
- `categories`: カテゴリフィルタ
- `min_price`, `max_price`: 価格範囲
- `park`: パーク（`tdl`/`tds`）
- `area`: エリア名
- `character`: キャラクター名
- `only_available`: 販売中のみ（デフォルト: `true`）
- `page`, `limit`: ページネーション

### 特定メニュー取得
```
GET /api/menus/1779
```

### レストラン一覧
```
GET /api/restaurants?park=tdl
```

### タグ一覧
```
GET /api/tags
```

### カテゴリ一覧
```
GET /api/categories
```

### 統計情報
```
GET /api/stats
```

## スクレイピングガイドライン

- ✅ robots.txt 確認済み
- ✅ レート制限: 1秒1リクエスト
- ✅ 実行頻度: 週1回
- ✅ User-Agent設定済み

## デプロイ

```bash
# Vercelにデプロイ
vercel --prod
```

## 開発ロードマップ

- [x] Phase 1: データ収集
  - [x] Pydanticモデル設計
  - [x] スクレイパー実装
  - [x] スクレイピングスクリプト
- [x] Phase 2: API実装
  - [x] FastAPIエンドポイント
  - [x] データローダー
  - [x] Vercel設定
- [x] ドキュメント整備
  - [x] APIリファレンス
  - [x] コンポーネント設計書
- [ ] Phase 3: フロントエンド
  - [ ] Reactプロジェクトセットアップ
  - [ ] UI実装
  - [ ] フィルタリング機能
- [ ] Phase 4: 自動化
  - [ ] GitHub Actions設定
  - [ ] 週次スクレイピングワークフロー

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
