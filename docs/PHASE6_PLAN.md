# Phase 6: コンテンツ充実化 - 実装計画書

**想定期間**: 2週間（実働14日）  
**開始予定**: Phase 5完了後  
**担当**: フロントエンド  
**目的**: ユーザーエンゲージメント向上のためのコンテンツ機能追加

---

## 📌 エグゼクティブサマリー

### 目標
- 人気メニュー機能でユーザーの興味を喚起
- メニュー詳細ページの情報量を増やし滞在時間を延長
- レストラン詳細ページで訪問計画をサポート

### 主要機能（優先度順）

1. **人気メニューサジェスト** 🔥（3日間）
   - 手動選定による10件の人気メニューをカルーセル表示
   - 初回訪問ガイドモーダル

2. **メニュー詳細ページ拡張** 🔥（5日間）
   - 栄養成分情報の表示
   - 関連メニューサジェスト
   - SNSシェアボタン

3. **レストラン詳細ページ** 🟡（4日間）
   - 営業時間、座席数、特徴の表示
   - レストランごとのメニュー一覧
   - アクセス情報

4. **テスト・デバッグ** 🟢（2日間）
   - E2Eテスト追加（8件）
   - パフォーマンステスト

---

## 🎯 現状分析

### ✅ Phase 5完了時点での実装状況

#### 検索・フィルター機能
- ✅ オートコンプリート機能（Fuse.js）
- ✅ 検索履歴機能（localStorage）
- ✅ 検索結果ハイライト
- ✅ フィルターUI改善（MUIトランジション）

#### データ構造
- ✅ MenuItem型（14フィールド）
- ⚠️ 栄養成分情報なし → Phase 6で追加
- ⚠️ レストラン詳細情報なし → Phase 6で追加

#### コンポーネント
- ✅ MenuDetail.tsx（基本実装済み）
- ❌ RestaurantDetail.tsx → Phase 6で新規作成
- ❌ PopularMenusCarousel.tsx → Phase 6で新規作成

---

## 🛠️ 技術設計

### 新規ライブラリ

#### 必須ライブラリ
```json
{
  "react-slick": "^0.30.2",
  "@types/react-slick": "^0.23.13",
  "slick-carousel": "^1.8.1"
}
```

#### 軽量な代替案検討
- react-slick: 53.3KB（gzip）
- Swiper: 145KB（gzip）→ 不採用
- embla-carousel-react: 35KB（gzip）→ 検討中

**判断**: react-slickを採用（実績豊富、MUIとの相性良好）

### データ拡張

#### MenuItem型の拡張
```typescript
interface MenuItem {
  // 既存フィールド（14個）
  id: string;
  name: string;
  // ...

  // Phase 6で追加
  nutrition?: {
    calories?: number;        // カロリー（kcal）
    protein?: number;          // タンパク質（g）
    fat?: number;              // 脂質（g）
    carbohydrates?: number;    // 炭水化物（g）
    salt?: number;             // 塩分（g）
  };
  relatedMenuIds?: string[];   // 関連メニューID
  popularity?: number;          // 人気度（1-100）
}
```

#### Restaurant型の新規作成
```typescript
interface Restaurant {
  id: string;
  name: string;
  park: 'disneyland' | 'disneysea';
  area: string;                // エリア名
  openingHours: string;        // 営業時間
  seatingCapacity: number;     // 座席数
  features: string[];          // 特徴タグ
  paymentMethods: string[];    // 支払い方法
  reservationRequired: boolean; // 予約要否
  description: string;         // 説明文
  imageUrl?: string;
  mapLocation?: {
    lat: number;
    lng: number;
  };
}
```

### 技術スタック

#### 既存技術（継続使用）
- React 19.2 + TypeScript 5.9
- Material-UI 7.3.6
- TanStack Query 5.90
- React Router 7.11

#### 新規追加
- react-slick 0.30.2（カルーセル）
- react-share 5.0.0（SNSシェア、軽量）

---

## 📅 実装手順

### Phase 6.1: 人気メニューサジェスト（3日間）

#### Day 1: データ準備とreact-slickセットアップ

**タスク 6.1.1: 人気メニューデータの手動選定**

