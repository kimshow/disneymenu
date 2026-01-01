# タグ整理実装仕様書

**作成日**: 2026年1月1日  
**バージョン**: v1.0.0  
**ステータス**: 実装中

---

## 1. 概要

### 1.1 目的

現在のタグシステムは以下の問題を抱えています：
- 「おすすめメニュー」タグがほぼ全メニューに付与されており無意味
- 価格帯タグ（～500円など）が`price`フィールドと重複
- サービスタイプタグが`restaurants.service_types`と重複
- タグ名の不整合（「ドリンク（ソフトドリンク）」と「ソフトドリンク」など）
- カテゴリが混在しており、ユーザーが目的のタグを見つけにくい

これらを解決し、**有用なタグのみをカテゴリ別に整理**します。

### 1.2 スコープ

#### 対象作業
- ✅ 無意味・冗長なタグの削除
- ✅ タグ名の正規化（統一）
- ✅ タグカテゴリの定義（6カテゴリ）
- ✅ バックエンドAPI拡張（`/api/tags/grouped`）
- ✅ フロントエンドUIの改善（カテゴリ別表示）
- ✅ E2Eテストの更新

#### 対象外
- ❌ 新規タグの追加（アレルギー対応、季節限定など） → Phase 2で実装
- ❌ 人気度タグ（販売データ収集後に実装）

---

## 2. タグカテゴリ設計

### 2.1 カテゴリ一覧

| カテゴリID | カテゴリ名 | 説明 | 例 |
|-----------|----------|------|-----|
| `food_type` | 料理の種類 | 料理・食べ物の種類 | カレー、ピザ、ハンバーガー |
| `drink_type` | ドリンク種類 | ドリンクの種類 | ソフトドリンク、ペットボトル |
| `character` | キャラクター | キャラクターモチーフ | ミッキーマウス、ドナルドダック |
| `area` | エリア | パーク内のエリア | ワールドバザール、トゥモローランド |
| `restaurant` | レストラン | レストラン名 | スウィートハート・カフェ |
| `features` | 特徴 | その他の特徴 | ワンハンドメニュー、ホット、アイス |

### 2.2 各カテゴリの詳細

#### 2.2.1 料理の種類 (food_type)

**目的**: 料理のジャンルで絞り込み

**タグリスト**:
```python
FOOD_TYPE_TAGS = [
    'カレー',
    'ピザ',
    'ハンバーガー',
    'ホットドッグ',
    'サンドウィッチ・パン',
    '中華',
    'ワンハンドメニュー',
    '肉まん',
    '中華まん',
    '肉巻',
    'カルツォーネ',
    'ごはん',
]
```

#### 2.2.2 ドリンク種類 (drink_type)

**目的**: ドリンクの種類で絞り込み

**タグリスト**:
```python
DRINK_TYPE_TAGS = [
    'ソフトドリンク',
    'ペットボトル',
    'フリー・リフィル',
    'ホット',
    'アイス',
]
```

**注意**: 「ホット」「アイス」は料理にも適用される場合があるため、`features`にも含める

#### 2.2.3 キャラクター (character)

**目的**: キャラクターモチーフのメニューを検索

**タグリスト**:
```python
CHARACTER_TAGS = [
    'キャラクターモチーフのメニュー',
    'ミッキーマウス',
    'ミッキーモチーフのメニュー',
    'ドナルドダック',
    'プルート',
]
```

**将来の拡張**: ダッフィー、シェリーメイ、プーさん、トイ・ストーリーなど

#### 2.2.4 エリア (area)

**目的**: パーク内のエリアで絞り込み

**データソース**: `data/menus.json`の`restaurants.area`から抽出

