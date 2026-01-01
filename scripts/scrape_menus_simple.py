"""
Requests ベースのシンプルなスクレイピングスクリプト
aiohttpやPlaywrightよりも安定した動作

Usage:
    python scripts/scrape_menus_simple.py --start 0 --end 100
"""

import requests
import json
import sys
import time
import argparse
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
from collections import Counter

# Add parent directory to path to import api modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.scraper import MenuScraper


class SimpleMenuScraper:
    """Requestsベースのシンプルなメニュースクレイパー"""

    def __init__(self, rate_limit: float = 1.0, timeout: int = 20):
        """
        Args:
            rate_limit: 各リクエスト間の待機時間（秒）
            timeout: タイムアウト時間（秒）
        """
        self.rate_limit = rate_limit
        self.timeout = timeout
        self.scraper = MenuScraper()

        # ブラウザに近いヘッダー設定
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
        }

        # セッションを作成（Cookieを保持）
        self.session = requests.Session()
        self.session.headers.update(self.headers)

    def scrape_menu(self, menu_id: str) -> Optional[Dict]:
        """
        単一メニューをスクレイピング

        Args:
            menu_id: メニューID（4桁）

        Returns:
            パースされたメニューデータ、または None
        """
        url = f"https://www.tokyodisneyresort.jp/food/{menu_id}/"

        try:
            response = self.session.get(url, timeout=self.timeout)

            # ステータスコードを確認
            if response.status_code == 404:
                return None
            elif response.status_code != 200:
                print(f"Warning: {menu_id} returned status {response.status_code}")
                return None

            # HTMLコンテンツを取得
            html = response.text

            # スクレイパーでパース
            data = self.scraper.parse_menu_page(html, menu_id)

            # レート制限
            if self.rate_limit > 0:
                time.sleep(self.rate_limit)

            return data

        except requests.exceptions.Timeout:
            print(f"Timeout: {menu_id}")
            return None
        except requests.exceptions.RequestException as e:
            print(f"Error scraping {menu_id}: {e}")
            return None
        except Exception as e:
            print(f"Unexpected error scraping {menu_id}: {e}")
            return None

    def scrape_range(self, start_id: int, end_id: int) -> List[Dict]:
        """
        指定範囲のメニューをスクレイピング

        Args:
            start_id: 開始ID
            end_id: 終了ID

        Returns:
            メニューデータのリスト
        """
        results = []

        print(f"Scraping menu IDs {start_id:04d} to {end_id:04d}...")

        for menu_id_num in tqdm(range(start_id, end_id + 1), desc="Scraping"):
            menu_id_str = str(menu_id_num).zfill(4)
            data = self.scrape_menu(menu_id_str)
            if data:
                results.append(data)

        return results

    def close(self):
        """セッションをクローズ"""
        self.session.close()


def save_menus(menus: List[Dict], output_path: str = "data/menus.json"):
    """
    メニューデータをJSONに保存

    Args:
        menus: メニューデータのリスト
        output_path: 出力先パス
    """
    output_file = Path(output_path)
    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(menus, f, ensure_ascii=False, indent=2)

    print(f"\n✓ Saved {len(menus)} menus to {output_path}")

    # 統計情報を表示
    if menus:
        print("\n" + "=" * 60)
        print("📊 Statistics")
        print("=" * 60)

        # パーク別の統計
        parks = {}
        for menu in menus:
            if menu.get("restaurants"):
                for restaurant in menu["restaurants"]:
                    if isinstance(restaurant, dict):
                        park = restaurant.get("park", "unknown")
                        parks[park] = parks.get(park, 0) + 1

        print(f"Total menus: {len(menus)}")

        if parks:
            print("\nPark distribution:")
            park_names = {"tdl": "ランド", "tds": "シー"}
            for park, count in sorted(parks.items()):
                park_name = park_names.get(park, park)
                print(f"  - {park_name}: {count}")

        # 価格統計
        prices = []
        for menu in menus:
            price = menu.get("price")
            if price:
                if isinstance(price, dict):
                    prices.append(price.get("amount", 0))
                else:
                    prices.append(price)

        if prices:
            print(f"\nPrice range: ¥{min(prices):,} - ¥{max(prices):,}")
            print(f"Average price: ¥{sum(prices) // len(prices):,}")
            print(f"Median price: ¥{sorted(prices)[len(prices) // 2]:,}")

        # カテゴリー統計
        categories = []
        for menu in menus:
            if menu.get("categories"):
                categories.extend(menu["categories"])

        if categories:
            cat_counter = Counter(categories)
            print(f"\nTop categories:")
            for category, count in cat_counter.most_common(5):
                print(f"  - {category}: {count}")

        # レストラン数
        restaurants = set()
        for menu in menus:
            if menu.get("restaurants"):
                for restaurant in menu["restaurants"]:
                    if isinstance(restaurant, dict):
                        restaurants.add(restaurant.get("name", ""))
                    else:
                        restaurants.add(str(restaurant))

        print(f"\nUnique restaurants: {len(restaurants)}")

        # 画像カバレッジ
        menus_with_images = sum(1 for m in menus if m.get("image_urls") or m.get("images") or m.get("image_url"))
        coverage_pct = (menus_with_images * 100 // len(menus)) if len(menus) > 0 else 0
        print(f"Image coverage: {menus_with_images}/{len(menus)} ({coverage_pct}%)")

        print("=" * 60)


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description="Scrape Disney menu items (Simple Requests version)")
    parser.add_argument("--start", type=int, default=0, help="Start ID (default: 0)")
    parser.add_argument("--end", type=int, default=9999, help="End ID (default: 9999)")
    parser.add_argument("--output", type=str, default="data/menus.json", help="Output file path")
    parser.add_argument("--rate-limit", type=float, default=1.0, help="Rate limit in seconds (default: 1.0)")
    parser.add_argument("--timeout", type=int, default=20, help="Request timeout in seconds (default: 20)")

    args = parser.parse_args()

    print("=" * 60)
    print("Disney Menu Scraper (Simple Requests)")
    print("=" * 60)
    print(f"Range: {args.start:04d} - {args.end:04d}")
    print(f"Rate limit: {args.rate_limit} seconds")
    print(f"Timeout: {args.timeout} seconds")
    print(f"Output: {args.output}")
    print("=" * 60)

    try:
        scraper = SimpleMenuScraper(rate_limit=args.rate_limit, timeout=args.timeout)
        menus = scraper.scrape_range(args.start, args.end)
        scraper.close()

        save_menus(menus, args.output)

        print("\n✅ Scraping completed successfully!")

        if len(menus) == 0:
            print("\n⚠️  Warning: No menus were scraped. Check if the ID range is correct.")

    except KeyboardInterrupt:
        print("\n⚠️  Scraping interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
