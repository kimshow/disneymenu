# Disney Menu - 機能拡張実装計画書

**作成日**: 2025年12月29日  
**バージョン**: 2.0  
**ステータス**: レビュー完了・実装準備完了

---

## 📋 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [現状分析](#現状分析)
3. [要件定義](#要件定義)
4. [設計](#設計)
5. [実装手順](#実装手順)
6. [テスト計画](#テスト計画)
7. [リスク管理](#リスク管理)

---

## 📊 エグゼクティブサマリー

### プロジェクト概要
Tokyo Disney Resortのメニュー情報を表示するWebアプリケーションに、以下の機能を追加する。

### 主要機能追加
1. **リトルグリーンまんデータ追加** - 4店舗で販売される人気メニュー
2. **複数販売場所対応** - 折りたたみ可能な店舗リスト表示
3. **パーク・カテゴリータグ表示** - ランド/シー、カテゴリーの視覚化
4. **詳細モーダル** - アレルゲン情報、マップ位置情報の表示
5. **全メニュー表示** - is_available=falseのメニューも表示

### スケジュール
- **所要時間**: 10時間（約2日間）
- **開始予定**: 2025年12月29日
- **完了予定**: 2025年12月30日

### 成果物
- リトルグリーンまんを含む4件のメニューデータ
- 8つの新規コンポーネント
- 詳細モーダル機能
- 更新されたE2Eテスト

---

## 🔍 現状分析

### システム構成

```
Backend (FastAPI)
├─ Port: 8000
├─ Data: data/menus.json (3件)
├─ Coverage: 96% (116 tests)
└─ Status: ✅ 動作中

Frontend (React + Vite)
├─ Port: 5176
├─ Framework: React 18.2.0, Vite 7.3.0
├─ UI: Material-UI v7.3.6
└─ Status: ✅ 動作中（TypeScriptエラー修正済み）
```

### データ現状

**menus.json**: 3件
```json
[
  {
    "id": "4370",
    "name": "ミッキーケーキセット",
    "is_available": true
  },
  {
    "id": "4371", 
    "name": "シーフードパスタ",
    "is_available": true
  },
  {
    "id": "4372",
    "name": "季節のフルーツタルト",
    "is_available": false  // ← 非表示
  }
]
```

### 特定された問題

#### 🔴 Critical Issues

1. **データ表示の問題**
   - **問題**: `only_available: true`により1件が非表示
   - **影響**: 3件中1件しか表示されない（実質2件表示）
   - **原因**: `MenuListPage.tsx` L21でフィルター設定
   - **対策**: `only_available: false`に変更

2. **リトルグリーンまん未登録**
   - **問題**: 人気メニューがデータに存在しない
   - **影響**: ユーザー体験の低下
   - **対策**: data/menus.jsonに追加

3. **型定義の不足**
   - **問題**: MapLocation型が未定義
   - **影響**: マップ機能実装不可
   - **対策**: types/menu.tsに型追加

#### 🟡 Design Issues

1. **単一レストラン前提設計**
   - **問題**: MenuCardが1店舗のみ表示
   - **影響**: 複数店舗メニューの情報不足
   - **対策**: RestaurantListコンポーネント作成

2. **タグ表示の不足**
   - **問題**: パーク・カテゴリー情報が未活用
   - **影響**: 視覚的な区別が困難
   - **対策**: チップコンポーネント作成

3. **詳細情報の欠如**
   - **問題**: アレルゲン情報が見えない
   - **影響**: アレルギー対応困難
   - **対策**: 詳細モーダル実装

#### 🟢 Architecture Improvements

1. **コンポーネント分割不足**
   - **現状**: MenuCard.tsxに全ロジック混在
   - **改善**: 責務ごとに分割

2. **状態管理の単純化**
   - **現状**: ローカルstateのみ
   - **改善**: Context API導入（将来）

---

## 📝 要件定義

### 機能要件

#### FR-1: データ拡張
| ID | 要件 | 優先度 | 検収基準 |
|----|------|--------|----------|
| FR-1.1 | リトルグリーンまん追加 | 🔴 High | menus.jsonに4件目として存在 |
| FR-1.2 | 複数販売場所データ | 🔴 High | restaurants配列に4店舗 |
| FR-1.3 | マップ座標データ | 🟡 Medium | map_locations配列に4箇所 |
| FR-1.4 | 全メニュー表示 | 🔴 High | 4件すべて画面に表示 |

#### FR-2: 表示機能拡張
| ID | 要件 | 優先度 | 検収基準 |
|----|------|--------|----------|
| FR-2.1 | パークタグ表示 | 🔴 High | ランド/シーのChip表示 |
| FR-2.2 | カテゴリータグ表示 | 🔴 High | カテゴリーのChip表示 |
| FR-2.3 | 複数店舗折りたたみ | 🔴 High | 4店舗が展開/折りたたみ可能 |
| FR-2.4 | サービスタイプ表示 | 🟡 Medium | カウンター/バフェテリア表示 |
| FR-2.5 | 販売状況バッジ | 🟡 Medium | 販売終了/季節限定バッジ |

#### FR-3: 詳細情報表示
| ID | 要件 | 優先度 | 検収基準 |
|----|------|--------|----------|
| FR-3.1 | 詳細モーダル | 🔴 High | カードクリックで開閉 |
| FR-3.2 | アレルゲン情報 | 🔴 High | Warning Chip表示 |
| FR-3.3 | 画像ギャラリー | 🟡 Medium | 複数画像スライド表示 |
| FR-3.4 | マップ情報表示 | 🟢 Low | 座標・ゾーン情報表示 |
| FR-3.5 | 公式リンク | 🟡 Medium | 外部リンクボタン |

### 非機能要件

#### NFR-1: パフォーマンス
- 初期ロード: 3秒以内
- カードレンダリング: 100ms以内
- モーダル開閉: スムーズなアニメーション

#### NFR-2: アクセシビリティ
- WCAG 2.1 AA準拠
- キーボードナビゲーション対応
- ARIAラベル適切に設定

#### NFR-3: レスポンシブ
- モバイル（320-767px）: 1カラム
- タブレット（768-1023px）: 2カラム
- デスクトップ（1024px-）: 3カラム

---

## 🛠 設計

### データモデル設計

#### 新規型定義

```typescript
// types/menu.ts に追加

/**
 * マップ位置情報
 */
export interface MapLocation {
  restaurant_id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  floor?: string;
  zone?: string;
  map_url?: string;
}

/**
 * MenuItem インターフェース拡張
 */
export interface MenuItem {
  // 既存フィールド...
  map_locations?: MapLocation[];  // 追加
}
```

### コンポーネント設計

#### 新規コンポーネント構造

```
frontend/src/components/
├─ menu/                      # 新規ディレクトリ
│  ├─ ParkChip.tsx           # パークタグ (50行)
│  ├─ CategoryChips.tsx      # カテゴリータグ (60行)
│  ├─ AllergenChips.tsx      # アレルゲンタグ (70行)
│  ├─ RestaurantItem.tsx     # レストラン単体 (80行)
│  ├─ RestaurantList.tsx     # レストランリスト (120行)
│  ├─ MenuImageGallery.tsx   # 画像ギャラリー (100行)
│  └─ MenuDetailModal.tsx    # 詳細モーダル (250行)
└─ MenuCard.tsx              # 既存（150行→200行に拡張）
```

#### コンポーネント依存関係

```
MenuListPage
  ├─ MenuCard
  │  ├─ ParkChip
  │  ├─ CategoryChips
  │  └─ RestaurantList
  │     └─ RestaurantItem
  └─ MenuDetailModal
     ├─ MenuImageGallery
     ├─ ParkChip
     ├─ CategoryChips
     ├─ AllergenChips
     └─ RestaurantItem
```

### UI設計

#### MenuCard レイアウト

```
┌─────────────────────────┐
│ [季節限定]    [販売終了]│ ← バッジ（条件付き）
│                         │
│       画像エリア         │
│      (200px高)          │
│                         │
├─────────────────────────┤
│ メニュー名              │
│ ¥400 / 1個              │
├─────────────────────────┤
│ [ランド] [シー]         │ ← パークタグ
│ [デザート] [スナック]   │ ← カテゴリータグ
├─────────────────────────┤
│ 販売場所 (4店舗) [▼]   │ ← 折りたたみ
└─────────────────────────┘
```

#### MenuDetailModal レイアウト

```
┌──────────────────────────────────┐
│ リトルグリーンまん          [×] │
├──────────────────────────────────┤
│  ┌────────────────────────────┐  │
│  │    画像ギャラリー          │  │
│  │    [◀] 1/2 [▶]            │  │
│  └────────────────────────────┘  │
│                                  │
│  ¥400 / 1個                      │
│  [ランド] [シー] [季節限定]     │
│                                  │
│  トイ・ストーリーのリトル...    │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  カテゴリー                      │
│  [デザート] [スナック]           │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  アレルゲン情報                  │
│  [⚠小麦] [⚠卵] [⚠乳]           │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━     │
│  販売場所 (4店舗)                │
│  • ニューヨーク・デリ           │
│    [ランド] [カウンター]         │
│  • パン・ギャラクティック...    │
│                                  │
├──────────────────────────────────┤
│        [閉じる] [公式ページ]     │
└──────────────────────────────────┘
```

---

## 📐 実装手順

### Phase 0: 環境準備（15分）

#### ステップ0.1: Gitブランチ作成

```bash
cd /Users/kimurashoya/disneymenu
git checkout develop
git pull origin develop
git checkout -b feature/menu-enhancements
```

#### ステップ0.2: 依存関係確認

```bash
# バックエンド確認
lsof -ti:8000
curl http://localhost:8000/api/stats

# フロントエンド確認
cd frontend
npm run type-check
```

---

### Phase 1: データ層拡張（1時間）

#### ステップ1.1: 型定義拡張（15分）

**ファイル**: `frontend/src/types/menu.ts`

**追加箇所**: L23付近（`is_available`の後）

```typescript
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: PriceInfo;
  image_urls: string[];
  thumbnail_url?: string;
  restaurants: Restaurant[];
  categories: string[];
  tags: string[];
  keywords?: string[];
  characters?: string[];
  allergens?: string[];
  source_url: string;
  scraped_at: string;
  is_seasonal: boolean;
  is_new: boolean;
  is_available: boolean;
  map_locations?: MapLocation[];  // ← 追加
}

// ファイル末尾に追加
/**
 * マップ位置情報
 */
export interface MapLocation {
  restaurant_id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  floor?: string;
  zone?: string;
  map_url?: string;
}
```

**検証コマンド**:
```bash
cd frontend
npm run type-check
```

**期待結果**: エラーなし

---

#### ステップ1.2: メニューデータ追加（30分）

**ファイル**: `data/menus.json`

**追加箇所**: 配列の末尾（L105の`}`の後、`]`の前）

**追加内容**:
```json
  },
  {
    "id": "1779",
    "name": "リトルグリーンまん",
    "description": "トイ・ストーリーのリトルグリーンメンをモチーフにしたスイーツ。エイリアンの形をした可愛い緑色の饅頭です。中身はカスタードクリーム。",
    "price": {
      "amount": 400,
      "unit": "1個",
      "tax_included": true
    },
    "image_urls": [
      "https://media1.tokyodisneyresort.jp/food_menu/image/1779_1.34_1_C2w75656.jpg",
      "https://media1.tokyodisneyresort.jp/food_menu/image/1779_2.34_1_C2w75656.jpg"
    ],
    "thumbnail_url": "https://media1.tokyodisneyresort.jp/food_menu/image/1779_1.34_1_C2w75656.jpg",
    "restaurants": [
      {
        "id": "551",
        "name": "ニューヨーク・デリ",
        "park": "tdl",
        "area": "トゥモローランド",
        "url": "https://www.tokyodisneyresort.jp/tdl/restaurant/detail/551/",
        "service_types": ["カウンター"],
        "availability": {
          "start_date": "2025-01-01",
          "end_date": "2025-12-31"
        }
      },
      {
        "id": "552",
        "name": "パン・ギャラクティック・ピザ・ポート",
        "park": "tdl",
        "area": "トゥモローランド",
        "url": "https://www.tokyodisneyresort.jp/tdl/restaurant/detail/552/",
        "service_types": ["カウンター"],
        "availability": {
          "start_date": "2025-01-01",
          "end_date": "2025-12-31"
        }
      },
      {
        "id": "553",
        "name": "プラザパビリオン・レストラン",
        "park": "tdl",
        "area": "ウエスタンランド",
        "url": "https://www.tokyodisneyresort.jp/tdl/restaurant/detail/553/",
        "service_types": ["バフェテリア"],
        "availability": {
          "start_date": "2025-01-01",
          "end_date": "2025-12-31"
        }
      },
      {
        "id": "554",
        "name": "プラズマ・レイズ・ダイナー",
        "park": "tds",
        "area": "ポートディスカバリー",
        "url": "https://www.tokyodisneyresort.jp/tds/restaurant/detail/554/",
        "service_types": ["カウンター"],
        "availability": {
          "start_date": "2025-01-01",
          "end_date": "2025-12-31"
        }
      }
    ],
    "categories": ["デザート／スウィーツ", "スナック"],
    "tags": ["キャラクターモチーフのメニュー", "トイ・ストーリー", "ピクサー"],
    "characters": ["リトルグリーンメン", "エイリアン"],
    "allergens": ["小麦", "卵", "乳"],
    "source_url": "https://www.tokyodisneyresort.jp/food/1779/",
    "scraped_at": "2025-12-29T10:00:00",
    "is_seasonal": false,
    "is_new": false,
    "is_available": true,
    "map_locations": [
      {
        "restaurant_id": "551",
        "coordinates": { "lat": 35.6329, "lng": 139.8804 },
        "floor": "1F",
        "zone": "トゥモローランド中央"
      },
      {
        "restaurant_id": "552",
        "coordinates": { "lat": 35.6331, "lng": 139.8806 },
        "floor": "1F",
        "zone": "トゥモローランド東"
      },
      {
        "restaurant_id": "553",
        "coordinates": { "lat": 35.6324, "lng": 139.8798 },
        "floor": "1F",
        "zone": "ウエスタンランド北"
      },
      {
        "restaurant_id": "554",
        "coordinates": { "lat": 35.6267, "lng": 139.8835 },
        "floor": "1F",
        "zone": "ポートディスカバリー西"
      }
    ]
  }
]
```

**検証コマンド**:
```bash
# JSONの妥当性確認
cat data/menus.json | jq '.| length'
# 期待値: 4

# APIで確認
curl http://localhost:8000/api/menus | jq '.data | length'
# 期待値: 4

# リトルグリーンまんを確認
curl http://localhost:8000/api/menus | jq '.data[] | select(.id=="1779") | .name'
# 期待値: "リトルグリーンまん"
```

---

#### ステップ1.3: フィルター調整（15分）

**ファイル**: `frontend/src/pages/MenuListPage.tsx`

**変更箇所**: L19-22

**変更前**:
```typescript
  const [filters] = useState<MenuFilters>({
    page,
    limit: 12,
    only_available: true,
  });
```

**変更後**:
```typescript
  const [filters] = useState<MenuFilters>({
    page,
    limit: 12,
    only_available: false,  // ✅ すべてのメニューを表示
  });
```

**検証**:
- ブラウザで http://localhost:5176/ を開く
- 4つのメニューカードが表示されることを確認
- 「季節のフルーツタルト」が表示されることを確認

---

### Phase 2: コンポーネント作成（4時間）

#### ステップ2.1: 共通チップコンポーネント（1時間）

##### ファイル1: `frontend/src/components/menu/ParkChip.tsx`

**新規作成**

```typescript
import { Chip } from '@mui/material';
import { Park as ParkIcon } from '@mui/icons-material';

interface ParkChipProps {
  park: 'tdl' | 'tds';
  size?: 'small' | 'medium';
}

export function ParkChip({ park, size = 'small' }: ParkChipProps) {
  const label = park === 'tdl' ? 'ランド' : 'シー';
  const color = park === 'tdl' ? 'primary' : 'secondary';

  return (
    <Chip
      icon={<ParkIcon />}
      label={label}
      size={size}
      color={color}
      variant="outlined"
    />
  );
}
```

##### ファイル2: `frontend/src/components/menu/CategoryChips.tsx`

**新規作成**

```typescript
import { Chip, Stack } from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';

interface CategoryChipsProps {
  categories: string[];
  size?: 'small' | 'medium';
}

export function CategoryChips({ categories, size = 'small' }: CategoryChipsProps) {
  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {categories.map((category) => (
        <Chip
          key={category}
          icon={<CategoryIcon />}
          label={category}
          size={size}
          color="default"
          variant="outlined"
        />
      ))}
    </Stack>
  );
}
```

##### ファイル3: `frontend/src/components/menu/AllergenChips.tsx`

**新規作成**

```typescript
import { Chip, Stack } from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface AllergenChipsProps {
  allergens: string[];
  size?: 'small' | 'medium';
}

export function AllergenChips({ allergens, size = 'small' }: AllergenChipsProps) {
  if (allergens.length === 0) {
    return null;
  }

  return (
    <Stack direction="row" spacing={0.5} flexWrap="wrap">
      {allergens.map((allergen) => (
        <Chip
          key={allergen}
          icon={<WarningIcon />}
          label={allergen}
          size={size}
          color="warning"
          variant="filled"
        />
      ))}
    </Stack>
  );
}
```

**検証コマンド**:
```bash
cd frontend
npm run type-check
npm run build
```

---

#### ステップ2.2: レストラン表示コンポーネント（1時間）

##### ファイル4: `frontend/src/components/menu/RestaurantItem.tsx`

**新規作成**

```typescript
import { Box, Typography, Chip, Stack } from '@mui/material';
import { Restaurant as RestaurantIcon, RoomService as ServiceIcon } from '@mui/icons-material';
import type { Restaurant } from '../../types/menu';

interface RestaurantItemProps {
  restaurant: Restaurant;
}

export function RestaurantItem({ restaurant }: RestaurantItemProps) {
  const parkLabel = restaurant.park === 'tdl' ? 'ランド' : 'シー';

  return (
    <Box sx={{ py: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <RestaurantIcon fontSize="small" color="action" />
        <Typography variant="body2" fontWeight="medium">
          {restaurant.name}
        </Typography>
      </Stack>
      
      <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }} flexWrap="wrap">
        <Chip label={parkLabel} size="small" variant="outlined" />
        <Chip label={restaurant.area} size="small" variant="outlined" />
        {restaurant.service_types?.map((type) => (
          <Chip
            key={type}
            icon={<ServiceIcon />}
            label={type}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
      </Stack>
    </Box>
  );
}
```

##### ファイル5: `frontend/src/components/menu/RestaurantList.tsx`

**新規作成**

```typescript
import { useState } from 'react';
import {
  Box,
  Typography,
  Collapse,
  IconButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { Restaurant } from '../../types/menu';
import { RestaurantItem } from './RestaurantItem';

interface RestaurantListProps {
  restaurants: Restaurant[];
}

export function RestaurantList({ restaurants }: RestaurantListProps) {
  const [expanded, setExpanded] = useState(false);

  if (restaurants.length === 0) {
    return null;
  }

  // 1店舗のみの場合は折りたたみなし
  if (restaurants.length === 1) {
    return <RestaurantItem restaurant={restaurants[0]} />;
  }

  // 複数店舗の場合は折りたたみ表示
  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setExpanded(!expanded)}
        sx={{ cursor: 'pointer', py: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          販売場所 ({restaurants.length}店舗)
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Stack>

      <Collapse in={expanded}>
        <Box sx={{ pl: 2 }}>
          {restaurants.map((restaurant, index) => (
            <Box key={restaurant.id}>
              <RestaurantItem restaurant={restaurant} />
              {index < restaurants.length - 1 && <Divider sx={{ my: 1 }} />}
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}
```

**検証**:
```bash
cd frontend
npm run type-check
```

---

#### ステップ2.3: MenuCard拡張（1時間）

**ファイル**: `frontend/src/components/MenuCard.tsx`

**インポート追加**: ファイル先頭

```typescript
import { Card, CardContent, CardMedia, Typography, Chip, Box, Stack } from '@mui/material';
import type { MenuItem } from '../types/menu';
import { ParkChip } from './menu/ParkChip';
import { CategoryChips } from './menu/CategoryChips';
import { RestaurantList } from './menu/RestaurantList';
```

**変更箇所1**: L16付近（パーク情報の取得）

**変更前**:
```typescript
  const restaurant = menu.restaurants[0];
  const parkLabel = restaurant?.park === 'tdl' ? 'ランド' : 'シー';
```

**変更後**:
```typescript
  // ユニークなパークを取得
  const parks = [...new Set(menu.restaurants.map(r => r.park))];
```

**変更箇所2**: Cardコンポーネント全体を置き換え

**変更前**: L18-89全体

**変更後**:
```typescript
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        } : {},
        position: 'relative',
      }}
    >
      {/* 販売状況バッジ */}
      {!menu.is_available && (
        <Chip
          label="販売終了"
          size="small"
          color="default"
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
          }}
        />
      )}
      
      {menu.is_seasonal && (
        <Chip
          label="季節限定"
          size="small"
          color="success"
          sx={{
            position: 'absolute',
            top: 8,
            left: 8,
            zIndex: 1,
          }}
        />
      )}

      {/* 画像 */}
      {imageUrl ? (
        <CardMedia
          component="img"
          height="200"
          image={imageUrl}
          alt={menu.name}
          sx={{ objectFit: 'cover' }}
        />
      ) : (
        <Box
          sx={{
            height: 200,
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            画像なし
          </Typography>
        </Box>
      )}

      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* メニュー名 */}
        <Typography variant="h6" component="h2" gutterBottom>
          {menu.name}
        </Typography>

        {/* 価格 */}
        <Typography variant="h5" color="primary" gutterBottom>
          ¥{menu.price.amount.toLocaleString()}
          <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            / {menu.price.unit}
          </Typography>
        </Typography>

        {/* パークタグ */}
        <Stack direction="row" spacing={0.5} sx={{ mb: 1 }} flexWrap="wrap">
          {parks.map((park) => (
            <ParkChip key={park} park={park} />
          ))}
        </Stack>

        {/* カテゴリータグ */}
        <Box sx={{ mb: 1 }}>
          <CategoryChips categories={menu.categories} />
        </Box>

        {/* レストランリスト */}
        <Box sx={{ mt: 'auto' }}>
          <RestaurantList restaurants={menu.restaurants} />
        </Box>
      </CardContent>
    </Card>
  );
```

**検証**:
```bash
cd frontend
npm run build
```

ブラウザで確認:
- パークタグが表示される
- カテゴリータグが表示される
- リトルグリーンまんの「販売場所 (4店舗)」が折りたたみ表示される

---

#### ステップ2.4: 詳細モーダル作成（1時間）

##### ファイル6: `frontend/src/components/menu/MenuImageGallery.tsx`

**新規作成**

```typescript
import { useState } from 'react';
import { Box, IconButton, MobileStepper } from '@mui/material';
import { KeyboardArrowLeft, KeyboardArrowRight } from '@mui/icons-material';

interface MenuImageGalleryProps {
  images: string[];
  name: string;
}

export function MenuImageGallery({ images, name }: MenuImageGalleryProps) {
  const [activeStep, setActiveStep] = useState(0);
  const maxSteps = images.length;

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  if (images.length === 0) {
    return (
      <Box
        sx={{
          width: '100%',
          height: 400,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        画像なし
      </Box>
    );
  }

  if (images.length === 1) {
    return (
      <Box
        component="img"
        src={images[0]}
        alt={name}
        sx={{
          width: '100%',
          height: 400,
          objectFit: 'contain',
          bgcolor: 'grey.100',
        }}
      />
    );
  }

  return (
    <Box>
      <Box
        component="img"
        src={images[activeStep]}
        alt={`${name} - ${activeStep + 1}`}
        sx={{
          width: '100%',
          height: 400,
          objectFit: 'contain',
          bgcolor: 'grey.100',
        }}
      />
      <MobileStepper
        steps={maxSteps}
        position="static"
        activeStep={activeStep}
        nextButton={
          <IconButton
            size="small"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            <KeyboardArrowRight />
          </IconButton>
        }
        backButton={
          <IconButton
            size="small"
            onClick={handleBack}
            disabled={activeStep === 0}
          >
            <KeyboardArrowLeft />
          </IconButton>
        }
      />
    </Box>
  );
}
```

##### ファイル7: `frontend/src/components/menu/MenuDetailModal.tsx`

**新規作成**

```typescript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import type { MenuItem } from '../../types/menu';
import { ParkChip } from './ParkChip';
import { CategoryChips } from './CategoryChips';
import { AllergenChips } from './AllergenChips';
import { RestaurantItem } from './RestaurantItem';
import { MenuImageGallery } from './MenuImageGallery';

interface MenuDetailModalProps {
  menu: MenuItem | null;
  open: boolean;
  onClose: () => void;
}

export function MenuDetailModal({ menu, open, onClose }: MenuDetailModalProps) {
  if (!menu) return null;

  const parks = [...new Set(menu.restaurants.map(r => r.park))];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" component="span">
            {menu.name}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* 画像ギャラリー */}
        <MenuImageGallery images={menu.image_urls} name={menu.name} />

        {/* 基本情報 */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            ¥{menu.price.amount.toLocaleString()}
            <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
              / {menu.price.unit}
            </Typography>
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
            {parks.map((park) => (
              <ParkChip key={park} park={park} size="medium" />
            ))}
            {menu.is_seasonal && (
              <Chip label="季節限定" size="medium" color="success" />
            )}
            {!menu.is_available && (
              <Chip label="販売終了" size="medium" color="default" />
            )}
          </Stack>

          {menu.description && (
            <Typography variant="body1" paragraph>
              {menu.description}
            </Typography>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* カテゴリー */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            カテゴリー
          </Typography>
          <CategoryChips categories={menu.categories} size="medium" />
        </Box>

        {/* アレルゲン情報 */}
        {menu.allergens && menu.allergens.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                アレルゲン情報
              </Typography>
              <AllergenChips allergens={menu.allergens} size="medium" />
            </Box>
          </>
        )}

        {/* 販売場所 */}
        <Divider sx={{ my: 2 }} />
        <Box>
          <Typography variant="h6" gutterBottom>
            販売場所 ({menu.restaurants.length}店舗)
          </Typography>
          <Stack spacing={2}>
            {menu.restaurants.map((restaurant) => (
              <RestaurantItem key={restaurant.id} restaurant={restaurant} />
            ))}
          </Stack>
        </Box>

        {/* マップ情報（将来実装） */}
        {menu.map_locations && menu.map_locations.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography variant="h6" gutterBottom>
                マップ情報
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ※ マップ表示機能は今後実装予定です
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>閉じる</Button>
        <Button
          variant="contained"
          href={menu.source_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          公式ページで見る
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

#### ステップ2.5: MenuListPage更新（30分）

**ファイル**: `frontend/src/pages/MenuListPage.tsx`

**インポート追加**: L14付近

```typescript
import { useMenus } from '../hooks/useMenus';
import { MenuCard } from '../components/MenuCard';
import { MenuDetailModal } from '../components/menu/MenuDetailModal';  // 追加
import type { MenuFilters, MenuItem } from '../types/menu';  // MenuItem追加
```

**状態管理追加**: L23付近

```typescript
  // モーダル状態管理
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
```

**ハンドラー追加**: L30付近

```typescript
  const handleCardClick = (menu: MenuItem) => {
    setSelectedMenu(menu);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    // アニメーション完了後にクリア
    setTimeout(() => setSelectedMenu(null), 300);
  };
```

**MenuCard呼び出し変更**: L110付近

**変更前**:
```typescript
        {menus.map((menu) => (
          <MenuCard key={menu.id} menu={menu} />
        ))}
```

**変更後**:
```typescript
        {menus.map((menu) => (
          <MenuCard 
            key={menu.id} 
            menu={menu} 
            onClick={() => handleCardClick(menu)}
          />
        ))}
```

**モーダル追加**: ファイル末尾（Containerの閉じタグの前）

```typescript
      {/* 詳細モーダル */}
      <MenuDetailModal
        menu={selectedMenu}
        open={modalOpen}
        onClose={handleModalClose}
      />
    </Container>
  );
}
```

**検証**:
```bash
cd frontend
npm run build
npm run dev
```

ブラウザで確認:
- メニューカードをクリック
- モーダルが開く
- アレルゲン情報が表示される
- 複数画像がある場合はギャラリーが動作
- 「閉じる」ボタンでモーダルが閉じる

---

### Phase 3: テストと検証（2時間）

#### ステップ3.1: ビルド確認（15分）

```bash
cd /Users/kimurashoya/disneymenu/frontend
npm run type-check
npm run build
```

**期待結果**: エラーなし

---

#### ステップ3.2: E2Eテスト実行（30分）

```bash
cd frontend
npm run test:e2e
```

**期待結果**:
- 13/13テストがパス
- 4つのメニューカードが表示
- すべてのテストケースが成功

---

#### ステップ3.3: 手動テスト（1時間15分）

##### テストケース1: メニュー表示（15分）

| 項目 | 確認内容 | 期待結果 | 実施 |
|------|----------|----------|------|
| TC-1.1 | メニュー件数 | 4件表示される | ☐ |
| TC-1.2 | リトルグリーンまん | 表示される | ☐ |
| TC-1.3 | 販売終了バッジ | 「季節のフルーツタルト」に表示 | ☐ |
| TC-1.4 | 季節限定バッジ | 該当メニューに表示 | ☐ |

##### テストケース2: タグ表示（15分）

| 項目 | 確認内容 | 期待結果 | 実施 |
|------|----------|----------|------|
| TC-2.1 | パークタグ | ランド/シーが表示 | ☐ |
| TC-2.2 | カテゴリータグ | すべてのカテゴリーが表示 | ☐ |
| TC-2.3 | タグ折り返し | 複数タグが適切に折り返される | ☐ |
| TC-2.4 | アイコン表示 | 各タグにアイコンが表示 | ☐ |

##### テストケース3: レストラン表示（15分）

| 項目 | 確認内容 | 期待結果 | 実施 |
|------|----------|----------|------|
| TC-3.1 | 単一店舗 | 直接表示される | ☐ |
| TC-3.2 | 複数店舗 | 「販売場所 (4店舗)」と表示 | ☐ |
| TC-3.3 | 折りたたみ | クリックで展開/折りたたみ | ☐ |
| TC-3.4 | 店舗情報 | 名前、パーク、エリア、サービスタイプ表示 | ☐ |

##### テストケース4: 詳細モーダル（20分）

| 項目 | 確認内容 | 期待結果 | 実施 |
|------|----------|----------|------|
| TC-4.1 | モーダル開閉 | カードクリックで開く | ☐ |
| TC-4.2 | 画像ギャラリー | 複数画像がスライド表示 | ☐ |
| TC-4.3 | アレルゲン情報 | Warningチップで表示 | ☐ |
| TC-4.4 | 全店舗表示 | すべての販売場所が表示 | ☐ |
| TC-4.5 | 公式リンク | 外部リンクが動作 | ☐ |
| TC-4.6 | 閉じるボタン | モーダルが閉じる | ☐ |
| TC-4.7 | 背景クリック | モーダルが閉じる | ☐ |

##### テストケース5: レスポンシブ（10分）

| 項目 | 確認内容 | 期待結果 | 実施 |
|------|----------|----------|------|
| TC-5.1 | モバイル (375px) | 1カラム表示 | ☐ |
| TC-5.2 | タブレット (768px) | 2カラム表示 | ☐ |
| TC-5.3 | デスクトップ (1024px) | 3カラム表示 | ☐ |
| TC-5.4 | モーダル (375px) | フルスクリーン | ☐ |

---

## 🧪 テスト計画

### E2Eテスト更新

**ファイル**: `frontend/tests/e2e/menu-list.spec.ts`

**追加テストケース**:

```typescript
test('4つのメニューが表示される', async ({ page }) => {
  await page.goto('/');
  const menuCards = page.locator('.MuiCard-root');
  await expect(menuCards).toHaveCount(4);
});

test('リトルグリーンまんが表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('リトルグリーンまん')).toBeVisible();
});

test('複数販売場所の折りたたみが動作する', async ({ page }) => {
  await page.goto('/');
  
  // リトルグリーンまんのカードを見つける
  const card = page.getByText('リトルグリーンまん').locator('..');
  
  // 折りたたみ部分をクリック
  await card.getByText('販売場所 (4店舗)').click();
  
  // すべてのレストランが表示される
  await expect(page.getByText('ニューヨーク・デリ')).toBeVisible();
  await expect(page.getByText('パン・ギャラクティック・ピザ・ポート')).toBeVisible();
  await expect(page.getByText('プラザパビリオン・レストラン')).toBeVisible();
  await expect(page.getByText('プラズマ・レイズ・ダイナー')).toBeVisible();
});

test('詳細モーダルが正しく開閉する', async ({ page }) => {
  await page.goto('/');
  
  // 最初のカードをクリック
  await page.locator('.MuiCard-root').first().click();
  
  // モーダルが表示される
  await expect(page.locator('[role="dialog"]')).toBeVisible();
  
  // 閉じるボタンをクリック
  await page.getByRole('button', { name: '閉じる' }).click();
  
  // モーダルが閉じる
  await expect(page.locator('[role="dialog"]')).not.toBeVisible();
});

test('アレルゲン情報が表示される', async ({ page }) => {
  await page.goto('/');
  
  // リトルグリーンまんをクリック
  await page.getByText('リトルグリーンまん').click();
  
  // アレルゲン情報が表示される
  await expect(page.getByText('アレルゲン情報')).toBeVisible();
  await expect(page.getByText('小麦')).toBeVisible();
  await expect(page.getByText('卵')).toBeVisible();
  await expect(page.getByText('乳')).toBeVisible();
});
```

---

## ⚠️ リスク管理

### 特定されたリスク

| リスク | 影響度 | 発生確率 | 対策 |
|--------|--------|----------|------|
| Material-UI v7互換性問題 | 高 | 低 | 段階的テスト、v5へのダウングレード検討 |
| 大量データ時のパフォーマンス低下 | 中 | 中 | ページネーション、仮想スクロール |
| 画像読み込みの遅延 | 中 | 高 | lazy loading、placeholder |
| 複雑なコンポーネントのバグ | 中 | 中 | 十分なテスト、段階的リリース |
| TypeScriptエラー | 低 | 低 | 厳格な型チェック |

### 緊急時の対応

#### ロールバック手順

```bash
# 変更を破棄
git checkout develop
git branch -D feature/menu-enhancements

# 前の状態に戻す
cd frontend
npm run dev
```

#### 段階的リリース

Phase 1のみ実装→確認→Phase 2実装→確認の順で進める

---

## 📅 実装スケジュール

| Phase | タスク | 所要時間 | 開始 | 完了 |
|-------|--------|----------|------|------|
| Phase 0 | 環境準備 | 15分 | - | - |
| Phase 1.1 | 型定義拡張 | 15分 | - | - |
| Phase 1.2 | メニューデータ追加 | 30分 | - | - |
| Phase 1.3 | フィルター調整 | 15分 | - | - |
| Phase 2.1 | 共通チップ | 1時間 | - | - |
| Phase 2.2 | レストラン表示 | 1時間 | - | - |
| Phase 2.3 | MenuCard拡張 | 1時間 | - | - |
| Phase 2.4 | 詳細モーダル | 1時間 | - | - |
| Phase 2.5 | MenuListPage更新 | 30分 | - | - |
| Phase 3.1 | ビルド確認 | 15分 | - | - |
| Phase 3.2 | E2Eテスト | 30分 | - | - |
| Phase 3.3 | 手動テスト | 1時間15分 | - | - |

**合計所要時間**: 10時間

---

## ✅ 完了基準

### Phase 1 完了基準
- [ ] menus.jsonに4件のメニュー
- [ ] MapLocation型定義追加
- [ ] TypeScriptコンパイルエラーなし
- [ ] APIで4件取得確認

### Phase 2 完了基準
- [ ] 8つの新規コンポーネント作成
- [ ] MenuCard拡張完了
- [ ] MenuListPage更新完了
- [ ] ビルドエラーなし

### Phase 3 完了基準
- [ ] E2Eテスト13/13パス
- [ ] 手動テストすべて合格
- [ ] レスポンシブ動作確認
- [ ] アクセシビリティ確認

### プロジェクト完了基準
- [ ] すべてのPhase完了
- [ ] ドキュメント更新
- [ ] コードレビュー完了
- [ ] mainブランチマージ準備完了

---

## 📚 参考資料

### 技術ドキュメント
- [Material-UI v7](https://mui.com/material-ui/)
- [React TypeScript](https://react-typescript-cheatsheet.netlify.app/)
- [Playwright](https://playwright.dev/)

### プロジェクト内ドキュメント
- [DEVELOPMENT.md](../DEVELOPMENT.md)
- [STARTUP.md](../STARTUP.md)
- [FRONTEND_BLANK_PAGE_FIX.md](./FRONTEND_BLANK_PAGE_FIX.md)

---

**作成者**: AI Assistant  
**最終更新**: 2025年12月29日  
**バージョン**: 2.0