**タグリスト例**:
```python
AREA_TAGS = [
    # 東京ディズニーランド
    'ワールドバザール',
    'トゥモローランド',
    'トゥーンタウン',
    'ファンタジーランド',
    'ウエスタンランド',
    'クリッターカントリー',
    'アドベンチャーランド',
    
    # 東京ディズニーシー
    'メディテレーニアンハーバー',
    'アメリカンウォーターフロント',
    'ポートディスカバリー',
    'ロストリバーデルタ',
    'アラビアンコースト',
    'マーメイドラグーン',
    'ミステリアスアイランド',
]
```

#### 2.2.5 レストラン (restaurant)

**目的**: レストラン名で絞り込み

**データソース**: `data/menus.json`の`restaurants.name`から抽出（約102箇所）

**タグリスト例**:
```python
RESTAURANT_TAGS = [
    'スウィートハート・カフェ',
    'マンマ・ビスコッティーズ・ベーカリー',
    'れすとらん北齋',
    'センターストリート・コーヒーハウス',
    # ... 他98箇所
]
```

**注意**: 
- レストラン名タグは`restaurants`フィールドと重複するが、タグとしても維持
- 理由: タグフィルターで複数レストランを同時選択可能（OR条件）

#### 2.2.6 特徴 (features)

**目的**: その他の有用な特徴で絞り込み

**タグリスト**:
```python
FEATURE_TAGS = [
    'ワンハンドメニュー',  # 食べ歩き向け
    'ホット',              # 温かい料理・ドリンク
    'アイス',              # 冷たい料理・ドリンク
    'スナック',            # 軽食
    'スウィーツ',          # デザート
]
```

---

## 3. 削除対象タグ

### 3.1 完全削除するタグ

#### 3.1.1 無意味なタグ

```python
MEANINGLESS_TAGS = [
    'おすすめメニュー',  # ほぼ全メニューに付与されており無意味
]
```

#### 3.1.2 冗長なタグ（他のフィールドと重複）

```python
# 価格帯タグ（priceフィールドで検索可能）
PRICE_TAGS = [
    '～500円',
    '500～1000円',
    '1000～2000円',
    '2000円～',
]

# サービスタイプタグ（restaurants.service_typesに移動すべき）
SERVICE_TYPE_TAGS = [
    'カウンターサービス',
    'テーブルサービス',
    'ブッフェサービス',
    'ワゴンサービス',
    'バフェテリアサービス',
]
```

**削除理由**:
- 価格帯: APIの`min_price`/`max_price`パラメータで検索可能
- サービスタイプ: レストラン情報として別フィールドで管理すべき

#### 3.1.3 カテゴリフィールドと重複するタグ

```python
# categoriesフィールドと重複
CATEGORY_DUPLICATE_TAGS = [
    'メインディッシュ',
    'サイド',
    # 'スナック',    # featuresカテゴリに残す
    # 'スウィーツ',  # featuresカテゴリに残す
]
```

---

## 4. タグ正規化ルール

### 4.1 正規化マップ

```python
TAG_NORMALIZATION = {
    # 括弧付きタグを統一
    'ドリンク（ソフトドリンク）': 'ソフトドリンク',
    'ひんやり（アイス）': 'アイス',
    'あったかい（ホット）': 'ホット',
    
    # 表記ゆれの統一
    'ミッキーモチーフのメニュー': 'ミッキーマウス',
    
    # その他の正規化
    # ... 必要に応じて追加
}
```

### 4.2 正規化ルール

1. **括弧内の情報を削除**: `ドリンク（ソフトドリンク）` → `ソフトドリンク`
2. **冗長な接尾語を削除**: `ミッキーモチーフのメニュー` → `ミッキーマウス`（キャラクター名で統一）
3. **重複タグの削除**: 正規化後に同じタグが複数ある場合は1つに統合

---

## 5. 実装手順

### 5.1 Phase 1: バックエンド実装（2日）

#### Day 1: データクリーニング

**タスク1: タグクリーニングスクリプト作成**

