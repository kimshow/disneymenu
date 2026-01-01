# フロントエンド機能拡張 - 実装計画書

**作成日**: 2026年1月1日  
**対象バージョン**: v1.1.0  
**ステータス**: 実装準備中

---

## 1. プロジェクト概要

### 1.1 目的

704件の実データを活用し、ユーザーが目的のメニューを素早く見つけられる検索・フィルター・ソート機能を実装する。URLクエリパラメータ対応により、検索結果の共有を可能にし、ユーザー体験を向上させる。

### 1.2 スコープ

#### 対象機能
- ✅ **検索機能**: テキスト検索バー（メニュー名・説明の全文検索）
- ✅ **フィルター機能**: レストラン、価格範囲、パーク、カテゴリ、タグ、販売状況
- ✅ **ソート機能**: 価格順、新着順、名前順（昇順/降順）
- ✅ **UX改善**: 適用中フィルター表示、フィルターリセット、URL同期

#### 対象外
- ❌ お気に入り機能（Phase 7で実装）
- ❌ レストラン詳細ページ（Phase 8で実装）
- ❌ 地図表示機能（Phase 9で実装）
- ❌ ダークモード対応（Phase 10で実装）

### 1.3 現在の実装状況

**既存機能**:
- ✅ メニュー一覧表示（12件/ページ）
- ✅ ページネーション機能
- ✅ メニュー詳細モーダル
- ✅ レスポンシブデザイン基礎
- ✅ E2Eテスト基盤（28テスト、100%成功）

**データ状況**:
- **総メニュー数**: 704件
- **パーク**: 東京ディズニーランド（402件）、東京ディズニーシー（457件）
- **価格帯**: ¥0 - ¥13,000（平均: ¥652円）
- **レストラン数**: 102箇所

---

## 2. アーキテクチャ設計

### 2.1 システム構成

```
┌─────────────────────────────────────────────────────────┐
│                    MenuListPage                          │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────┐  │
│  │         SearchBar (新規)                          │  │
│  │  - TextField (検索クエリ入力)                     │  │
│  │  - IconButton (検索実行)                          │  │
│  │  - Debounce (300ms)                              │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      FilterPanel (新規)                           │  │
│  │  ┌────────────────────────────────────────────┐  │  │
│  │  │ Desktop: Sidebar (折りたたみ可能)           │  │  │
│  │  │ Mobile: Drawer (スワイプで開閉)            │  │  │
│  │  ├────────────────────────────────────────────┤  │  │
│  │  │ - RestaurantFilter (Autocomplete)          │  │  │
│  │  │ - PriceRangeSlider (Slider)                │  │  │
│  │  │ - ParkFilter (ToggleButtonGroup)           │  │  │
│  │  │ - CategoryFilter (Chip 複数選択)            │  │  │
│  │  │ - TagFilter (Chip 複数選択)                 │  │  │
│  │  │ - AvailabilitySwitch (Switch)              │  │  │
│  │  └────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      SortControl (新規)                           │  │
│  │  - SortSelect (Select: price/name/scraped_at)    │  │
│  │  - OrderToggle (IconButton: asc/desc)            │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      AppliedFilters (新規)                        │  │
│  │  - Chip (適用中フィルター表示)                   │  │
│  │  - IconButton (個別削除)                          │  │
│  │  - Button (すべてクリア)                          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      MenuGrid (既存)                              │  │
│  │  - MenuCard (既存コンポーネント)                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │      Pagination (既存)                            │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘

           ▼ React Query (useMenus)
           
┌─────────────────────────────────────────────────────────┐
│              API Client (api.ts)                         │
│  - getMenus(filters) - 拡張済み                          │
│  - getRestaurants() - 既存                               │
│  - getTags() - 既存                                      │
│  - getCategories() - 既存                                │
└─────────────────────────────────────────────────────────┘

           ▼ HTTP Request
           
┌─────────────────────────────────────────────────────────┐
│           FastAPI Backend (api/index.py)                 │
│  - GET /api/menus (新規パラメータ追加)                   │
│    * sort: price/name/scraped_at                         │
│    * order: asc/desc                                     │
└─────────────────────────────────────────────────────────┘
```

### 2.2 状態管理戦略

#### URLクエリパラメータ（推奨実装）

**メリット**:
- 検索結果の共有が可能
- ブラウザバック/フォワード対応
- ブックマーク可能
- リロード時に状態保持

**実装方法**:
```typescript
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();

// 読み取り
const filters: MenuFilters = {
  q: searchParams.get('q') || '',
  park: searchParams.get('park') as 'tdl' | 'tds' | undefined,
  min_price: parseInt(searchParams.get('min_price') || '0'),
  max_price: parseInt(searchParams.get('max_price') || '13000'),
  categories: searchParams.get('categories')?.split(',') || [],
  tags: searchParams.get('tags')?.split(',') || [],
  only_available: searchParams.get('only_available') === 'true',
  sort: searchParams.get('sort') || 'scraped_at',
  order: searchParams.get('order') || 'desc',
  page: parseInt(searchParams.get('page') || '1'),
  limit: parseInt(searchParams.get('limit') || '12'),
};

// 更新
const updateFilters = (newFilters: Partial<MenuFilters>) => {
  const params = new URLSearchParams(searchParams);
  Object.entries(newFilters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else {
        params.set(key, String(value));
      }
    } else {
      params.delete(key);
    }
  });
  setSearchParams(params);
};
```

