# Disney Menu - テスト実行ガイド

このドキュメントでは、Disney Menuアプリケーションのテスト実行方法を詳しく説明します。

---

## 📋 目次

1. [ユニットテスト（Backend）](#ユニットテストbackend)
2. [E2Eテスト（Frontend）](#e2eテストfrontend)
3. [トラブルシューティング](#トラブルシューティング)
4. [CI/CD環境でのテスト](#cicd環境でのテスト)

---

## 🧪 ユニットテスト（Backend）

### 前提条件

- Python仮想環境が有効化されていること
- 依存関係がインストール済みであること

### 実行手順

#### 1. プロジェクトルートへ移動

```bash
cd /Users/kimurashoya/disneymenu
```

#### 2. 仮想環境を有効化

```bash
source venv/bin/activate
```

#### 3. テスト実行

**全テストを実行:**

```bash
pytest
```

**カバレッジ付きで実行:**

```bash
pytest --cov --cov-report=term --cov-report=annotate:cov_annotate
```

**特定のテストファイルを実行:**

```bash
pytest tests/test_scraper.py
```

**特定のテストクラス/関数を実行:**

```bash
pytest tests/test_scraper.py::TestMenuScraperParseMenuPage::test_parse_menu_4370
```

**詳細モード（-v）で実行:**

```bash
pytest -v
```

### カバレッジレポートの確認

カバレッジ付きでテストを実行すると、以下のレポートが生成されます。

**ターミナル出力:**

```bash
pytest --cov --cov-report=term
```

**HTMLレポート:**

```bash
pytest --cov --cov-report=html
# htmlcov/index.html をブラウザで開く
open htmlcov/index.html
```

**注釈付きソースファイル:**

```bash
pytest --cov --cov-report=annotate:cov_annotate
# cov_annotate/ ディレクトリに、カバーされていない行に "!" マークがついたファイルが生成される
```

### 目標カバレッジ

- **目標:** 100%
- **最低:** 95%

主要モジュール（`api/data_loader.py`, `api/index.py`, `api/scraper.py`, `api/models.py`）は100%を維持してください。

---

## 🎭 E2Eテスト（Frontend）

E2Eテストは**Playwright**を使用しています。

### ⚠️ 重要な注意事項

#### 1. ポート確認を必ず実行

E2Eテストを実行する前に、**必ず以下のコマンドで使用中のポートを確認**してください。

```bash
# バックエンド (ポート 8000) を確認
lsof -ti:8000

# フロントエンド (ポート 5174, 5175, 5176) を確認
lsof -ti:5174
lsof -ti:5175
lsof -ti:5176
```

**結果の見方:**

- **プロセスIDが表示される:** そのポートでサーバーが起動中
- **何も表示されない:** そのポートは空いている

#### 2. 重複サーバーの停止

複数のサーバープロセスが起動していると、E2Eテストが失敗します。**不要なプロセスを停止**してください。

```bash
# 特定のポートのプロセスを停止
kill -9 $(lsof -ti:5175)

# 全てのViteプロセスを停止（慎重に使用）
pkill -f "vite"

# 全てのuvicornプロセスを停止（慎重に使用）
pkill -f "uvicorn"
```

#### 3. Playwrightの設定ファイル確認

`frontend/playwright.config.ts` でポート設定を確認してください。

```typescript
export default defineConfig({
  use: {
    baseURL: 'http://localhost:5175', // ← このポート番号
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175', // ← このポート番号
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

**Viteが実際に起動するポート**と**Playwright設定のポート**が一致していることを確認してください。

---

### E2Eテスト実行手順

#### 方法1: Playwrightが自動でサーバーを起動（推奨）

この方法では、Playwrightが自動的にフロントエンドサーバーを起動します。

**ステップ1: バックエンドを起動**

ターミナル1で以下を実行:

```bash
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**ステップ2: ポート確認（重要）**

ターミナル2で以下を実行:

```bash
# バックエンドが起動していることを確認
lsof -ti:8000

# フロントエンドのポートが空いていることを確認
lsof -ti:5175
# 何も表示されなければOK。プロセスIDが表示される場合は停止する
```

**ステップ3: E2Eテストを実行**

ターミナル2で以下を実行:

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run test:e2e
```

Playwrightが自動的に:
1. `npm run dev` でフロントエンドを起動
2. サーバーが起動するまで最大120秒待機
3. テストを実行
4. テスト完了後にサーバーを停止

---

#### 方法2: 手動でサーバーを起動

開発中やデバッグ時には、手動でサーバーを起動する方が便利です。

**ステップ1: バックエンドを起動**

ターミナル1で以下を実行:

```bash
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

**ステップ2: フロントエンドを起動**

ターミナル2で以下を実行:

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run dev
```

**重要:** Viteが起動したポート番号を確認してください。

```
VITE v7.3.0  ready in 76 ms

➜  Local:   http://localhost:5175/  ← このポート番号を確認
```

**ステップ3: playwright.config.ts のポート番号を確認**

Viteが起動したポートと、`playwright.config.ts` のポート設定が一致していることを確認してください。

不一致の場合は、以下のいずれかを実行:

- **A. playwright.config.ts を修正** (推奨)
- **B. Viteの起動ポートを明示的に指定**

```bash
# Viteのポートを5175に固定する場合
vite --port 5175
```

**ステップ4: ポート確認（必須）**

```bash
# バックエンド (期待: プロセスIDが表示される)
lsof -ti:8000

# フロントエンド (期待: プロセスIDが表示される)
lsof -ti:5175
```

**ステップ5: E2Eテストを実行**

ターミナル3で以下を実行:

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run test:e2e
```

このとき、playwright.config.ts の `reuseExistingServer` オプションにより、既存のサーバーが使用されます。

---

### E2Eテストのデバッグ

#### UIモードで実行

テストをステップ実行したい場合:

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run test:e2e:ui
```

ブラウザが開き、各テストをステップごとに確認できます。

#### デバッグモードで単一テストを実行

```bash
cd /Users/kimurashoya/disneymenu/frontend
npx playwright test tests/e2e/menu-list.spec.ts:11 --debug
```

#### ヘッドフルモードで実行（ブラウザを表示）

```bash
cd /Users/kimurashoya/disneymenu/frontend
npx playwright test --headed
```

#### スクリーンショットの確認

テスト失敗時には、自動的にスクリーンショットが保存されます。

```bash
# スクリーンショットの場所
frontend/test-results/
```

#### HTMLレポートの表示

```bash
cd /Users/kimurashoya/disneymenu/frontend
npx playwright show-report
```

ブラウザでレポートが開き、各テストの詳細、スクリーンショット、トレースを確認できます。

---

## 🛠 トラブルシューティング

### 問題1: E2Eテストがタイムアウト

**エラーメッセージ:**

```
Error: Timed out waiting 120000ms from config.webServer.
```

**原因と対処:**

1. **バックエンドが起動していない**

```bash
# 確認
lsof -ti:8000

# 対処: バックエンドを起動
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

2. **フロントエンドのポートが重複している**

```bash
# 確認
lsof -ti:5175

# 対処: 重複プロセスを停止
kill -9 $(lsof -ti:5175)
```

3. **playwright.config.ts のポート番号が間違っている**

`frontend/playwright.config.ts` を開き、`baseURL` と `webServer.url` のポート番号を確認してください。

### 問題2: テストが "Test was interrupted" で失敗

**原因:**

- ターミナルで `Ctrl+C` が押された
- システムリソース不足
- ブラウザプロセスの異常終了

**対処:**

```bash
# 1. 全てのPlaywrightプロセスを停止
pkill -f "playwright"

# 2. キャッシュをクリア
cd /Users/kimurashoya/disneymenu/frontend
rm -rf test-results/
rm -rf playwright-report/

# 3. 再度テストを実行
npm run test:e2e
```

### 問題3: APIエラーでテストが失敗

**エラーメッセージ (フロントエンド):**

```
メニューの読み込みに失敗しました
```

**対処:**

```bash
# 1. バックエンドが起動していることを確認
lsof -ti:8000

# 2. APIが応答することを確認
curl http://localhost:8000/api/menus

# 期待されるレスポンス:
# {"success":true,"data":[...],"meta":{...}}
```

バックエンドが起動していない場合:

```bash
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000
```

### 問題4: ポート競合エラー

**エラーメッセージ:**

```
Port 5174 is in use, trying another one...
```

**原因:**

複数のViteプロセスが起動している、または別のアプリケーションがポートを使用している。

**対処:**

```bash
# ポート5174を使用しているプロセスを確認
lsof -ti:5174

# プロセスを停止
kill -9 $(lsof -ti:5174)

# または全てのViteプロセスを停止
pkill -f "vite"
```

### 問題5: "npm error code ENOENT" エラー

**エラーメッセージ:**

```
npm error enoent Could not read package.json
```

**原因:**

間違ったディレクトリでnpmコマンドを実行している。

**対処:**

```bash
# 現在のディレクトリを確認
pwd

# frontendディレクトリに移動
cd /Users/kimurashoya/disneymenu/frontend

# 再度コマンドを実行
npm run test:e2e
```

---

## 🚀 CI/CD環境でのテスト

### GitHub Actions

`.github/workflows/test.yml` の例:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt
      
      - name: Run backend tests
        run: |
          source venv/bin/activate
          pytest --cov --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - uses: actions/setup-python@v5
        with:
          python-version: '3.9'
      
      - name: Install Python dependencies
        run: |
          python -m venv venv
          source venv/bin/activate
          pip install -r requirements.txt
      
      - name: Start backend
        run: |
          source venv/bin/activate
          PYTHONPATH=. uvicorn api.index:app --port 8000 &
          sleep 5
      
      - name: Install Playwright
        working-directory: frontend
        run: |
          npm ci
          npx playwright install --with-deps
      
      - name: Run E2E tests
        working-directory: frontend
        run: npm run test:e2e
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: frontend/playwright-report/
```

---

## 📝 ベストプラクティス

### テスト実行前のチェックリスト

- [ ] バックエンドが起動している (`lsof -ti:8000`)
- [ ] フロントエンドのポートが空いている、または正しく起動している
- [ ] `playwright.config.ts` のポート設定が正しい
- [ ] 不要な重複プロセスがない

### テスト実行後のクリーンアップ

```bash
# 全てのサーバーを停止
kill -9 $(lsof -ti:8000)  # バックエンド
kill -9 $(lsof -ti:5175)  # フロントエンド

# または特定のプロセス名で停止
pkill -f "uvicorn"
pkill -f "vite"
```

### 推奨ワークフロー

1. **開発中:** 方法2（手動でサーバー起動）を使用
   - ホットリロードが効く
   - エラーログをリアルタイムで確認できる

2. **CI/CD:** 方法1（Playwrightが自動起動）を使用
   - クリーンな環境でテスト実行
   - ポート競合の心配がない

3. **デバッグ:** UIモードまたはデバッグモードを使用
   - `npm run test:e2e:ui`
   - `npx playwright test --debug`

---

## 🔍 よく使うコマンド一覧

```bash
# ポート確認
lsof -ti:8000   # バックエンド
lsof -ti:5175   # フロントエンド

# プロセス停止
kill -9 $(lsof -ti:8000)
kill -9 $(lsof -ti:5175)

# バックエンドテスト
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
pytest --cov --cov-report=term

# E2Eテスト (自動起動)
cd /Users/kimurashoya/disneymenu/frontend
npm run test:e2e

# E2Eテスト (UIモード)
cd /Users/kimurashoya/disneymenu/frontend
npm run test:e2e:ui

# HTMLレポート表示
cd /Users/kimurashoya/disneymenu/frontend
npx playwright show-report

# 全プロセス確認
ps aux | grep -E "uvicorn|vite|playwright"

# クリーンアップ
pkill -f "uvicorn"
pkill -f "vite"
pkill -f "playwright"
```

---

## 📚 参考リンク

- [Playwright Documentation](https://playwright.dev/)
- [pytest Documentation](https://docs.pytest.org/)
- [pytest-cov Documentation](https://pytest-cov.readthedocs.io/)
- [Vite Documentation](https://vitejs.dev/)

---

**最終更新:** 2025年12月31日
