# Phase 5: 検索体験とUI/UX向上 - 実装計画書

**作成日**: 2026年1月2日  
**優先度**: 🔥 高  
**ステータス**: 計画中  
**想定期間**: 2週間

---

## 📋 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [現状分析](#現状分析)
3. [Phase 5の目標](#phase-5の目標)
4. [機能要件](#機能要件)
5. [技術設計](#技術設計)
6. [実装手順](#実装手順)
7. [テスト計画](#テスト計画)
8. [リスク管理](#リスク管理)

---

## 📊 エグゼクティブサマリー

### プロジェクト概要

Phase 4.5でお気に入り機能の完全実装が完了し、基本機能が揃いました。Phase 5では、ユーザーがメニューをより快適に探せるよう、検索体験とUI/UXを大幅に向上させます。

### 主要機能追加

1. **オートコンプリート機能** - 入力中にメニュー候補をリアルタイム表示
2. **検索履歴保存** - 過去の検索クエリを再利用可能に
3. **検索結果ハイライト** - 検索キーワードを結果内で視覚的に強調
4. **人気メニューサジェスト** - アクセス頻度の高いメニューをレコメンド
5. **フィルター改善** - アニメーション、UI改善、モバイル最適化

### スケジュール

- **Phase 5.1**: オートコンプリート実装（3日）
- **Phase 5.2**: 検索履歴機能（2日）
- **Phase 5.3**: 検索結果ハイライト（2日）
- **Phase 5.4**: 人気メニュー機能（3日）
- **Phase 5.5**: フィルターUI改善（2日）
- **Phase 5.6**: テスト・デバッグ（2日）

**合計**: 約2週間（実働14日）

---

## 🔍 現状分析

### 完了済み機能（Phase 1-4.5）

#### ✅ Phase 4.5: お気に入り機能
- お気に入り追加/削除（localStorage完結型）
- お気に入り一覧ページ（ソート機能付き）
- エクスポート/インポート機能
- 完全レスポンシブデザイン（1列/2列/3-5列グリッド）
- E2Eテスト20件全パス

#### ✅ 既存の検索・フィルター機能
- テキスト検索（メニュー名・説明文の全文検索）
- タグフィルター（料理種類、ドリンク、キャラクター等）
- カテゴリフィルター（メインディッシュ、スイーツ等）
- 価格帯フィルター（¥0～¥17,000スライダー）
- パークフィルター（ランド/シー）
- レストランフィルター（102箇所）
- 販売状況フィルター

### 現状の課題

#### 🔴 Critical Issues

1. **検索体験の限界**
   - **問題**: 入力完了まで候補が表示されない
   - **影響**: ユーザーが正確なメニュー名を知らないと検索が困難
   - **解決策**: オートコンプリート機能の実装

2. **検索履歴の未保存**
   - **問題**: 過去の検索を再利用できない
   - **影響**: 同じメニューを何度も検索する手間
   - **解決策**: localStorage での検索履歴管理

3. **検索結果の視認性**
   - **問題**: 検索キーワードがどこにマッチしたか分かりにくい
   - **影響**: 検索結果の確認に時間がかかる
   - **解決策**: ハイライト表示機能

#### 🟡 Medium Issues

4. **初回訪問時のガイダンス不足**
   - **問題**: 人気メニューや使い方が分かりにくい
   - **影響**: 新規ユーザーの離脱率が高い可能性
   - **解決策**: 人気メニューサジェスト、ガイドツアー

5. **フィルターUIの改善余地**
   - **問題**: フィルター操作時のフィードバックが弱い
   - **影響**: UXの満足度低下
   - **解決策**: アニメーション、トランジション追加

---

## 🎯 Phase 5の目標

### ビジネス目標

1. **ユーザー体験の向上**
   - 検索完了時間を平均30%短縮
   - 新規ユーザーの初回検索成功率を80%以上に
   - モバイルユーザーの操作性を大幅改善

2. **エンゲージメント向上**
   - 平均セッション時間を20%増加
   - ページビュー数を15%増加
   - リピート訪問率を25%向上

### 技術目標

1. **パフォーマンス維持**
   - オートコンプリートのレスポンス時間: 50ms以内
   - 検索履歴の読み込み時間: 10ms以内
   - ハイライト処理時間: 30ms以内

2. **品質保証**
   - E2Eテストカバレッジ: 全機能をカバー（+10件追加）
   - ユニットテストカバレッジ: 90%以上
   - アクセシビリティ: WCAG 2.1 AA準拠

---

## 📝 機能要件

### Phase 5.1: オートコンプリート機能

#### 機能概要
検索バーに入力すると、リアルタイムでメニュー候補を表示します。

#### 詳細要件

**FR-5.1.1: リアルタイム候補表示**
- 入力文字数が2文字以上で候補を表示
- 最大10件の候補を表示
- スコアリング: 前方一致 > 部分一致 > 説明文一致
- デバウンス: 150ms

**FR-5.1.2: 候補表示内容**
- メニュー名（太字）
- 価格（右寄せ）
- レストラン名（小文字、グレー）
- サムネイル画像（オプション）

**FR-5.1.3: キーボード操作**
- 上下矢印キー: 候補選択
- Enter: 選択した候補で検索実行
- Esc: 候補リストを閉じる

**FR-5.1.4: モバイル最適化**
- タッチ操作に最適化された候補リスト
- 画面下部からスライドインするドロワー形式

#### UI設計

```
┌────────────────────────────────────────┐
│  [🔍] カレー___                        │
│  ┌──────────────────────────────────┐│
│  │ シーフードカレー      ¥1,200      ││
│  │   カフェ・ポルトフィーノ          ││
│  ├──────────────────────────────────┤│
│  │ カレーライス          ¥1,000      ││
│  │   キャンプ・ウッドチャック        ││
│  ├──────────────────────────────────┤│
│  │ スパイシーカレー      ¥1,100      ││
│  │   チャイナボイジャー              ││
│  └──────────────────────────────────┘│
└────────────────────────────────────────┘
```

#### 技術仕様

**コンポーネント: `SearchAutocomplete.tsx`**

```typescript
interface AutocompleteOption {
  id: string;
  name: string;
  price: number;
  restaurant: string;
  imageUrl?: string;
}

interface SearchAutocompleteProps {
  onSearch: (query: string) => void;
  onSelectMenu: (menuId: string) => void;
}
```

**データフェッチング:**
- TanStack Query でメニューリストをキャッシュ
- クライアント側でフィルタリング（パフォーマンス優先）
- Fuse.js でファジー検索実装

---

### Phase 5.2: 検索履歴機能

#### 機能概要
過去の検索クエリを保存し、再利用できるようにします。

#### 詳細要件

**FR-5.2.1: 検索履歴の保存**
- 最大20件の検索履歴を保存
- localStorage に保存（キー: `disney-menu-search-history`）
- タイムスタンプ付きで保存

**FR-5.2.2: 検索履歴の表示**
- 検索バーをフォーカスした時に表示
- 最新5件を表示
- 各項目に削除ボタン（✕）を表示

**FR-5.2.3: 検索履歴の管理**
- クリックで検索を再実行
- 削除ボタンで個別削除
- 「すべて削除」ボタンで一括削除

#### UI設計

```
┌────────────────────────────────────────┐
│  [🔍] _____                            │
│  ┌──────────────────────────────────┐│
│  │ 🕐 最近の検索                     ││
│  ├──────────────────────────────────┤│
│  │ カレー                        [✕]││
│  │ ミッキー                      [✕]││
│  │ ポップコーン                  [✕]││
│  │ チュロス                      [✕]││
│  │ パスタ                        [✕]││
│  ├──────────────────────────────────┤│
│  │           すべて削除              ││
│  └──────────────────────────────────┘│
└────────────────────────────────────────┘
```

#### 技術仕様

**LocalStorage管理: `searchHistoryService.ts`**

```typescript
interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

class SearchHistoryService {
  private readonly STORAGE_KEY = 'disney-menu-search-history';
  private readonly MAX_ITEMS = 20;

  addQuery(query: string): void;
  getHistory(): SearchHistoryItem[];
  removeQuery(query: string): void;
  clearAll(): void;
}
```

---

### Phase 5.3: 検索結果ハイライト

#### 機能概要
検索キーワードを結果内で視覚的に強調表示します。

#### 詳細要件

**FR-5.3.1: キーワードハイライト**
- メニュー名内の検索キーワードをハイライト
- 説明文内のキーワードもハイライト
- 複数キーワード対応（スペース区切り）

**FR-5.3.2: ハイライトスタイル**
- 背景色: 黄色（#FFEB3B）
- 文字色: 黒（#000000）
- フォントウェイト: 太字

**FR-5.3.3: アクセシビリティ**
- `<mark>` タグを使用（スクリーンリーダー対応）
- コントラスト比: 4.5:1以上

#### UI設計

```
┌────────────────────────────────────────┐
│  シーフード[カレー]                    │
│  エビ、イカ、ホタテが入った海鮮[カレー]│
│  ¥1,200  カフェ・ポルトフィーノ       │
└────────────────────────────────────────┘
```

#### 技術仕様

**ユーティリティ関数: `highlightText.ts`**

```typescript
export function highlightText(
  text: string,
  keywords: string[]
): React.ReactNode {
  // 正規表現でキーワードを検索し、<mark>タグで囲む
  // React要素の配列として返す
}
```

---

### Phase 5.4: 人気メニュー機能

#### 機能概要
アクセス頻度の高いメニューをサジェストし、初回訪問時のガイダンスを提供します。

#### 詳細要件

**FR-5.4.1: 人気メニューの選定**
- 初期データ: 手動で選定した10件
- 将来的にアクセスログベースで自動更新

**FR-5.4.2: 人気メニュー表示**
- トップページにカルーセル形式で表示
- 各メニューに「詳細を見る」ボタン
- 自動スライド（5秒間隔）

**FR-5.4.3: 初回訪問ガイド**
- 初回訪問時にモーダルでガイド表示
- 人気メニュー3件を紹介
- 「スキップ」「次へ」「完了」ボタン

#### UI設計

```
┌────────────────────────────────────────┐
│  🔥 人気メニュー                       │
│  ┌────┐  ┌────┐  ┌────┐             │
│  │ミッ│  │チュ│  │ポッ│  ← → ●○○   │
│  │キー│  │ロス│  │プコ│             │
│  │ケー│  │   │  │ーン│             │
│  │キ  │  │   │  │   │             │
│  └────┘  └────┘  └────┘             │
└────────────────────────────────────────┘
```

#### 技術仕様

**人気メニューデータ: `popularMenus.ts`**

```typescript
export const POPULAR_MENUS = [
  {
    id: '1779',
    name: 'ミッキーケーキセット',
    reason: 'キャラクターデザインで大人気',
  },
  // ... 10件
];
```

---

### Phase 5.5: フィルターUI改善

#### 機能概要
フィルター操作時のフィードバックを強化し、モバイル体験を向上させます。

#### 詳細要件

**FR-5.5.1: アニメーション追加**
- フィルター選択時にスムーズなトランジション
- フィルタークリア時のフェードアウト
- 結果更新時のフェードイン

**FR-5.5.2: モバイル最適化**
- フィルタードロワーのスワイプ対応
- 大きめのタップ領域（最小44x44px）
- フローティングアクションボタン

**FR-5.5.3: フィルター状態の可視化**
- 適用中フィルター数をバッジ表示
- 各フィルターのアクティブ状態を色で表現
- リセットボタンの強調表示

#### 技術仕様

**アニメーション設定:**
```typescript
const transitions = {
  fadeIn: 'opacity 0.3s ease-in',
  slideUp: 'transform 0.3s ease-out',
  colorChange: 'background-color 0.2s ease',
};
```

---

## 🏗️ 技術設計

### アーキテクチャ

#### フロントエンド構成

```
frontend/src/
├── components/
│   ├── search/
│   │   ├── SearchAutocomplete.tsx      # 新規
│   │   ├── SearchHistory.tsx           # 新規
│   │   └── HighlightedText.tsx         # 新規
│   ├── popular/
│   │   ├── PopularMenusCarousel.tsx    # 新規
│   │   └── WelcomeGuide.tsx            # 新規
│   └── filters/
│       └── AnimatedFilterPanel.tsx     # 更新
├── services/
│   ├── searchHistoryService.ts         # 新規
│   └── analyticsService.ts             # 新規（将来用）
└── utils/
    └── highlightText.ts                # 新規
```

### 技術スタック（追加分）

#### 新規ライブラリ

**検索機能:**
- **Fuse.js**: ファジー検索ライブラリ（v7.0.0）
- **react-highlight-words**: テキストハイライト（v0.20.0）

**UI/UXライブラリ:**
- **react-swipeable**: スワイプ操作対応（v7.0.1）
- **framer-motion**: アニメーション（v11.0.0）
- **react-slick**: カルーセル実装（v0.30.0）

#### パフォーマンス最適化

**キャッシュ戦略:**
- TanStack Query でメニューリスト全件をキャッシュ
- staleTime: 5分
- cacheTime: 10分

**デバウンス:**
- 検索入力: 150ms
- オートコンプリート: 100ms

**仮想スクロール:**
- 候補リストが10件超の場合に適用
- react-window 使用

---

## 📐 実装手順

### Phase 5.1: オートコンプリート実装（3日）

#### Day 1: 基本構造構築

**タスク 5.1.1: 依存関係インストール**
```bash
cd frontend
npm install fuse.js@7.0.0 react-highlight-words@0.20.0
```

**タスク 5.1.2: SearchAutocomplete コンポーネント作成**

ファイル: `frontend/src/components/search/SearchAutocomplete.tsx`

```typescript
import { useState, useMemo } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import Fuse from 'fuse.js';
import { useMenus } from '../../hooks/useMenus';

interface AutocompleteOption {
  id: string;
  name: string;
  price: number;
  restaurant: string;
}

export function SearchAutocomplete() {
  const [inputValue, setInputValue] = useState('');
  const { data: menus } = useMenus({ limit: 1000 });

  // Fuse.js設定
  const fuse = useMemo(
    () =>
      new Fuse(menus || [], {
        keys: ['name', 'description'],
        threshold: 0.3,
        limit: 10,
      }),
    [menus]
  );

  // 検索実行
  const options = useMemo(() => {
    if (inputValue.length < 2) return [];
    return fuse.search(inputValue).map((result) => result.item);
  }, [inputValue, fuse]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={(option) => option.name}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body1" fontWeight="bold">
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.restaurant}
            </Typography>
          </Box>
          <Typography variant="body2">¥{option.price.toLocaleString()}</Typography>
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} placeholder="メニューを検索..." />
      )}
      onInputChange={(_, value) => setInputValue(value)}
    />
  );
}
```

#### Day 2: キーボード操作とモバイル最適化

**タスク 5.1.3: キーボードナビゲーション実装**
- 上下矢印キーで候補選択
- Enter で検索実行
- Esc で閉じる

**タスク 5.1.4: モバイル用ドロワー実装**
- 画面サイズ判定
- ドロワーアニメーション

#### Day 3: テストとデバッグ

**タスク 5.1.5: E2Eテスト作成**

ファイル: `frontend/tests/e2e/autocomplete.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('オートコンプリート候補が表示される', async ({ page }) => {
  await page.goto('/');
  const searchBox = page.locator('input[placeholder*="検索"]');
  
  await searchBox.fill('カレー');
  await page.waitForTimeout(200); // デバウンス待機
  
  const options = page.locator('[role="listbox"] [role="option"]');
  await expect(options).toHaveCount(10, { timeout: 1000 });
});
```

---

### Phase 5.2: 検索履歴機能（2日）

#### Day 4: localStorage管理実装

**タスク 5.2.1: SearchHistoryService 作成**

ファイル: `frontend/src/services/searchHistoryService.ts`

```typescript
interface SearchHistoryItem {
  query: string;
  timestamp: number;
}

class SearchHistoryService {
  private readonly STORAGE_KEY = 'disney-menu-search-history';
  private readonly MAX_ITEMS = 20;

  addQuery(query: string): void {
    if (!query.trim()) return;

    const history = this.getHistory();
    const filtered = history.filter((item) => item.query !== query);
    
    filtered.unshift({
      query,
      timestamp: Date.now(),
    });

    const sliced = filtered.slice(0, this.MAX_ITEMS);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(sliced));
  }

  getHistory(): SearchHistoryItem[] {
    const json = localStorage.getItem(this.STORAGE_KEY);
    if (!json) return [];
    
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  removeQuery(query: string): void {
    const history = this.getHistory();
    const filtered = history.filter((item) => item.query !== query);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
  }

  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const searchHistoryService = new SearchHistoryService();
```

#### Day 5: UI実装とテスト

**タスク 5.2.2: SearchHistory コンポーネント作成**
**タスク 5.2.3: E2Eテスト作成**

---

### Phase 5.3: 検索結果ハイライト（2日）

#### Day 6: ハイライト関数実装

**タスク 5.3.1: highlightText ユーティリティ作成**

ファイル: `frontend/src/utils/highlightText.ts`

```typescript
import React from 'react';

export function highlightText(
  text: string,
  keywords: string[]
): React.ReactNode {
  if (!keywords.length) return text;

  const regex = new RegExp(`(${keywords.join('|')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    const isMatch = keywords.some(
      (keyword) => part.toLowerCase() === keyword.toLowerCase()
    );

    return isMatch ? (
      <mark key={index} style={{ backgroundColor: '#FFEB3B', color: '#000' }}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    );
  });
}
```

#### Day 7: MenuCard統合とテスト

**タスク 5.3.2: MenuCard にハイライト適用**
**タスク 5.3.3: アクセシビリティテスト**

---

### Phase 5.4: 人気メニュー機能（3日）

#### Day 8-9: カルーセル実装

**タスク 5.4.1: react-slick インストール**
```bash
npm install react-slick@0.30.0 @types/react-slick
```

**タスク 5.4.2: PopularMenusCarousel 作成**

#### Day 10: 初回ガイド実装

**タスク 5.4.3: WelcomeGuide モーダル作成**
**タスク 5.4.4: localStorage で表示制御**

---

### Phase 5.5: フィルターUI改善（2日）

#### Day 11: アニメーション追加

**タスク 5.5.1: framer-motion インストール**
```bash
npm install framer-motion@11.0.0
```

**タスク 5.5.2: AnimatedFilterPanel 作成**

#### Day 12: モバイル最適化

**タスク 5.5.3: スワイプ操作実装**
**タスク 5.5.4: FAB（フローティングボタン）追加**

---

### Phase 5.6: テスト・デバッグ（2日）

#### Day 13: 統合テスト

**タスク 5.6.1: 全E2Eテスト実行**
```bash
npm run test:e2e
```

**タスク 5.6.2: パフォーマンステスト**
- Lighthouse スコア測定
- バンドルサイズ確認

#### Day 14: 最終調整とデプロイ

**タスク 5.6.3: バグ修正**
**タスク 5.6.4: ドキュメント更新**
**タスク 5.6.5: 本番デプロイ**

---

## 🧪 テスト計画

### E2Eテスト追加（10件）

#### オートコンプリート（3件）
1. 候補が表示される
2. キーボードで操作できる
3. モバイルドロワーが動作する

#### 検索履歴（3件）
4. 検索履歴が保存される
5. 履歴から再検索できる
6. 履歴を削除できる

#### ハイライト（2件）
7. 検索結果がハイライトされる
8. 複数キーワードがハイライトされる

#### 人気メニュー（2件）
9. 人気メニューカルーセルが表示される
10. 初回ガイドが表示される

### パフォーマンステスト

#### Lighthouse目標スコア
- Performance: 90以上
- Accessibility: 95以上
- Best Practices: 90以上
- SEO: 90以上

---

## ⚠️ リスク管理

### 技術的リスク

#### リスク1: バンドルサイズ増加
- **影響**: ページ読み込み速度の低下
- **対策**: Code Splitting、Tree Shaking、lazy loading
- **軽減策**: Lighthouse で継続監視

#### リスク2: 検索パフォーマンス劣化
- **影響**: オートコンプリートの応答遅延
- **対策**: Web Worker でバックグラウンド処理
- **軽減策**: 候補数を10件に制限

### スケジュールリスク

#### リスク3: 実装の遅延
- **影響**: リリース日の延期
- **対策**: 各Phaseの完了判定を厳格に
- **軽減策**: MVP機能を優先実装

---

## 📚 参考資料

### 技術ドキュメント
- [Fuse.js Documentation](https://fusejs.io/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [React Slick Documentation](https://react-slick.neostack.com/)
- [Material-UI Autocomplete](https://mui.com/material-ui/react-autocomplete/)

### デザインリファレンス
- [Google Search UX](https://www.google.com/)
- [Amazon Product Search](https://www.amazon.com/)
- [Airbnb Search Experience](https://www.airbnb.com/)

---

**作成者**: Disney Menu Development Team  
**最終更新**: 2026年1月2日  
**バージョン**: 1.0
