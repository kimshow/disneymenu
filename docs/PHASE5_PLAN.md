# Phase 5: 検索体験とUI/UX向上 - 実装計画書（改訂版）

**作成日**: 2026年1月2日  
**最終更新**: 2026年1月2日（実装状況を反映）  
**優先度**: 🔥 高  
**ステータス**: 実装準備中  
**想定期間**: 1.5週間（実働10日）

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

Phase 4.5でお気に入り機能の完全実装が完了し、検索・フィルター・ソート機能も既に実装済みです。Phase 5では、既存の検索体験を大幅に向上させる4つの機能を追加します。

### 主要機能追加（優先度順）

1. **オートコンプリート機能** 🔥 - 入力中にメニュー候補をリアルタイム表示
2. **検索履歴機能** 🔥 - 過去の検索クエリを再利用可能に
3. **検索結果ハイライト** 🟡 - 検索キーワードを結果内で視覚的に強調
4. **フィルターUI改善** 🟡 - アニメーション強化とモバイル体験向上

**Phase 6に移動:**
- ~~人気メニューサジェスト~~ → 優先度を下げて後続フェーズで実装

### スケジュール（改訂版）

- **Phase 5.1**: オートコンプリート実装（4日）
- **Phase 5.2**: 検索履歴機能（2日）
- **Phase 5.3**: 検索結果ハイライト（2日）
- **Phase 5.4**: フィルターUI改善（2日）

**合計**: 約1.5週間（実働10日）

---

## 🔍 現状分析（実装済み機能）

### ✅ 完了済み機能（Phase 1-4.5）

#### **Phase 4.5: お気に入り機能（完全実装済み）**
- ✅ お気に入り追加/削除（localStorage完結型）
- ✅ お気に入り一覧ページ（ソート機能付き）
- ✅ エクスポート/インポート機能
- ✅ 完全レスポンシブデザイン（1列/2列/3-5列グリッド）
- ✅ E2Eテスト20件全パス

#### **検索機能（基本実装済み）**
- ✅ `SearchBar.tsx`: テキスト検索コンポーネント
  - Enterキー対応
  - クリアボタン付き
  - URLクエリパラメータと同期
- ❌ オートコンプリート（未実装）
- ❌ 検索履歴（未実装）
- ❌ ハイライト表示（未実装）

#### **フィルター機能（完全実装済み）**
- ✅ `FilterPanel.tsx`: デスクトップ/モバイル対応
- ✅ `PriceRangeFilter.tsx`: スライダー式（デバウンス付き）
- ✅ `ParkFilter.tsx`: ランド/シー選択
- ✅ `CategoryFilter.tsx`: カテゴリフィルター
- ✅ `TagFilterGrouped.tsx`: グループ化タグフィルター
- ✅ `RestaurantFilter.tsx`: **MUI Autocomplete使用**（102件）
- ✅ `AvailabilityFilter.tsx`: 販売状況フィルター
- ✅ `AppliedFilters.tsx`: 適用中フィルター表示・個別削除

#### **ソート機能（完全実装済み）**
- ✅ `SortControl.tsx`: 新着順/価格順/名前順、昇降順切替

#### **カスタムHooks（実装済み）**
- ✅ `useDebounce.ts`: デバウンス処理（500ms）
- ✅ `useFavorites.ts`: お気に入り管理
- ✅ `useMenus.ts`: TanStack Query使用

#### **技術スタック（現在使用中）**
- React 19.2 + TypeScript 5.9
- Material-UI 7.3.6（Autocomplete, Drawer等を活用）
- TanStack Query 5.90（データキャッシュ）
- React Router 7.11（URLクエリパラメータ同期）
- Axios 1.13
- Playwright（E2Eテスト）

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

**不要なライブラリ（削除）:**
- ❌ ~~react-highlight-words~~ → 軽量な自作実装で対応
- ❌ ~~framer-motion~~ → MUIのトランジション機能で代替
- ❌ ~~react-swipeable~~ → MUI Drawerのデフォルト機能で対応
- ❌ ~~react-slick~~ → Phase 6に延期（人気メニュー機能）

