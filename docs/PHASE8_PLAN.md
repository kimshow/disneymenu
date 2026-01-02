# Phase 8: マップ機能 - 実装計画書

**想定期間**: 3週間（実働21日）  
**開始予定**: Phase 7完了後  
**担当**: フロントエンド + 地図API統合  
**目的**: レストランの位置情報提供とパーク内ナビゲーションによるユーザー体験向上

---

## 📌 エグゼクティブサマリー

### 目標
- パーク内のレストラン位置を地図上で視覚的に表示
- 現在地からのルート案内機能
- フィルター機能と連動したインタラクティブマップ

### 主要機能（優先度順）

1. **Google Maps API統合** 🔥（7日間）
   - API設定とマップ表示
   - レストランマーカー配置
   - カスタムスタイル適用

2. **インタラクティブマップ** 🔥（7日間）
   - マーカークリックで情報表示
   - フィルター連動
   - エリア別絞り込み

3. **ルート案内機能** 🟡（5日間）
   - 現在地取得
   - ルート表示
   - 所要時間表示

4. **テスト・デバッグ** 🟢（2日間）
   - E2Eテスト追加（8件）
   - パフォーマンステスト

---

## 🎯 現状分析

### ✅ Phase 7完了時点での実装状況

#### データ構造
- ✅ Restaurant型（基本情報）
- ⚠️ 位置情報（緯度経度）が一部のみ → Phase 8で全レストラン分追加
- ❌ エリア境界データなし → Phase 8で作成

#### 既存コンポーネント
- ✅ RestaurantDetail.tsx
- ✅ Restaurants.tsx（一覧ページ）
- ❌ マップコンポーネントなし

#### API
- ✅ `/api/restaurants`
- ❌ Google Maps API未統合

---

## 🛠️ 技術設計

### Google Maps API

#### APIキーの取得と設定

1. **Google Cloud Console**で新規プロジェクト作成
2. **Maps JavaScript API**を有効化
3. **Geocoding API**を有効化（住所→座標変換用）
4. APIキーを取得し、以下の制限を設定：
   - HTTPリファラー制限: `https://disneymenu.vercel.app/*`
   - API制限: Maps JavaScript API, Geocoding API のみ

5. Vercelの環境変数に設定：
```bash
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

#### 料金体系（2026年1月時点）

| API | 無料枠 | 超過料金 |
|-----|--------|---------|
| Maps JavaScript API | 28,000回/月 | $7/1000回 |
| Geocoding API | 40,000回/月 | $5/1000回 |

**想定コスト**: 月間1,000ユーザー × 平均3マップ表示 = 3,000回 → **無料枠内**

### 新規ライブラリ

#### Google Maps ライブラリ比較

| ライブラリ | サイズ（gzip） | 特徴 | 採用判断 |
|-----------|---------------|------|---------|
| @react-google-maps/api | 45KB | 公式、フック対応 | ✅ 採用 |
| google-map-react | 35KB | 軽量、古い | ❌ 更新停止 |
| @vis.gl/react-google-maps | 50KB | 新しい、高機能 | ❌ ベータ版 |

**判断**: @react-google-maps/api v2.19.0を採用（最も実績豊富）

#### インストール
```bash
npm install @react-google-maps/api@2.19.3
npm install @googlemaps/markerclusterer@2.5.3  # マーカークラスタリング
```

### データ拡張

#### Restaurant型の拡張
```typescript
interface Restaurant {
  // 既存フィールド
  id: string;
  name: string;
  // ...

