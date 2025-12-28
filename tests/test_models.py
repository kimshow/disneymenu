"""Tests for api/models.py"""

import pytest
from datetime import date, datetime
from pydantic import ValidationError
from api.models import ParkType, ServiceType, AvailabilityPeriod, PriceInfo, Restaurant, MenuItem


class TestParkType:
    """Tests for ParkType enum"""

    def test_disneyland_value(self):
        """Test Disneyland park type value"""
        assert ParkType.DISNEYLAND == "tdl"
        assert ParkType.DISNEYLAND.value == "tdl"

    def test_disneysea_value(self):
        """Test DisneySea park type value"""
        assert ParkType.DISNEYSEA == "tds"
        assert ParkType.DISNEYSEA.value == "tds"


class TestServiceType:
    """Tests for ServiceType enum"""

    def test_counter_value(self):
        assert ServiceType.COUNTER == "カウンターサービス"

    def test_buffet_value(self):
        assert ServiceType.BUFFET == "バフェテリアサービス"

    def test_table_value(self):
        assert ServiceType.TABLE == "テーブルサービス"

    def test_mobile_order_value(self):
        assert ServiceType.MOBILE_ORDER == "モバイルオーダー"


class TestAvailabilityPeriod:
    """Tests for AvailabilityPeriod model"""

    def test_create_with_both_dates(self):
        """Test creation with start and end dates"""
        period = AvailabilityPeriod(start_date=date(2025, 1, 1), end_date=date(2025, 12, 31))
        assert period.start_date == date(2025, 1, 1)
        assert period.end_date == date(2025, 12, 31)

    def test_create_with_start_date_only(self):
        """Test creation with start date only"""
        period = AvailabilityPeriod(start_date=date(2025, 1, 1))
        assert period.start_date == date(2025, 1, 1)
        assert period.end_date is None

    def test_create_with_no_dates(self):
        """Test creation with no dates (always available)"""
        period = AvailabilityPeriod()
        assert period.start_date is None
        assert period.end_date is None

    def test_is_available_within_period(self):
        """Test is_available returns True for date within period"""
        period = AvailabilityPeriod(start_date=date(2025, 1, 1), end_date=date(2025, 12, 31))
        assert period.is_available(date(2025, 6, 15)) is True

    def test_is_available_before_start(self):
        """Test is_available returns False for date before start"""
        period = AvailabilityPeriod(start_date=date(2025, 6, 1), end_date=date(2025, 12, 31))
        assert period.is_available(date(2025, 5, 31)) is False

    def test_is_available_after_end(self):
        """Test is_available returns False for date after end"""
        period = AvailabilityPeriod(start_date=date(2025, 1, 1), end_date=date(2025, 6, 30))
        assert period.is_available(date(2025, 7, 1)) is False

    def test_is_available_no_start_date(self):
        """Test is_available with no start date"""
        period = AvailabilityPeriod(end_date=date(2025, 12, 31))
        assert period.is_available(date(2025, 6, 15)) is True

    def test_is_available_no_end_date(self):
        """Test is_available with no end date"""
        period = AvailabilityPeriod(start_date=date(2025, 1, 1))
        assert period.is_available(date(2026, 6, 15)) is True

    def test_is_available_no_dates(self):
        """Test is_available with no dates (always available)"""
        period = AvailabilityPeriod()
        assert period.is_available(date(2025, 6, 15)) is True

    def test_is_available_default_today(self):
        """Test is_available uses today's date by default"""
        period = AvailabilityPeriod()
        assert period.is_available() is True


class TestPriceInfo:
    """Tests for PriceInfo model"""

    def test_create_with_all_fields(self):
        """Test creation with all fields"""
        price = PriceInfo(amount=500, unit="1個", tax_included=True)
        assert price.amount == 500
        assert price.unit == "1個"
        assert price.tax_included is True

    def test_create_with_defaults(self):
        """Test creation with default values"""
        price = PriceInfo(amount=500)
        assert price.amount == 500
        assert price.unit == ""
        assert price.tax_included is True

    def test_create_with_tax_excluded(self):
        """Test creation with tax excluded"""
        price = PriceInfo(amount=500, tax_included=False)
        assert price.tax_included is False

    def test_validation_requires_amount(self):
        """Test validation requires amount field"""
        with pytest.raises(ValidationError):
            PriceInfo()


class TestRestaurant:
    """Tests for Restaurant model"""

    def test_create_with_all_fields(self):
        """Test creation with all fields"""
        availability = AvailabilityPeriod(start_date=date(2025, 1, 1), end_date=date(2025, 12, 31))
        restaurant = Restaurant(
            id="100",
            name="テストレストラン",
            park=ParkType.DISNEYLAND,
            area="トゥモローランド",
            service_types=[ServiceType.COUNTER],
            url="https://www.tokyodisneyresort.jp/tdl/restaurant/detail/100/",
            availability=availability,
        )
        assert restaurant.id == "100"
        assert restaurant.name == "テストレストラン"
        assert restaurant.park == ParkType.DISNEYLAND
        assert restaurant.area == "トゥモローランド"
        assert len(restaurant.service_types) == 1
        assert restaurant.availability == availability

    def test_create_with_defaults(self):
        """Test creation with default values"""
        restaurant = Restaurant(
            id="100",
            name="テストレストラン",
            park=ParkType.DISNEYLAND,
            area="トゥモローランド",
            url="https://www.tokyodisneyresort.jp/tdl/restaurant/detail/100/",
        )
        assert restaurant.service_types == []
        assert restaurant.availability is None

    def test_park_serialization(self):
        """Test park enum serialization"""
        restaurant = Restaurant(
            id="100",
            name="テストレストラン",
            park=ParkType.DISNEYLAND,
            area="トゥモローランド",
            url="https://www.tokyodisneyresort.jp/tdl/restaurant/detail/100/",
        )
        data = restaurant.model_dump()
        assert data["park"] == "tdl"

    def test_validation_invalid_url(self):
        """Test validation fails for invalid URL"""
        with pytest.raises(ValidationError):
            Restaurant(
                id="100",
                name="テストレストラン",
                park=ParkType.DISNEYLAND,
                area="トゥモローランド",
                url="not-a-valid-url",
            )