#### ローカルステート（補助的利用）

**用途**:
- UI一時状態（Drawer開閉、モーダル表示など）
- デバウンス中の入力値
- フィルターパネルの展開/折りたたみ状態

### 2.3 データフロー

```
User Input (検索/フィルター/ソート)
    ↓
URLクエリパラメータ更新 (setSearchParams)
    ↓
useSearchParams フック (自動再レンダリング)
    ↓
MenuFilters オブジェクト構築
    ↓
useMenus(filters) フック (React Query)
    ↓
APIクライアント getMenus(filters)
    ↓
FastAPI Backend GET /api/menus
    ↓
フィルタリング・ソート処理 (Python)
    ↓
JSON レスポンス
    ↓
React Query キャッシュ (5分間)
    ↓
MenuGrid コンポーネント再レンダリング
```

---

## 3. 機能仕様

### 3.1 検索機能

#### 3.1.1 仕様

| 項目 | 内容 |
|------|------|
| **検索対象** | メニュー名（`name_ja`, `name_en`）、説明（`description`） |
| **検索方式** | 部分一致、大文字小文字区別なし |
| **デバウンス** | 300ms（入力停止後に検索実行） |
| **最小文字数** | 1文字以上（空欄の場合はすべて表示） |
| **ハイライト** | Phase 2で実装（検索キーワードを強調表示） |

#### 3.1.2 UI設計

**配置**: ページ上部、固定ヘッダー内  
**コンポーネント**: Material-UI `TextField`  
**サイズ**: 
- デスクトップ: 幅500px
- モバイル: 幅100%（余白16px）

**実装例**:
```tsx
<TextField
  fullWidth
  placeholder="メニューを検索（例: カレー、ミッキー）"
  value={searchQuery}
  onChange={handleSearchChange}
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
    endAdornment: searchQuery && (
      <InputAdornment position="end">
        <IconButton size="small" onClick={handleClearSearch}>
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    ),
  }}
/>
```

#### 3.1.3 API仕様

**エンドポイント**: `GET /api/menus`  
**パラメータ**: `q` (string, optional)  
**例**:
```
GET /api/menus?q=カレー
GET /api/menus?q=ミッキー&park=tdl
```

**バックエンド実装** (既存):
```python
if q:
    q_lower = q.lower()
    filtered = [
        m for m in filtered
        if q_lower in m.name_ja.lower()
        or (m.name_en and q_lower in m.name_en.lower())
        or (m.description and q_lower in m.description.lower())
    ]
```

---

### 3.2 フィルター機能

#### 3.2.1 レストランフィルター

| 項目 | 内容 |
|------|------|
| **コンポーネント** | Material-UI `Autocomplete` |
| **選択方式** | 単一選択（1レストランのみ） |
| **データソース** | `GET /api/restaurants` (102箇所) |
| **表示形式** | レストラン名（パーク・エリア付き） |
| **クリア機能** | ✅ あり（×ボタン） |

**実装例**:
```tsx
<Autocomplete
  options={restaurants}
  getOptionLabel={(option) => 
    `${option.name_ja} (${option.park === 'tdl' ? 'ランド' : 'シー'} - ${option.area})`
  }
  value={selectedRestaurant}
  onChange={(_, newValue) => setSelectedRestaurant(newValue)}
  renderInput={(params) => (
    <TextField {...params} label="レストラン" placeholder="レストランを選択" />
  )}
/>
```

#### 3.2.2 価格範囲フィルター

| 項目 | 内容 |
|------|------|
| **コンポーネント** | Material-UI `Slider` |
| **範囲** | ¥0 - ¥13,000（データから動的取得） |
| **刻み** | ¥100 |
| **デフォルト** | 最小値 - 最大値（全範囲） |
| **表示** | 現在値をラベル表示（¥1,000 - ¥3,000） |

**実装例**:
```tsx
<Box sx={{ px: 2 }}>
  <Typography gutterBottom>価格範囲</Typography>
  <Slider
    value={priceRange}
    onChange={handlePriceChange}
    valueLabelDisplay="auto"
    valueLabelFormat={(value) => `¥${value.toLocaleString()}`}
    min={0}
    max={13000}
    step={100}
    marks={[
      { value: 0, label: '¥0' },
      { value: 13000, label: '¥13,000' },
    ]}
  />
</Box>
```

#### 3.2.3 パークフィルター

| 項目 | 内容 |
|------|------|
| **コンポーネント** | Material-UI `ToggleButtonGroup` |
| **選択肢** | ランド / シー / すべて |
| **選択方式** | 単一選択（排他的） |
| **デフォルト** | すべて |

**実装例**:
```tsx
<ToggleButtonGroup
  value={park}
  exclusive
  onChange={handleParkChange}
  aria-label="パーク選択"
>
  <ToggleButton value="all" aria-label="すべて">
    すべて
  </ToggleButton>
  <ToggleButton value="tdl" aria-label="ランド">
    🏰 ランド
  </ToggleButton>
  <ToggleButton value="tds" aria-label="シー">
    🌊 シー
  </ToggleButton>
</ToggleButtonGroup>
```