`data/popular_menus.json`を作成：
```json
{
  "popularMenus": [
    {
      "menuId": "0001",
      "reason": "SNSで話題の季節限定スイーツ",
      "displayOrder": 1
    }
  ]
}
```

選定基準：
- 季節限定メニュー（4件）
- 高価格帯の特別メニュー（3件）
- ビジュアルが華やかなメニュー（3件）

**タスク 6.1.2: react-slickインストールとCSS設定**

```bash
npm install react-slick@0.30.2 @types/react-slick slick-carousel
```

`index.css`に追加：
```css
@import "~slick-carousel/slick/slick.css";
@import "~slick-carousel/slick/slick-theme.css";
```

#### Day 2: PopularMenusCarouselコンポーネント作成

**タスク 6.1.3: PopularMenusCarousel.tsx実装**

```typescript
import Slider from 'react-slick';
import { Box, Card, CardMedia, CardContent, Typography, Chip } from '@mui/material';
import { useMenus } from '../../hooks/useMenus';

export const PopularMenusCarousel = () => {
  const { data: response } = useMenus({ limit: 1000 });
  const menus = response?.data || [];

  // popular_menus.jsonから人気メニューIDを取得
  const popularMenuIds = ['0001', '0042', '0123']; // 実際はJSONから読み込み

  const popularMenus = menus.filter(menu => popularMenuIds.includes(menu.id));

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      { breakpoint: 960, settings: { slidesToShow: 2 } },
      { breakpoint: 600, settings: { slidesToShow: 1 } }
    ]
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
        🔥 人気メニュー
      </Typography>
      <Slider {...settings}>
        {popularMenus.map(menu => (
          <Box key={menu.id} sx={{ px: 1 }}>
            <Card sx={{ height: 350 }}>
              <CardMedia
                component="img"
                height="200"
                image={menu.imageUrl || '/placeholder.jpg'}
                alt={menu.name}
              />
              <CardContent>
                <Typography variant="h6" noWrap>{menu.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {menu.restaurant}
                </Typography>
                <Chip label={`¥${menu.price}`} size="small" color="primary" sx={{ mt: 1 }} />
              </CardContent>
            </Card>
          </Box>
        ))}
      </Slider>
    </Box>
  );
};
```

**タスク 6.1.4: Homeページに統合**

`pages/Home.tsx`の検索バー下に配置：
```typescript
<SearchBar />
<PopularMenusCarousel />
<FilterPanel />
```

#### Day 3: 初回訪問ガイド実装

**タスク 6.1.5: WelcomeGuideモーダル作成**

```typescript
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import { useState, useEffect } from 'react';

export const WelcomeGuide = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasVisited = localStorage.getItem('disney-menu-visited');
    if (!hasVisited) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem('disney-menu-visited', 'true');
    setOpen(false);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm">
      <DialogTitle>🎉 ディズニーメニュー検索へようこそ！</DialogTitle>
      <DialogContent>
        <Typography paragraph>
          このサイトでは、東京ディズニーリゾートの
          全レストランメニューを検索できます。
        </Typography>
        <Typography variant="h6" gutterBottom>主な機能</Typography>
        <ul>
          <li>🔍 メニュー名や説明文で検索</li>
          <li>🏷️ パーク、価格帯、カテゴリでフィルター</li>
          <li>⭐ お気に入り登録機能</li>
          <li>🔥 人気メニューのおすすめ</li>
        </ul>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="contained">
          使ってみる
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

**タスク 6.1.6: E2Eテスト作成**

`popular-menus.spec.ts`:
```typescript
test('人気メニューカルーセルが表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=🔥 人気メニュー')).toBeVisible();
  await expect(page.locator('.slick-slide').first()).toBeVisible();
});
```

---

### Phase 6.2: メニュー詳細ページ拡張（5日間）

#### Day 4: 栄養成分データの準備

**タスク 6.2.1: スクレイピングスクリプト拡張**

`scripts/scrape_menus.py`に栄養成分抽出ロジック追加：
```python
def extract_nutrition(soup):
    nutrition = {}
    nutrition_section = soup.select_one('.nutrition-info')
    if nutrition_section:
        nutrition['calories'] = extract_number(nutrition_section, 'カロリー')
        nutrition['protein'] = extract_number(nutrition_section, 'たんぱく質')
        # ...
    return nutrition
