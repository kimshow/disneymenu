"""Tests for api/scraper.py using menu IDs 4370-4375"""

import pytest
from api.scraper import MenuScraper


@pytest.fixture
def scraper():
    """Create MenuScraper instance"""
    return MenuScraper()


class TestMenuScraperParseMenuPage:
    """Tests for parse_menu_page method with menu IDs 4370-4375"""

    def test_parse_menu_4370(self, scraper, sample_html):
        """Test parsing menu ID 4370"""
        result = scraper.parse_menu_page(sample_html, "4370")

        assert result is not None
        assert result["id"] == "4370"
        assert result["name"] == "テストメニュー"
        assert result["price"]["amount"] == 500
        assert len(result["restaurants"]) == 1
        assert result["restaurants"][0]["name"] == "テストレストラン"

    def test_parse_menu_4371_minimal(self, scraper):
        """Test parsing menu ID 4371 with minimal HTML - returns None due to missing restaurant"""
        html = r"""
        <html>
        <head></head>
        <body>
            <h1 class="heading1">シンプルメニュー</h1>
            <p class="price">1個 ¥300</p>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "4371")

        # レストラン情報がないためNoneが返される
        assert result is None

    def test_parse_menu_4372_no_title(self, scraper):
        """Test parsing menu ID 4372 without title returns None"""
        html = r"""
        <html>
        <body>
            <p class="price">1個 ¥500</p>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "4372")

        assert result is None

    def test_parse_menu_4373_with_restaurants(self, scraper):
        """Test parsing menu ID 4373 with multiple restaurants"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">マルチレストランメニュー</h1>
            <p class="price">1皿 ¥800</p>
            <div class="linkList7">
                <ul>
                    <li>
                        <a href="/tdl/restaurant/detail/200/">
                            <div class="listTextArea">
                                <h3 class="heading3">レストラン1</h3>
                                <p>東京ディズニーランド/エリア1</p>
                            </div>
                        </a>
                    </li>
                    <li>
                        <a href="/tds/restaurant/detail/300/">
                            <div class="listTextArea">
                                <h3 class="heading3">レストラン2</h3>
                                <p>東京ディズニーシー/エリア2</p>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "4373")

        assert result is not None
        assert len(result["restaurants"]) == 2
        assert result["restaurants"][0]["park"] == "tdl"
        assert result["restaurants"][1]["park"] == "tds"

    def test_parse_menu_4374_with_metadata(self, scraper):
        """Test parsing menu ID 4374 with complete metadata - returns None due to missing restaurant"""
        html = r"""
        <html>
        <head>
            <meta name="description" content="特別なメニュー">
            <meta name="keywords" content="東京ディズニーランド,デザート／スウィーツ,キャラクターモチーフのメニュー">
            <meta property="og:image" content="https://example.com/og.jpg">
        </head>
        <body>
            <h1 class="heading1">フルメタデータメニュー</h1>
            <p class="price">1個 ¥1,200</p>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "4374")

        # レストラン情報がないためNoneが返される
        assert result is None

    def test_parse_menu_4375_with_images(self, scraper):
        """Test parsing menu ID 4375 with multiple images - returns None due to missing restaurant"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">画像付きメニュー</h1>
            <p class="price">1個 ¥600</p>
            <div class="columnImage">
                <img src="https://example.com/img1.jpg" alt="画像1">
                <img src="https://example.com/img2.jpg" alt="画像2">
                <img src="https://example.com/img3.jpg" alt="画像3">
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "4375")

        # レストラン情報がないためNoneが返される
        assert result is None


class TestMenuScraperExtractName:
    """Tests for _extract_name method"""

    def test_extract_name_success(self, scraper, sample_html):
        """Test successful name extraction"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(sample_html, "lxml")
        name = scraper._extract_name(soup)
        assert name == "テストメニュー"

    def test_extract_name_missing(self, scraper):
        """Test name extraction when element missing"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        name = scraper._extract_name(soup)
        assert name == ""


class TestMenuScraperExtractPrice:
    """Tests for _extract_price method"""

    def test_extract_price_yen_symbol(self, scraper):
        """Test price extraction with ¥ symbol"""
        from bs4 import BeautifulSoup

        html = r'<p class="price">1個 ¥500</p>'
        soup = BeautifulSoup(html, "lxml")
        price = scraper._extract_price(soup)
        assert price["amount"] == 500

    def test_extract_price_with_comma(self, scraper):
        """Test price extraction with comma separator"""
        from bs4 import BeautifulSoup

        html = r'<p class="price">1個 ¥1,200</p>'
        soup = BeautifulSoup(html, "lxml")
        price = scraper._extract_price(soup)
        assert price["amount"] == 1200
        assert price["unit"] == "1個"

    def test_extract_price_with_unit(self, scraper):
        """Test price extraction with unit"""
        from bs4 import BeautifulSoup

        html = r'<p class="price">1セット ¥800</p>'
        soup = BeautifulSoup(html, "lxml")
        price = scraper._extract_price(soup)
        assert price["amount"] == 800
        assert price["unit"] == "1セット"

    def test_extract_price_missing(self, scraper):
        """Test price extraction when missing"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        price = scraper._extract_price(soup)
        assert price["amount"] == 0