#### 3.2.4 カテゴリフィルター

| 項目 | 内容 |
|------|------|
| **コンポーネント** | Material-UI `Chip` (複数選択) |
| **データソース** | `GET /api/categories` |
| **選択方式** | 複数選択可能（OR条件） |
| **表示形式** | チップ形式、選択時は色変更 |

**実装例**:
```tsx
<Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
  {categories.map((category) => (
    <Chip
      key={category}
      label={category}
      onClick={() => toggleCategory(category)}
      color={selectedCategories.includes(category) ? 'primary' : 'default'}
      variant={selectedCategories.includes(category) ? 'filled' : 'outlined'}
    />
  ))}
</Box>
```

#### 3.2.5 タグフィルター

| 項目 | 内容 |
|------|------|
| **コンポーネント** | Material-UI `Chip` (複数選択) |
| **データソース** | `GET /api/tags` |
| **選択方式** | 複数選択可能（OR条件） |
| **表示形式** | カテゴリフィルターと同様 |

#### 3.2.6 販売状況フィルター

| 項目 | 内容 |
|------|------|
| **コンポーネント** | Material-UI `Switch` |
| **ラベル** | "販売中のみ表示" |
| **デフォルト** | OFF（すべて表示） |

**実装例**:
```tsx
<FormControlLabel
  control={
    <Switch
      checked={onlyAvailable}
      onChange={(e) => setOnlyAvailable(e.target.checked)}
    />
  }
  label="販売中のみ表示"
/>
```

---

### 3.3 ソート機能

#### 3.3.1 仕様

| 項目 | 内容 |
|------|------|
| **ソート項目** | 価格 / 新着順 / 名前順 |
| **ソート順** | 昇順 (asc) / 降順 (desc) |
| **デフォルト** | 新着順・降順（`scraped_at desc`） |
| **UI配置** | ページ上部、検索バーの下 |

#### 3.3.2 ソートオプション詳細

| ソート項目 | APIパラメータ | 昇順の意味 | 降順の意味 |
|------------|---------------|------------|------------|
| **価格順** | `sort=price` | 安い順 | 高い順 |
| **新着順** | `sort=scraped_at` | 古い順 | 新しい順 |
| **名前順** | `sort=name` | あいうえお順 | 逆順 |

#### 3.3.3 UI設計

**実装例**:
```tsx
<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
  <FormControl size="small" sx={{ minWidth: 150 }}>
    <InputLabel>並び替え</InputLabel>
    <Select
      value={sort}
      label="並び替え"
      onChange={(e) => setSort(e.target.value)}
    >
      <MenuItem value="scraped_at">新着順</MenuItem>
      <MenuItem value="price">価格順</MenuItem>
      <MenuItem value="name">名前順</MenuItem>
    </Select>
  </FormControl>
  
  <IconButton
    size="small"
    onClick={() => setOrder(order === 'asc' ? 'desc' : 'asc')}
    aria-label={order === 'asc' ? '昇順' : '降順'}
  >
    {order === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
  </IconButton>
  
  <Typography variant="body2" color="text.secondary">
    {order === 'asc' ? '昇順' : '降順'}
  </Typography>
</Box>
```

#### 3.3.4 バックエンド実装（新規追加必要）

**api/index.py** に追加:
```python
@app.get("/api/menus", response_model=MenuListResponse)
async def get_menus(
    # 既存パラメータ...
    sort: Optional[str] = Query(None, description="ソート項目 (price, name, scraped_at)"),
    order: Optional[str] = Query("asc", description="ソート順 (asc, desc)"),
):
    # フィルタリング処理（既存）
    # ...
    
    # ソート処理（新規）
    if sort:
        reverse = (order == "desc")
        if sort == "price":
            filtered.sort(key=lambda x: x.price, reverse=reverse)
        elif sort == "name":
            filtered.sort(key=lambda x: x.name_ja, reverse=reverse)
        elif sort == "scraped_at":
            filtered.sort(key=lambda x: x.scraped_at, reverse=reverse)
    
    # ページネーション（既存）
    # ...
```

---

### 3.4 適用中フィルター表示

#### 3.4.1 仕様

| 項目 | 内容 |
|------|------|
| **配置** | 検索バーとメニューリストの間 |
| **表示形式** | Material-UI `Chip` |
| **機能** | 個別削除 + 一括クリア |
| **表示条件** | 1つ以上のフィルターが適用されている場合 |

#### 3.4.2 UI設計

**実装例**:
```tsx
{hasActiveFilters && (
  <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
    <Typography variant="body2" color="text.secondary">
      適用中のフィルター:
    </Typography>
    
    {filters.q && (
      <Chip
        label={`検索: ${filters.q}`}
        onDelete={() => removeFilter('q')}
        size="small"
      />
    )}
    
    {filters.park && (
      <Chip
        label={`パーク: ${filters.park === 'tdl' ? 'ランド' : 'シー'}`}
        onDelete={() => removeFilter('park')}
        size="small"
      />
    )}
    
    {filters.min_price > 0 && (
      <Chip
        label={`最低価格: ¥${filters.min_price}`}
        onDelete={() => removeFilter('min_price')}
        size="small"
      />
    )}
    
    {/* 他のフィルター... */}
    
    <Button
      size="small"
      onClick={clearAllFilters}
      startIcon={<ClearIcon />}
    >
      すべてクリア
    </Button>
  </Box>
)}
```