```

**タスク 6.2.2: data/menus.jsonへの栄養成分追加**

手動で主要メニュー50件の栄養成分を追加（段階的に拡充）

#### Day 5-6: 栄養成分表示コンポーネント

**タスク 6.2.3: NutritionInfo.tsxコンポーネント作成**

```typescript
import { Box, Typography, Table, TableBody, TableRow, TableCell } from '@mui/material';

interface NutritionInfoProps {
  nutrition?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbohydrates?: number;
    salt?: number;
  };
}

export const NutritionInfo: React.FC<NutritionInfoProps> = ({ nutrition }) => {
  if (!nutrition) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>栄養成分表</Typography>
      <Table size="small">
        <TableBody>
          {nutrition.calories && (
            <TableRow>
              <TableCell>カロリー</TableCell>
              <TableCell align="right">{nutrition.calories} kcal</TableCell>
            </TableRow>
          )}
          {nutrition.protein && (
            <TableRow>
              <TableCell>たんぱく質</TableCell>
              <TableCell align="right">{nutrition.protein} g</TableCell>
            </TableRow>
          )}
          {/* 他の栄養成分も同様に */}
        </TableBody>
      </Table>
    </Box>
  );
};
```

**タスク 6.2.4: MenuDetail.tsxに統合**

```typescript
import { NutritionInfo } from '../../components/menu/NutritionInfo';

// MenuDetail内
<NutritionInfo nutrition={menu.nutrition} />
```

#### Day 7: 関連メニューサジェスト

**タスク 6.2.5: 関連メニュー抽出ロジック**

```typescript
const getRelatedMenus = (currentMenu: MenuItem, allMenus: MenuItem[]) => {
  return allMenus
    .filter(menu => 
      menu.id !== currentMenu.id &&
      menu.restaurant === currentMenu.restaurant // 同じレストラン
    )
    .slice(0, 4);
};
```

**タスク 6.2.6: RelatedMenus.tsxコンポーネント**

```typescript
import { Grid, Card, CardMedia, CardContent, Typography } from '@mui/material';