  // Phase 8で追加
  location: {
    lat: number;
    lng: number;
  };
  address: string;           // 住所（日本語）
  area: string;              // エリア名（例: "ワールドバザール"）
  floor?: number;            // 階数
  nearbyLandmarks: string[]; // 近くの目印
}
```

#### レストラン位置データの準備

`data/restaurant_locations.json`:
```json
[
  {
    "restaurantId": "rest_001",
    "name": "クリスタルパレス・レストラン",
    "location": {
      "lat": 35.6329,
      "lng": 139.8804
    },
    "address": "千葉県浦安市舞浜1-1 東京ディズニーランド",
    "area": "アドベンチャーランド",
    "nearbyLandmarks": ["シンデレラ城", "ウエスタンリバー鉄道"]
  }
]
```

**データ収集方法**:
1. 公式サイトの地図情報を参照
2. Google Mapsで各レストランの座標を手動取得
3. 全102件のレストラン位置データを作成

---

## 📅 実装手順

### Phase 8.1: Google Maps API統合（7日間）

#### Day 1-2: API設定とデータ準備

**タスク 8.1.1: Google Cloud Console設定**

1. プロジェクト作成: `disney-menu-map`
2. Maps JavaScript API有効化
3. Geocoding API有効化
4. APIキー生成と制限設定

**タスク 8.1.2: 環境変数設定**

`.env.local`:
```env
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
```

Vercel環境変数:
```bash
vercel env add VITE_GOOGLE_MAPS_API_KEY production
```

**タスク 8.1.3: レストラン位置データ作成**

```python
# scripts/add_restaurant_locations.py
import json

# 主要レストラン20件の座標を手動で追加
locations = [
    {
        "restaurantId": "rest_001",
        "location": {"lat": 35.6329, "lng": 139.8804},
        "area": "アドベンチャーランド"
    },
    # ... 残り19件
]

with open('data/restaurant_locations.json', 'w', encoding='utf-8') as f:
    json.dump(locations, f, ensure_ascii=False, indent=2)
```

#### Day 3-4: 基本マップ表示

**タスク 8.1.4: @react-google-maps/apiインストール**

```bash
npm install @react-google-maps/api@2.19.3
```

**タスク 8.1.5: MapContainer.tsxコンポーネント作成**

```typescript
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useState } from 'react';

const mapContainerStyle = {
  width: '100%',
  height: '600px',
};

const center = {
  lat: 35.6329, // 東京ディズニーランドの中心
  lng: 139.8804,
};

export const MapContainer: React.FC = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const onLoad = (map: google.maps.Map) => {
    setMap(map);
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={16}
        onLoad={onLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
        }}
      />
    </LoadScript>
  );
};
```

#### Day 5-6: レストランマーカー配置

**タスク 8.1.6: useRestaurantLocations Hook作成**

```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useRestaurantLocations = () => {
  return useQuery({
    queryKey: ['restaurant-locations'],
    queryFn: async () => {
      const response = await api.get('/api/restaurants/locations');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24時間キャッシュ
  });
};
```

**タスク 8.1.7: RestaurantMarkers.tsxコンポーネント**

```typescript
import { Marker, InfoWindow } from '@react-google-maps/api';
import { useState } from 'react';
import { Restaurant } from '../../types';

interface RestaurantMarkersProps {
  restaurants: Restaurant[];
  onRestaurantClick: (restaurant: Restaurant) => void;
}

export const RestaurantMarkers: React.FC<RestaurantMarkersProps> = ({
  restaurants,
  onRestaurantClick,
}) => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  return (
    <>
      {restaurants.map((restaurant) => (
        <Marker
          key={restaurant.id}
          position={restaurant.location}
          onClick={() => setSelectedRestaurant(restaurant)}
          icon={{
            url: '/icons/restaurant-marker.png',
            scaledSize: new google.maps.Size(40, 40),
          }}
        />
      ))}

      {selectedRestaurant && (
        <InfoWindow
          position={selectedRestaurant.location}
          onCloseClick={() => setSelectedRestaurant(null)}
        >
          <div style={{ minWidth: 200 }}>
            <h3>{selectedRestaurant.name}</h3>
            <p>{selectedRestaurant.area}</p>
            <Button
              size="small"
              onClick={() => onRestaurantClick(selectedRestaurant)}
            >
              詳細を見る
            </Button>
          </div>
        </InfoWindow>
      ))}
    </>
  );
};
```

#### Day 7: カスタムスタイル適用

**タスク 8.1.8: ディズニー風マップスタイル**

```typescript
const mapStyles = [
  {
    featureType: 'poi',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }], // 不要なPOI非表示
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#a2daf2' }], // 水色を明るく
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#f5f5dc' }], // ベージュ系
  },
];

