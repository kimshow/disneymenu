# Disney Menu - 起動手順書

このドキュメントでは、Disney Menuアプリケーションを起動する手順を詳しく説明します。

---

## 📋 前提条件

- Python 3.9以上がインストール済み
- Node.js 18以上がインストール済み
- プロジェクトの依存関係がインストール済み

初回セットアップが未完了の場合は、`DEVELOPMENT.md`の「環境セットアップ」セクションを参照してください。

---

## 🚀 クイックスタート（推奨）

2つのターミナルウィンドウを開いて、以下を実行します。

### ターミナル1: バックエンド

```bash
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

### ターミナル2: フロントエンド

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run dev
```

**起動確認:**

- バックエンド: http://localhost:8000/docs
- フロントエンド: http://localhost:5174/
- API統計: http://localhost:8000/api/stats

---

## 📖 詳細手順

### 1️⃣ バックエンド起動（FastAPI）

#### ステップ1: プロジェクトディレクトリへ移動

```bash
cd /Users/kimurashoya/disneymenu
```

#### ステップ2: Python仮想環境を有効化

```bash
source venv/bin/activate
```

**確認:** プロンプトに`(venv)`が表示されることを確認

```
(venv) kimurashoya@MacBook-Air disneymenu %
```

#### ステップ3: uvicornでFastAPIアプリを起動

```bash
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**オプション説明:**
- `PYTHONPATH=.` : Pythonがapiモジュールを見つけられるようにする
- `--reload` : ファイル変更時に自動再起動（開発用）
- `--port 8000` : ポート8000で起動

**成功時の出力:**

```
INFO:     Will watch for changes in these directories: ['/Users/kimurashoya/disneymenu']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using WatchFiles
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

#### ステップ4: 動作確認

**別のターミナルで以下を実行:**

```bash
# 統計情報を取得
curl http://localhost:8000/api/stats

# 期待されるレスポンス:
# {"success":true,"data":{"total_menus":3,"available_menus":2,...}}
```

**ブラウザでAPIドキュメントにアクセス:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

#### トラブルシューティング（バックエンド）

**問題: `Address already in use`エラー**

```bash
# ポート8000を使用しているプロセスを確認
lsof -ti:8000

# プロセスを終了
kill -9 $(lsof -ti:8000)

# 再度起動
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**問題: `ModuleNotFoundError: No module named 'api'`**

→ `PYTHONPATH=.`を忘れていないか確認してください。

**問題: 仮想環境が見つからない**

```bash
# 仮想環境を再作成
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### 2️⃣ フロントエンド起動（React + Vite）

#### ステップ1: frontendディレクトリへ移動

```bash
cd /Users/kimurashoya/disneymenu/frontend
```

#### ステップ2: Vite開発サーバーを起動

```bash
npm run dev
```

**成功時の出力:**

```
VITE v7.3.0  ready in 500 ms

➜  Local:   http://localhost:5174/
➜  Network: use --host to expose
➜  press h + enter to show help
```

#### ステップ3: 動作確認

**ブラウザで以下にアクセス:**

http://localhost:5174/

**期待される表示:**
- 「メニュー一覧」というタイトル
- メニューカードが表示される
- ページネーション（データが多い場合）

#### トラブルシューティング（フロントエンド）

**問題: `Port 5173 is in use`**

Viteは自動的に別のポートを使用します（例: 5174）。表示されたURLをブラウザで開いてください。

**問題: ページが空白、またはメニューが表示されない**

1. バックエンドが起動しているか確認:
   ```bash
   lsof -ti:8000
   ```

2. APIが応答しているか確認:
   ```bash
   curl http://localhost:8000/api/menus
   ```

3. ブラウザのコンソールでエラーを確認:
   - 開発者ツール（F12） → Console タブ

**問題: `node_modules`が見つからない**

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm install
npm run dev
```

---

### 3️⃣ 両方を同時起動（tmux使用例）

**tmuxがインストールされている場合:**

```bash
# 新しいtmuxセッションを開始
tmux new -s disneymenu

# ウィンドウを分割（Ctrl+B, %）
# 左側: バックエンド
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000

# 右側: フロントエンド（Ctrl+B, 矢印キーで移動）
cd /Users/kimurashoya/disneymenu/frontend
npm run dev

# デタッチ: Ctrl+B, d
# アタッチ: tmux attach -t disneymenu
```

---

## 🧪 E2Eテスト実行

### 前提条件

- バックエンドが http://localhost:8000 で起動中
- フロントエンドは停止していてもOK（Playwrightが自動起動）

### テスト実行

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run test:e2e
```

### UIモードでテスト実行（デバッグ用）

```bash
npm run test:e2e:ui
```

### テストレポート表示

テスト実行後、自動的にHTMLレポートが表示されます。  
手動で開く場合:

```bash
npx playwright show-report
```

---

## 🛑 停止手順

### バックエンド停止

**方法1: ターミナルで停止**

バックエンドが動いているターミナルで `Ctrl+C` を押す

**方法2: プロセスをkill**

```bash
# ポート8000のプロセスIDを確認
lsof -ti:8000

# プロセスを終了
kill -9 $(lsof -ti:8000)
```

### フロントエンド停止

フロントエンドが動いているターミナルで `Ctrl+C` を押す

---

## 🔍 起動状態確認

### 両方のサーバーが起動しているか確認

```bash
# バックエンド（期待: プロセスIDが返る）
lsof -ti:8000

# フロントエンド（期待: プロセスIDが返る）
lsof -ti:5174
```

### APIエンドポイント一覧確認

```bash
# 統計情報
curl http://localhost:8000/api/stats

# メニュー一覧
curl http://localhost:8000/api/menus

# タグ一覧
curl http://localhost:8000/api/tags

# カテゴリ一覧
curl http://localhost:8000/api/categories

# レストラン一覧
curl http://localhost:8000/api/restaurants
```

---

## 📝 よく使うコマンド

```bash
# バックエンドテスト実行
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
pytest

# カバレッジ付きテスト
pytest --cov=api --cov-report=html

# フロントエンドビルド
cd /Users/kimurashoya/disneymenu/frontend
npm run build

# Vercelにデプロイ（プレビュー）
vercel

# Vercelにデプロイ（本番）
vercel --prod
```

---

## 🆘 ヘルプ

詳細な開発情報は `DEVELOPMENT.md` を参照してください。

- プロジェクト概要
- 完了済み/進行中/未着手タスク
- 環境セットアップ
- テスト実行方法
- トラブルシューティング
- ディレクトリ構造
- Git Flowワークフロー
