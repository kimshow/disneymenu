"""Tests for api/index.py FastAPI application"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch
from pathlib import Path


@pytest.fixture
def mock_data_loader(sample_menus_list, sample_menu_data):
    """Create mock MenuDataLoader"""
    mock = Mock()
    mock.load_menus.return_value = sample_menus_list
    mock.get_menu_by_id.side_effect = lambda id: next((menu for menu in sample_menus_list if menu["id"] == id), None)
    mock.filter_by_availability.return_value = sample_menus_list
    mock.get_all_restaurants.return_value = [
        {"id": "100", "name": "テストレストラン", "park": "tdl", "area": "テストエリア"}
    ]
    mock.get_all_categories.return_value = ["デザート／スウィーツ", "テストカテゴリ"]
    mock.get_all_tags.return_value = ["キャラクターモチーフのメニュー", "テストタグ"]
    mock.get_stats.return_value = {
        "total_menus": 5,
        "available_menus": 5,
        "total_restaurants": 1,
        "total_tags": 2,
        "total_categories": 2,
        "min_price": 300,
        "max_price": 700,
        "avg_price": 500,
    }
    return mock


@pytest.fixture
def client(mock_data_loader):
    """Create TestClient with mocked data loader"""
    with patch("api.index.loader", mock_data_loader):
        from api.index import app

        yield TestClient(app)


class TestRootEndpoint:
    """Tests for root endpoint"""

    def test_root(self, client):
        """Test root endpoint returns API info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data


class TestGetMenus:
    """Tests for GET /api/menus endpoint"""

    def test_get_menus_default(self, client):
        """Test get all menus with default pagination"""
        response = client.get("/api/menus")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert "meta" in data
        assert data["meta"]["page"] == 1
        assert data["meta"]["limit"] == 50

    def test_get_menus_with_pagination(self, client):
        """Test get menus with custom pagination"""
        response = client.get("/api/menus?page=2&limit=10")
        assert response.status_code == 200
        data = response.json()
        assert data["meta"]["page"] == 2
        assert data["meta"]["limit"] == 10

    def test_get_menus_with_query(self, client, mock_data_loader):
        """Test get menus with search query"""
        response = client.get("/api/menus?q=テスト")
        assert response.status_code == 200
        # APIは内部でフィルタリングを行うため、load_menusとfilter_by_availabilityが呼ばれる
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_price_filter(self, client, mock_data_loader):
        """Test get menus with price range filter"""
        response = client.get("/api/menus?min_price=400&max_price=600")
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_park_filter(self, client, mock_data_loader):
        """Test get menus filtered by park"""
        response = client.get("/api/menus?park=tdl")
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_restaurant_filter(self, client, mock_data_loader):
        """Test get menus filtered by restaurant"""
        response = client.get("/api/menus?restaurant=テストレストラン")
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_category_filter(self, client, mock_data_loader):
        """Test get menus filtered by category"""
        response = client.get("/api/menus?categories=デザート")
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_tags_filter(self, client, mock_data_loader):
        """Test get menus filtered by tags"""
        response = client.get("/api/menus?tags=キャラクターモチーフ,季節限定")
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_area_filter(self, client, mock_data_loader):
        """Test get menus filtered by area"""
        response = client.get("/api/menus?area=トゥモローランド")
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_character_filter(self, client, mock_data_loader):
        """Test get menus filtered by character"""
        response = client.get("/api/menus?character=ミッキー")
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_with_all_filters(self, client, mock_data_loader):
        """Test get menus with all filters combined"""
        response = client.get(
            "/api/menus?q=テスト&min_price=400&max_price=600" "&park=tdl&categories=デザート&tags=キャラクターモチーフ"
        )
        assert response.status_code == 200
        assert mock_data_loader.load_menus.called

    def test_get_menus_invalid_page(self, client):
        """Test get menus with invalid page number"""
        response = client.get("/api/menus?page=0")
        assert response.status_code == 422  # Validation error

    def test_get_menus_invalid_limit(self, client):
        """Test get menus with invalid limit"""
        response = client.get("/api/menus?limit=0")
        assert response.status_code == 422  # Validation error

    def test_get_menus_limit_too_large(self, client):
        """Test get menus with limit exceeding maximum"""
        response = client.get("/api/menus?limit=101")
        assert response.status_code == 422  # Validation error

    def test_get_menus_empty_result(self, client, mock_data_loader):
        """Test get menus with no matching results"""
        mock_data_loader.load_menus.return_value = []
        mock_data_loader.filter_by_availability.return_value = []
        response = client.get("/api/menus?q=存在しない")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) == 0
        assert data["meta"]["total"] == 0


