# カテゴリ整理仕様書

## 現状の問題点

### 1. カテゴリフィールドが未使用
- 全704件のメニューが `category: "N/A"` のまま
- メニューの種類（料理、ドリンク、スイーツなど）が分類されていない
- フィルタリングや検索が非効率

### 2. 冗長・重複タグの残存
以下のタグが完全に冗長：
- `ドリンク（アルコールドリンク）`: 121件（`アルコールドリンク`と重複）
- 価格帯タグ: `2000～4000円`など（17件、priceフィールドで検索可能）

### 3. タグとカテゴリの役割が不明確
- タグ: 料理名、ドリンク種類、特徴、エリア、レストラン名が混在
- カテゴリ: 未使用
- 本来の役割:
  - **カテゴリ**: メニューの大分類（料理、ドリンク、スイーツ、グッズなど）
  - **タグ**: 詳細な特徴やフィルタリング用の属性

## 整理計画

### Phase 1: 冗長タグの削除（即時実行）

#### 1.1 削除対象タグ
```python
REMOVE_TAGS_PHASE2 = [
    # アルコールドリンク重複
    'ドリンク（アルコールドリンク）',  # 121件 → 'アルコールドリンク'で代替可能
    
    # 価格帯タグ（priceフィールドで検索可能）
    '2000～4000円',  # 17件
    '～500円',       # 残存している場合
    '500～1000円',   # 残存している場合
    '1000～2000円',  # 残存している場合
    '4000円～',      # 残存している場合
]
```

**影響**: 約130-150件のタグを削除（メニュー数は変わらない）

#### 1.2 実装
- `scripts/clean_tags.py`を拡張してPhase 2として実行
- バックアップ自動作成
- ドライランモード対応

### Phase 2: カテゴリの自動割り当て（推奨）

#### 2.1 カテゴリ定義
以下の7カテゴリを定義：

```python
MENU_CATEGORIES = {
    'food': {
        'label': '料理',
        'description': '食事メニュー（カレー、ピザ、パスタ、ハンバーガーなど）',
        'tags': ['カレー', 'ピザ', 'ハンバーガー', 'パスタ', 'ラーメン', 'うどん', 
                 'そば', 'チャーハン', 'サンドイッチ', 'スープ', 'サラダ', 'ポップコーン']
    },
    'drink': {
        'label': 'ドリンク',
        'description': '飲み物全般（ソフトドリンク、アルコール含む）',
        'tags': ['ソフトドリンク', 'アルコールドリンク', 'ビール', 'カクテル', 
                 'ウィスキー', 'ペットボトル', 'フリー・リフィル']
    },
    'sweets': {
        'label': 'スイーツ',
        'description': 'デザート・お菓子類',
        'tags': ['スウィーツ', 'アイス', 'スナック']
    },
    'set_menu': {
        'label': 'セットメニュー',
        'description': 'コース料理やセット商品',
        'tags': ['コース料理', 'セット']
    },
    'souvenir_menu': {
        'label': 'スーベニア付きメニュー',
        'description': 'お土産容器付きのメニュー',
        'tags': ['スーベニア付きメニュー']
    },
    'character_menu': {
        'label': 'キャラクターメニュー',
        'description': 'キャラクターモチーフの特別メニュー',
        'tags': ['キャラクターモチーフのメニュー', 'ミッキーマウス', 'ミニーマウス']
    },
    'other': {
        'label': 'その他',
        'description': '上記に該当しないメニュー',
        'tags': []
    }
}
```

#### 2.2 カテゴリ割り当てロジック
1. **タグベース判定**: メニューのタグを上記定義と照合
2. **優先順位**: character_menu > souvenir_menu > sweets > food > drink > set_menu > other
3. **複数該当時の処理**:
   - キャラクター・スーベニアタグがあれば最優先
   - 料理とドリンクが両方ある場合 → 'set_menu'
   - どれにも該当しない場合 → 'other'

#### 2.3 実装
- `scripts/assign_categories.py`を新規作成
- バックアップ自動作成
- ドライランモード対応
- カテゴリ割り当て統計を出力

### Phase 3: API・UI対応

#### 3.1 バックエンドAPI拡張
`/api/menus`エンドポイントに`category`フィルターを追加：
```python
@app.get("/api/menus", tags=["Menus"])
async def get_menus(
    category: Optional[str] = None,  # 新規追加
    q: Optional[str] = None,
    tags: Optional[str] = None,
    # ... 既存パラメータ
):
    # カテゴリフィルタリングロジック追加
    if category:
        filtered_menus = [m for m in filtered_menus if m.get('category') == category]
```