class TestMenuScraperExtractImages:
    """Tests for _extract_images method"""

    def test_extract_images_success(self, scraper, sample_html):
        """Test successful image extraction"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(sample_html, "lxml")
        images = scraper._extract_images(soup)
        assert len(images) == 2
        assert all("example.com" in img for img in images)

    def test_extract_images_empty(self, scraper):
        """Test image extraction when no images"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        images = scraper._extract_images(soup)
        assert images == []


class TestMenuScraperExtractRestaurants:
    """Tests for _extract_restaurants method"""

    def test_extract_restaurants_success(self, scraper, sample_html):
        """Test successful restaurant extraction"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(sample_html, "lxml")
        restaurants = scraper._extract_restaurants(soup)
        assert len(restaurants) == 1
        assert restaurants[0]["name"] == "テストレストラン"
        assert restaurants[0]["id"] == "100"
        assert restaurants[0]["park"] == "tdl"

    def test_extract_restaurants_empty(self, scraper):
        """Test restaurant extraction when empty"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        restaurants = scraper._extract_restaurants(soup)
        assert restaurants == []


class TestMenuScraperExtractCategories:
    """Tests for _extract_categories method"""

    def test_extract_categories_from_keywords(self, scraper, sample_html):
        """Test category extraction from keywords meta"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(sample_html, "lxml")
        categories = scraper._extract_categories(soup)
        assert "デザート／スウィーツ" in categories

    def test_extract_categories_empty(self, scraper):
        """Test category extraction when empty"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        categories = scraper._extract_categories(soup)
        assert categories == []


class TestMenuScraperExtractTags:
    """Tests for _extract_tags method"""

    def test_extract_tags_from_keywords(self, scraper, sample_html):
        """Test tag extraction from keywords meta"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(sample_html, "lxml")
        tags = scraper._extract_tags(soup)
        assert "キャラクターモチーフのメニュー" in tags

    def test_extract_tags_empty(self, scraper):
        """Test tag extraction when empty"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        tags = scraper._extract_tags(soup)
        assert tags == []


class TestMenuScraperParseAvailability:
    """Tests for _parse_availability method"""

    def test_parse_availability_with_dates(self, scraper):
        """Test availability parsing with start and end dates"""
        text = "2025年1月1日 ～ 2025年12月31日"
        availability = scraper._parse_availability(text)
        assert availability is not None
        assert availability["start_date"] == "2025-01-01"
        assert availability["end_date"] == "2025-12-31"

    def test_parse_availability_ongoing(self, scraper):
        """Test availability parsing for ongoing items"""
        text = "2025年1月1日 ～"
        availability = scraper._parse_availability(text)
        assert availability is not None
        assert availability["start_date"] == "2025-01-01"
        assert availability["end_date"] is None

    def test_parse_availability_invalid(self, scraper):
        """Test availability parsing with invalid format"""
        text = "invalid date format"
        availability = scraper._parse_availability(text)
        assert availability is None