---

### 3.5 フィルターパネル

#### 3.5.1 レイアウト設計

**デスクトップ（≥900px）**:
- サイドバー形式（左側固定）
- 幅: 280px
- 折りたたみ可能（トグルボタン）
- スクロール可能

**モバイル（<900px）**:
- Material-UI `Drawer` (一時的表示)
- 幅: 80% または 320px (最大)
- フローティングアクションボタンで開閉
- スワイプで閉じる

#### 3.5.2 実装例

```tsx
const FilterPanel = ({ open, onClose, isMobile }: FilterPanelProps) => {
  const content = (
    <Box sx={{ p: 2, width: isMobile ? 320 : 280 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">フィルター</Typography>
        {isMobile && (
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      {/* レストランフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          レストラン
        </Typography>
        <RestaurantFilter />
      </Box>
      
      {/* 価格範囲フィルター */}
      <Box sx={{ mb: 3 }}>
        <PriceRangeFilter />
      </Box>
      
      {/* パークフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          パーク
        </Typography>
        <ParkFilter />
      </Box>
      
      {/* カテゴリフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          カテゴリ
        </Typography>
        <CategoryFilter />
      </Box>
      
      {/* タグフィルター */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          タグ
        </Typography>
        <TagFilter />
      </Box>
      
      {/* 販売状況フィルター */}
      <Box sx={{ mb: 3 }}>
        <AvailabilityFilter />
      </Box>
    </Box>
  );
  
  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
      >
        {content}
      </Drawer>
    );
  }
  
  return (
    <Box
      sx={{
        width: open ? 280 : 0,
        transition: 'width 0.3s',
        overflow: 'hidden',
        borderRight: open ? '1px solid #e0e0e0' : 'none',
      }}
    >
      {content}
    </Box>
  );
};
```

---

## 4. 実装計画

### 4.1 Phase 1: バックエンド拡張 + 検索機能（1日）

#### タスク

1. **バックエンドにソート機能追加** (2時間)
   - `api/index.py` の `/api/menus` エンドポイントを修正
   - `sort` パラメータ追加（price/name/scraped_at）
   - `order` パラメータ追加（asc/desc）
   - ソートロジック実装

2. **バックエンドテスト更新** (1時間)
   - `tests/test_menus.py` に新規テストケース追加
   - ソート機能のテスト（6ケース）
   ```python
   # 価格昇順
   # 価格降順
   # 名前昇順
   # 名前降順
   # 新着順昇順
   # 新着順降順
   ```

3. **検索バーUI実装** (2時間)
   - `MenuListPage.tsx` に `SearchBar` コンポーネント追加
   - Material-UI `TextField` 使用
   - デバウンス処理実装（lodash.debounce または useDebounce）
   - URLクエリパラメータ同期

4. **検索機能の動作確認** (1時間)
   - 手動テスト（ブラウザ）
   - 検索結果の正確性確認
   - デバウンス動作確認
   - URL更新確認

#### 成果物

- ✅ `api/index.py` - ソート機能追加
- ✅ `tests/test_menus.py` - ソート機能テスト追加
- ✅ `frontend/src/components/search/SearchBar.tsx` - 新規作成
- ✅ `frontend/src/pages/MenuListPage.tsx` - SearchBar統合

#### 完了条件

- バックエンドテスト全件合格（149 + 6 = 155テスト）
- 検索バーでテキスト入力 → 300ms後に結果更新
- URLクエリパラメータに `?q=カレー` が反映される
- ブラウザバックで検索状態が復元される

---

### 4.2 Phase 2: フィルターパネル実装（2日）

#### タスク（Day 1）

1. **フィルターパネルの基本構造作成** (2時間)
   - `FilterPanel.tsx` コンポーネント作成
   - デスクトップ: サイドバーレイアウト
   - モバイル: Drawer実装
   - 折りたたみ機能実装

2. **レストランフィルター実装** (2時間)
   - `RestaurantFilter.tsx` 作成
   - Material-UI `Autocomplete` 使用
   - `useRestaurants()` フック利用
   - URLクエリ同期

3. **価格範囲フィルター実装** (2時間)
   - `PriceRangeFilter.tsx` 作成
   - Material-UI `Slider` 使用
   - 最小値・最大値の動的取得（useStats）
   - リアルタイム更新

4. **パークフィルター実装** (1時間)
   - `ParkFilter.tsx` 作成
   - Material-UI `ToggleButtonGroup` 使用
   - ランド/シー/すべて選択

#### タスク（Day 2）

5. **カテゴリフィルター実装** (2時間)
   - `CategoryFilter.tsx` 作成
   - `useCategories()` フック利用
   - `Chip` 複数選択実装

6. **タグフィルター実装** (2時間)
   - `TagFilter.tsx` 作成
   - `useTags()` フック利用
   - カテゴリフィルターと同様の実装

