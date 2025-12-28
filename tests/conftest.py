"""Pytest configuration and fixtures"""

import pytest
import json
from pathlib import Path
from datetime import date, datetime


@pytest.fixture
def sample_menu_data():
    """Sample menu item data for testing"""
    return {
        "id": "4370",
        "name": "テストメニュー",
        "description": "テスト用の説明文",
        "price": {"amount": 500, "unit": "1個", "tax_included": True},
        "image_urls": ["https://example.com/image1.jpg"],
        "thumbnail_url": "https://example.com/thumb.jpg",
        "restaurants": [
            {
                "id": "100",
                "name": "テストレストラン",
                "park": "tdl",
                "area": "テストエリア",
                "url": "https://www.tokyodisneyresort.jp/tdl/restaurant/detail/100/",
                "service_types": [],
                "availability": {"start_date": "2025-01-01", "end_date": "2025-12-31"},
            }
        ],
        "categories": ["テストカテゴリ"],
        "tags": ["テストタグ"],
        "characters": ["テストキャラクター"],
        "allergens": [],
        "nutritional_info": None,
        "source_url": "https://www.tokyodisneyresort.jp/food/4370/",
        "scraped_at": "2025-12-28T12:00:00",
        "last_updated": None,
        "is_seasonal": False,
        "is_new": False,
        "is_available": True,
    }


@pytest.fixture
def sample_menus_list(sample_menu_data):
    """List of sample menu items"""
    menus = []
    for i in range(5):
        menu = sample_menu_data.copy()
        menu["id"] = f"437{i}"
        menu["name"] = f"テストメニュー{i}"
        menu["price"] = {"amount": 300 + i * 100, "unit": "1個", "tax_included": True}
        menus.append(menu)
    return menus


@pytest.fixture
def temp_menu_json():
    """Use actual test menu JSON file"""
    json_file = Path("data/test_menus.json")
    if not json_file.exists():
        pytest.skip("Test data file not found")
    return json_file


@pytest.fixture
def sample_html():
    """Sample HTML content for scraping tests"""
    return r"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="description" content="テストメニューの説明">
        <meta name="keywords" content="東京ディズニーランド,トゥモローランド,デザート／スウィーツ,キャラクターモチーフのメニュー,～500円">
        <meta property="og:image" content="https://example.com/og_image.jpg">
    </head>
    <body>
        <h1 class="heading1">テストメニュー</h1>
        <p class="price">1個 ¥500</p>
        <div class="columnImage">
            <img src="https://example.com/image1.jpg" alt="メニュー画像1">
            <img src="https://example.com/image2.jpg" alt="メニュー画像2">
        </div>
        <div class="linkList7">
            <ul>
                <li>
                    <a href="https://www.tokyodisneyresort.jp/tdl/restaurant/detail/100/">
                        <div class="listTextArea">
                            <h3 class="heading3">テストレストラン</h3>
                            <p>東京ディズニーランド/テストエリア</p>
                            <div class="definitionList">
                                <p>2025年1月1日 ～ 2025年12月31日</p>
                            </div>
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    </body>
    </html>
    """


@pytest.fixture
def sample_html_with_multiple_restaurants():
    """Sample HTML with multiple restaurants for testing"""
    return r"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="description" content="複数店舗で販売されるメニュー">
        <meta name="keywords" content="東京ディズニーランド,東京ディズニーシー,デザート／スウィーツ">
        <meta property="og:image" content="https://example.com/multi.jpg">
    </head>
    <body>
        <h1 class="heading1">マルチ店舗メニュー</h1>
        <p class="price">1個 ¥800</p>
        <div class="linkList7">
            <ul>
                <li>
                    <a href="/tdl/restaurant/detail/335/">
                        <div class="listTextArea">
                            <h3 class="heading3">プラザパビリオン・レストラン</h3>
                            <p>東京ディズニーランド/ウエスタンランド</p>
                            <div class="definitionList">
                                <p>2025年12月26日 ～</p>
                            </div>
                        </div>
                    </a>
                </li>
                <li>
                    <a href="/tds/restaurant/detail/403/">
                        <div class="listTextArea">
                            <h3 class="heading3">ザンビーニ･ブラザーズ･リストランテ</h3>
                            <p>東京ディズニーシー/メディテレーニアンハーバー</p>
                            <div class="definitionList">
                                <p>2025年1月1日 ～ 2025年3月31日</p>
                            </div>
                        </div>
                    </a>
                </li>
            </ul>
        </div>
    </body>
    </html>
    """


@pytest.fixture
def sample_html_minimal():
    """Minimal HTML that should return None (no restaurants)"""
    return r"""
    <!DOCTYPE html>
    <html>
    <body>
        <h1 class="heading1">不完全なメニュー</h1>
        <p class="price">1個 ¥300</p>
    </body>
    </html>
    """