```python
# scripts/clean_tags.py

import json
import shutil
from datetime import datetime
from pathlib import Path

# 削除対象タグ
REMOVE_TAGS = [
    'おすすめメニュー',
    '～500円', '500～1000円', '1000～2000円', '2000円～',
    'カウンターサービス', 'テーブルサービス', 'ブッフェサービス',
    'ワゴンサービス', 'バフェテリアサービス',
    'メインディッシュ', 'サイド',
]

# 正規化マップ
TAG_NORMALIZATION = {
    'ドリンク（ソフトドリンク）': 'ソフトドリンク',
    'ひんやり（アイス）': 'アイス',
    'あったかい（ホット）': 'ホット',
    'ミッキーモチーフのメニュー': 'ミッキーマウス',
}

def clean_and_normalize_tags():
    """タグのクリーニングと正規化を実行"""
    data_path = Path('data/menus.json')
    
    # バックアップ作成
    backup_path = Path(f'data/menus_backup_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json')
    shutil.copy(data_path, backup_path)
    print(f"✅ バックアップ作成: {backup_path}")
    
    # データ読み込み
    with open(data_path, 'r', encoding='utf-8') as f:
        menus = json.load(f)
    
    total_menus = len(menus)
    removed_count = 0
    normalized_count = 0
    
    # 各メニューのタグをクリーニング
    for menu in menus:
        original_tags = menu.get('tags', [])
        
        # 1. 削除対象タグを除外
        cleaned_tags = [tag for tag in original_tags if tag not in REMOVE_TAGS]
        
        # 2. 正規化
        normalized_tags = [TAG_NORMALIZATION.get(tag, tag) for tag in cleaned_tags]
        
        # 3. 重複削除
        unique_tags = list(dict.fromkeys(normalized_tags))  # 順序を保持しながら重複削除
        
        # 統計
        removed_count += len(original_tags) - len(unique_tags)
        if set(original_tags) != set(unique_tags):
            normalized_count += 1
        
        menu['tags'] = unique_tags
    
    # データ保存
    with open(data_path, 'w', encoding='utf-8') as f:
        json.dump(menus, f, ensure_ascii=False, indent=2)
    
    print(f"✅ クリーニング完了")
    print(f"   - 処理メニュー数: {total_menus:,} 件")
    print(f"   - 変更されたメニュー数: {normalized_count:,} 件")
    print(f"   - 削除されたタグ数: {removed_count:,} 個")
    
    # クリーニング後の統計
    all_tags = []
    for menu in menus:
        all_tags.extend(menu.get('tags', []))
    
    unique_after = len(set(all_tags))
    print(f"   - クリーニング後のユニークタグ数: {unique_after} 個")

if __name__ == '__main__':
    clean_and_normalize_tags()
```

**実行**:
```bash
cd /Users/kimurashoya/disneymenu
python scripts/clean_tags.py
```

#### Day 2: タグカテゴリ定義とAPI実装

**タスク2: タグカテゴリ定義**

```python
# api/constants.py (新規作成)

from typing import Dict, List

# タグカテゴリ定義
TAG_CATEGORIES: Dict[str, List[str]] = {
    'food_type': [
        'カレー',
        'ピザ',
        'ハンバーガー',
        'ホットドッグ',
        'サンドウィッチ・パン',
        '中華',
        'ワンハンドメニュー',
        '肉まん',
        '中華まん',
        '肉巻',
        'カルツォーネ',
        'ごはん',
    ],
    'drink_type': [
        'ソフトドリンク',
        'ペットボトル',
        'フリー・リフィル',
        'ホット',
        'アイス',
    ],
    'character': [
        'キャラクターモチーフのメニュー',
        'ミッキーマウス',
        'ドナルドダック',
        'プルート',
    ],
    'features': [
        'ワンハンドメニュー',
        'ホット',
        'アイス',
        'スナック',
        'スウィーツ',
    ],
}

# カテゴリ名（日本語）
CATEGORY_LABELS: Dict[str, str] = {
    'food_type': '料理の種類',
    'drink_type': 'ドリンク種類',
    'character': 'キャラクター',
    'area': 'エリア',
    'restaurant': 'レストラン',
    'features': '特徴',
}
```