7. **販売状況フィルター実装** (1時間)
   - `AvailabilityFilter.tsx` 作成
   - Material-UI `Switch` 使用

8. **フィルター統合とテスト** (1時間)
   - `MenuListPage.tsx` にフィルターパネル統合
   - 複合フィルター動作確認
   - レスポンシブデザイン確認

#### 成果物

- ✅ `frontend/src/components/filters/FilterPanel.tsx`
- ✅ `frontend/src/components/filters/RestaurantFilter.tsx`
- ✅ `frontend/src/components/filters/PriceRangeFilter.tsx`
- ✅ `frontend/src/components/filters/ParkFilter.tsx`
- ✅ `frontend/src/components/filters/CategoryFilter.tsx`
- ✅ `frontend/src/components/filters/TagFilter.tsx`
- ✅ `frontend/src/components/filters/AvailabilityFilter.tsx`

#### 完了条件

- デスクトップでサイドバー表示、折りたたみ可能
- モバイルでDrawer表示、スワイプで閉じる
- すべてのフィルターが正常動作
- 複合フィルター（検索 + パーク + 価格範囲）が正常動作
- URLクエリパラメータにすべてのフィルターが反映

---

### 4.3 Phase 3: ソート機能 + UX改善（1日）

#### タスク

1. **ソートコントロール実装** (2時間)
   - `SortControl.tsx` 作成
   - Material-UI `Select` + `IconButton` 使用
   - 昇順/降順切り替え実装
   - URLクエリ同期

2. **適用中フィルター表示実装** (2時間)
   - `AppliedFilters.tsx` 作成
   - `Chip` で現在のフィルター表示
   - 個別削除機能
   - すべてクリアボタン

3. **パフォーマンス最適化** (2時間)
   - `React.memo` でMenuCard最適化
   - `useMemo` でフィルター計算メモ化
   - デバウンス調整（検索、価格スライダー）

4. **統合テストと調整** (2時間)
   - 全機能の動作確認
   - バグ修正
   - UI微調整

#### 成果物

- ✅ `frontend/src/components/sort/SortControl.tsx`
- ✅ `frontend/src/components/filters/AppliedFilters.tsx`
- ✅ `frontend/src/components/menu/MenuCard.tsx` - React.memo化
- ✅ `frontend/src/pages/MenuListPage.tsx` - 最終統合

#### 完了条件

- ソート機能が正常動作（価格順、新着順、名前順）
- 適用中フィルターが正確に表示される
- フィルタークリアが正常動作
- パフォーマンス低下なし（704件でも快適）

---

### 4.4 Phase 4: E2Eテスト作成（1日）

#### タスク

1. **検索機能テスト** (2時間)
   - `menu-list-search.spec.ts` 作成
   - テキスト入力テスト
   - デバウンステスト
   - 結果フィルタリングテスト
   - URL同期テスト

2. **フィルター機能テスト** (3時間)
   - `menu-list-filters.spec.ts` 作成
   - レストランフィルターテスト
   - 価格範囲スライダーテスト
   - パークフィルターテスト
   - カテゴリ・タグフィルターテスト
   - 販売状況フィルターテスト
   - 複合フィルターテスト

3. **ソート機能テスト** (1時間)
   - `menu-list-sort.spec.ts` 作成
   - 価格順ソートテスト（昇順/降順）
   - 新着順ソートテスト
   - 名前順ソートテスト

4. **統合テスト実行** (2時間)
   - 全E2Eテスト実行
   - カバレッジ確認
   - バグ修正

#### 成果物

- ✅ `frontend/tests/e2e/menu-list-search.spec.ts` (5-7テスト)
- ✅ `frontend/tests/e2e/menu-list-filters.spec.ts` (10-15テスト)
- ✅ `frontend/tests/e2e/menu-list-sort.spec.ts` (6テスト)

#### 完了条件

- 新規E2Eテスト20-28件追加
- 全E2Eテスト合格（既存28 + 新規20-28 = 48-56テスト）
- テストカバレッジ90%以上

---

### 4.5 スケジュール

| Phase | 内容 | 所要時間 | 担当日 |
|-------|------|----------|--------|
| Phase 1 | バックエンド拡張 + 検索機能 | 1日 (6時間) | Day 1 |
| Phase 2 | フィルターパネル実装 | 2日 (12時間) | Day 2-3 |
| Phase 3 | ソート機能 + UX改善 | 1日 (8時間) | Day 4 |
| Phase 4 | E2Eテスト作成 | 1日 (8時間) | Day 5 |
| **合計** | **全機能実装完了** | **5日** | **1週間** |

---

## 5. 技術仕様

### 5.1 使用技術スタック

#### フロントエンド
- **React**: 18.3.1
- **TypeScript**: 5.x
- **Material-UI**: 5.x
- **React Router**: 6.x
- **React Query**: 4.x (TanStack Query)
- **Axios**: 1.x
- **Lodash**: 4.x (デバウンス用)

#### バックエンド
- **FastAPI**: 0.104.1
- **Python**: 3.9+
- **Pydantic**: 2.5.0

#### テスト
- **Playwright**: 1.57.0
- **pytest**: 7.x

