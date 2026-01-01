# Disney Menu - デプロイ手順書

## 📋 目次

1. [事前準備](#事前準備)
2. [ローカル環境での最終確認](#ローカル環境での最終確認)
3. [Vercelへのデプロイ](#vercelへのデプロイ)
4. [環境変数の設定](#環境変数の設定)
5. [デプロイ後の確認](#デプロイ後の確認)
6. [トラブルシューティング](#トラブルシューティング)
7. [ロールバック手順](#ロールバック手順)

---

## 事前準備

### 1. 必要なツールのインストール

```bash
# Vercel CLIのインストール
npm install -g vercel

# バージョン確認
vercel --version
```

### 2. Vercelアカウントの準備

- Vercelアカウント作成: https://vercel.com/signup
- GitHubアカウントとの連携を推奨

### 3. ブランチの状態確認

```bash
# 現在のブランチ確認
git branch

# 未コミットの変更確認
git status

# feature/menu-enhancementsをmainにマージ（推奨）
git checkout main
git merge feature/menu-enhancements
git push origin main
```

---

## ローカル環境での最終確認

### 1. バックエンドテスト

```bash
# 仮想環境のアクティベート
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate  # Windows

# テスト実行
pytest tests/ -v --cov=api --cov-report=html

# 期待結果: 149 passed, 100% coverage
```

### 2. フロントエンドテスト

```bash
cd frontend

# E2Eテスト実行
npm run test:e2e

# 期待結果: 28 passed (うち1スキップは許容)
```

### 3. ビルド確認

```bash
# バックエンド: データファイル確認
ls -lh data/menus.json
# 期待: 704件のメニューデータ、約2-3MB

# フロントエンド: ビルド実行
cd frontend
npm run build

# 期待結果:
# - dist/ディレクトリが生成される
# - バンドルサイズが表示される（目安: 500KB-1MB）
```

### 4. ローカルプレビュー

```bash
# バックエンド起動
cd ..
source venv/bin/activate
uvicorn api.index:app --reload --port 8000

# 別ターミナルでフロントエンド起動
cd frontend
npm run dev

# ブラウザで http://localhost:5174 を開き動作確認
# ✓ メニュー一覧が表示される
# ✓ 検索機能が動作する
# ✓ フィルター機能が動作する
# ✓ ページネーションが動作する
```

---

## Vercelへのデプロイ

### 方法1: Vercel CLI（推奨 - 初回）

#### ステップ1: プロジェクトのリンク

```bash
# プロジェクトルートで実行
cd /path/to/disneymenu

# Vercelにログイン
vercel login

# プロジェクトをセットアップ（初回のみ）
vercel

# 質問への回答例:
# ? Set up and deploy? [Y/n] Y
# ? Which scope? [あなたのアカウント名]
# ? Link to existing project? [N/y] N
# ? What's your project's name? d-menu  ← ここで希望のURL名を入力
# ? In which directory is your code located? ./
# ? Want to override the settings? [N/y] N

# この設定により https://d-menu.vercel.app としてデプロイされます
# 注意: プロジェクト名が既に使用されている場合は d-menu-two など別名になります
```

#### ステップ2: 本番デプロイ

```bash
# 本番環境にデプロイ
vercel --prod --yes

# デプロイURL: https://tdrmenu.vercel.app
# デプロイ完了まで約30-50秒
```

#### ステップ3: プロジェクトの再リンク（必要な場合）

```bash
# 別のプロジェクトにリンクされてしまった場合
rm -rf .vercel
vercel link --project d-menu --yes

# その後再デプロイ
vercel --prod --yes
```

### 方法2: GitHub連携（推奨 - 継続的デプロイ）

#### ステップ1: Vercelダッシュボードでプロジェクト作成

1. https://vercel.com/new にアクセス
2. **Import Git Repository** をクリック
3. GitHubリポジトリ `kimshow/disneymenu` を選択
4. **Import** をクリック

#### ステップ2: プロジェクト設定

```
Project Name: d-menu  ← 希望のURL名を入力（これで https://d-menu.vercel.app になります）
Framework Preset: Other
Root Directory: ./
Build Command: (空欄)
Output Directory: (空欄)
Install Command: (空欄)
```

**環境変数** セクションで以下を設定（後述）

#### ステップ3: デプロイ

- **Deploy** ボタンをクリック
- 初回デプロイが自動実行される
- 以降、`main`ブランチへのpushで自動デプロイ

---

## URLのカスタマイズ

Vercelでは以下の3つの方法でURLをカスタマイズできます：

### 1. デフォルトURL（自動）

デプロイ時に自動で割り当てられます：
- **パターン**: `https://[project-name].vercel.app`
- **今回の設定**: `https://d-menu.vercel.app`

### 2. プロジェクト名の変更

Vercelダッシュボードでプロジェクト名を変更できます：

1. プロジェクトページ → **Settings** タブ
2. **General** セクション → **Project Name**
3. 希望の名前を入力（例: `d-menu`）
4. **Save** ボタンをクリック

変更後のURL: `https://d-menu.vercel.app`

**注意**: プロジェクト名は一意である必要があります（他のユーザーが使用していない名前）

### 3. カスタムドメインの設定（独自ドメイン）

独自ドメインを所有している場合、完全にカスタムなURLを設定できます。

#### Vercel CLIでの設定

```bash
# カスタムドメインを追加
vercel domains add your-domain.com

# プロジェクトにドメインを紐付け
vercel alias set disneymenu.vercel.app your-domain.com
```

#### Vercelダッシュボードでの設定

1. プロジェクトページ → **Settings** タブ
2. **Domains** セクション
3. **Add** ボタンをクリック
4. ドメイン名を入力（例: `disney-menu.example.com` または `example.com`）
5. 表示されるDNS設定を、ドメインレジストラで設定

**DNSレコード設定例**:
```
Type: A
Name: @  (または your-subdomain)
Value: 76.76.21.21  (Vercelが指定するIPアドレス)

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

6. DNS設定が反映されるまで待機（最大48時間、通常は数分〜数時間）
7. Vercel側で自動的にSSL証明書が発行される

#### 利用可能なカスタムドメインの種類

- **ルートドメイン**: `example.com`
- **サブドメイン**: `menu.example.com`, `disney.example.com`
- **複数ドメイン**: 1つのプロジェクトに複数のドメインを紐付け可能

### 4. プレビューデプロイメントのURL

PRやブランチごとに自動生成されるプレビューURL：
- **パターン**: `https://[project-name]-[git-branch]-[scope].vercel.app`
- **例**: `https://disneymenu-feature-menu-enhancements-kimshow.vercel.app`

これらは自動生成され、カスタマイズできません。

---

## 重要な設定ファイル

### vercel.json（必須）

プロジェクトルートに`vercel.json`を配置します：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

**重要なポイント**:
- `builds`と`routes`を使用（`rewrites`との併用不可）
- APIは`@vercel/python`でビルド
- フロントエンドは`@vercel/static-build`でビルド
- routesの順序が重要：API → フロントエンドの順

### api/index.py（FastAPI設定）

FastAPIアプリケーションで`root_path="/api"`を設定：

```python
app = FastAPI(
    title="Disney Menu API",
    description="東京ディズニーリゾートのメニュー検索API",
    version="1.0.0",
    root_path="/api",  # ← 必須設定
    docs_url="/docs" if DEBUG else None,
    redoc_url="/redoc" if DEBUG else None,
)

# エンドポイント定義（/apiプレフィックスなし）
@app.get("/", tags=["Root"])
async def root():
    return {"message": "Disney Menu API"}

@app.get("/menus", response_model=MenuListResponse, tags=["Menus"])
async def get_menus(...):
    pass
```

**重要なポイント**:
- `root_path="/api"`を設定することで、Vercelのルーティングと統合
- エンドポイント定義には`/api`プレフィックスを**付けない**
- アクセス時のURL: `https://tdrmenu.vercel.app/api/menus`

### フロントエンド（API URL設定）

`frontend/src/services/api.ts`でAPIベースURLを設定：

```typescript
// 相対パスを使用（Vercelの同一ドメインでデプロイされるため）
const API_BASE_URL = '/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});
```

**フィルターコンポーネントの注意点**:

`FilterPanel.tsx`と`CategoryFilter.tsx`などで、APIリクエスト時に**絶対パスを使わない**：

```typescript
// ❌ NG: ローカルホストの絶対URL
const response = await axios.get('http://localhost:8000/api/categories');

// ✅ OK: 相対パス
const response = await axios.get('/api/categories');
```

これにより、ローカル開発環境でもVercel本番環境でも動作します。

---

## 環境変数の設定

### Vercelダッシュボードでの設定

1. プロジェクトページ → **Settings** タブ
2. **Environment Variables** セクション

### 設定する環境変数

| 変数名 | 値 | 環境 | 説明 |
|--------|------|------|------|
| `DEBUG` | `false` | Production | デバッグモード無効化 |
| `VITE_API_BASE_URL` | `/api` | All | APIベースURL |
| `DATA_PATH` | `data/menus.json` | All | データファイルパス |

### CLIでの設定（オプション）

```bash
# 本番環境変数の設定
vercel env add DEBUG production
# 入力: false

vercel env add VITE_API_BASE_URL production
# 入力: /api

# 設定確認
vercel env ls
```

---

## デプロイ後の確認

### 1. デプロイ状態の確認

```bash
# デプロイ一覧
vercel ls

# 最新デプロイの詳細
vercel inspect
```

### 2. 本番環境での動作確認

#### ヘルスチェック

```bash
# APIエンドポイント確認
curl https://tdrmenu.vercel.app/api/

# 期待レスポンス:
# {
#   "message": "Disney Menu API",
#   "version": "1.0.0",
#   "endpoints": {
#     "menus": "/api/menus",
#     "restaurants": "/api/restaurants",
#     "tags": "/api/tags",
#     "categories": "/api/categories",
#     "stats": "/api/stats"
#   }
# }

# 統計情報取得
curl https://tdrmenu.vercel.app/api/stats

# 期待レスポンス:
# {
#   "success": true,
#   "data": {
#     "total_menus": 1151,
#     "total_restaurants": 111,
#     "total_tags": 238,
#     "total_categories": 6,
#     ...
#   }
# }

# メニュー一覧取得
curl "https://tdrmenu.vercel.app/api/menus?page=1&limit=3"

# 期待: 3件のメニューデータと pagination情報

# カテゴリ一覧取得
curl https://tdrmenu.vercel.app/api/categories

# 期待: 6カテゴリ（メイン、サイド、デザート、ドリンク、スナック、セット）

# グループ化タグ取得
curl https://tdrmenu.vercel.app/api/tags/grouped

# 期待: グループごとに整理されたタグ一覧
```

#### ブラウザでの確認

1. https://tdrmenu.vercel.app にアクセス
2. 以下を順に確認:

**基本機能**
- ✅ メニュー一覧が表示される（1,151件のメニュー）
- ✅ メニューカードに画像、名前、価格が表示される
- ✅ ページネーションが動作する

**検索機能**
- ✅ 検索ボックスで「カレー」と検索
- ✅ Enterキーまたは検索ボタンで実行
- ✅ カレーメニューが絞り込まれる

**フィルター機能**
- ✅ パークフィルター（ランド/シー）が表示される
- ✅ カテゴリフィルター（6カテゴリ）が表示される
- ✅ タグフィルター（料理、ドリンク、エリア等）が表示される
- ✅ 価格範囲スライダーが動作する
- ✅ レストランフィルター（111レストラン）が表示される
- ✅ フィルター適用後にメニューが絞り込まれる

**パフォーマンス**
- ✅ 初回ロード: 3秒以内
- ✅ ページ遷移: 1秒以内
- ✅ Chrome DevToolsでLighthouse実行（目標: 90点以上）

### 3. エラーログの確認

```bash
# Vercelダッシュボードでログ確認
# Project → Deployments → 最新デプロイ → Logs

# または CLI で
vercel logs https://tdrmenu.vercel.app

# リアルタイムログ監視
vercel logs https://tdrmenu.vercel.app --follow
```

### 4. 各APIエンドポイントの動作確認

```bash
# 全エンドポイントをテスト
API_BASE="https://tdrmenu.vercel.app/api"

# 1. ルート
curl -s "$API_BASE/" | jq .

# 2. メニュー一覧
curl -s "$API_BASE/menus?page=1&limit=3" | jq '.meta'

# 3. 統計情報
curl -s "$API_BASE/stats" | jq '.data'

# 4. レストラン一覧
curl -s "$API_BASE/restaurants" | jq '.data | length'

# 5. タグ一覧
curl -s "$API_BASE/tags" | jq '.data | length'

# 6. グループ化タグ
curl -s "$API_BASE/tags/grouped" | jq 'keys'

# 7. カテゴリ一覧
curl -s "$API_BASE/categories" | jq '.data'

# 期待結果:
# - 全てのエンドポイントが200 OKを返す
# - エラーメッセージが表示されない
# - データが正しく返される
```

---

## トラブルシューティング

### エラー1: ビルドエラー

**症状**
```
Error: Build failed
```

**原因と対処**

```bash
# 1. ローカルでビルド確認
cd frontend
npm run build

# 2. 依存関係の再インストール
rm -rf node_modules package-lock.json
npm install

# 3. Vercel再デプロイ
vercel --prod --force
```

### エラー2: APIが404エラー

**症状**
- フロントエンドは表示されるがデータが取得できない
- `/api/menus` が404

**原因と対処**

```bash
# 1. vercel.jsonのroutes設定確認
cat vercel.json
# "src": "/api/(.*)" が正しく設定されているか

# 2. api/index.pyの存在確認
ls -la api/index.py

# 3. FastAPIのroot_path設定確認
grep "root_path" api/index.py
# root_path="/api" が設定されているか

# 4. エンドポイント定義確認（/apiプレフィックスなし）
grep "@app.get" api/index.py | head -5
# @app.get("/menus") のように /api がついていないこと

# 5. 再デプロイ
git add vercel.json api/index.py
git commit -m "fix: API routing configuration"
git push origin main
```

### エラー3: フィルターが表示されない

**症状**
- メニューは表示されるが、カテゴリやタグなどのフィルターが表示されない
- ブラウザのコンソールにAPIエラー

**原因と対処**

フロントエンドコンポーネントでローカルホストのURLがハードコードされている可能性：

```bash
# 1. ハードコードされたURLを検索
grep -r "localhost:8000" frontend/src/

# 2. 見つかった場合は相対パスに修正
# 例: frontend/src/components/filters/FilterPanel.tsx
# http://localhost:8000/api/tags/grouped → /api/tags/grouped

# 3. フロントエンド再ビルド
cd frontend
npm run build

# 4. 再デプロイ
cd ..
vercel --prod --yes
```

**修正例**:

```typescript
// ❌ NG
const response = await axios.get('http://localhost:8000/api/categories');

// ✅ OK
const response = await axios.get('/api/categories');
```

### エラー4: メニューデータが0件

**症状**
- APIは動作するが `"total": 0`

**原因と対処**

```bash
# 1. データファイルの確認
ls -lh data/menus.json
cat data/menus.json | jq 'length'  # 704 が表示されるべき

# 2. データファイルがコミットされているか
git ls-files data/menus.json

# 3. .gitignoreの確認
cat .gitignore | grep menus.json
# "data/*.json" が !data/menus.json より前にある場合は問題

# 4. データファイルを再コミット
git add -f data/menus.json
git commit -m "fix: Include menus.json in deployment"
git push origin main
```

### エラー4: メニューデータが0件

**症状**
- APIは動作するが `"total": 0`

**原因と対処**

```bash
# 1. データファイルの確認
ls -lh data/menus.json
cat data/menus.json | jq 'length'  # 1151 が表示されるべき

# 2. データファイルがコミットされているか
git ls-files data/menus.json

# 3. .gitignoreの確認
cat .gitignore | grep menus.json
# "data/*.json" が !data/menus.json より前にある場合は問題

# 4. データファイルを再コミット
git add -f data/menus.json
git commit -m "fix: Include menus.json in deployment"
git push origin main
```

### エラー5: 環境変数が反映されない

**症状**
- `DEBUG=false` なのにログが出力される

**原因と対処**

1. Vercelダッシュボード → Settings → Environment Variables
2. 変数が正しく設定されているか確認
3. **Redeploy** ボタンをクリック（環境変数変更後は必須）

```bash
# または CLI で
vercel env pull  # ローカルに環境変数をダウンロード
cat .env.local  # 確認

vercel --prod --force  # 強制再デプロイ
```

---

## ロールバック手順

### 方法1: Vercelダッシュボード

1. Project → **Deployments** タブ
2. 以前の成功したデプロイを選択
3. **Promote to Production** ボタンをクリック

### 方法2: CLI

```bash
# デプロイ一覧確認
vercel ls

# 特定のデプロイをプロモート
vercel promote <deployment-url>

# 例:
vercel promote disneymenu-abc123.vercel.app
```

### 方法3: Gitロールバック

```bash
# 以前のコミットに戻す
git log --oneline  # コミット履歴確認
git revert <commit-hash>  # 安全な方法
# または
git reset --hard <commit-hash>  # 強制的に戻す（注意）

git push origin main --force  # 強制プッシュ（チームで要確認）
```

---

## デプロイ後のメンテナンス

### 定期的な確認事項

**毎週**
- [ ] ヘルスチェック実行
- [ ] エラーログ確認
- [ ] パフォーマンス計測（Lighthouse）

**毎月**
- [ ] メニューデータ更新（スクレイピング実行）
- [ ] 依存関係の更新確認
- [ ] セキュリティアップデート適用

### モニタリング設定（オプション）

#### Vercel Analytics有効化

1. Project → **Analytics** タブ
2. **Enable Analytics** をクリック
3. ページビュー、パフォーマンスを自動収集

#### カスタムドメイン設定（オプション）

1. Project → **Settings** → **Domains**
2. **Add Domain** をクリック
3. 独自ドメインを入力（例: `disneymenu.example.com`）
4. DNSレコードを設定（NameserverまたはAレコード）

---

## チェックリスト

### デプロイ前

- [ ] 全テスト合格（pytest 149件、E2E 28件）
- [ ] ローカルビルド成功
- [ ] ローカルプレビュー動作確認
- [ ] 環境変数準備完了
- [ ] データファイル確認（704件）
- [ ] コミット・プッシュ完了

### デプロイ中

- [ ] Vercel CLIログイン完了
- [ ] プロジェクト設定完了
- [ ] 環境変数設定完了
- [ ] デプロイコマンド実行

### デプロイ後

- [ ] デプロイURL確認
- [ ] APIヘルスチェック成功
- [ ] フロントエンド表示確認
- [ ] 検索機能動作確認
- [ ] フィルター機能動作確認
- [ ] パフォーマンス確認（3秒以内）
- [ ] エラーログ確認（エラーなし）

---

## サポート情報

### 公式ドキュメント

- Vercel Documentation: https://vercel.com/docs
- FastAPI on Vercel: https://vercel.com/guides/using-fastapi-with-vercel
- Vite on Vercel: https://vercel.com/guides/deploying-vite-with-vercel

### 問題報告

- GitHub Issues: https://github.com/kimshow/disneymenu/issues
- Vercel Support: https://vercel.com/support

---

## まとめ

このデプロイ手順書に従うことで、Disney Menuアプリケーションを安全かつ確実にVercelにデプロイできます。

**推奨デプロイフロー**:
1. ローカルで十分にテスト（pytest 172件合格、100%カバレッジ）
2. GitHub連携でCI/CD構築
3. mainブランチへのマージで自動デプロイ
4. デプロイ後は必ず動作確認

**重要なポイント**:
- ✅ `vercel.json`でbuildsとroutesを正しく設定
- ✅ FastAPIで`root_path="/api"`を設定
- ✅ フロントエンドのAPIリクエストは相対パス（`/api`）を使用
- ✅ ハードコードされた`localhost:8000`のURLを削除
- ✅ データファイル（menus.json）がデプロイに含まれることを確認
- ✅ 環境変数は必ず設定（変更後は再デプロイ必須）
- ✅ エラーログを定期的にチェック
- ✅ 問題発生時は迅速にロールバック

**実際のデプロイ時間**:
- ビルド時間: 約30-50秒
- 合計デプロイ時間: 約1分

**本番URL**:
- メインサイト: https://tdrmenu.vercel.app
- API: https://tdrmenu.vercel.app/api/
- ドキュメント: https://tdrmenu.vercel.app/api/docs（DEBUG=true時のみ）

Good luck! 🚀