#### パフォーマンス最適化

**キャッシュ戦略:**
- TanStack Query でメニューリスト全件をキャッシュ
- staleTime: 5分
- cacheTime: 10分

**デバウンス:**
- 検索入力: 150ms（既存の`useDebounce`フックを活用）
- オートコンプリート: 150ms

**参考にする既存実装:**
- `RestaurantFilter.tsx`: MUI Autocompleteの実装例
- `useDebounce.ts`: デバウンス処理の実装例
- `favoritesStorage.ts`: localStorage管理のパターン

---

## 📐 実装手順

### Phase 5.1: オートコンプリート実装（4日）

#### Day 1-2: 基本構造構築

**タスク 5.1.1: 依存関係インストール**
```bash
cd frontend
npm install fuse.js@7.0.0
```

**タスク 5.1.2: SearchAutocomplete コンポーネント作成**

参考: `RestaurantFilter.tsx`のMUI Autocomplete実装をベースにする

ファイル: `frontend/src/components/search/SearchAutocomplete.tsx`

```typescript
import { useState, useMemo } from 'react';
import { Autocomplete, TextField, Box, Typography } from '@mui/material';
import Fuse from 'fuse.js';
import { useMenus } from '../../hooks/useMenus';
import { useDebounce } from '../../hooks/useDebounce';

interface AutocompleteOption {
  id: string;
  name: string;
  price: number;
  restaurant: string;
}

export function SearchAutocomplete() {
  const [inputValue, setInputValue] = useState('');
  const debouncedInput = useDebounce(inputValue, 150);
  const { data: response } = useMenus({ limit: 1000 });
  const menus = response?.data || [];

  // Fuse.js設定
  const fuse = useMemo(
    () =>
      new Fuse(menus, {
        keys: ['name', 'description'],
        threshold: 0.3,
      }),
    [menus]
  );

  // 検索実行
  const options = useMemo(() => {
    if (debouncedInput.length < 2) return [];
    return fuse.search(debouncedInput).slice(0, 10).map((result) => result.item);
  }, [debouncedInput, fuse]);

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

#### Day 3: キーボード操作とモバイル最適化

**タスク 5.1.3: キーボードナビゲーション実装**
- 上下矢印キーで候補選択（MUI Autocompleteのデフォルト動作）
- Enter で検索実行
- Esc で閉じる

**タスク 5.1.4: モバイル用ドロワー実装**
- `useMediaQuery`で画面サイズ判定
- モバイル時はDrawer形式の候補リスト

#### Day 4: テストとデバッグ

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

#### Day 5: localStorage管理実装

**タスク 5.2.1: SearchHistoryService 作成**

参考: `favoritesStorage.ts`のlocalStorage管理パターンをベースにする

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

#### Day 6: UI実装とテスト

**タスク 5.2.2: SearchHistory コンポーネント作成**
**タスク 5.2.3: E2Eテスト作成**

---

### Phase 5.3: 検索結果ハイライト（2日）

#### Day 7: ハイライト関数実装

**タスク 5.3.1: highlightText ユーティリティ作成**

軽量な自作実装（ライブラリ不要）

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
      <mark key={index} style={{ backgroundColor: '#FFEB3B', color: '#000', fontWeight: 'bold' }}>
        {part}
      </mark>
    ) : (
      <React.Fragment key={index}>{part}</React.Fragment>
    );
  });
}
```

#### Day 8: MenuCard統合とテスト

**タスク 5.3.2: MenuCard にハイライト適用**
**タスク 5.3.3: アクセシビリティテスト**

---

### Phase 5.4: フィルターUI改善（2日）

#### Day 9: アニメーション追加

**タスク 5.4.1: MUIトランジションを活用**

framer-motionは不要、MUIの組み込みコンポーネントを使用

```typescript
import { Fade, Collapse, Slide } from '@mui/material';

// フィルター適用時
<Fade in={isVisible}>
  <AppliedFilters />
</Fade>

// フィルターパネル開閉
<Collapse in={isOpen}>
  <FilterPanel />
</Collapse>
```

