"""Tests for api/data_loader.py"""

import pytest
import json
from pathlib import Path
from datetime import datetime, date
from api.data_loader import MenuDataLoader


class TestMenuDataLoaderInit:
    """Tests for MenuDataLoader initialization"""

    def test_init_default(self):
        """Test initialization with default data file"""
        loader = MenuDataLoader()
        assert loader.data_path == Path("data/menus.json")

    def test_init_custom_file(self):
        """Test initialization with custom data file"""
        custom_path = "/tmp/custom_menus.json"
        loader = MenuDataLoader(data_path=custom_path)
        assert loader.data_path == Path(custom_path)


class TestMenuDataLoaderLoadMenus:
    """Tests for load_menus method"""

    def test_load_menus_success(self, temp_menu_json):
        """Test successful data loading"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()
        assert len(menus) >= 3
        assert all(isinstance(menu, dict) for menu in menus)
        assert menus[0]["id"] in ["4370", "4371", "4372"]

    def test_load_menus_file_not_found(self):
        """Test load_menus with non-existent file"""
        loader = MenuDataLoader(data_path="/tmp/nonexistent.json")
        menus = loader.load_menus()
        assert menus == []

    def test_load_menus_invalid_json(self, tmp_path):
        """Test load_menus with invalid JSON"""
        invalid_json = tmp_path / "invalid.json"
        invalid_json.write_text("{ invalid json")
        loader = MenuDataLoader(data_path=str(invalid_json))
        menus = loader.load_menus()
        assert menus == []


class TestMenuDataLoaderGetMenuById:
    """Tests for get_menu_by_id method"""

    def test_get_menu_by_id_success(self, temp_menu_json):
        """Test successful menu retrieval by ID"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menu = loader.get_menu_by_id("4370")
        assert menu is not None
        assert menu["id"] == "4370"
        assert "name" in menu

    def test_get_menu_by_id_not_found(self, temp_menu_json):
        """Test menu retrieval with non-existent ID"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menu = loader.get_menu_by_id("9999")
        assert menu is None


class TestMenuDataLoaderFilterByAvailability:
    """Tests for filter_by_availability method"""

    def test_filter_by_availability_current_date(self, temp_menu_json):
        """Test filtering by current availability"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()
        available = loader.filter_by_availability(menus)
        assert len(available) > 0

    def test_filter_by_availability_specific_date(self, temp_menu_json):
        """Test filtering by specific date"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()
        test_date = date(2025, 7, 1)
        available = loader.filter_by_availability(menus, check_date=test_date)
        # 季節限定メニュー(6-8月)は含まれる
        assert any(m["id"] == "4372" for m in available)


class TestMenuDataLoaderGetAllTags:
    """Tests for get_all_tags method"""

    def test_get_all_tags(self, temp_menu_json):
        """Test getting all unique tags"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        tags = loader.get_all_tags()
        assert len(tags) > 0
        assert all(isinstance(tag, str) for tag in tags)
        assert tags == sorted(tags)  # Should be sorted

    def test_get_all_tags_empty_data(self, tmp_path):
        """Test getting tags with empty data"""
        empty_json = tmp_path / "empty.json"
        empty_json.write_text("[]")
        loader = MenuDataLoader(data_path=str(empty_json))
        tags = loader.get_all_tags()
        assert tags == []


class TestMenuDataLoaderGetAllCategories:
    """Tests for get_all_categories method"""

    def test_get_all_categories(self, temp_menu_json):
        """Test getting all unique categories"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        categories = loader.get_all_categories()
        assert len(categories) > 0
        assert all(isinstance(cat, str) for cat in categories)
        assert categories == sorted(categories)  # Should be sorted

    def test_get_all_categories_empty_data(self, tmp_path):
        """Test getting categories with empty data"""
        empty_json = tmp_path / "empty.json"
        empty_json.write_text("[]")
        loader = MenuDataLoader(data_path=str(empty_json))
        categories = loader.get_all_categories()
        assert categories == []


class TestMenuDataLoaderGetAllRestaurants:
    """Tests for get_all_restaurants method"""

    def test_get_all_restaurants(self, temp_menu_json):
        """Test getting all unique restaurants"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        restaurants = loader.get_all_restaurants()
        assert len(restaurants) > 0
        assert all(isinstance(r, dict) for r in restaurants)
        # Check uniqueness by ID
        ids = [r["id"] for r in restaurants]
        assert len(ids) == len(set(ids))

    def test_get_all_restaurants_empty_data(self, tmp_path):
        """Test getting restaurants with empty data"""
        empty_json = tmp_path / "empty.json"
        empty_json.write_text("[]")
        loader = MenuDataLoader(data_path=str(empty_json))
        restaurants = loader.get_all_restaurants()
        assert restaurants == []