// MapContainerに適用
<GoogleMap
  options={{
    styles: mapStyles,
    // ...
  }}
/>
```

---

### Phase 8.2: インタラクティブマップ（7日間）

#### Day 8-9: マーカークリック情報表示

**タスク 8.2.1: RestaurantInfoCard.tsxコンポーネント**

```typescript
import { Card, CardContent, CardMedia, Typography, Button, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

export const RestaurantInfoCard: React.FC<{ restaurant: Restaurant }> = ({ restaurant }) => {
  return (
    <Card sx={{ maxWidth: 400 }}>
      <CardMedia
        component="img"
        height="140"
        image={restaurant.imageUrl || '/placeholder.jpg'}
        alt={restaurant.name}
      />
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {restaurant.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {restaurant.area} · {restaurant.park === 'disneyland' ? 'ランド' : 'シー'}
        </Typography>
        <Box sx={{ mb: 1 }}>
          {restaurant.features.slice(0, 3).map((feature) => (
            <Chip key={feature} label={feature} size="small" sx={{ mr: 0.5 }} />
          ))}
        </Box>
        <Typography variant="body2" paragraph>
          {restaurant.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            size="small"
            component={Link}
            to={`/restaurant/${restaurant.id}`}
          >
            詳細を見る
          </Button>
          <Button variant="outlined" size="small">
            ルート案内
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};
```

**タスク 8.2.2: サイドパネル統合**

```typescript
export const MapPage = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 64px)' }}>
      {/* マップエリア */}
      <Box sx={{ flex: 1 }}>
        <MapContainer
          restaurants={restaurants}
          onRestaurantClick={setSelectedRestaurant}
        />
      </Box>

      {/* サイドパネル */}
      {selectedRestaurant && (
        <Drawer
          anchor="right"
          open={Boolean(selectedRestaurant)}
          onClose={() => setSelectedRestaurant(null)}
          variant="persistent"
        >
          <Box sx={{ width: 400, p: 2 }}>
            <RestaurantInfoCard restaurant={selectedRestaurant} />
          </Box>
        </Drawer>
      )}
    </Box>
  );
};
```

#### Day 10-11: フィルター連動

**タスク 8.2.3: MapFilterPanel.tsxコンポーネント**

```typescript
export const MapFilterPanel: React.FC = () => {
  const [selectedPark, setSelectedPark] = useState<string>('all');
  const [selectedArea, setSelectedArea] = useState<string>('all');

  return (
    <Paper
      sx={{
        position: 'absolute',
        top: 80,
        left: 20,
        zIndex: 1,
        p: 2,
        minWidth: 250,
      }}
    >
      <Typography variant="h6" gutterBottom>
        フィルター
      </Typography>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>パーク</InputLabel>
        <Select
          value={selectedPark}
          onChange={(e) => setSelectedPark(e.target.value)}
        >
          <MenuItem value="all">すべて</MenuItem>
          <MenuItem value="disneyland">ディズニーランド</MenuItem>
          <MenuItem value="disneysea">ディズニーシー</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel>エリア</InputLabel>
        <Select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
        >
          <MenuItem value="all">すべて</MenuItem>
          <MenuItem value="ワールドバザール">ワールドバザール</MenuItem>
          <MenuItem value="アドベンチャーランド">アドベンチャーランド</MenuItem>
          {/* 他のエリア */}
        </Select>
      </FormControl>
    </Paper>
  );
};
```

**タスク 8.2.4: フィルター適用ロジック**

```typescript
const filteredRestaurants = useMemo(() => {
  let filtered = restaurants;

  if (selectedPark !== 'all') {
    filtered = filtered.filter((r) => r.park === selectedPark);
  }

  if (selectedArea !== 'all') {
    filtered = filtered.filter((r) => r.area === selectedArea);
  }

  return filtered;
}, [restaurants, selectedPark, selectedArea]);
```

#### Day 12-14: エリア別絞り込みとマーカークラスタリング

**タスク 8.2.5: マーカークラスタリング実装**

```bash
npm install @googlemaps/markerclusterer@2.5.3
```

```typescript
import { MarkerClusterer } from '@googlemaps/markerclusterer';

export const ClusteredMarkers: React.FC = () => {
  const [clusterer, setClusterer] = useState<MarkerClusterer | null>(null);

  useEffect(() => {
    if (map && markers.length > 0) {
      const newClusterer = new MarkerClusterer({
        map,
        markers,
        algorithm: new SuperClusterAlgorithm({ radius: 100 }),
      });
      setClusterer(newClusterer);
    }
  }, [map, markers]);

  return null;
};
```

**タスク 8.2.6: エリア境界ポリゴン表示**

```typescript
import { Polygon } from '@react-google-maps/api';

const adventurelandBounds = [
  { lat: 35.6330, lng: 139.8800 },
  { lat: 35.6335, lng: 139.8810 },
  { lat: 35.6325, lng: 139.8815 },
  { lat: 35.6320, lng: 139.8805 },
];

<Polygon
  paths={adventurelandBounds}
  options={{
    fillColor: '#FFE4B5',
    fillOpacity: 0.2,
    strokeColor: '#FF8C00',
    strokeOpacity: 0.8,
    strokeWeight: 2,
  }}
/>
```

---

### Phase 8.3: ルート案内機能（5日間）

#### Day 15-16: 現在地取得

**タスク 8.3.1: useGeolocation Hook作成**

```typescript
import { useState, useEffect } from 'react';

export const useGeolocation = () => {
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => setPosition(pos),
      (err) => setError(err.message)
    );
  }, []);

  return { position, error };
};
```

**タスク 8.3.2: 現在地マーカー表示**

```typescript
const { position } = useGeolocation();