export const RelatedMenus: React.FC<{ menus: MenuItem[] }> = ({ menus }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>同じレストランのメニュー</Typography>
      <Grid container spacing={2}>
        {menus.map(menu => (
          <Grid item xs={12} sm={6} md={3} key={menu.id}>
            <Card component={Link} to={`/menu/${menu.id}`}>
              <CardMedia
                component="img"
                height="140"
                image={menu.imageUrl || '/placeholder.jpg'}
                alt={menu.name}
              />
              <CardContent>
                <Typography variant="body2" noWrap>{menu.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ¥{menu.price}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
```

#### Day 8: SNSシェアボタン

**タスク 6.2.7: react-shareインストール**

```bash
npm install react-share@5.1.2
```

**タスク 6.2.8: ShareButtons.tsxコンポーネント**

```typescript
import {
  TwitterShareButton,
  FacebookShareButton,
  LineShareButton,
  TwitterIcon,
  FacebookIcon,
  LineIcon
} from 'react-share';
import { Box } from '@mui/material';

export const ShareButtons: React.FC<{ menu: MenuItem }> = ({ menu }) => {
  const shareUrl = `https://disneymenu.vercel.app/menu/${menu.id}`;
  const title = `${menu.name} - ${menu.restaurant}`;

  return (
    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
      <TwitterShareButton url={shareUrl} title={title}>
        <TwitterIcon size={32} round />
      </TwitterShareButton>
      <FacebookShareButton url={shareUrl} quote={title}>
        <FacebookIcon size={32} round />
      </FacebookShareButton>
      <LineShareButton url={shareUrl} title={title}>
        <LineIcon size={32} round />
      </LineShareButton>
    </Box>
  );
};
```

---

### Phase 6.3: レストラン詳細ページ（4日間）

#### Day 9: データ準備

**タスク 6.3.1: restaurants.json作成**

`data/restaurants.json`:
```json
[
  {
    "id": "rest_001",
    "name": "クリスタルパレス・レストラン",
    "park": "disneyland",
    "area": "アドベンチャーランド",
    "openingHours": "10:00-20:00（日によって変動）",
    "seatingCapacity": 500,
    "features": ["ブッフェスタイル", "キャラクターグリーティング", "屋内"],
    "paymentMethods": ["現金", "クレジットカード", "電子マネー"],
    "reservationRequired": true,
    "description": "ディズニーキャラクターと一緒に食事ができるブッフェレストラン"
  }
]
```

**タスク 6.3.2: Restaurant型定義とAPI追加**

`api/index.py`に追加：
```python
@app.get("/api/restaurants/{restaurant_id}")
async def get_restaurant(restaurant_id: str):
    # restaurants.jsonから取得
    pass
```

#### Day 10-11: RestaurantDetailページ実装

**タスク 6.3.3: RestaurantDetail.tsxページ作成**

```typescript
export const RestaurantDetail = () => {
  const { restaurantId } = useParams();
  const { data: restaurant } = useRestaurant(restaurantId);
  const { data: response } = useMenus({ restaurant: restaurant?.name });

  if (!restaurant) return <CircularProgress />;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>{restaurant.name}</Typography>
      
      {/* 基本情報 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6">基本情報</Typography>
          <List>
            <ListItem>
              <ListItemText primary="営業時間" secondary={restaurant.openingHours} />
            </ListItem>
            <ListItem>
              <ListItemText primary="座席数" secondary={`${restaurant.seatingCapacity}席`} />
            </ListItem>
            <ListItem>
              <ListItemText primary="予約" secondary={restaurant.reservationRequired ? '必要' : '不要'} />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* 特徴タグ */}
      <Box sx={{ mb: 3 }}>
        {restaurant.features.map(feature => (
          <Chip key={feature} label={feature} sx={{ mr: 1, mb: 1 }} />
        ))}
      </Box>

      {/* メニュー一覧 */}
      <Typography variant="h5" gutterBottom>メニュー</Typography>
      <Grid container spacing={2}>
        {response?.data.map(menu => (
          <Grid item xs={12} sm={6} md={4} key={menu.id}>
            <MenuCard menu={menu} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
```

**タスク 6.3.4: ルーティング追加**

`App.tsx`:
```typescript
<Route path="/restaurant/:restaurantId" element={<RestaurantDetail />} />
```

#### Day 12: レストランリンク追加

**タスク 6.3.5: MenuCard.tsxにレストランリンク追加**

```typescript
<Typography variant="body2" color="text.secondary">
  <Link
    to={`/restaurant/${getRestaurantId(menu.restaurant)}`}
    style={{ textDecoration: 'none', color: 'inherit' }}
  >
    {menu.restaurant} →
  </Link>
</Typography>
```

**タスク 6.3.6: レストラン一覧ページ作成**

`pages/Restaurants.tsx`:
```typescript
export const Restaurants = () => {
  const { data: restaurants } = useRestaurants();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>レストラン一覧</Typography>
      <Grid container spacing={3}>
        {restaurants?.map(restaurant => (
          <Grid item xs={12} sm={6} md={4} key={restaurant.id}>
            <Card component={Link} to={`/restaurant/${restaurant.id}`}>
              <CardContent>
                <Typography variant="h6">{restaurant.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {restaurant.area} · {restaurant.park === 'disneyland' ? 'ランド' : 'シー'}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  {restaurant.features.slice(0, 3).map(feature => (
                    <Chip key={feature} label={feature} size="small" sx={{ mr: 0.5 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
```

---

### Phase 6.4: テスト・デバッグ（2日間）

#### Day 13: E2Eテスト作成

**タスク 6.4.1: Phase 6のE2Eテスト（8件）**

`restaurant-detail.spec.ts`:
```typescript
test('レストラン詳細ページが表示される', async ({ page }) => {
  await page.goto('/restaurant/rest_001');
  await expect(page.locator('h4')).toContainText('クリスタルパレス');
  await expect(page.locator('text=営業時間')).toBeVisible();
  await expect(page.locator('text=座席数')).toBeVisible();
});

test('レストランのメニュー一覧が表示される', async ({ page }) => {
  await page.goto('/restaurant/rest_001');
  await expect(page.locator('.menu-card')).toHaveCount.greaterThan(0);
});
```

`nutrition-info.spec.ts`:
```typescript
test('栄養成分情報が表示される', async ({ page }) => {
  await page.goto('/menu/0001');
  await expect(page.locator('text=栄養成分表')).toBeVisible();
  await expect(page.locator('text=カロリー')).toBeVisible();
});
```

`share-buttons.spec.ts`:
```typescript
test('SNSシェアボタンが表示される', async ({ page }) => {
  await page.goto('/menu/0001');
  await expect(page.locator('[aria-label*="Twitter"]')).toBeVisible();
  await expect(page.locator('[aria-label*="Facebook"]')).toBeVisible();
});
```

**タスク 6.4.2: 全テスト実行**

```bash
npm run test:e2e
# 期待: 28件のテスト全パス（Phase 5: 20件 + Phase 6: 8件）
```

#### Day 14: パフォーマンステストと最終調整

**タスク 6.4.3: Lighthouseスコア測定**

```bash
npm run build
npx lighthouse http://localhost:4173 --view
```

目標スコア:
- Performance: 90以上
- Accessibility: 95以上
- Best Practices: 95以上
- SEO: 95以上

**タスク 6.4.4: バンドルサイズ確認**

```bash
npm run build -- --analyze
```

Phase 6追加分の目標:
- react-slick: +53KB
- react-share: +15KB
- 合計: +70KB以下

**タスク 6.4.5: ドキュメント更新**

- README.mdにPhase 6完了を記載
- CHANGELOG.md作成
- API_REFERENCE.mdにレストランエンドポイント追加

**タスク 6.4.6: 本番デプロイ**

```bash
git add .
git commit -m "feat: Phase 6実装完了 - コンテンツ充実化"
git push origin main
vercel --prod
```

---

## 🧪 テスト計画

### E2Eテスト追加（8件）

#### 人気メニュー（2件）
1. 人気メニューカルーセルが表示される
2. カルーセルの自動再生が動作する

#### メニュー詳細拡張（3件）
3. 栄養成分情報が表示される
4. 関連メニューが表示される
5. SNSシェアボタンが動作する

#### レストラン詳細（3件）
6. レストラン詳細ページが表示される
7. レストランのメニュー一覧が表示される
8. レストラン一覧ページが表示される

### パフォーマンステスト

- Lighthouseスコア: 90点以上
- バンドルサイズ: 前Phaseから+70KB以内
- FCP（First Contentful Paint）: 1.8秒以内
- LCP（Largest Contentful Paint）: 2.5秒以内

---

## 📊 成果指標

### 定量指標

| 指標 | 目標 |
|------|------|
| 人気メニューCTR | 20%以上 |
| 詳細ページ滞在時間 | +30秒 |
| SNSシェア数 | 50回/月 |
| E2Eテスト総数 | 28件 |

### 定性指標

- ユーザーが人気メニューから興味を持ちやすくなる
- 栄養成分情報で健康志向のユーザーをサポート
- レストラン詳細で訪問計画が立てやすくなる

---

## 🚀 次のPhase

### Phase 7予告: データ分析とビジュアライゼーション（2週間）

- 統計ダッシュボード（Chart.js）
- 価格分布グラフ
- トレンド分析
- データエクスポート機能

---

## 📚 参考資料

### ライブラリドキュメント
- [react-slick](https://react-slick.neostack.com/)
- [react-share](https://github.com/nygardk/react-share)
- [Material-UI Table](https://mui.com/material-ui/react-table/)

### デザイン参考
- [食べログ](https://tabelog.com/) - メニュー詳細ページ
- [ぐるなび](https://www.gnavi.co.jp/) - レストラン詳細ページ
- [Netflix](https://www.netflix.com/) - カルーセルUI

### 栄養成分データ
- [東京ディズニーリゾート公式](https://www.tokyodisneyresort.jp/food/)
- [文部科学省 食品成分データベース](https://fooddb.mext.go.jp/)