### 5.2 ディレクトリ構造（新規追加分）

```
frontend/
├── src/
│   ├── components/
│   │   ├── search/
│   │   │   └── SearchBar.tsx            # 新規
│   │   ├── filters/
│   │   │   ├── FilterPanel.tsx          # 新規
│   │   │   ├── RestaurantFilter.tsx     # 新規
│   │   │   ├── PriceRangeFilter.tsx     # 新規
│   │   │   ├── ParkFilter.tsx           # 新規
│   │   │   ├── CategoryFilter.tsx       # 新規
│   │   │   ├── TagFilter.tsx            # 新規
│   │   │   ├── AvailabilityFilter.tsx   # 新規
│   │   │   └── AppliedFilters.tsx       # 新規
│   │   └── sort/
│   │       └── SortControl.tsx          # 新規
│   ├── hooks/
│   │   └── useDebounce.ts               # 新規
│   └── utils/
│       └── urlHelpers.ts                # 新規
├── tests/e2e/
│   ├── menu-list-search.spec.ts         # 新規
│   ├── menu-list-filters.spec.ts        # 新規
│   └── menu-list-sort.spec.ts           # 新規
```

### 5.3 型定義拡張

**frontend/src/types/menu.ts** に追加:
```typescript
export interface MenuFilters {
  q?: string;                    // 検索クエリ
  park?: 'tdl' | 'tds';          // パーク
  restaurant?: string;            // レストラン名
  area?: string;                  // エリア
  character?: string;             // キャラクター
  tags?: string[];                // タグ（OR条件）
  categories?: string[];          // カテゴリ（OR条件）
  min_price?: number;             // 最低価格
  max_price?: number;             // 最高価格
  only_available?: boolean;       // 販売中のみ
  sort?: 'price' | 'name' | 'scraped_at'; // ソート項目
  order?: 'asc' | 'desc';        // ソート順
  page?: number;                  // ページ番号
  limit?: number;                 // ページサイズ
}

export interface SortOption {
  value: 'price' | 'name' | 'scraped_at';
  label: string;
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'scraped_at', label: '新着順' },
  { value: 'price', label: '価格順' },
  { value: 'name', label: '名前順' },
];
```

---

## 6. パフォーマンス最適化

### 6.1 最適化戦略

#### 1. React.memo による再レンダリング防止

**対象コンポーネント**:
- `MenuCard` - メニューカード本体
- `FilterPanel` - フィルターパネル全体
- 各フィルターコンポーネント

**実装例**:
```typescript
export const MenuCard = React.memo<MenuCardProps>(({ menu, onClick }) => {
  // ... existing implementation
}, (prevProps, nextProps) => {
  return prevProps.menu.id === nextProps.menu.id;
});
```

#### 2. useMemo によるフィルター計算メモ化

```typescript
const filteredMenus = useMemo(() => {
  // フィルタリング処理
  return applyFilters(menus, filters);
}, [menus, filters]);
```

#### 3. デバウンス処理

**検索バー**: 300ms  
**価格スライダー**: 500ms

```typescript
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () => debounce((value: string) => {
    updateFilters({ q: value });
  }, 300),
  [updateFilters]
);
```

#### 4. React Query キャッシュ設定

```typescript
const { data, isLoading } = useMenus(filters, {
  staleTime: 5 * 60 * 1000,  // 5分間キャッシュ
  cacheTime: 10 * 60 * 1000, // 10分間メモリ保持
  keepPreviousData: true,     // ページ遷移時に前のデータを保持
});
```

### 6.2 パフォーマンス目標

| 指標 | 目標値 | 測定方法 |
|------|--------|----------|
| **初回ロード時間** | < 2秒 | Lighthouse Performance |
| **検索実行時間** | < 500ms | Chrome DevTools Network |
| **フィルター適用時間** | < 300ms | React DevTools Profiler |
| **ページ遷移時間** | < 200ms | E2Eテスト計測 |
| **バンドルサイズ** | < 500KB (gzip) | webpack-bundle-analyzer |

### 6.3 将来的な最適化（Phase 6以降）

- **仮想スクロール**: react-window 導入（大量データ表示時）
- **画像遅延読み込み**: Intersection Observer API 活用
- **Service Worker**: PWA化、オフライン対応
- **コード分割**: React.lazy + Suspense でルート単位の分割

---

## 7. テスト戦略

### 7.1 バックエンドテスト（pytest）

#### 新規追加テスト

**tests/test_menus.py**:
```python
class TestSortFeature:
    def test_sort_by_price_asc(self, client):
        """価格昇順ソートのテスト"""
        response = client.get("/api/menus?sort=price&order=asc&limit=5")
        assert response.status_code == 200
        data = response.json()
        prices = [item["price"] for item in data["data"]]
        assert prices == sorted(prices)
    
    def test_sort_by_price_desc(self, client):
        """価格降順ソートのテスト"""
        response = client.get("/api/menus?sort=price&order=desc&limit=5")
        assert response.status_code == 200
        data = response.json()
        prices = [item["price"] for item in data["data"]]
        assert prices == sorted(prices, reverse=True)
    
    def test_sort_by_name_asc(self, client):
        """名前昇順ソートのテスト"""
        response = client.get("/api/menus?sort=name&order=asc&limit=5")
        assert response.status_code == 200
        data = response.json()
        names = [item["name_ja"] for item in data["data"]]
        assert names == sorted(names)
    
    # ... 他のソートテスト
```