{position && (
  <Marker
    position={{
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    }}
    icon={{
      url: '/icons/current-location.png',
      scaledSize: new google.maps.Size(30, 30),
    }}
  />
)}
```

#### Day 17-18: ルート表示

**タスク 8.3.3: DirectionsService統合**

```typescript
import { DirectionsRenderer, DirectionsService } from '@react-google-maps/api';

export const RouteDisplay: React.FC<{
  origin: google.maps.LatLngLiteral;
  destination: google.maps.LatLngLiteral;
}> = ({ origin, destination }) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

  const directionsCallback = (result: google.maps.DirectionsResult | null) => {
    if (result && result.routes.length > 0) {
      setDirections(result);
    }
  };

  return (
    <>
      <DirectionsService
        options={{
          origin,
          destination,
          travelMode: google.maps.TravelMode.WALKING,
        }}
        callback={directionsCallback}
      />

      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: false,
            polylineOptions: {
              strokeColor: '#4285F4',
              strokeWeight: 5,
            },
          }}
        />
      )}
    </>
  );
};
```

#### Day 19: 所要時間表示

**タスク 8.3.4: RouteInfo.tsxコンポーネント**

```typescript
export const RouteInfo: React.FC<{ directions: google.maps.DirectionsResult }> = ({
  directions,
}) => {
  const route = directions.routes[0];
  const leg = route.legs[0];

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        ルート情報
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <DirectionsWalkIcon />
        <Typography>徒歩 {leg.duration?.text}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        距離: {leg.distance?.text}
      </Typography>
      <Button variant="contained" sx={{ mt: 2 }} fullWidth>
        ナビゲーション開始
      </Button>
    </Paper>
  );
};
```

---

### Phase 8.4: テスト・デバッグ（2日間）

#### Day 20: E2Eテスト作成

**タスク 8.4.1: Phase 8のE2Eテスト（8件）**

`map.spec.ts`:
```typescript
test('マップページが表示される', async ({ page }) => {
  await page.goto('/map');
  await expect(page.locator('.google-map')).toBeVisible();
});