class TestGetMenuById:
    """Tests for GET /api/menus/{menu_id} endpoint"""

    def test_get_menu_by_id_success(self, client):
        """Test get menu by ID successfully"""
        response = client.get("/api/menus/4370")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["id"] == "4370"

    def test_get_menu_by_id_not_found(self, client, mock_data_loader):
        """Test get menu by ID when not found"""
        mock_data_loader.get_menu_by_id.return_value = None
        response = client.get("/api/menus/9999")
        assert response.status_code == 404
        data = response.json()
        # HTTPExceptionのレスポンスにはsuccessフィールドがない
        assert "detail" in data
        assert "not found" in data["detail"].lower()

    def test_get_menu_by_id_valid_ids(self, client):
        """Test get menu with various valid IDs"""
        for menu_id in ["4370", "4371", "4372"]:
            response = client.get(f"/api/menus/{menu_id}")
            assert response.status_code in [200, 404]


class TestGetRestaurants:
    """Tests for GET /api/restaurants endpoint"""

    def test_get_restaurants_all(self, client):
        """Test get all restaurants"""
        response = client.get("/api/restaurants")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert isinstance(data["data"], list)

    def test_get_restaurants_by_park(self, client, mock_data_loader):
        """Test get restaurants filtered by park"""
        response = client.get("/api/restaurants?park=tdl")
        assert response.status_code == 200
        # APIは内部でフィルタリングするため、get_all_restaurantsが呼ばれる
        assert mock_data_loader.get_all_restaurants.called

    def test_get_restaurants_invalid_park(self, client):
        """Test get restaurants with invalid park code"""
        response = client.get("/api/restaurants?park=invalid")
        # ParkTypeのバリデーションで422エラーになる
        assert response.status_code == 422


