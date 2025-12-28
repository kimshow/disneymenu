# API リファレンス

## 目次

1. [データモデル (api/models.py)](#データモデル)
2. [スクレイパー (api/scraper.py)](#スクレイパー)
3. [データローダー (api/data_loader.py)](#データローダー)
4. [FastAPI エンドポイント (api/index.py)](#fastapi-エンドポイント)
5. [スクレイピングスクリプト (scripts/)](#スクレイピングスクリプト)

---

## データモデル

### `ParkType` (Enum)
パーク種別を表す列挙型

**値:**
- `DISNEYLAND = "tdl"` - 東京ディズニーランド
- `DISNEYSEA = "tds"` - 東京ディズニーシー

**使用例:**
```python
from api.models import ParkType

park = ParkType.DISNEYLAND  # "tdl"
```

---

### `ServiceType` (Enum)
レストランのサービスタイプを表す列挙型

**値:**
- `COUNTER = "カウンターサービス"`
- `BUFFET = "バフェテリアサービス"`
- `TABLE = "テーブルサービス"`
- `MOBILE_ORDER = "モバイルオーダー"`

---

### `AvailabilityPeriod` (BaseModel)
メニュー販売期間を管理するモデル

**フィールド:**
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `start_date` | `Optional[date]` | 販売開始日 |
| `end_date` | `Optional[date]` | 販売終了日 |

**メソッド:**

#### `is_available(check_date: Optional[date] = None) -> bool`
指定日に販売中かどうかを判定

**パラメータ:**
- `check_date` (Optional[date]): チェックする日付。Noneの場合は今日の日付

**戻り値:**
- `bool`: 販売中ならTrue、それ以外はFalse

**使用例:**
```python
from datetime import date
from api.models import AvailabilityPeriod

period = AvailabilityPeriod(
    start_date=date(2025, 12, 26),
    end_date=None  # 終了日未定
)

if period.is_available():
    print("現在販売中")
```

---

### `PriceInfo` (BaseModel)
価格情報を表すモデル

**フィールド:**
| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `amount` | `int` | - | 価格（円） |
| `unit` | `str` | `""` | 単位（例: "1カップ", "1個"） |
| `tax_included` | `bool` | `True` | 税込かどうか |

**使用例:**
```python
from api.models import PriceInfo

price = PriceInfo(amount=400, unit="1カップ", tax_included=True)
print(f"{price.unit} ¥{price.amount}")  # "1カップ ¥400"
```

---

### `Restaurant` (BaseModel)
レストラン情報を表すモデル

**フィールド:**
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `str` | レストランID (URLから抽出) |
| `name` | `str` | レストラン名 |
| `park` | `ParkType` | どちらのパークか |
| `area` | `str` | エリア名（例: トゥモローランド） |
| `service_types` | `List[ServiceType]` | サービスタイプのリスト |
| `url` | `HttpUrl` | レストラン詳細URL |
| `availability` | `Optional[AvailabilityPeriod]` | このレストランでの販売期間 |

**使用例:**
```python
from api.models import Restaurant, ParkType

restaurant = Restaurant(
    id="335",
    name="プラザパビリオン・レストラン",
    park=ParkType.DISNEYLAND,
    area="ウエスタンランド",
    url="https://www.tokyodisneyresort.jp/tdl/restaurant/detail/335/",
    service_types=[],
    availability=None
)
```

---

### `MenuItem` (BaseModel)
メニューアイテムの完全な情報を表すモデル

**フィールド:**

#### 基本情報
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `id` | `str` | 4桁のメニューID |
| `name` | `str` | メニュー名（日本語） |
| `description` | `Optional[str]` | メニュー説明 |

#### 価格
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `price` | `PriceInfo` | 価格情報 |

#### 画像
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `image_urls` | `List[HttpUrl]` | メニュー画像URL一覧 |
| `thumbnail_url` | `Optional[HttpUrl]` | サムネイル画像URL |

#### 販売情報
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `restaurants` | `List[Restaurant]` | 販売店舗一覧 |

#### カテゴリとタグ
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `categories` | `List[str]` | カテゴリ（例: デザート／スウィーツ） |
| `tags` | `List[str]` | タグ（例: キャラクターモチーフ、季節限定） |
| `characters` | `List[str]` | 関連キャラクター（例: トイ・ストーリー） |

#### アレルギー・栄養情報
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `allergens` | `List[str]` | アレルゲン情報 |
| `nutritional_info` | `Optional[dict]` | 栄養成分情報 |

#### メタデータ
| フィールド | 型 | 説明 |
|-----------|-----|------|
| `source_url` | `HttpUrl` | 元ページURL |
| `scraped_at` | `datetime` | スクレイピング日時 |
| `last_updated` | `Optional[datetime]` | 最終更新日時 |

#### ステータス
| フィールド | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `is_seasonal` | `bool` | `False` | 季節限定商品か |
| `is_new` | `bool` | `False` | 新商品か |
| `is_available` | `bool` | `True` | 現在販売中か |

**使用例:**
```python
from api.models import MenuItem, PriceInfo, Restaurant, ParkType

menu = MenuItem(
    id="1779",
    name="リトルグリーンまん",
    description="トイ・ストーリーのリトルグリーンメンをモチーフにした中華まん",
    price=PriceInfo(amount=400, unit="1カップ"),
    image_urls=["https://media1.tokyodisneyresort.jp/food_menu/image/1779_1.34_1_C2w75656.jpg"],
    restaurants=[
        Restaurant(
            id="335",
            name="プラザパビリオン・レストラン",
            park=ParkType.DISNEYLAND,
            area="ウエスタンランド",
            url="https://www.tokyodisneyresort.jp/tdl/restaurant/detail/335/"
        )
    ],
    categories=["デザート／スウィーツ", "スナック"],
    tags=["キャラクターモチーフのメニュー", "～500円"],
    characters=["トイ・ストーリー", "ピクサー"],
    source_url="https://www.tokyodisneyresort.jp/food/1779/"
)
```

---

## スクレイパー

### `MenuScraper` クラス
東京ディズニーリゾートのメニューページをスクレイピングするクラス

#### クラス変数

**`SELECTORS`**: CSS セレクター定義
```python
SELECTORS = {
    'title': 'h1.heading1',                    # メニュー名
    'price': 'p.price',                        # 価格
    'images': '.columnImage img',              # 画像
    'og_image': 'meta[property="og:image"]',   # OGP画像
    'description': 'meta[name="description"]', # 説明文
    'keywords': 'meta[name="keywords"]',       # キーワード
    'restaurants': '.linkList7 ul li',         # レストランリスト
    'restaurant_name': 'h3.heading3',          # レストラン名
    'restaurant_area': '.listTextArea > p',    # エリア
    'restaurant_link': 'a',                    # リンク
    'availability_period': '.definitionList p' # 販売期間
}
```

---

#### メソッド

### `parse_menu_page(html: str, menu_id: str) -> Optional[Dict]`
メニューページHTMLをパースしてデータを抽出

**パラメータ:**
- `html` (str): HTMLコンテンツ
- `menu_id` (str): メニューID（4桁）

**戻り値:**
- `Optional[Dict]`: パースされたメニューデータ、またはNone（データが不完全な場合）

**返されるデータ構造:**
```python
{
    'id': str,                      # メニューID
    'name': str,                    # メニュー名
    'description': str,             # 説明文
    'price': {                      # 価格情報
        'amount': int,
        'unit': str,
        'tax_included': bool
    },
    'image_urls': List[str],        # 画像URL一覧
    'thumbnail_url': Optional[str], # サムネイル画像URL
    'restaurants': List[Dict],      # レストラン一覧
    'categories': List[str],        # カテゴリ
    'tags': List[str],              # タグ
    'characters': List[str],        # キャラクター
    'source_url': str,              # 元ページURL
    'scraped_at': str,              # スクレイピング日時(ISO形式)
    'is_seasonal': bool,            # 季節限定か
    'is_available': bool,           # 販売中か
    'allergens': List[str],         # アレルゲン情報
    'nutritional_info': None,       # 栄養情報
    'last_updated': None,           # 最終更新日時
    'is_new': bool                  # 新商品か
}
```

**使用例:**
```python
from api.scraper import MenuScraper
import requests

scraper = MenuScraper()
response = requests.get("https://www.tokyodisneyresort.jp/food/1779/")
data = scraper.parse_menu_page(response.text, "1779")

if data:
    print(f"メニュー: {data['name']}")
    print(f"価格: ¥{data['price']['amount']}")
```

---

### プライベートメソッド

#### `_extract_name(soup: BeautifulSoup) -> str`
メニュー名を抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `str`: メニュー名（取得できない場合は空文字列）

---

#### `_extract_price(soup: BeautifulSoup) -> Dict`
価格情報を抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `Dict`: 価格情報 `{'amount': int, 'unit': str, 'tax_included': bool}`

**パース例:**
- `"1カップ ¥400"` → `{'amount': 400, 'unit': '1カップ', 'tax_included': True}`
- `"¥400"` → `{'amount': 400, 'unit': '', 'tax_included': True}`

---

#### `_extract_images(soup: BeautifulSoup) -> List[str]`
画像URL一覧を抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `List[str]`: 画像URLのリスト

---

#### `_extract_og_image(soup: BeautifulSoup) -> Optional[str]`
OGP画像URLを抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `Optional[str]`: OGP画像URL、またはNone

---

#### `_extract_description(soup: BeautifulSoup) -> str`
メタタグから説明文を抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `str`: 説明文

---

#### `_extract_restaurants(soup: BeautifulSoup) -> List[Dict]`
販売店舗一覧を抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `List[Dict]`: レストラン情報のリスト

**レストラン情報の構造:**
```python
{
    'id': str,              # レストランID
    'name': str,            # レストラン名
    'park': str,            # "tdl" or "tds"
    'area': str,            # エリア名
    'url': str,             # レストランURL
    'availability': {       # 販売期間（Optional）
        'start_date': str,  # "YYYY-MM-DD"
        'end_date': str     # "YYYY-MM-DD" or None
    },
    'service_types': []     # サービスタイプ（現在は空）
}
```

---

#### `_parse_availability(text: str) -> Optional[Dict]`
販売期間テキストをパース

**パラメータ:**
- `text` (str): 販売期間テキスト（例: "2025年12月26日 ～ 2026年3月31日"）

**戻り値:**
- `Optional[Dict]`: `{'start_date': str, 'end_date': Optional[str]}`、またはNone

**パース例:**
- `"2025年12月26日 ～"` → `{'start_date': '2025-12-26', 'end_date': None}`
- `"2025年7月1日 ～ 2026年3月31日"` → `{'start_date': '2025-07-01', 'end_date': '2026-03-31'}`

---

#### `_extract_keywords(soup: BeautifulSoup) -> List[str]`
メタタグからキーワード一覧を取得

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `List[str]`: キーワードのリスト

---

#### `_extract_tags(soup: BeautifulSoup) -> List[str]`
キーワードからタグを抽出（パーク名、レストラン名、キャラクター名を除外）

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `List[str]`: タグのリスト

**除外されるキーワード:**
- パーク名: 東京ディズニーシー、東京ディズニーランド
- エリア名: トゥモローランド、ウエスタンランド等
- レストラン名で終わるもの: ～レストラン、～ダイナー等

---

#### `_extract_categories(soup: BeautifulSoup) -> List[str]`
キーワードからカテゴリを抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `List[str]`: カテゴリのリスト

**抽出条件:**
- `／`を含むキーワード（例: "デザート／スウィーツ"）
- カテゴリキーワード: おすすめメニュー、スウィーツ、スナック等

---

#### `_extract_characters(soup: BeautifulSoup) -> List[str]`
キーワードからキャラクター/作品名を抽出

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `List[str]`: キャラクター/作品名のリスト

**検索パターン:**
- トイ・ストーリー、ピクサー、ミッキー、ミニー
- ドナルド、デイジー、グーフィー、プルート
- ダッフィー、シェリーメイ、ジェラトーニ等
- マーベル、スター・ウォーズ

---

#### `_is_seasonal(soup: BeautifulSoup) -> bool`
季節限定商品かどうか判定

**パラメータ:**
- `soup` (BeautifulSoup): パース済みHTMLオブジェクト

**戻り値:**
- `bool`: 季節限定ならTrue

**判定キーワード:**
- 季節限定、期間限定、シーズン
- クリスマス、ハロウィーン、イースター

---

## データローダー

### `MenuDataLoader` クラス
メニューデータの読み込みとフィルタリングを行うクラス

#### 初期化

```python
MenuDataLoader(data_path: str = 'data/menus.json')
```

**パラメータ:**
- `data_path` (str): メニューデータJSONファイルのパス（デフォルト: `'data/menus.json'`）

---

#### メソッド

### `load_menus(force_reload: bool = False) -> List[Dict]`
メニューデータを読み込み

**パラメータ:**
- `force_reload` (bool): キャッシュを無視して再読み込みするか（デフォルト: False）

**戻り値:**
- `List[Dict]`: メニューデータのリスト

**キャッシュ動作:**
- ファイルの更新時刻をチェックして、変更がなければキャッシュを使用
- `force_reload=True`の場合は常に再読み込み

**使用例:**
```python
from api.data_loader import MenuDataLoader

loader = MenuDataLoader()
menus = loader.load_menus()
print(f"読み込んだメニュー数: {len(menus)}")
```

---

### `filter_by_availability(menus: List[Dict], check_date: Optional[date] = None) -> List[Dict]`
販売中のメニューのみフィルタ

**パラメータ:**
- `menus` (List[Dict]): メニューデータリスト
- `check_date` (Optional[date]): チェック日付（Noneの場合は今日）

**戻り値:**
- `List[Dict]`: 販売中のメニューリスト

**フィルタリングロジック:**
1. 各メニューの全レストランをチェック
2. 販売期間指定がないレストランがあれば → 販売中
3. 販売期間内のレストランがあれば → 販売中
4. すべてのレストランが販売期間外 → 除外

**使用例:**
```python
from datetime import date
from api.data_loader import MenuDataLoader

loader = MenuDataLoader()
menus = loader.load_menus()
available = loader.filter_by_availability(menus, date(2025, 12, 28))
print(f"販売中のメニュー: {len(available)}/{len(menus)}")
```

---

### `get_menu_by_id(menu_id: str) -> Optional[Dict]`
IDでメニューを取得

**パラメータ:**
- `menu_id` (str): メニューID

**戻り値:**
- `Optional[Dict]`: メニューデータまたはNone

**使用例:**
```python
loader = MenuDataLoader()
menu = loader.get_menu_by_id("1779")
if menu:
    print(f"メニュー名: {menu['name']}")
```

---

### `get_all_tags() -> List[str]`
全てのタグを取得

**戻り値:**
- `List[str]`: タグのリスト（重複なし、ソート済み）

**使用例:**
```python
loader = MenuDataLoader()
tags = loader.get_all_tags()
print(f"タグ数: {len(tags)}")
print(f"タグ: {', '.join(tags[:10])}")
```

---

### `get_all_categories() -> List[str]`
全てのカテゴリを取得

**戻り値:**
- `List[str]`: カテゴリのリスト（重複なし、ソート済み）

---

### `get_all_restaurants() -> List[Dict]`
全てのレストランを取得

**戻り値:**
- `List[Dict]`: レストランのリスト（重複なし）

**使用例:**
```python
loader = MenuDataLoader()
restaurants = loader.get_all_restaurants()
for r in restaurants:
    print(f"{r['name']} ({r['park']}) - {r['area']}")
```

---

### `get_stats() -> Dict`
統計情報を取得

**戻り値:**
- `Dict`: 統計情報

**統計情報の構造:**
```python
{
    'total_menus': int,          # 総メニュー数
    'available_menus': int,      # 販売中のメニュー数
    'total_tags': int,           # 総タグ数
    'total_categories': int,     # 総カテゴリ数
    'total_restaurants': int,    # 総レストラン数
    'min_price': int,            # 最低価格
    'max_price': int,            # 最高価格
    'avg_price': int,            # 平均価格
    'last_updated': str          # 最終更新日時
}
```

**使用例:**
```python
loader = MenuDataLoader()
stats = loader.get_stats()
print(f"総メニュー数: {stats['total_menus']}")
print(f"価格帯: ¥{stats['min_price']} - ¥{stats['max_price']}")
```

---

## FastAPI エンドポイント

### ベースURL
- **開発環境**: `http://localhost:8000`
- **本番環境**: `https://your-domain.vercel.app`

### 認証
現在、認証は不要です（全エンドポイントが公開）

---

### エンドポイント一覧

#### `GET /`
APIルート情報を取得

**レスポンス例:**
```json
{
  "message": "Disney Menu API",
  "version": "1.0.0",
  "endpoints": {
    "menus": "/api/menus",
    "menu_by_id": "/api/menus/{id}",
    "restaurants": "/api/restaurants",
    "tags": "/api/tags",
    "categories": "/api/categories",
    "stats": "/api/stats"
  }
}
```

---

#### `GET /api/menus`
メニュー一覧を取得

**クエリパラメータ:**

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `q` | string | - | 検索クエリ（名前、説明） |
| `tags` | string | - | タグフィルタ（カンマ区切り） |
| `categories` | string | - | カテゴリフィルタ（カンマ区切り） |
| `min_price` | integer | - | 最小価格 |
| `max_price` | integer | - | 最大価格 |
| `park` | string | - | パークフィルタ（`tdl`/`tds`） |
| `area` | string | - | エリアフィルタ |
| `character` | string | - | キャラクターフィルタ |
| `only_available` | boolean | true | 販売中のみ |
| `page` | integer | 1 | ページ番号（≥1） |
| `limit` | integer | 50 | 1ページあたりの件数（1-100） |

**レスポンス:**
```json
{
  "success": true,
  "data": [
    {
      "id": "1779",
      "name": "リトルグリーンまん",
      "price": {
        "amount": 400,
        "unit": "1カップ"
      },
      "restaurants": [...],
      "tags": [...],
      ...
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "pages": 3
  }
}
```

**使用例:**
```bash
# 基本的な取得
curl "http://localhost:8000/api/menus"

# 検索
curl "http://localhost:8000/api/menus?q=カレー"

# パークとエリアでフィルタ
curl "http://localhost:8000/api/menus?park=tdl&area=トゥモローランド"

# 価格範囲でフィルタ
curl "http://localhost:8000/api/menus?min_price=500&max_price=1000"

# タグでフィルタ
curl "http://localhost:8000/api/menus?tags=キャラクターモチーフのメニュー"

# ページネーション
curl "http://localhost:8000/api/menus?page=2&limit=20"
```

---

#### `GET /api/menus/{menu_id}`
特定のメニューを取得

**パスパラメータ:**
- `menu_id` (string): メニューID（4桁）

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "id": "1779",
    "name": "リトルグリーンまん",
    "description": "東京ディズニーシー、東京ディズニーランドのおすすめメニュー...",
    "price": {
      "amount": 400,
      "unit": "1カップ",
      "tax_included": true
    },
    "image_urls": ["https://..."],
    "thumbnail_url": "https://...",
    "restaurants": [...],
    "categories": ["デザート／スウィーツ", "スナック"],
    "tags": ["キャラクターモチーフのメニュー", "～500円"],
    "characters": ["トイ・ストーリー", "ピクサー"],
    "source_url": "https://www.tokyodisneyresort.jp/food/1779/",
    "scraped_at": "2025-12-28T12:00:00",
    ...
  }
}
```

**エラーレスポンス (404):**
```json
{
  "detail": "Menu not found"
}
```

**使用例:**
```bash
curl "http://localhost:8000/api/menus/1779"
```

---

#### `GET /api/restaurants`
レストラン一覧を取得

**クエリパラメータ:**
| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `park` | string | - | パークフィルタ（`tdl`/`tds`） |

**レスポンス:**
```json
{
  "success": true,
  "data": [
    {
      "id": "335",
      "name": "プラザパビリオン・レストラン",
      "park": "tdl",
      "area": "ウエスタンランド",
      "url": "https://www.tokyodisneyresort.jp/tdl/restaurant/detail/335/",
      "service_types": [],
      "availability": null
    },
    ...
  ]
}
```

**使用例:**
```bash
# 全レストラン
curl "http://localhost:8000/api/restaurants"

# ディズニーランドのみ
curl "http://localhost:8000/api/restaurants?park=tdl"
```

---

#### `GET /api/tags`
タグ一覧を取得

**レスポンス:**
```json
{
  "success": true,
  "data": [
    "～500円",
    "カウンターサービス",
    "キャラクターモチーフのメニュー",
    "スナック",
    "バフェテリアサービス",
    ...
  ]
}
```

**使用例:**
```bash
curl "http://localhost:8000/api/tags"
```

---

#### `GET /api/categories`
カテゴリ一覧を取得

**レスポンス:**
```json
{
  "success": true,
  "data": [
    "おすすめメニュー",
    "スウィーツ",
    "スナック",
    "デザート／スウィーツ",
    ...
  ]
}
```

**使用例:**
```bash
curl "http://localhost:8000/api/categories"
```

---

#### `GET /api/stats`
統計情報を取得

**レスポンス:**
```json
{
  "success": true,
  "data": {
    "total_menus": 150,
    "available_menus": 145,
    "total_tags": 25,
    "total_categories": 8,
    "total_restaurants": 50,
    "min_price": 300,
    "max_price": 2500,
    "avg_price": 850,
    "last_updated": "2025-12-28T12:00:00"
  }
}
```

**使用例:**
```bash
curl "http://localhost:8000/api/stats"
```

---

## スクレイピングスクリプト

### `scripts/scrape_menus.py`
メインスクレイピングスクリプト

#### 使用方法

```bash
python scripts/scrape_menus.py [OPTIONS]
```

#### オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `--start` | integer | 0 | 開始メニューID |
| `--end` | integer | 9999 | 終了メニューID |
| `--output` | string | data/menus.json | 出力ファイルパス |
| `--rate-limit` | float | 1.0 | リクエスト間隔（秒） |
| `--max-concurrent` | integer | 5 | 最大同時接続数 |

#### 使用例

```bash
# テストスクレイピング（ID 1700-1800）
python scripts/scrape_menus.py --start 1700 --end 1800

# 全IDスクレイピング
python scripts/scrape_menus.py

# レート制限を2秒に設定
python scripts/scrape_menus.py --start 1000 --end 2000 --rate-limit 2.0

# 出力先を指定
python scripts/scrape_menus.py --output data/test_menus.json
```

#### 機能

1. **非同期スクレイピング**: aiohttpを使用した高速処理
2. **レート制限**: robots.txtに準拠（デフォルト1秒1リクエスト）
3. **エラーハンドリング**: タイムアウト、404エラーを適切に処理
4. **プログレスバー**: tqdmによる進捗表示
5. **統計情報**: 完了時にパーク別統計、価格統計を表示

---

### `scripts/test_scraper.py`
単一メニューのテストスクリプト

#### 使用方法

```bash
python scripts/test_scraper.py
```

#### 機能

- 単一URL (ID: 1779) からデータを取得
- スクレイピング結果をコンソールに表示
- `data/test_single.json`に保存
- 同期処理（requestsライブラリ使用）

#### 使用例

```bash
# テスト実行
python scripts/test_scraper.py

# 出力確認
cat data/test_single.json
```

---

## 開発ガイド

### ローカル開発サーバー起動

```bash
# 仮想環境有効化
source venv/bin/activate

# FastAPI起動（開発モード）
cd api && uvicorn index:app --reload --port 8000

# または Vercel Dev
vercel dev
```

### APIドキュメント

FastAPIの自動生成ドキュメントにアクセス:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### データ更新フロー

1. スクレイピング実行
2. `data/menus.json`を更新
3. Gitにコミット
4. Vercelに自動デプロイ
5. APIが新しいデータを返す

---

## エラーハンドリング

### スクレイパー

- **タイムアウト**: 60秒でタイムアウト
- **404エラー**: 存在しないIDはスキップ
- **パースエラー**: ログ出力してスキップ

### API

- **404**: メニューが見つからない場合
- **422**: バリデーションエラー（無効なパラメータ）
- **500**: サーバーエラー

---

## パフォーマンス最適化

### データローダー

- **ファイルキャッシュ**: 更新時刻をチェックして不要な読み込みを回避
- **`@lru_cache`**: Pythonの標準キャッシュ機能を使用

### スクレイピング

- **非同期処理**: aiohttpで複数リクエストを並行処理
- **セマフォ**: 同時接続数を制限（デフォルト5）
- **レート制限**: サーバー負荷を考慮

---

## セキュリティ

### CORS設定

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に設定
    allow_methods=["GET"],
    allow_headers=["*"],
)
```

**本番環境での推奨設定:**
```python
allow_origins=["https://yourdomain.com"]
```

### User-Agent

スクレイピング時に適切なUser-Agentを設定:
```python
headers = {
    'User-Agent': 'Mozilla/5.0 (compatible; DisneyMenuScraper/1.0; +https://github.com/kimshow/disneymenu)'
}
```

---

## トラブルシューティング

### スクレイピングがタイムアウトする

```bash
# タイムアウト時間を延長
# scripts/scrape_menus.py の timeout 設定を変更
timeout=aiohttp.ClientTimeout(total=60)  # → 120に変更
```

### データが読み込まれない

```bash
# ファイルの存在確認
ls -la data/menus.json

# JSONの妥当性チェック
python -m json.tool data/menus.json
```

### APIが起動しない

```bash
# 依存関係の再インストール
pip install -r requirements.txt

# ポート競合チェック
lsof -i :8000
```

---

## ライセンスと注意事項

このプロジェクトは非公式のファンプロジェクトです。東京ディズニーリゾートとは一切関係ありません。

**スクレイピングガイドライン:**
- ✅ robots.txt 確認済み
- ✅ レート制限遵守（1秒1リクエスト）
- ✅ 実行頻度制限（週1回推奨）
- ✅ User-Agent設定済み