class TestMenuItem:
    """Tests for MenuItem model"""

    def test_create_minimal(self):
        """Test creation with minimal required fields"""
        price = PriceInfo(amount=500)
        menu = MenuItem(
            id="4370", name="テストメニュー", price=price, source_url="https://www.tokyodisneyresort.jp/food/4370/"
        )
        assert menu.id == "4370"
        assert menu.name == "テストメニュー"
        assert menu.price.amount == 500
        assert str(menu.source_url) == "https://www.tokyodisneyresort.jp/food/4370/"

    def test_create_with_all_fields(self):
        """Test creation with all fields"""
        price = PriceInfo(amount=500, unit="1個")
        restaurant = Restaurant(
            id="100",
            name="テストレストラン",
            park=ParkType.DISNEYLAND,
            area="トゥモローランド",
            url="https://www.tokyodisneyresort.jp/tdl/restaurant/detail/100/",
        )
        menu = MenuItem(
            id="4370",
            name="テストメニュー",
            description="テスト用メニュー",
            price=price,
            image_urls=["https://example.com/image.jpg"],
            thumbnail_url="https://example.com/thumb.jpg",
            restaurants=[restaurant],
            categories=["デザート／スウィーツ"],
            tags=["キャラクターモチーフ"],
            characters=["ミッキー"],
            allergens=["卵", "乳"],
            nutritional_info={"calories": 300},
            source_url="https://www.tokyodisneyresort.jp/food/4370/",
            scraped_at=datetime(2025, 12, 28, 12, 0, 0),
            last_updated=datetime(2025, 12, 28, 12, 0, 0),
            is_seasonal=True,
            is_new=True,
            is_available=True,
        )
        assert menu.description == "テスト用メニュー"
        assert len(menu.image_urls) == 1
        assert len(menu.restaurants) == 1
        assert len(menu.categories) == 1
        assert len(menu.tags) == 1
        assert len(menu.characters) == 1
        assert len(menu.allergens) == 2
        assert menu.nutritional_info == {"calories": 300}
        assert menu.is_seasonal is True
        assert menu.is_new is True

    def test_default_values(self):
        """Test default field values"""
        price = PriceInfo(amount=500)
        menu = MenuItem(
            id="4370", name="テストメニュー", price=price, source_url="https://www.tokyodisneyresort.jp/food/4370/"
        )
        assert menu.description is None
        assert menu.image_urls == []
        assert menu.thumbnail_url is None
        assert menu.restaurants == []
        assert menu.categories == []
        assert menu.tags == []
        assert menu.characters == []
        assert menu.allergens == []
        assert menu.nutritional_info is None
        assert menu.last_updated is None
        assert menu.is_seasonal is False
        assert menu.is_new is False
        assert menu.is_available is True

    def test_json_serialization(self):
        """Test JSON serialization"""
        price = PriceInfo(amount=500)
        menu = MenuItem(
            id="4370", name="テストメニュー", price=price, source_url="https://www.tokyodisneyresort.jp/food/4370/"
        )
        json_str = menu.model_dump_json()
        assert "4370" in json_str
        assert "テストメニュー" in json_str

    def test_json_deserialization(self):
        """Test JSON deserialization"""
        json_data = """
        {
            "id": "4370",
            "name": "テストメニュー",
            "price": {"amount": 500, "unit": "", "tax_included": true},
            "source_url": "https://www.tokyodisneyresort.jp/food/4370/",
            "scraped_at": "2025-12-28T12:00:00",
            "image_urls": [],
            "restaurants": [],
            "categories": [],
            "tags": [],
            "characters": [],
            "allergens": [],
            "is_seasonal": false,
            "is_new": false,
            "is_available": true
        }
        """
        menu = MenuItem.model_validate_json(json_data)
        assert menu.id == "4370"
        assert menu.name == "テストメニュー"
        assert menu.price.amount == 500

    def test_validation_requires_fields(self):
        """Test validation requires essential fields"""
        with pytest.raises(ValidationError):
            MenuItem()

    def test_validation_invalid_image_url(self):
        """Test validation fails for invalid image URL"""
        price = PriceInfo(amount=500)
        with pytest.raises(ValidationError):
            MenuItem(
                id="4370",
                name="テストメニュー",
                price=price,
                image_urls=["not-a-valid-url"],
                source_url="https://www.tokyodisneyresort.jp/food/4370/",
            )
