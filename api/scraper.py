"""
Web scraper for Tokyo Disney Resort food menu pages
"""

from bs4 import BeautifulSoup
import re
from typing import Optional, List, Dict
from datetime import datetime


class MenuScraper:
    """メニューページスクレイパー"""

    SELECTORS = {
        "title": "h1.heading1",
        "price": "p.price",
        "images": ".columnImage img",
        "og_image": 'meta[property="og:image"]',
        "description": 'meta[name="description"]',
        "keywords": 'meta[name="keywords"]',
        "restaurants": ".linkList7 ul li",
        "restaurant_name": "h3.heading3",
        "restaurant_area": ".listTextArea > p",
        "restaurant_link": "a",
        "availability_period": ".definitionList p",
    }

    def parse_menu_page(self, html: str, menu_id: str) -> Optional[Dict]:
        """
        メニューページをパース

        Args:
            html: HTMLコンテンツ
            menu_id: メニューID（4桁）

        Returns:
            パースされたメニューデータ、またはNone（データが不完全な場合）
        """
        soup = BeautifulSoup(html, "lxml")

        # タイトルが取得できない場合はスキップ
        name = self._extract_name(soup)
        if not name:
            return None

        try:
            data = {
                "id": menu_id,
                "name": name,
                "description": self._extract_description(soup),
                "price": self._extract_price(soup),
                "image_urls": self._extract_images(soup),
                "thumbnail_url": self._extract_og_image(soup),
                "restaurants": self._extract_restaurants(soup),
                "categories": self._extract_categories(soup),
                "tags": self._extract_tags(soup),
                "characters": self._extract_characters(soup),
                "source_url": f"https://www.tokyodisneyresort.jp/food/{menu_id}/",
                "scraped_at": datetime.now().isoformat(),
                "is_seasonal": self._is_seasonal(soup),
                "is_available": True,
                "allergens": [],
                "nutritional_info": None,
                "last_updated": None,
                "is_new": False,
            }

            # レストランが存在しない場合はスキップ
            if not data["restaurants"]:
                return None

            return data
        except Exception as e:
            print(f"Error parsing menu {menu_id}: {e}")
            return None

    def _extract_name(self, soup: BeautifulSoup) -> str:
        """メニュー名を抽出"""
        element = soup.select_one(self.SELECTORS["title"])
        return element.get_text(strip=True) if element else ""

    def _extract_price(self, soup: BeautifulSoup) -> Dict:
        """価格情報を抽出"""
        element = soup.select_one(self.SELECTORS["price"])
        if not element:
            return {"amount": 0, "unit": "", "tax_included": True}

        text = element.get_text(strip=True)
        # 例: "1カップ ¥400" → unit="1カップ", amount=400
        # 例: "¥400" → unit="", amount=400
        match = re.search(r"(.+?)¥([\d,]+)", text)
        if match:
            unit = match.group(1).strip()
            amount = int(match.group(2).replace(",", ""))
            return {"amount": amount, "unit": unit, "tax_included": True}

        # ¥が先頭にある場合（単位なし）
        match = re.search(r"^¥([\d,]+)", text)
        if match:
            amount = int(match.group(1).replace(",", ""))
            return {"amount": amount, "unit": "", "tax_included": True}

        # ¥マークなしの場合
        match = re.search(r"(.+?)([\d,]+)円", text)
        if match:
            unit = match.group(1).strip()
            amount = int(match.group(2).replace(",", ""))
            return {"amount": amount, "unit": unit, "tax_included": True}

        return {"amount": 0, "unit": "", "tax_included": True}

    def _extract_images(self, soup: BeautifulSoup) -> List[str]:
        """画像URL一覧を抽出"""
        images = soup.select(self.SELECTORS["images"])
        urls = []
        for img in images:
            src = img.get("src", "")
            if src and not src.startswith("./"):
                urls.append(src)
            elif src.startswith("./"):
                # 相対パスを絶対パスに変換
                src = src.replace("./", "https://www.tokyodisneyresort.jp/")
                urls.append(src)
        return urls

    def _extract_og_image(self, soup: BeautifulSoup) -> Optional[str]:
        """OGP画像を抽出"""
        element = soup.select_one(self.SELECTORS["og_image"])
        return element.get("content") if element else None

    def _extract_description(self, soup: BeautifulSoup) -> str:
        """説明文を抽出"""
        element = soup.select_one(self.SELECTORS["description"])
        return element.get("content", "") if element else ""

    def _extract_restaurants(self, soup: BeautifulSoup) -> List[Dict]:
        """販売店舗一覧を抽出"""
        restaurants = []
        for li in soup.select(self.SELECTORS["restaurants"]):
            link = li.select_one(self.SELECTORS["restaurant_link"])
            if not link:
                continue

            # URLからレストランIDとパークを抽出
            url = link.get("href", "")
            if not url:
                continue

            restaurant_id = url.rstrip("/").split("/")[-1]
            park = "tdl" if "/tdl/" in url else "tds"

            # 店舗名とエリア
            name_elem = li.select_one(self.SELECTORS["restaurant_name"])
            area_elem = li.select_one(self.SELECTORS["restaurant_area"])

            name = name_elem.get_text(strip=True) if name_elem else ""
            if not name:
                continue

            # エリア名を抽出（例: "東京ディズニーランド/ウエスタンランド" → "ウエスタンランド"）
            area_text = area_elem.get_text(strip=True) if area_elem else ""
            area_parts = area_text.split("/")
            area = area_parts[-1] if len(area_parts) > 1 else area_parts[0] if area_parts else ""

            # 販売期間
            period_elem = li.select_one(self.SELECTORS["availability_period"])
            availability = None
            if period_elem:
                availability = self._parse_availability(period_elem.get_text(strip=True))

            restaurants.append(
                {
                    "id": restaurant_id,
                    "name": name,
                    "park": park,
                    "area": area,
                    "url": url if url.startswith("http") else f"https://www.tokyodisneyresort.jp{url}",
                    "availability": availability,
                    "service_types": [],  # 別途解析が必要な場合
                }
            )

        return restaurants

    def _parse_availability(self, text: str) -> Optional[Dict]:
        """販売期間をパース"""
        if not text:
            return None

        # 例: "2025年12月26日 ～" または "2025年7月1日 ～ 2026年3月31日"
        match = re.search(r"(\d{4})年(\d{1,2})月(\d{1,2})日\s*～\s*(?:(\d{4})年(\d{1,2})月(\d{1,2})日)?", text)
        if match:
            start_date = f"{match.group(1)}-{match.group(2).zfill(2)}-{match.group(3).zfill(2)}"
            end_date = None
            if match.group(4):
                end_date = f"{match.group(4)}-{match.group(5).zfill(2)}-{match.group(6).zfill(2)}"

            return {"start_date": start_date, "end_date": end_date}
        return None

    def _extract_keywords(self, soup: BeautifulSoup) -> List[str]:
        """キーワード一覧を取得"""
        keywords_elem = soup.select_one(self.SELECTORS["keywords"])
        if not keywords_elem:
            return []

        content = keywords_elem.get("content", "")
        return [k.strip() for k in content.split(",") if k.strip()]

    def _extract_tags(self, soup: BeautifulSoup) -> List[str]:
        """タグを抽出"""
        all_keywords = self._extract_keywords(soup)

        # パーク名、エリア名、レストラン名を除外してタグのみ抽出
        exclude_patterns = [
            "東京ディズニーシー",
            "東京ディズニーランド",
            "トゥモローランド",
            "ウエスタンランド",
            "メディテレーニアンハーバー",
            "アメリカンウォーターフロント",
            "ロストリバーデルタ",
            "ファンタジーランド",
            "アドベンチャーランド",
            "クリッターカントリー",
            "トゥーンタウン",
            "ポートディスカバリー",
            "マーメイドラグーン",
            "アラビアンコースト",
            "ミステリアスアイランド",
        ]

        # レストラン名っぽいものも除外
        tags = []
        for keyword in all_keywords:
            # 除外パターンに一致するか
            if any(pattern in keyword for pattern in exclude_patterns):
                continue
            # レストラン名っぽいもの（・デリ、レストラン等で終わる）も除外
            if keyword.endswith(("・デリ", "レストラン", "ダイナー", "グリル", "カウンター")):
                continue
            # キャラクター名は別途抽出するのでここでは除外
            if any(char in keyword for char in ["トイ・ストーリー", "ピクサー", "ミッキー", "ミニー"]):
                continue
            tags.append(keyword)

        return tags

    def _extract_categories(self, soup: BeautifulSoup) -> List[str]:
        """カテゴリを抽出"""
        all_keywords = self._extract_keywords(soup)

        # カテゴリっぽいもの（"デザート／スウィーツ"、"メイン"等）を抽出
        categories = []
        category_keywords = [
            "デザート／スウィーツ",
            "スウィーツ",
            "スナック",
            "おすすめメニュー",
            "メイン",
            "サイド",
            "ドリンク",
            "アルコール",
            "セット",
        ]

        for keyword in all_keywords:
            if "／" in keyword or keyword in category_keywords:
                categories.append(keyword)

        return categories

    def _extract_characters(self, soup: BeautifulSoup) -> List[str]:
        """キャラクター/作品名を抽出"""
        all_keywords = self._extract_keywords(soup)

        # キャラクター/作品っぽいキーワード
        character_patterns = [
            "トイ・ストーリー",
            "ピクサー",
            "ミッキー",
            "ミニー",
            "ドナルド",
            "デイジー",
            "グーフィー",
            "プルート",
            "チップ",
            "デール",
            "スティッチ",
            "プーさん",
            "アリエル",
            "ベル",
            "シンデレラ",
            "ラプンツェル",
            "エルサ",
            "アナ",
            "アラジン",
            "ジャスミン",
            "ダッフィー",
            "シェリーメイ",
            "ジェラトーニ",
            "ステラ・ルー",
            "クッキー・アン",
            "オル・メル",
            "リーナ・ベル",
            "マーベル",
            "スター・ウォーズ",
            "アベンジャーズ",
        ]

        characters = []
        for keyword in all_keywords:
            if any(pattern in keyword for pattern in character_patterns):
                characters.append(keyword)

        return characters

    def _is_seasonal(self, soup: BeautifulSoup) -> bool:
        """季節限定商品かどうか判定"""
        all_keywords = self._extract_keywords(soup)
        seasonal_keywords = ["季節限定", "期間限定", "シーズン", "クリスマス", "ハロウィーン", "イースター"]

        return any(keyword in " ".join(all_keywords) for keyword in seasonal_keywords)
