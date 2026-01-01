"""
FastAPI application for Disney Menu API
"""

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from api.data_loader import MenuDataLoader
from api.models import MenuItem, ParkType
from api.constants import TAG_CATEGORIES, CATEGORY_LABELS, MENU_CATEGORIES

app = FastAPI(title="Disney Menu API", description="API for browsing Tokyo Disney Resort food menus", version="1.0.0")

# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 本番環境では適切に設定
    allow_methods=["GET"],
    allow_headers=["*"],
)

# データローダー
loader = MenuDataLoader()


class MenuListResponse(BaseModel):
    """メニュー一覧レスポンス"""

    success: bool = True
    data: List[dict]
    meta: dict


class MenuResponse(BaseModel):
    """単一メニューレスポンス"""

    success: bool = True
    data: dict


class ListResponse(BaseModel):
    """リストレスポンス（タグ、レストラン等）"""

    success: bool = True
    data: List[dict] | List[str]


class StatsResponse(BaseModel):
    """統計情報レスポンス"""

    success: bool = True
    data: dict


@app.get("/", tags=["Root"])
async def root():
    """API ルート"""
    return {
        "message": "Disney Menu API",
        "version": "1.0.0",
        "endpoints": {
            "menus": "/api/menus",
            "menu_by_id": "/api/menus/{id}",
            "restaurants": "/api/restaurants",
            "tags": "/api/tags",
            "categories": "/api/categories",
            "stats": "/api/stats",
        },
    }