#### 3.2 `/api/categories`エンドポイント追加
カテゴリ一覧とメニュー数を返すAPI：
```python
@app.get("/api/categories", tags=["Categories"])
async def get_categories() -> Dict[str, Any]:
    """全カテゴリとそれぞれのメニュー数を返す"""
    menus = loader.load_menus()
    category_counts = Counter(menu.get('category', 'other') for menu in menus)
    
    return {
        'categories': [
            {
                'key': key,
                'label': MENU_CATEGORIES[key]['label'],
                'count': category_counts.get(key, 0)
            }
            for key in MENU_CATEGORIES.keys()
        ],
        'total': len(menus)
    }
```

#### 3.3 フロントエンドUI
`FilterPanel`にカテゴリフィルターを追加：
```tsx
// CategoryFilter.tsx（新規作成）
export const CategoryFilter = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') || '';
  
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:8000/api/categories');
      return response.data.categories;
    },
    staleTime: 10 * 60 * 1000,
  });
  
  return (
    <FormControl fullWidth>
      <InputLabel>カテゴリ</InputLabel>
      <Select
        value={selectedCategory}
        onChange={(e) => {
          const params = new URLSearchParams(searchParams);
          if (e.target.value) {
            params.set('category', e.target.value);
          } else {
            params.delete('category');
          }
          params.delete('page');
          setSearchParams(params);
        }}
      >
        <MenuItem value="">すべて</MenuItem>
        {categories?.map((cat) => (
          <MenuItem key={cat.key} value={cat.key}>
            {cat.label} ({cat.count})
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
```

## 実装スケジュール

### 即時実行可能（30分）
- [x] Phase 1: 冗長タグ削除
  - `scripts/clean_tags.py`拡張
  - ドライラン → 確認 → 本実行

### 推奨実装（2-3時間）
- [ ] Phase 2: カテゴリ自動割り当て
  - `scripts/assign_categories.py`作成
  - カテゴリ定義を`api/constants.py`に追加
  - ドライラン → 確認 → 本実行

- [ ] Phase 3: API・UI対応
  - バックエンドAPI拡張（categoryフィルター、/api/categoriesエンドポイント）
  - バックエンドテスト追加
  - CategoryFilter.tsx作成
  - FilterPanel.tsx更新
  - E2Eテスト追加

## 検証項目

### Phase 1完了後
- [ ] `ドリンク（アルコールドリンク）`タグが全件削除されている
- [ ] 価格帯タグ（`2000～4000円`など）が全件削除されている
- [ ] `アルコールドリンク`タグは維持されている（124件）
- [ ] 削除されたタグが他のタグに置き換わっていない
- [ ] バックアップファイルが作成されている

### Phase 2完了後
- [ ] 全メニューに適切なカテゴリが割り当てられている
- [ ] `category: "N/A"`のメニューが0件
- [ ] カテゴリ別メニュー数が妥当（drinkが最多、character_menuが少数など）
- [ ] 複数カテゴリに該当するメニューが適切に処理されている
- [ ] バックアップファイルが作成されている

### Phase 3完了後
- [ ] `/api/menus?category=drink`でドリンクのみ取得できる
- [ ] `/api/categories`がカテゴリ一覧とメニュー数を返す
- [ ] フロントエンドでカテゴリフィルターが表示される
- [ ] カテゴリ選択でフィルタリングが動作する
- [ ] URLパラメータが正しく更新される
- [ ] 適用中フィルターに表示される
- [ ] バックエンドテストが全合格
- [ ] E2Eテストが全合格

## リスク管理

### データ整合性リスク
- **リスク**: カテゴリ自動割り当てのロジックミスでメニューが誤分類される
- **対策**: ドライランモードで事前確認、バックアップ自動作成、統計情報の目視確認

### パフォーマンスリスク
- **リスク**: カテゴリフィルターの追加でAPI応答速度が低下する
- **対策**: メモリキャッシュの活用、インデックス検討（将来的にDB化する場合）

### UI/UX リスク
- **リスク**: フィルター項目が増えすぎてUIが複雑になる
- **対策**: カテゴリフィルターを最上部に配置、デフォルトは「すべて」

## 期待される効果

### ユーザー体験の向上
- カテゴリで大まかに絞り込んでから詳細フィルター（タグ、エリアなど）を適用できる
- 「ドリンクだけ見たい」「料理だけ見たい」というニーズに即応
- 検索結果が整理され、目的のメニューを見つけやすくなる

### データ品質の向上
- メニューが適切に分類され、データの意味が明確になる
- 冗長タグが削除され、タグシステムが整理される
- 将来的なデータ分析・統計処理が容易になる

### 開発効率の向上
- カテゴリベースのAPIが実装され、新機能追加が容易になる
- タグとカテゴリの役割が明確になり、データ設計が改善される
