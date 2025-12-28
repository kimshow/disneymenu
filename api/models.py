"""
Pydantic models for Disney Menu items
"""

from pydantic import BaseModel, ConfigDict, Field, HttpUrl
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


class ParkType(str, Enum):
    """パーク種別"""

    DISNEYLAND = "tdl"
    DISNEYSEA = "tds"


class ServiceType(str, Enum):
    """サービスタイプ"""

    COUNTER = "カウンターサービス"
    BUFFET = "バフェテリアサービス"
    TABLE = "テーブルサービス"
    MOBILE_ORDER = "モバイルオーダー"


class AvailabilityPeriod(BaseModel):
    """販売期間"""

    start_date: Optional[date] = None
    end_date: Optional[date] = None

    def is_available(self, check_date: Optional[date] = None) -> bool:
        """指定日に販売中かチェック"""
        if check_date is None:
            check_date = date.today()

        if self.start_date and check_date < self.start_date:
            return False
        if self.end_date and check_date > self.end_date:
            return False
        return True


class Restaurant(BaseModel):
    """レストラン情報"""

    id: str = Field(..., description="レストランID (URLから抽出)")
    name: str = Field(..., description="レストラン名")
    park: ParkType = Field(..., description="どちらのパークか")
    area: str = Field(..., description="エリア名（例: トゥモローランド）")
    service_types: List[ServiceType] = Field(default_factory=list)
    url: HttpUrl = Field(..., description="レストラン詳細URL")
    availability: Optional[AvailabilityPeriod] = Field(None, description="このレストランでの販売期間")


class PriceInfo(BaseModel):
    """価格情報"""

    amount: int = Field(..., description="価格（円）")
    unit: str = Field(default="", description="単位（例: '1カップ', '1個'）")
    tax_included: bool = Field(default=True, description="税込かどうか")


class MenuItem(BaseModel):
    """メニューアイテム"""

    # 基本情報
    id: str = Field(..., description="4桁のメニューID")
    name: str = Field(..., description="メニュー名（日本語）")
    description: Optional[str] = Field(None, description="メニュー説明")

    # 価格
    price: PriceInfo

    # 画像
    image_urls: List[HttpUrl] = Field(default_factory=list, description="メニュー画像URL一覧")
    thumbnail_url: Optional[HttpUrl] = Field(None, description="サムネイル画像URL")

    # 販売情報
    restaurants: List[Restaurant] = Field(default_factory=list, description="販売店舗一覧")

    # カテゴリとタグ
    categories: List[str] = Field(default_factory=list, description="カテゴリ（例: デザート／スウィーツ）")
    tags: List[str] = Field(default_factory=list, description="タグ（例: キャラクターモチーフ、季節限定）")
    characters: List[str] = Field(default_factory=list, description="関連キャラクター（例: トイ・ストーリー）")

    # アレルギー・栄養情報
    allergens: List[str] = Field(default_factory=list, description="アレルゲン情報")
    nutritional_info: Optional[dict] = Field(None, description="栄養成分情報")

    # メタデータ
    source_url: HttpUrl = Field(..., description="元ページURL")
    scraped_at: datetime = Field(default_factory=datetime.now, description="スクレイピング日時")
    last_updated: Optional[datetime] = Field(None, description="最終更新日時")

    # ステータス
    is_seasonal: bool = Field(default=False, description="季節限定商品か")
    is_new: bool = Field(default=False, description="新商品か")
    is_available: bool = Field(default=True, description="現在販売中か")

    model_config = ConfigDict(
        use_enum_values=True,
        json_schema_extra={
            "example": {
                "id": "1779",
                "name": "リトルグリーンまん",
                "description": "トイ・ストーリーのリトルグリーンメンをモチーフにした中華まん",
                "price": {"amount": 400, "unit": "1カップ"},
                "image_urls": ["https://media1.tokyodisneyresort.jp/food_menu/image/1779_1.34_1_C2w75656.jpg"],
                "restaurants": [
                    {
                        "id": "335",
                        "name": "プラザパビリオン・レストラン",
                        "park": "tdl",
                        "area": "ウエスタンランド",
                        "url": "https://www.tokyodisneyresort.jp/tdl/restaurant/detail/335/",
                    }
                ],
                "categories": ["デザート／スウィーツ", "スナック"],
                "tags": ["キャラクターモチーフのメニュー", "～500円"],
                "characters": ["トイ・ストーリー", "ピクサー"],
                "source_url": "https://www.tokyodisneyresort.jp/food/1779/",
                "is_seasonal": False,
            }
        },
    )