**タスク3: グループ化タグAPI実装**

```python
# api/index.py に追加

from api.constants import TAG_CATEGORIES, CATEGORY_LABELS

@app.get("/api/tags/grouped")
async def get_grouped_tags() -> Dict[str, Any]:
    """
    カテゴリ別にグループ化されたタグを返す
    
    Returns:
        {
            "food_type": {
                "label": "料理の種類",
                "tags": ["カレー", "ピザ", ...]
            },
            "drink_type": {
                "label": "ドリンク種類",
                "tags": ["ソフトドリンク", ...]
            },
            ...
        }
    """
    # メニューデータから実際に使用されているタグを抽出
    all_tags_by_category = {
        category: set() for category in TAG_CATEGORIES.keys()
    }
    all_tags_by_category['area'] = set()
    all_tags_by_category['restaurant'] = set()
    
    for menu in MENUS:
        tags = menu.get('tags', [])
        
        # 各カテゴリに分類
        for tag in tags:
            categorized = False
            
            # 定義済みカテゴリに分類
            for category, category_tags in TAG_CATEGORIES.items():
                if tag in category_tags:
                    all_tags_by_category[category].add(tag)
                    categorized = True
                    break
            
            # エリアタグの判定
            if not categorized:
                for restaurant in menu.get('restaurants', []):
                    if tag == restaurant.get('area'):
                        all_tags_by_category['area'].add(tag)
                        categorized = True
                        break
            
            # レストランタグの判定
            if not categorized:
                for restaurant in menu.get('restaurants', []):
                    if tag == restaurant.get('name'):
                        all_tags_by_category['restaurant'].add(tag)
                        categorized = True
                        break
    
    # レスポンス構築
    result = {}
    for category, tags in all_tags_by_category.items():
        if tags:  # タグが存在する場合のみ含める
            result[category] = {
                'label': CATEGORY_LABELS.get(category, category),
                'tags': sorted(list(tags))  # アルファベット順にソート
            }
    
    return result
```

**テスト追加**:

```python
# tests/test_index.py に追加

def test_get_grouped_tags(client):
    """グループ化されたタグの取得テスト"""
    response = client.get("/api/tags/grouped")
    assert response.status_code == 200
    data = response.json()
    
    # カテゴリが存在することを確認
    assert 'food_type' in data
    assert 'drink_type' in data
    assert 'character' in data
    assert 'area' in data
    assert 'restaurant' in data
    assert 'features' in data
    
    # 各カテゴリの構造を確認
    for category, content in data.items():
        assert 'label' in content
        assert 'tags' in content
        assert isinstance(content['tags'], list)
        assert len(content['tags']) > 0
```

---

### 5.2 Phase 2: フロントエンド実装（2日）

#### Day 3: タグフィルターUI改善

**タスク4: グループ化タグフィルターコンポーネント作成**

```tsx
// frontend/src/components/filters/TagFilterGrouped.tsx (新規作成)

import React, { memo } from 'react';
import {
  Box,
  Typography,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useSearchParams } from 'react-router-dom';

interface TagGroup {
  label: string;
  tags: string[];
}

interface TagFilterGroupedProps {
  groupedTags: Record<string, TagGroup>;
}

export const TagFilterGrouped = memo<TagFilterGroupedProps>(({ groupedTags }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 現在選択されているタグを取得
  const selectedTags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
  
  // タグの選択/解除
  const toggleTag = (tag: string) => {
    const params = new URLSearchParams(searchParams);
    const currentTags = params.get('tags')?.split(',').filter(Boolean) || [];
    
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    
    if (newTags.length > 0) {
      params.set('tags', newTags.join(','));
    } else {
      params.delete('tags');
    }
    
    params.delete('page'); // ページ番号をリセット
    setSearchParams(params);
  };
  
  return (
    <Box>
      {Object.entries(groupedTags).map(([category, { label, tags }]) => (
        <Accordion key={category} defaultExpanded={category === 'food_type'}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">{label}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onClick={() => toggleTag(tag)}
                  color={selectedTags.includes(tag) ? 'primary' : 'default'}
                  variant={selectedTags.includes(tag) ? 'filled' : 'outlined'}
                  size="small"
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
});

TagFilterGrouped.displayName = 'TagFilterGrouped';
```