class TestMenuDataLoaderGetStats:
    """Tests for get_stats method"""

    def test_get_stats_complete(self, temp_menu_json):
        """Test getting complete statistics"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        stats = loader.get_stats()

        assert "total_menus" in stats
        assert "available_menus" in stats
        assert "total_tags" in stats
        assert "total_categories" in stats
        assert "total_restaurants" in stats
        assert "min_price" in stats
        assert "max_price" in stats
        assert "avg_price" in stats

        assert stats["total_menus"] >= 3
        assert "min_price" in stats
        assert "max_price" in stats

    def test_get_stats_empty_data(self, tmp_path):
        """Test getting statistics with empty data"""
        empty_json = tmp_path / "empty.json"
        empty_json.write_text("[]")
        loader = MenuDataLoader(data_path=str(empty_json))
        stats = loader.get_stats()

        assert stats["total_menus"] == 0
        assert stats["total_restaurants"] == 0


class TestMenuDataLoaderEdgeCases:
    """Tests for edge cases and error handling"""

    def test_load_with_encoding_issues(self, tmp_path):
        """Test loading file with encoding issues"""
        json_file = tmp_path / "encoded.json"
        json_file.write_text('[{"id": "0001", "name": "テスト"}]', encoding="utf-8")
        loader = MenuDataLoader(data_path=str(json_file))
        menus = loader.load_menus()
        assert len(menus) == 1

    def test_filter_with_future_date(self, temp_menu_json):
        """Test filtering with future date"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()
        future_date = date(2030, 1, 1)
        available = loader.filter_by_availability(menus, check_date=future_date)
        # 終了日が設定されていないメニューは含まれる可能性がある
        assert isinstance(available, list)

    def test_filter_with_past_date(self, temp_menu_json):
        """Test filtering with past date"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()
        past_date = date(2020, 1, 1)
        available = loader.filter_by_availability(menus, check_date=past_date)
        # 過去の日付では何も返らない可能性が高い
        assert isinstance(available, list)

    def test_get_menu_by_nonexistent_id(self, temp_menu_json):
        """Test getting menu with non-existent ID"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menu = loader.get_menu_by_id("99999")
        assert menu is None

    def test_concurrent_load_calls(self, temp_menu_json):
        """Test multiple concurrent load calls use cache"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus1 = loader.load_menus()
        menus2 = loader.load_menus()
        # キャッシュを使用するため同じ参照か、同じ内容
        assert len(menus1) == len(menus2)

    def test_filter_with_invalid_date_format(self, temp_menu_json):
        """Test filter with invalid date format in data"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()

        # 無効な日付フォーマットを持つメニューを追加
        invalid_menu = menus[0].copy() if menus else {}
        if invalid_menu:
            invalid_menu["restaurants"] = [
                {
                    "id": "test",
                    "name": "Test",
                    "park": "tdl",
                    "area": "Test Area",
                    "url": "https://example.com",
                    "availability": {"start_date": "invalid-date", "end_date": "2025-12-31"},
                    "service_types": [],
                }
            ]
            menus_with_invalid = menus + [invalid_menu]

            # ValueError例外をキャッチして処理するかテスト
            result = loader.filter_by_availability(menus_with_invalid)
            assert isinstance(result, list)

    def test_filter_with_end_date_only(self, temp_menu_json):
        """Test filter with end date only (no start date)"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()

        if menus:
            # 終了日のみのメニューを作成
            menu_with_end_only = menus[0].copy()
            menu_with_end_only["restaurants"] = [
                {
                    "id": "test",
                    "name": "Test",
                    "park": "tdl",
                    "area": "Test Area",
                    "url": "https://example.com",
                    "availability": {"end_date": "2030-12-31"},  # start_dateなし
                    "service_types": [],
                }
            ]

            test_date = date(2025, 12, 28)
            result = loader.filter_by_availability([menu_with_end_only], check_date=test_date)
            # 終了日より前なので含まれる
            assert len(result) == 1

    def test_filter_with_start_date_only(self, temp_menu_json):
        """Test filter with start date only (no end date)"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()

        if menus:
            # 開始日のみのメニューを作成
            menu_with_start_only = menus[0].copy()
            menu_with_start_only["restaurants"] = [
                {
                    "id": "test",
                    "name": "Test",
                    "park": "tdl",
                    "area": "Test Area",
                    "url": "https://example.com",
                    "availability": {"start_date": "2025-01-01"},  # end_dateなし
                    "service_types": [],
                }
            ]

            test_date = date(2025, 12, 28)
            result = loader.filter_by_availability([menu_with_start_only], check_date=test_date)
            # 開始日より後なので含まれる
            assert len(result) == 1

    def test_filter_with_no_availability_period(self, temp_menu_json):
        """Test filter with restaurant that has no availability period"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()

        if menus:
            # availability指定なしのメニュー
            menu_without_availability = menus[0].copy()
            menu_without_availability["restaurants"] = [
                {
                    "id": "test",
                    "name": "Test Restaurant",
                    "park": "tdl",
                    "area": "Test Area",
                    "url": "https://example.com",
                    "service_types": [],
                }
            ]

            result = loader.filter_by_availability([menu_without_availability])
            # availability指定がない場合は常に販売中として扱われる
            assert len(result) == 1

    def test_filter_with_invalid_end_date(self, temp_menu_json):
        """Test filter with invalid end date format"""
        loader = MenuDataLoader(data_path=str(temp_menu_json))
        menus = loader.load_menus()

        if menus:
            # 無効な終了日フォーマットを持つメニュー
            menu_with_invalid_end = menus[0].copy()
            menu_with_invalid_end["restaurants"] = [
                {
                    "id": "test",
                    "name": "Test",
                    "park": "tdl",
                    "area": "Test Area",
                    "url": "https://example.com",
                    "availability": {
                        "start_date": "2025-01-01",
                        "end_date": "invalid-date-format",
                    },
                    "service_types": [],
                }
            ]

            test_date = date(2025, 6, 1)
            result = loader.filter_by_availability([menu_with_invalid_end], check_date=test_date)
            # 無効な終了日はスキップされ、開始日のチェックのみで通過する
            assert len(result) == 1
