# セキュリティポリシー

## 🛡️ セキュリティ対策の概要

Disney Menu APIは、OWASP Top 10とCWE Top 25に基づいたセキュリティベストプラクティスに従って開発されています。

## 🔒 実装済みセキュリティ対策

### 1. 入力バリデーション（CWE-20）

**対策内容**:
- 全APIエンドポイントのクエリパラメータに厳密なバリデーション
- 文字列長の制限（クエリ: 200文字、タグ: 500文字）
- 数値の範囲制限（価格: 0-100,000円、ページ: 1-10,000）
- 正規表現パターンマッチング（ソート項目、順序）

**検証済み攻撃パターン**:
- SQLインジェクション（CWE-89）
- XSS（CWE-79）
- コマンドインジェクション（CWE-78）

### 2. Path Traversal防止（CWE-22）

**対策内容**:
- ファイルパスの絶対パス解決
- `data/` ディレクトリ外へのアクセスを完全にブロック
- パス検証の失敗時に `ValueError` を発生

**保護対象**:
- `MenuDataLoader` のファイル読み込み
- スクレイピングスクリプトのファイル書き込み

### 3. CORS設定の最小権限化（A05）

**対策内容**:
- 環境変数 `ALLOWED_ORIGINS` で許可オリジンを明示的に指定
- 本番環境では特定ドメインのみ許可
- `allow_credentials=False` で認証情報送信を防止
- HTTPメソッドを `GET`, `OPTIONS` のみに制限

**設定例**:
```bash
# 開発環境
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:3000

# 本番環境
ALLOWED_ORIGINS=https://your-domain.vercel.app
```

### 4. SSRF対策（CWE-918）

**対策内容**:
- スクレイピング先ドメインをホワイトリスト化（`www.tokyodisneyresort.jp`）
- リダイレクトの無効化（`allow_redirects=False`）
- レスポンスサイズ制限（5MB）
- タイムアウト設定（接続5秒、合計10秒）

### 5. セキュリティヘッダー

**実装済みヘッダー**:
- `X-Content-Type-Options: nosniff` - MIME sniffing防止
- `X-Frame-Options: DENY/SAMEORIGIN` - クリックジャッキング防止
- `X-XSS-Protection: 1; mode=block` - XSS防止
- `Referrer-Policy: strict-origin-when-cross-origin` - リファラー情報保護
- `Content-Security-Policy` - コンテンツ読み込み制限
- `Permissions-Policy` - 不要な機能の無効化

### 6. エラーハンドリング（CWE-209）

**対策内容**:
- 本番環境でスタックトレースを非表示
- 一般的なエラーメッセージの使用
- 内部実装の詳細を隠蔽

### 7. APIドキュメントの保護

**対策内容**:
- 本番環境（`DEBUG=false`）で `/docs` と `/redoc` を無効化
- 開発環境のみSwagger UIを公開

## 🧪 セキュリティテスト

### テスト実行

```bash
# セキュリティテストの実行
pytest tests/test_security.py -v

# 全テストの実行
pytest tests/ -v --cov=api
```

### テストカバレッジ

- 入力バリデーション: 15テスト
- Path Traversal防止: 4テスト
- DoS対策: 3テスト
- エラーハンドリング: 2テスト
- CORS設定: 1テスト
- APIドキュメント保護: 2テスト
- 入力サニタイゼーション: 3テスト
- 認可バイパス: 2テスト
- データバリデーション: 3テスト

**合計**: 35+テスト

## 🔍 セキュリティスキャン

### 推奨ツール

1. **依存関係の脆弱性チェック**
```bash
pip install safety
safety check
```

2. **コードスキャン**
```bash
pip install bandit
bandit -r api/
```

3. **フロントエンドスキャン**
```bash
cd frontend
npm audit
```

## 📝 セキュリティチェックリスト

### デプロイ前の確認

- [ ] `DEBUG=false` に設定
- [ ] `ALLOWED_ORIGINS` に本番ドメインを設定
- [ ] `/docs` エンドポイントが404を返すことを確認
- [ ] セキュリティヘッダーが正しく設定されていることを確認
- [ ] 全セキュリティテストが通過
- [ ] 依存関係に既知の脆弱性がないことを確認

### 定期メンテナンス

- [ ] 週次: 依存関係の脆弱性スキャン
- [ ] 月次: セキュリティパッチの適用
- [ ] 四半期: セキュリティレビューの実施

## 🚨 脆弱性の報告

セキュリティ上の問題を発見した場合は、以下の方法で報告してください：

### 報告方法

1. **GitHub Security Advisory**（推奨）
   - リポジトリの「Security」タブから報告

2. **Email**
   - security@your-domain.com（実際のメールアドレスに置き換え）

### 報告時に含める情報

- 脆弱性の詳細な説明
- 再現手順
- 影響範囲
- 可能であれば、修正案

### 対応プロセス

1. **24時間以内**: 受領確認
2. **7日以内**: 初期評価と対応計画の共有
3. **30日以内**: 修正の実装とリリース

## 📊 セキュリティ評価

### OWASP Top 10 (2021) 対応状況

| リスク | 対策状況 | 説明 |
|-------|---------|------|
| A01: Broken Access Control | ✅ 対応済み | 公開APIのみ、認証不要 |
| A02: Cryptographic Failures | N/A | 機密データなし |
| A03: Injection | ✅ 対応済み | 入力バリデーション実装 |
| A04: Insecure Design | ✅ 対応済み | セキュアな設計パターン採用 |
| A05: Security Misconfiguration | ✅ 対応済み | CORS、ヘッダー設定 |
| A06: Vulnerable Components | ✅ 対応済み | 定期的な依存関係更新 |
| A07: Authentication Failures | N/A | 認証機能なし |
| A08: Data Integrity Failures | ✅ 対応済み | 入力検証実装 |
| A09: Security Logging | ⚠️ 部分対応 | 基本ログのみ |
| A10: SSRF | ✅ 対応済み | ドメインホワイトリスト |

### 既知の制限事項

1. **レート制限**
   - 現在未実装
   - 将来的に `slowapi` での実装を検討

2. **監査ログ**
   - 基本的なログのみ
   - 詳細な監査ログは未実装

3. **HTTPSリダイレクト**
   - Vercelが自動処理
   - HSTSヘッダーの追加を検討

## 🔄 更新履歴

### 2026-01-01: 初回セキュリティレビュー

- OWASP Top 10に基づく包括的なセキュリティ対策実装
- 35+のセキュリティテスト追加
- セキュリティドキュメント作成

## 📚 参考資料

- [OWASP Top 10 (2021)](https://owasp.org/Top10/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [FastAPI Security](https://fastapi.tiangolo.com/tutorial/security/)
- [Vercel Security Best Practices](https://vercel.com/docs/security)

---

**Last Updated**: 2026-01-01  
**Version**: 1.0.0
