"""
Chrome DevTools MCP を使用したスクレイピングスクリプト
より安定したブラウザベースのスクレイピング

Usage:
    python scripts/scrape_menus_chrome.py --start 0 --end 100
"""

import json
import sys
import time
import argparse
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm

# Add parent directory to path to import api modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.scraper import MenuScraper

try:
    from playwright.sync_api import sync_playwright, Page, Browser

    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False
    print("⚠️  Playwright is not installed. Install it with: pip install playwright && playwright install chromium")


class ChromeMenuScraper:
    """Chrome DevTools を使用したメニュースクレイパー"""

    def __init__(self, headless: bool = True, rate_limit: float = 1.0):
        """
        Args:
            headless: ヘッドレスモードで実行するか
            rate_limit: 各リクエスト間の待機時間（秒）
        """
        self.headless = headless
        self.rate_limit = rate_limit
        self.scraper = MenuScraper()
        self.browser: Optional[Browser] = None
        self.page: Optional[Page] = None

    def __enter__(self):
        """コンテキストマネージャーのエントリー"""
        if not PLAYWRIGHT_AVAILABLE:
            raise RuntimeError("Playwright is not available")

        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=self.headless,
            args=["--disable-blink-features=AutomationControlled", "--disable-dev-shm-usage", "--no-sandbox"],
        )

        # ブラウザコンテキストを作成（より本物のブラウザに近い設定）
        self.context = self.browser.new_context(
            viewport={"width": 1920, "height": 1080},
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            locale="ja-JP",
            timezone_id="Asia/Tokyo",
            extra_http_headers={
                "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            },
        )

        self.page = self.context.new_page()

        # bot検出を回避するためのJavaScript実行
        self.page.add_init_script(
            """
            Object.defineProperty(navigator, 'webdriver', {
                get: () => undefined
            });
            Object.defineProperty(navigator, 'plugins', {
                get: () => [1, 2, 3, 4, 5]
            });
            Object.defineProperty(navigator, 'languages', {
                get: () => ['ja', 'ja-JP', 'en-US', 'en']
            });
        """
        )

        # 最初にトップページにアクセスしてCookieを取得
        try:
            print("Initializing session...")
            self.page.goto("https://www.tokyodisneyresort.jp/", wait_until="load", timeout=20000)
            self.page.wait_for_timeout(3000)
            print("Session initialized successfully")
        except Exception as e:
            print(f"Warning: Failed to initialize session: {e}")

        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """コンテキストマネージャーの終了"""
        if self.page:
            self.page.close()
        if self.context:
            self.context.close()
        if self.browser:
            self.browser.close()
        if hasattr(self, "playwright"):
            self.playwright.stop()

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
            # ページにアクセス（loadまで待つ、タイムアウトを45秒に設定）
            response = self.page.goto(url, wait_until="load", timeout=45000)  # DOMの読み込み完了まで待つ  # 45秒

            if not response:
                return None

            # ステータスコードを確認
            if response.status == 404:
                return None
            elif response.status != 200:
                print(f"Warning: {menu_id} returned status {response.status}")
                return None

            # JavaScriptが実行され、動的コンテンツが読み込まれるまで待つ
            self.page.wait_for_timeout(3000)

            # bot検出をさらに回避（ページ内でマウス移動をシミュレート）
            try:
                self.page.mouse.move(100, 100)
                self.page.wait_for_timeout(500)
                self.page.mouse.move(200, 200)
            except:
                pass

            # HTMLコンテンツを取得
            html = self.page.content()

            # スクレイパーでパース
            data = self.scraper.parse_menu_page(html, menu_id)

            # レート制限
            if self.rate_limit > 0:
                time.sleep(self.rate_limit)

            return data

        except Exception as e:
            error_msg = str(e)
            if "Timeout" in error_msg or "timeout" in error_msg:
                print(f"Timeout: {menu_id}")
            else:
                print(f"Error scraping {menu_id}: {e}")
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

    print(f"✓ Saved {len(menus)} menus to {output_path}")

    # 統計情報を表示
    if menus:
        print("\n" + "=" * 60)
        print("Statistics:")
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
            print("Park distribution:")
            for park, count in parks.items():
                park_name = "ランド" if park == "tdl" else "シー" if park == "tds" else park
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
            print(f"Price range: ¥{min(prices)} - ¥{max(prices)}")
            print(f"Average price: ¥{sum(prices) // len(prices)}")


def main():
    """メイン処理"""
    parser = argparse.ArgumentParser(description="Scrape Disney menu items using Chrome DevTools")
    parser.add_argument("--start", type=int, default=0, help="Start ID (default: 0)")
    parser.add_argument("--end", type=int, default=9999, help="End ID (default: 9999)")
    parser.add_argument("--output", type=str, default="data/menus.json", help="Output file path")
    parser.add_argument("--rate-limit", type=float, default=1.0, help="Rate limit in seconds (default: 1.0)")
    parser.add_argument("--visible", action="store_true", help="Run browser in visible mode (not headless)")

    args = parser.parse_args()

    if not PLAYWRIGHT_AVAILABLE:
        print("❌ Error: Playwright is not installed")
        print("Install it with: pip install playwright && playwright install chromium")
        sys.exit(1)

    print("=" * 60)
    print("Disney Menu Scraper (Chrome DevTools)")
    print("=" * 60)
    print(f"Range: {args.start:04d} - {args.end:04d}")
    print(f"Rate limit: {args.rate_limit} seconds")
    print(f"Output: {args.output}")
    print(f"Browser mode: {'Visible' if args.visible else 'Headless'}")
    print("=" * 60)

    try:
        with ChromeMenuScraper(headless=not args.visible, rate_limit=args.rate_limit) as scraper:
            menus = scraper.scrape_range(args.start, args.end)
            save_menus(menus, args.output)

        print("\n✅ Scraping completed successfully!")

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