class TestMenuScraperExtractDescription:
    """Tests for _extract_description method"""

    def test_extract_description_success(self, scraper, sample_html):
        """Test successful description extraction"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(sample_html, "lxml")
        description = scraper._extract_description(soup)
        assert description == "テストメニューの説明"

    def test_extract_description_missing(self, scraper):
        """Test description extraction when missing"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        description = scraper._extract_description(soup)
        assert description == ""


class TestMenuScraperExtractOgImage:
    """Tests for _extract_og_image method"""

    def test_extract_og_image_success(self, scraper, sample_html):
        """Test successful OG image extraction"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup(sample_html, "lxml")
        og_image = scraper._extract_og_image(soup)
        assert og_image == "https://example.com/og_image.jpg"

    def test_extract_og_image_missing(self, scraper):
        """Test OG image extraction when missing"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        og_image = scraper._extract_og_image(soup)
        assert og_image is None


class TestMenuScraperExtractCharacters:
    """Tests for _extract_characters method"""

    def test_extract_characters_from_keywords(self, scraper):
        """Test character extraction from keywords"""
        from bs4 import BeautifulSoup

        html = '<meta name="keywords" content="トイ・ストーリー,ピクサー,ミッキー">'
        soup = BeautifulSoup(html, "lxml")
        characters = scraper._extract_characters(soup)
        assert "トイ・ストーリー" in characters

    def test_extract_characters_empty(self, scraper):
        """Test character extraction when empty"""
        from bs4 import BeautifulSoup

        soup = BeautifulSoup("<html><body></body></html>", "lxml")
        characters = scraper._extract_characters(soup)
        assert characters == []


class TestMenuScraperIsSeasonal:
    """Tests for _is_seasonal method"""

    def test_is_seasonal_with_keywords(self, scraper):
        """Test seasonal detection from keywords"""
        from bs4 import BeautifulSoup

        html = '<meta name="keywords" content="季節限定,期間限定">'
        soup = BeautifulSoup(html, "lxml")
        is_seasonal = scraper._is_seasonal(soup)
        assert is_seasonal is True

    def test_is_seasonal_without_keywords(self, scraper):
        """Test non-seasonal detection"""
        from bs4 import BeautifulSoup

        html = '<meta name="keywords" content="デザート,スウィーツ">'
        soup = BeautifulSoup(html, "lxml")
        is_seasonal = scraper._is_seasonal(soup)
        assert is_seasonal is False