@app.get("/api/menus", response_model=MenuListResponse, tags=["Menus"])
async def get_menus(
    q: Optional[str] = Query(None, description="検索クエリ（名前、説明）"),
    tags: Optional[str] = Query(None, description="タグフィルタ（カンマ区切り）"),
    categories: Optional[str] = Query(None, description="カテゴリフィルタ（カンマ区切り）"),
    min_price: Optional[int] = Query(None, ge=0, description="最小価格"),
    max_price: Optional[int] = Query(None, ge=0, description="最大価格"),
    park: Optional[ParkType] = Query(None, description="パークフィルタ（tdl/tds）"),
    area: Optional[str] = Query(None, description="エリアフィルタ"),
    character: Optional[str] = Query(None, description="キャラクターフィルタ"),
    only_available: bool = Query(False, description="販売中のみ（デフォルト: すべて表示）"),
    sort: Optional[str] = Query(None, description="ソート項目 (price, name, scraped_at)"),
    order: Optional[str] = Query("asc", description="ソート順 (asc, desc)"),
    page: int = Query(1, ge=1, description="ページ番号"),
    limit: int = Query(50, ge=1, le=100, description="1ページあたりの件数"),
):
    """
    メニュー一覧を取得

    各種フィルタリングとページネーションに対応
    """
    menus = loader.load_menus()

    # デバッグログ
    print(f"[API /menus] Total loaded: {len(menus)}, only_available: {only_available}, page: {page}, limit: {limit}")

    # 販売中のみフィルタ
    if only_available:
        menus = loader.filter_by_availability(menus)
        print(f"[API /menus] After availability filter: {len(menus)}")

    # 検索フィルタ
    if q:
        q_lower = q.lower()
        menus = [m for m in menus if q_lower in m["name"].lower() or q_lower in m.get("description", "").lower()]

    # タグフィルタ
    if tags:
        tag_list = [t.strip() for t in tags.split(",")]
        menus = [m for m in menus if any(tag in m.get("tags", []) for tag in tag_list)]

    # カテゴリフィルタ（category フィールドと照合）
    if categories:
        category_list = [c.strip() for c in categories.split(",")]
        menus = [m for m in menus if m.get("category") in category_list]

    # 価格フィルタ
    if min_price is not None:
        menus = [m for m in menus if m["price"]["amount"] >= min_price]
    if max_price is not None:
        menus = [m for m in menus if m["price"]["amount"] <= max_price]

    # パークフィルタ
    if park:
        menus = [m for m in menus if any(r["park"] == park for r in m.get("restaurants", []))]

    # エリアフィルタ
    if area:
        menus = [m for m in menus if any(area.lower() in r["area"].lower() for r in m.get("restaurants", []))]

    # キャラクターフィルタ
    if character:
        menus = [m for m in menus if any(character.lower() in c.lower() for c in m.get("characters", []))]

    # ソート処理
    if sort:
        reverse = order == "desc"
        if sort == "price":
            menus = sorted(menus, key=lambda x: x["price"]["amount"], reverse=reverse)
        elif sort == "name":
            menus = sorted(menus, key=lambda x: x["name"], reverse=reverse)
        elif sort == "scraped_at":
            menus = sorted(menus, key=lambda x: x.get("scraped_at", ""), reverse=reverse)

    # ページネーション
    total = len(menus)
    start = (page - 1) * limit
    end = start + limit
    paginated_menus = menus[start:end]

    return MenuListResponse(
        data=paginated_menus, meta={"total": total, "page": page, "limit": limit, "pages": (total + limit - 1) // limit}
    )


@app.get("/api/menus/{menu_id}", response_model=MenuResponse, tags=["Menus"])
async def get_menu(menu_id: str):
    """
    特定のメニューを取得

    Args:
        menu_id: メニューID（4桁）
    """
    menu = loader.get_menu_by_id(menu_id)

    if not menu:
        raise HTTPException(status_code=404, detail="Menu not found")

    return MenuResponse(data=menu)


@app.get("/api/restaurants", response_model=ListResponse, tags=["Restaurants"])
async def get_restaurants(park: Optional[ParkType] = Query(None, description="パークフィルタ（tdl/tds）")):
    """
    レストラン一覧を取得
    """
    restaurants = loader.get_all_restaurants()

    # パークフィルタ
    if park:
        restaurants = [r for r in restaurants if r["park"] == park]

    # エリアでソート
    restaurants = sorted(restaurants, key=lambda r: (r["park"], r["area"], r["name"]))

    return ListResponse(data=restaurants)


@app.get("/api/tags", response_model=ListResponse, tags=["Tags"])
async def get_tags():
    """
    タグ一覧を取得
    """
    tags = loader.get_all_tags()
    return ListResponse(data=tags)


@app.get("/api/categories", response_model=ListResponse, tags=["Categories"])
async def get_categories():
    """
    カテゴリ一覧を取得
    """
    categories = loader.get_all_categories()
    return ListResponse(data=categories)


@app.get("/api/tags/grouped", tags=["Tags"])
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
    menus = loader.load_menus()

    # カテゴリごとのタグを格納
    all_tags_by_category: Dict[str, set] = {category: set() for category in TAG_CATEGORIES.keys()}
    all_tags_by_category["area"] = set()
    all_tags_by_category["restaurant"] = set()

    for menu in menus:
        tags = menu.get("tags", [])

        # 各カテゴリに分類
        for tag in tags:
            categorized = False

            # 定義済みカテゴリに分類
            for category, category_tags in TAG_CATEGORIES.items():
                if tag in category_tags:
                    all_tags_by_category[category].add(tag)
                    categorized = True
                    break

            if categorized:
                continue

            # エリアタグの判定
            for restaurant in menu.get("restaurants", []):
                if tag == restaurant.get("area"):
                    all_tags_by_category["area"].add(tag)
                    categorized = True
                    break

            if categorized:
                continue

            # レストランタグの判定
            for restaurant in menu.get("restaurants", []):
                if tag == restaurant.get("name"):
                    all_tags_by_category["restaurant"].add(tag)
                    categorized = True
                    break

    # レスポンス構築
    result = {}
    for category, tags in all_tags_by_category.items():
        if tags:  # タグが存在する場合のみ含める
            result[category] = {
                "label": CATEGORY_LABELS.get(category, category),
                "tags": sorted(list(tags)),  # アルファベット順にソート
            }

    return result


@app.get("/api/categories", response_model=ListResponse, tags=["Categories"])
async def get_categories():
    """
    メニューカテゴリ一覧とそれぞれのメニュー数を取得
    """
    from collections import Counter

    menus = loader.load_menus()
    category_counts = Counter(menu.get("category", "other") for menu in menus)

    categories = []
    for key, info in MENU_CATEGORIES.items():
        categories.append(
            {
                "key": key,
                "label": info["label"],
                "description": info["description"],
                "count": category_counts.get(key, 0),
            }
        )

    return ListResponse(data=categories)


@app.get("/api/stats", response_model=StatsResponse, tags=["Stats"])
async def get_stats():
    """
    統計情報を取得
    """
    stats = loader.get_stats()
    return StatsResponse(data=stats)


# Vercel用のハンドラー
handler = app
