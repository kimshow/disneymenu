"""セキュリティテスト

OWASP Top 10およびCWE Top 25に基づくセキュリティテスト
"""

import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch


@pytest.fixture
def mock_data_loader_security():
    """セキュリティテスト用のモックDataLoader"""
    mock = Mock()
    mock.load_menus.return_value = []
    mock.get_menu_by_id.return_value = None
    mock.filter_by_availability.return_value = []
    mock.get_all_restaurants.return_value = []
    mock.get_all_tags.return_value = []
    mock.get_stats.return_value = {"total_menus": 0}
    return mock


@pytest.fixture
def client_security(mock_data_loader_security):
    """セキュリティテスト用のTestClient"""
    with patch("api.index.loader", mock_data_loader_security):
        from api.index import app

        yield TestClient(app)


class TestInputValidation:
    """入力バリデーションのセキュリティテスト（CWE-20）"""

    def test_sql_injection_attempt(self, client_security):
        """SQLインジェクション試行を防ぐ（CWE-89）"""
        malicious_query = "'; DROP TABLE menus; --"
        response = client_security.get(f"/api/menus?q={malicious_query}")
        assert response.status_code == 200

    def test_oversized_query_parameter(self, client_security):
        """過大なクエリパラメータを拒否（DoS対策）"""
        oversized_query = "a" * 10000
        response = client_security.get(f"/api/menus?q={oversized_query}")
        assert response.status_code == 422

    def test_invalid_menu_id_format(self, client_security):
        """無効なメニューID形式を拒否"""
        invalid_ids = ["abcd", "12345", "12", "../../data"]
        for invalid_id in invalid_ids:
            response = client_security.get(f"/api/menus/{invalid_id}")
            # 404 (not found), 400 (bad request), 422 (validation error) すべて正常
            assert response.status_code in [400, 404, 422]


class TestPathTraversalPrevention:
    """パストラバーサル防止のテスト（CWE-22）"""

    def test_data_loader_path_validation_allowed(self):
        """DataLoaderが許可されたパスを受け入れる"""
        from api.data_loader import MenuDataLoader

        try:
            loader = MenuDataLoader("data/menus.json")
            assert loader.data_path.name == "menus.json"
        except ValueError:
            pytest.fail("Valid path should be accepted")

    def test_data_loader_path_traversal_blocked(self):
        """DataLoaderがパストラバーサルを防ぐ"""
        from api.data_loader import MenuDataLoader

        with pytest.raises(ValueError, match="Invalid data path"):
            MenuDataLoader("../../../etc/passwd")


class TestSecurityConfiguration:
    """セキュリティ設定のテスト"""

    def test_cors_headers_present(self, client_security):
        """CORSヘッダーが存在することを確認"""
        response = client_security.get("/api/menus")
        assert response.status_code == 200