class TestMenuScraperErrorHandling:
    """Tests for error handling"""

    def test_parse_invalid_html(self, scraper):
        """Test parsing with invalid HTML"""
        result = scraper.parse_menu_page("<invalid>html", "0001")
        assert result is None

    def test_parse_malformed_price(self, scraper):
        """Test parsing with malformed price"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">テスト</h1>
            <p class="price">時価</p>
            <div class="linkList7">
                <ul>
                    <li>
                        <a href="/tdl/restaurant/detail/100/">
                            <div class="listTextArea">
                                <h3 class="heading3">テストレストラン</h3>
                                <p>東京ディズニーランド/エリア</p>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "0002")
        assert result is not None
        assert result["price"]["amount"] == 0

    def test_parse_with_multiple_restaurants(self, scraper, sample_html_with_multiple_restaurants):
        """Test parsing HTML with multiple restaurants"""
        result = scraper.parse_menu_page(sample_html_with_multiple_restaurants, "1779")
        assert result is not None
        assert len(result["restaurants"]) == 2
        assert result["restaurants"][0]["park"] == "tdl"
        assert result["restaurants"][1]["park"] == "tds"
        assert result["price"]["amount"] == 800

    def test_parse_empty_html(self, scraper):
        """Test parsing empty HTML"""
        result = scraper.parse_menu_page("", "0003")
        assert result is None

    def test_parse_html_without_title(self, scraper, sample_html_minimal):
        """Test parsing HTML without proper title returns None"""
        result = scraper.parse_menu_page(sample_html_minimal, "0004")
        # レストラン情報がないためNone
        assert result is None

    def test_parse_with_relative_image_path(self, scraper):
        """Test parsing with relative image paths"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">テストメニュー</h1>
            <p class="price">1個 ¥500</p>
            <div class="columnImage">
                <img src="./images/test.jpg" alt="Test">
            </div>
            <div class="linkList7">
                <ul>
                    <li>
                        <a href="/tdl/restaurant/detail/100/">
                            <div class="listTextArea">
                                <h3 class="heading3">テストレストラン</h3>
                                <p>東京ディズニーランド/エリア</p>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "0005")
        assert result is not None
        assert len(result["image_urls"]) > 0
        assert result["image_urls"][0].startswith("https://")

    def test_parse_with_no_og_image(self, scraper):
        """Test parsing without OG image"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">テストメニュー</h1>
            <p class="price">¥500</p>
            <div class="linkList7">
                <ul>
                    <li>
                        <a href="/tdl/restaurant/detail/100/">
                            <div class="listTextArea">
                                <h3 class="heading3">テストレストラン</h3>
                                <p>東京ディズニーランド/エリア</p>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "0006")
        assert result is not None
        assert result["thumbnail_url"] is None

    def test_parse_price_with_yen_symbol_only(self, scraper):
        """Test parsing price with yen symbol format"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">テスト</h1>
            <p class="price">¥1,500</p>
            <div class="linkList7">
                <ul>
                    <li>
                        <a href="/tdl/restaurant/detail/100/">
                            <div class="listTextArea">
                                <h3 class="heading3">テストレストラン</h3>
                                <p>東京ディズニーランド/エリア</p>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "0007")
        assert result is not None
        assert result["price"]["amount"] == 1500
        assert result["price"]["unit"] == ""

    def test_parse_price_with_yen_kanji(self, scraper):
        """Test parsing price with yen kanji format"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">テスト</h1>
            <p class="price">1個 2,000円</p>
            <div class="linkList7">
                <ul>
                    <li>
                        <a href="/tdl/restaurant/detail/100/">
                            <div class="listTextArea">
                                <h3 class="heading3">テストレストラン</h3>
                                <p>東京ディズニーランド/エリア</p>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "0008")
        assert result is not None
        assert result["price"]["amount"] == 2000
        assert result["price"]["unit"] == "1個"

    def test_parse_restaurant_without_link(self, scraper):
        """Test parsing restaurant without proper link"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">テストメニュー</h1>
            <p class="price">¥500</p>
            <div class="linkList7">
                <ul>
                    <li>
                        <div class="listTextArea">
                            <h3 class="heading3">レストラン名のみ</h3>
                        </div>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "0009")
        # リンクがないのでレストランが抽出されず、Noneを返す
        assert result is None

    def test_parse_restaurant_with_relative_url(self, scraper):
        """Test parsing restaurant with relative URL"""
        html = r"""
        <html>
        <body>
            <h1 class="heading1">テスト</h1>
            <p class="price">¥500</p>
            <div class="linkList7">
                <ul>
                    <li>
                        <a href="/tds/restaurant/detail/200/">
                            <div class="listTextArea">
                                <h3 class="heading3">テストレストラン</h3>
                                <p>東京ディズニーシー/マーメイドラグーン</p>
                            </div>
                        </a>
                    </li>
                </ul>
            </div>
        </body>
        </html>
        """
        result = scraper.parse_menu_page(html, "0010")
        assert result is not None
        assert len(result["restaurants"]) == 1
        assert result["restaurants"][0]["url"].startswith("https://")
        assert result["restaurants"][0]["park"] == "tds"