test('レストランマーカーが表示される', async ({ page }) => {
  await page.goto('/map');
  await page.waitForSelector('img[src*="restaurant-marker"]');
  const markers = await page.locator('img[src*="restaurant-marker"]').count();
  expect(markers).toBeGreaterThan(0);
});

test('マーカークリックで情報が表示される', async ({ page }) => {
  await page.goto('/map');
  await page.click('img[src*="restaurant-marker"]').first();
  await expect(page.locator('.info-window')).toBeVisible();
});

test('フィルターパネルが動作する', async ({ page }) => {
  await page.goto('/map');
  await page.selectOption('select[name="park"]', 'disneyland');
  // マーカー数が変わることを確認
});

test('現在地が表示される', async ({ page, context }) => {
  await context.grantPermissions(['geolocation']);
  await page.goto('/map');
  await expect(page.locator('img[src*="current-location"]')).toBeVisible();
});

test('ルート案内ボタンが動作する', async ({ page }) => {
  await page.goto('/map');
  await page.click('img[src*="restaurant-marker"]').first();
  await page.click('text=ルート案内');
  await expect(page.locator('text=ルート情報')).toBeVisible();
});
```

#### Day 21: パフォーマンステストと最終調整

**タスク 8.4.2: マップ読み込み最適化**

```typescript
// 遅延読み込み
const MapPage = lazy(() => import('./pages/MapPage'));

// マップのメモ化
const MemoizedMap = memo(MapContainer);

// マーカーの最適化
const optimizedMarkers = useMemo(
  () => restaurants.map(r => ({ ...r, location: r.location })),
  [restaurants]
);
```

**タスク 8.4.3: API使用量モニタリング**

Google Cloud Consoleで確認:
- Maps JavaScript API: 1日あたり100回未満を目標
- Geocoding API: 1回のみ（初回データ作成時）

**タスク 8.4.4: ドキュメント更新と本番デプロイ**

```bash
git add .
git commit -m "feat: Phase 8実装完了 - マップ機能"
git push origin main
vercel --prod
```

---

## 🧪 テスト計画

### E2Eテスト追加（8件）

1. マップページが表示される
2. レストランマーカーが表示される
3. マーカークリックで情報が表示される
4. フィルターパネルが動作する
5. エリア別絞り込みが動作する
6. 現在地が表示される
7. ルート案内が表示される
8. 所要時間が表示される

### パフォーマンステスト

- 初回マップ読み込み: 2秒以内
- マーカー100個表示: 1秒以内
- Google Maps API使用量: 3,000回/月以内

---

## 📊 成果指標

### 定量指標

| 指標 | 目標 |
|------|------|
| マップページ訪問率 | 25%以上 |
| ルート案内使用数 | 100回/月 |
| マップ操作時間 | 3分以上 |
| E2Eテスト総数 | 42件 |

---

## 🚀 次のPhase

### Phase 9予告: ユーザー体験向上（2週間）

- ダークモード対応
- 多言語対応（英語）
- アクセシビリティ強化

---

## 📚 参考資料

- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript)
- [@react-google-maps/api](https://react-google-maps-api-docs.netlify.app/)
- [MarkerClusterer](https://github.com/googlemaps/js-markerclusterer)
- [東京ディズニーリゾート公式マップ](https://www.tokyodisneyresort.jp/tdl/map.html)