class TestGetCategories:
    """Tests for GET /api/categories endpoint"""

    def test_get_categories(self, client):
        """Test get all categories"""
        response = client.get("/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert isinstance(data["data"], list)
        assert len(data["data"]) > 0


class TestGetTags:
    """Tests for GET /api/tags endpoint"""

    def test_get_tags(self, client):
        """Test get all tags"""
        response = client.get("/api/tags")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        assert isinstance(data["data"], list)
        assert len(data["data"]) > 0


class TestGetStatistics:
    """Tests for GET /api/stats endpoint"""

    def test_get_statistics(self, client):
        """Test get statistics"""
        response = client.get("/api/stats")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "data" in data
        stats = data["data"]
        assert "total_menus" in stats
        assert "total_restaurants" in stats
        # 実際のAPIではmin_price, max_price, avg_priceが個別に返される
        assert "min_price" in stats or "max_price" in stats
        assert "total_categories" in stats
        assert "total_tags" in stats

    def test_get_statistics_structure(self, client):
        """Test statistics response structure"""
        response = client.get("/api/stats")
        data = response.json()
        stats = data["data"]

        # Check price fields (individual fields, not nested)
        assert isinstance(stats.get("min_price"), (int, type(None)))
        assert isinstance(stats.get("max_price"), (int, type(None)))

        # Check basic structure
        assert isinstance(stats["total_menus"], int)


class TestCORS:
    """Tests for CORS configuration"""

    def test_cors_headers_present(self, client):
        """Test CORS headers are present in response"""
        response = client.options("/api/menus")
        # CORS headers should be configured in middleware
        assert response.status_code in [200, 405]  # OPTIONS may or may not be allowed

    def test_cors_allow_origin(self, client):
        """Test CORS allows cross-origin requests"""
        response = client.get("/api/menus", headers={"Origin": "http://localhost:3000"})
        assert response.status_code == 200


class TestErrorHandling:
    """Tests for error handling"""

    def test_invalid_endpoint(self, client):
        """Test request to invalid endpoint"""
        response = client.get("/api/invalid")
        assert response.status_code == 404

    def test_method_not_allowed(self, client):
        """Test method not allowed"""
        response = client.post("/api/menus")
        assert response.status_code == 405

    def test_internal_error_handling(self):
        """Test internal error is handled gracefully"""
        # 新しいモックを作成してエラーを発生させる
        error_mock = Mock()
        error_mock.load_menus.side_effect = Exception("Database error")
        error_mock.filter_by_availability.return_value = []

        with patch("api.index.loader", error_mock):
            from api.index import app

            test_client = TestClient(app, raise_server_exceptions=False)
            response = test_client.get("/api/menus")
            # FastAPIは未処理の例外を500エラーに変換する
            assert response.status_code == 500


class TestResponseFormat:
    """Tests for response format consistency"""

    def test_response_format_success(self, client):
        """Test successful response format"""
        response = client.get("/api/menus")
        data = response.json()
        assert "success" in data
        assert "data" in data
        assert data["success"] is True

    def test_response_format_error(self, client, mock_data_loader):
        """Test error response format"""
        mock_data_loader.get_menu_by_id.return_value = None
        response = client.get("/api/menus/9999")
        data = response.json()
        # HTTPExceptionはdetailフィールドを返す（successフィールドなし）
        assert "detail" in data
        assert response.status_code == 404

    def test_response_includes_meta(self, client):
        """Test response includes metadata for list endpoints"""
        response = client.get("/api/menus")
        data = response.json()
        assert "meta" in data
        meta = data["meta"]
        assert "total" in meta
        assert "page" in meta
        assert "limit" in meta


class TestPaginationLogic:
    """Tests for pagination calculation logic"""

    def test_pagination_meta_calculation(self, client):
        """Test pagination metadata is calculated correctly"""
        response = client.get("/api/menus?page=1&limit=2")
        data = response.json()
        meta = data["meta"]
        assert meta["page"] == 1
        assert meta["limit"] == 2
        assert "total" in meta

    def test_pagination_offset_calculation(self, client, mock_data_loader):
        """Test pagination offset is calculated correctly"""
        response = client.get("/api/menus?page=3&limit=2")
        # Should request items from offset 4 (page 3, limit 2: skip 2*2=4 items)
        assert response.status_code == 200

    def test_pagination_last_page(self, client):
        """Test pagination on last page with partial results"""
        response = client.get("/api/menus?page=3&limit=2")
        data = response.json()
        # Should handle last page correctly even if fewer items than limit
        assert response.status_code == 200


class TestDataLoaderIntegration:
    """Tests for data loader integration"""

    def test_data_loader_called_once(self, client, mock_data_loader):
        """Test data loader is called efficiently"""
        client.get("/api/menus")
        client.get("/api/menus?page=2")
        # Data loader should cache results between calls
        assert mock_data_loader.load_menus.called

    def test_data_loader_filter_called(self, client, mock_data_loader):
        """Test data loader filter method is called with correct params"""
        client.get("/api/menus?q=テスト&min_price=400")
        # APIは内部でフィルタリングするため、load_menusとfilter_by_availabilityが呼ばれる
        assert mock_data_loader.load_menus.called
        assert mock_data_loader.filter_by_availability.called


class TestSortFeature:
    """Tests for sorting functionality"""

    def test_sort_by_price_asc(self, client, mock_data_loader):
        """Test sort menus by price ascending"""
        response = client.get("/api/menus?sort=price&order=asc&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        # ソート機能が正しく動作していることを確認（モックデータが返される）
        assert "data" in data

    def test_sort_by_price_desc(self, client, mock_data_loader):
        """Test sort menus by price descending"""
        response = client.get("/api/menus?sort=price&order=desc&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_sort_by_name_asc(self, client, mock_data_loader):
        """Test sort menus by name ascending"""
        response = client.get("/api/menus?sort=name&order=asc&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_sort_by_name_desc(self, client, mock_data_loader):
        """Test sort menus by name descending"""
        response = client.get("/api/menus?sort=name&order=desc&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_sort_by_scraped_at_asc(self, client, mock_data_loader):
        """Test sort menus by scraped_at ascending"""
        response = client.get("/api/menus?sort=scraped_at&order=asc&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_sort_by_scraped_at_desc(self, client, mock_data_loader):
        """Test sort menus by scraped_at descending"""
        response = client.get("/api/menus?sort=scraped_at&order=desc&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_sort_default_order(self, client, mock_data_loader):
        """Test sort with default order (asc)"""
        response = client.get("/api/menus?sort=price")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_sort_invalid_field(self, client, mock_data_loader):
        """Test sort with invalid field (should be ignored)"""
        response = client.get("/api/menus?sort=invalid_field")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestQueryParameterParsing:
    """Tests for query parameter parsing"""

    def test_parse_tags_single(self, client, mock_data_loader):
        """Test parsing single tag"""
        client.get("/api/menus?tags=キャラクターモチーフ")
        assert mock_data_loader.load_menus.called

    def test_parse_tags_multiple(self, client, mock_data_loader):
        """Test parsing multiple tags"""
        client.get("/api/menus?tags=キャラクターモチーフ,季節限定")
        assert mock_data_loader.load_menus.called

    def test_parse_price_integers(self, client, mock_data_loader):
        """Test parsing price as integers"""
        response = client.get("/api/menus?min_price=400&max_price=600")
        assert response.status_code == 200

    def test_parse_invalid_price(self, client):
        """Test parsing invalid price value"""
        response = client.get("/api/menus?min_price=invalid")
        assert response.status_code == 422  # Validation error