**タスク5: FilterPanel更新**

```tsx
// frontend/src/components/filters/FilterPanel.tsx を更新

import { TagFilterGrouped } from './TagFilterGrouped';

// useGroupedTagsフック追加
const useGroupedTags = () => {
  return useQuery({
    queryKey: ['groupedTags'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/tags/grouped');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10分間キャッシュ
  });
};

export const FilterPanel = memo<FilterPanelProps>(({ open, onClose, isMobile }) => {
  const { data: groupedTags, isLoading: isLoadingTags } = useGroupedTags();
  
  const content = (
    <Box sx={{ p: 2, width: isMobile ? 320 : 280 }}>
      {/* ... 既存のフィルター ... */}
      
      {/* タグフィルター（グループ化） */}
      <Box sx={{ mb: 3 }}>
        {isLoadingTags ? (
          <Typography variant="body2">読み込み中...</Typography>
        ) : groupedTags ? (
          <TagFilterGrouped groupedTags={groupedTags} />
        ) : null}
      </Box>
    </Box>
  );
  
  // ... 既存のコード
});
```

#### Day 4: AppliedFilters更新

**タスク6: AppliedFiltersでカテゴリ名表示**

```tsx
// frontend/src/components/filters/AppliedFilters.tsx を更新

// タグのカテゴリを取得するヘルパー関数
const getTagCategory = (tag: string, groupedTags: Record<string, TagGroup>): string | null => {
  for (const [category, { tags }] of Object.entries(groupedTags)) {
    if (tags.includes(tag)) {
      return groupedTags[category].label;
    }
  }
  return null;
};

// タグChip表示時にカテゴリ名を追加
{filters.tags.map((tag) => {
  const category = getTagCategory(tag, groupedTags);
  return (
    <Chip
      key={tag}
      label={category ? `${category}: ${tag}` : tag}
      onDelete={() => removeFilter('tags', tag)}
      size="small"
    />
  );
})}
```

---

### 5.3 Phase 3: テスト更新（1日）

#### Day 5: E2Eテスト更新

**タスク7: menu-list-filters.spec.ts更新**

```typescript
// frontend/tests/e2e/menu-list-filters.spec.ts

test('カテゴリ別タグフィルターで絞り込める', async ({ page }) => {
  await page.goto('http://localhost:5175/');
  await page.waitForLoadState('networkidle');
  
  // 料理の種類カテゴリを展開
  const foodTypeAccordion = page.locator('div:has-text("料理の種類")').first();
  await foodTypeAccordion.click();
  await page.waitForTimeout(300);
  
  // 「カレー」タグを選択
  const curryChip = page.locator('span:has-text("カレー")').first();
  await curryChip.click();
  await page.waitForTimeout(500);
  
  // URLに反映されることを確認
  const url = page.url();
  expect(url).toContain('tags=');
  expect(url).toContain('カレー');
  
  // メニューカードが表示されることを確認
  const menuCards = page.locator('[data-testid="menu-card"]');
  const count = await menuCards.count();
  expect(count).toBeGreaterThan(0);
});

test('エリアタグフィルターで絞り込める', async ({ page }) => {
  await page.goto('http://localhost:5175/');
  await page.waitForLoadState('networkidle');
  
  // エリアカテゴリを展開
  const areaAccordion = page.locator('div:has-text("エリア")').first();
  await areaAccordion.click();
  await page.waitForTimeout(300);
  
  // 「ワールドバザール」タグを選択
  const bazaarChip = page.locator('span:has-text("ワールドバザール")').first();
  await bazaarChip.click();
  await page.waitForTimeout(500);
  
  const url = page.url();
  expect(url).toContain('tags=');
  expect(url).toContain('ワールドバザール');
});
```