**テストカバレッジ目標**: 100%維持

### 7.2 E2Eテスト（Playwright）

#### 新規追加テスト

**menu-list-search.spec.ts** (7テスト):
```typescript
test.describe('検索機能', () => {
  test('検索バーが表示される', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[placeholder*="検索"]');
    await expect(searchInput).toBeVisible();
  });
  
  test('テキスト入力で検索結果が更新される', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="検索"]', 'カレー');
    await page.waitForTimeout(500); // デバウンス待ち
    const resultCount = await page.locator('[class*="MuiCard-root"]').count();
    expect(resultCount).toBeGreaterThan(0);
  });
  
  test('検索クエリがURLに反映される', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[placeholder*="検索"]', 'カレー');
    await page.waitForTimeout(500);
    expect(page.url()).toContain('q=%E3%82%AB%E3%83%AC%E3%83%BC');
  });
  
  // ... 他の検索テスト
});
```

**menu-list-filters.spec.ts** (15テスト):
```typescript
test.describe('フィルター機能', () => {
  test('フィルターパネルが表示される', async ({ page }) => {
    await page.goto('/');
    const filterPanel = page.locator('[aria-label*="フィルター"]');
    await expect(filterPanel).toBeVisible();
  });
  
  test('価格スライダーで範囲指定できる', async ({ page }) => {
    await page.goto('/');
    const slider = page.locator('[role="slider"]').first();
    await slider.fill('1000');
    await page.waitForTimeout(600); // デバウンス待ち
    expect(page.url()).toContain('min_price=1000');
  });
  
  test('パークフィルターで絞り込める', async ({ page }) => {
    await page.goto('/');
    await page.click('button[aria-label="ランド"]');
    await page.waitForTimeout(300);
    expect(page.url()).toContain('park=tdl');
    const menuCards = page.locator('[class*="MuiCard-root"]');
    const count = await menuCards.count();
    expect(count).toBeLessThanOrEqual(12); // 1ページ12件
  });
  
  // ... 他のフィルターテスト
});
```

**menu-list-sort.spec.ts** (6テスト):
```typescript
test.describe('ソート機能', () => {
  test('価格昇順でソートできる', async ({ page }) => {
    await page.goto('/');
    await page.selectOption('select[aria-label*="並び替え"]', 'price');
    await page.click('button[aria-label="昇順"]');
    await page.waitForTimeout(300);
    
    const prices = await page.locator('h5:has-text("¥")').allTextContents();
    const numericPrices = prices.map(p => parseInt(p.replace(/[^0-9]/g, '')));
    expect(numericPrices).toEqual([...numericPrices].sort((a, b) => a - b));
  });
  
  // ... 他のソートテスト
});
```

**テストカバレッジ目標**:
- 既存テスト: 28件（100%合格）
- 新規テスト: 28件（目標100%合格）
- 合計: 56件

---

## 8. アクセシビリティ対応

### 8.1 WCAG 2.1 AA 準拠

#### 実装項目

1. **キーボード操作**
   - すべてのフィルター・ボタンがキーボードで操作可能
   - フォーカス順序が論理的
   - フォーカス表示が明確（outline表示）

2. **ARIA属性**
   - `aria-label` でボタンの意味を明示
   - `aria-expanded` でパネルの開閉状態を通知
   - `role="search"` で検索バーを明示

3. **コントラスト比**
   - テキストと背景のコントラスト比 4.5:1 以上
   - アイコンボタンのコントラスト比 3:1 以上

4. **スクリーンリーダー対応**
   - 検索結果数の読み上げ
   - フィルター適用時の変更通知
   - ページ遷移時の通知

#### 実装例

```tsx
<TextField
  placeholder="メニューを検索"
  aria-label="メニュー検索"
  inputProps={{
    role: 'search',
    'aria-describedby': 'search-help-text',
  }}
/>

<Typography id="search-help-text" variant="caption" sx={{ display: 'none' }}>
  メニュー名または説明で検索できます
</Typography>
```

---

## 9. レスポンシブデザイン

### 9.1 ブレークポイント

| デバイス | 幅 | レイアウト |
|----------|-----|-----------|
| **モバイル** | < 600px | 1カラム、Drawer |
| **タブレット** | 600px - 899px | 2カラム、Drawer |
| **デスクトップ** | ≥ 900px | 3カラム、Sidebar |
| **ワイド** | ≥ 1200px | 4カラム、Sidebar |

### 9.2 レスポンシブ実装