**タスク 5.4.2: FilterPanelを拡張**
- フィルター選択時のスムーズなトランジション
- フィルタークリア時のフェードアウト
- 結果更新時のフェードイン

#### Day 10: 最終調整とテスト

**タスク 5.4.3: モバイル最適化**
- タップ領域の拡大（最小44x44px）
- MUI Drawerのデフォルトスワイプ機能を活用

**タスク 5.4.4: E2Eテスト作成と全体テスト**
```bash
npm run test:e2e
```

**タスク 5.4.5: Lighthouseスコア測定**
- Performance: 90以上目標
- Accessibility: 95以上目標

**タスク 5.4.6: ドキュメント更新と本番デプロイ**

---

## 🧪 テスト計画

### E2Eテスト追加（10件）

#### オートコンプリート（3件）
1. 候補が表示される
2. キーボードで操作できる
3. 候補を選択すると検索される

#### 検索履歴（3件）
4. 検索履歴が保存される
5. 履歴から再検索できる
6. 履歴を削除できる

#### ハイライト（2件）
7. 検索結果がハイライトされる
8. 複数キーワードがハイライトされる

#### フィルターUI（2件）
9. フィルター適用時にアニメーションが動作する
10. モバイルでフィルタードロワーが正常に動作する

### パフォーマンステスト

#### Lighthouse目標スコア
- Performance: 90以上
- Accessibility: 95以上
- Best Practices: 90以上
- SEO: 90以上

---

## 🚀 Phase 6以降のロードマップ

### **Phase 6: コンテンツ充実化**（2週間）

#### 6.1: 人気メニュー機能
- カルーセル形式で表示（react-slick）
- 手動選定し10件の人気メニュー
- 初回訪問ガイドモーダル

#### 6.2: メニュー詳細ページ拡張
- 栄養成分情報表示
- 関連メニューサジェスト
- SNSシェアボタン

#### 6.3: レストラン詳細ページ
- レストラン情報ページ作成
- 営業時間、座席数、特徴
- メニュー一覧

---

### **Phase 7: データ分析とビジュアライゼーション**（2週間）

#### 7.1: 統計ダッシュボード
- 価格分布グラフ（Chart.js）
- カテゴリ別メニュー数
- パーク別比較

#### 7.2: トレンド分析
- 人気メニューランキング
- 価格帯別人気度
- 季節限定メニューのタイムライン

#### 7.3: データエクスポート機能
- CSV/JSONダウンロード
- 統計レポート生成

---

### **Phase 8: マップ機能**（3週間）

#### 8.1: パーク内マップ表示
- Google Maps API統合
- レストラン位置表示
- 現在地からのルート案内

#### 8.2: インタラクティブマップ
- マーカークリックでレストラン情報表示
- フィルター連動
- エリア別絞り込み

---

### **Phase 9: ユーザー体験向上**（2週間）

#### 9.1: ダークモード対応
- MUIテーマ切替
- localStorage保存
- システム設定連動

#### 9.2: 多言語対応
- i18n導入（react-i18next）
- 英語版対応
- 言語切替UI

#### 9.3: アクセシビリティ向上
- スクリーンリーダー対応強化
- キーボードナビゲーション改善
- WCAG 2.1 AAA準拠

---

### **Phase 10: パフォーマンス最適化**（1週間）

#### 10.1: バンドルサイズ削減
- Code Splitting
- Tree Shaking
- Dynamic Import

#### 10.2: 画像最適化
- WebP対応
- Lazy Loading
- Responsive Images

#### 10.3: キャッシュ戦略
- Service Worker導入
- PWA対応
- オフライン機能

---

## 📈 長期ロードマップ（Phase 11以降）

### **Phase 11: ユーザー機能**
- ユーザー登録・ログイン（Firebase Auth）
- お気に入りの同期
- レビュー・評価機能

### **Phase 12: ソーシャル機能**
- メニューへのコメント
- ユーザー間でお気に入り共有
- フォロー機能

### **Phase 13: AI機能**
- メニューレコメンドエンジン
- 画像認識でメニュー検索
- チャットボットサポート

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