---

## 6. データマイグレーション

### 6.1 バックアップ戦略

```bash
# 実行前に必ずバックアップ
cp data/menus.json data/menus_backup_$(date +%Y%m%d_%H%M%S).json
```

### 6.2 ロールバック手順

```bash
# 問題が発生した場合
cp data/menus_backup_YYYYMMDD_HHMMSS.json data/menus.json
```

---

## 7. 検証項目

### 7.1 データ検証

- [ ] クリーニング後のユニークタグ数が30-50個の範囲内
- [ ] 「おすすめメニュー」タグが完全に削除されている
- [ ] 価格帯タグが完全に削除されている
- [ ] タグ名の不整合が解消されている
- [ ] すべてのメニューに`tags`配列が存在する

### 7.2 API検証

- [ ] `/api/tags/grouped`が正しいJSON構造を返す
- [ ] すべてのカテゴリに`label`と`tags`が含まれる
- [ ] タグが重複していない
- [ ] 空のカテゴリが存在しない

### 7.3 UI検証

- [ ] タグフィルターがカテゴリ別に表示される
- [ ] Accordionで展開/折りたたみができる
- [ ] タグ選択でURLパラメータが更新される
- [ ] 適用中フィルターにカテゴリ名が表示される
- [ ] モバイルでも正常に動作する

### 7.4 E2Eテスト

- [ ] 既存のフィルターテストがすべて合格
- [ ] 新規カテゴリ別タグフィルターテストが合格
- [ ] エリアタグフィルターテストが合格
- [ ] レストランタグフィルターテストが合格

---

## 8. パフォーマンス考慮

### 8.1 キャッシュ戦略

```tsx
// グループ化タグAPIは頻繁に変更されないため、長めにキャッシュ
const { data: groupedTags } = useQuery({
  queryKey: ['groupedTags'],
  queryFn: fetchGroupedTags,
  staleTime: 10 * 60 * 1000,  // 10分間キャッシュ
  cacheTime: 30 * 60 * 1000,  // 30分間メモリ保持
});
```

### 8.2 レンダリング最適化

```tsx
// TagFilterGroupedをReact.memoで最適化
export const TagFilterGrouped = memo<TagFilterGroupedProps>(({ groupedTags }) => {
  // ...
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.groupedTags) === JSON.stringify(nextProps.groupedTags);
});
```

---

## 9. スケジュール

| Day | タスク | 所要時間 |
|-----|--------|----------|
| Day 1 | スクリプト作成 + データクリーニング実行 | 4時間 |
| Day 2 | タグカテゴリ定義 + API実装 + テスト | 6時間 |
| Day 3 | TagFilterGrouped作成 + FilterPanel更新 | 6時間 |
| Day 4 | AppliedFilters更新 + 統合テスト | 4時間 |
| Day 5 | E2Eテスト更新 + 最終検証 | 4時間 |
| **合計** | **5日** | **24時間** |

---

## 10. リスク管理

### リスク1: データ破損
**対策**: スクリプト実行前に自動バックアップ作成

### リスク2: タグ削除しすぎ
**対策**: 削除前に出現頻度を分析、慎重に判断

### リスク3: フロントエンドとの互換性
**対策**: 段階的リリース（バックエンド→フロントエンド）

---

## 11. 成功指標

### Before（現在）
- タグ数: 100+ 個（混在）
- 有用なタグ: ~30%
- UI: フラット表示、検索困難

### After（改善後）
- タグ数: 30-50個（厳選）
- 有用なタグ: 100%
- UI: カテゴリ別表示、直感的

---

**END OF DOCUMENT**