```tsx
const theme = useTheme();
const isMobile = useMediaQuery(theme.breakpoints.down('md'));

return (
  <Box sx={{ display: 'flex' }}>
    {/* デスクトップ: サイドバー、モバイル: Drawer */}
    <FilterPanel open={filterOpen} onClose={() => setFilterOpen(false)} isMobile={isMobile} />
    
    {/* メインコンテンツ */}
    <Box sx={{ flexGrow: 1, p: { xs: 2, md: 3 } }}>
      {/* 検索バー */}
      <SearchBar />
      
      {/* モバイル: フローティングボタン */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="フィルター"
          onClick={() => setFilterOpen(true)}
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          <FilterListIcon />
        </Fab>
      )}
      
      {/* メニューグリッド */}
      <Grid container spacing={2}>
        {menus.map((menu) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={menu.id}>
            <MenuCard menu={menu} />
          </Grid>
        ))}
      </Grid>
    </Box>
  </Box>
);
```

---

## 10. エラーハンドリング

### 10.1 エラーシナリオと対応

| エラー | 原因 | UI表示 | 対応 |
|--------|------|--------|------|
| **API接続失敗** | ネットワークエラー | Alert (error) | リトライボタン表示 |
| **検索結果0件** | 該当データなし | "該当メニューが見つかりません" | フィルター緩和の提案 |
| **無効なクエリ** | URLパラメータ不正 | デフォルト値で表示 | エラーログ送信 |
| **タイムアウト** | レスポンス遅延 | Loading表示継続 | 10秒後にエラー表示 |

### 10.2 実装例

```tsx
if (isError) {
  return (
    <Alert severity="error" action={
      <Button color="inherit" size="small" onClick={refetch}>
        再試行
      </Button>
    }>
      メニューの読み込みに失敗しました。ネットワーク接続を確認してください。
    </Alert>
  );
}

if (menus.length === 0 && !isLoading) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="h6" gutterBottom>
        該当するメニューが見つかりません
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        検索条件を変更してお試しください
      </Typography>
      <Button variant="outlined" onClick={clearAllFilters}>
        フィルターをクリア
      </Button>
    </Box>
  );
}
```

---

## 11. セキュリティ考慮事項

### 11.1 対策実装

1. **XSS対策**
   - React の自動エスケープ機能を活用
   - dangerouslySetInnerHTML は使用しない
   - URLパラメータのサニタイズ

2. **入力バリデーション**
   - 価格範囲: 0 - 13000 の範囲チェック
   - ページ番号: 1 以上の整数のみ
   - 検索クエリ: 最大100文字

3. **レート制限**
   - API呼び出しをReact Queryでキャッシュ（5分間）
   - デバウンス処理で過剰なリクエスト防止

### 11.2 実装例

```typescript
const sanitizeFilters = (filters: MenuFilters): MenuFilters => {
  return {
    ...filters,
    q: filters.q?.slice(0, 100), // 最大100文字
    min_price: Math.max(0, filters.min_price || 0),
    max_price: Math.min(13000, filters.max_price || 13000),
    page: Math.max(1, filters.page || 1),
    limit: Math.min(100, Math.max(1, filters.limit || 12)),
  };
};
```

---

## 12. デプロイ手順

### 12.1 開発環境での確認

```bash
# バックエンド起動
cd /Users/kimurashoya/disneymenu
source venv/bin/activate
PYTHONPATH=. uvicorn api.index:app --reload --port 8000

# フロントエンド起動
cd frontend
npm run dev

# E2Eテスト実行
npm run test:e2e
```

### 12.2 ビルド確認

```bash
cd frontend
npm run build

# ビルドサイズ確認
du -sh dist/

# Lighthouse テスト
npx lighthouse http://localhost:4173 --view
```

### 12.3 Vercel デプロイ

```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

---

## 13. 今後の拡張計画

### 13.1 Phase 5: お気に入り機能（次フェーズ）

- LocalStorage でお気に入りリスト管理
- お気に入りボタン（ハートアイコン）
- お気に入り一覧ページ
- お気に入り数の統計表示

### 13.2 Phase 6: レストラン詳細ページ

- レストラン単位のメニュー一覧
- レストラン情報表示（エリア、営業時間、座席数）
- 地図表示（MapLocation活用）

### 13.3 Phase 7: 高度な検索機能

- 検索サジェスト（オートコンプリート）
- 検索履歴（LocalStorage）
- 検索結果のハイライト表示
- 曖昧検索（ひらがな→カタカナ変換）

### 13.4 Phase 8: ダークモード対応

- Material-UI テーマ切り替え
- LocalStorage でテーマ保存
- システム設定自動検出

---

## 14. 参考資料

### 14.1 公式ドキュメント

- [React公式](https://react.dev/)
- [Material-UI公式](https://mui.com/)
- [React Router公式](https://reactrouter.com/)
- [React Query公式](https://tanstack.com/query/latest)
- [FastAPI公式](https://fastapi.tiangolo.com/)
- [Playwright公式](https://playwright.dev/)

### 14.2 関連ドキュメント

- [DEVELOPMENT.md](../DEVELOPMENT.md) - 開発ガイド
- [TESTS.md](./TESTS.md) - テスト実行ガイド
- [E2E_TEST_REPORT.md](../E2E_TEST_REPORT.md) - E2Eテスト結果レポート
- [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) - 実装計画書

---

## 15. 変更履歴

| 日付 | バージョン | 変更内容 | 担当者 |
|------|------------|----------|--------|
| 2026-01-01 | 1.0.0 | 初版作成 | GitHub Copilot |

---

**END OF DOCUMENT**
