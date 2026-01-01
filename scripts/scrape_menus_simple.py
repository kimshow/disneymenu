"""
非同期バッチ処理によるスクレイピングスクリプト
10ID単位でバッチ処理し、高速化を実現

Usage:
    python scripts/scrape_menus_simple.py --start 0 --end 100
"""

import asyncio
import aiohttp
import json
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
from collections import Counter

# Add parent directory to path to import api modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.scraper import MenuScraper


class SimpleMenuScraper:
    """非同期バッチ処理によるメニュースクレイパー"""

    def __init__(self, rate_limit: float = 1.0, timeout: int = 20, max_concurrent: int = 5, batch_size: int = 10):
        """
        Args:
            rate_limit: バッチ間の待機時間（秒）
            timeout: タイムアウト時間（秒）
            max_concurrent: 最大同時接続数
            batch_size: バッチサイズ（デフォルト: 10）
        """
        self.rate_limit = rate_limit
        self.timeout = timeout
        self.max_concurrent = max_concurrent
        self.batch_size = batch_size
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

    async def scrape_menu(
        self, session: aiohttp.ClientSession, menu_id: str, semaphore: asyncio.Semaphore
    ) -> Optional[Dict]:
        """
        単一メニューをスクレイピング（非同期）

        Args:
            session: aiohttp session
            menu_id: メニューID（4桁）
            semaphore: 同時接続数制限用

        Returns:
            パースされたメニューデータ、または None
        """
        url = f"https://www.tokyodisneyresort.jp/food/{menu_id}/"

        async with semaphore:
            try:
                timeout = aiohttp.ClientTimeout(total=self.timeout, connect=5)
                async with session.get(url, timeout=timeout, allow_redirects=False) as response:
                    if response.status == 200:
                        # レスポンスサイズ制限（5MB）
                        content_length = response.headers.get("Content-Length")
                        if content_length and int(content_length) > 5 * 1024 * 1024:
                            return None

                        html = await response.text()

                        # HTMLサイズチェック
                        if len(html) > 5 * 1024 * 1024:
                            return None

                        return self.scraper.parse_menu_page(html, menu_id)
                    elif response.status == 404:
                        return None  # 存在しないID
                    else:
                        return None
            except asyncio.TimeoutError:
                return None
            except aiohttp.ClientError:
                return None
            except Exception:
                return None

    async def scrape_range(self, start_id: int, end_id: int) -> List[Dict]:
        """
        指定範囲のメニューをスクレイピング（非同期バッチ処理）

        Args:
            start_id: 開始ID
            end_id: 終了ID

        Returns:
            メニューデータのリスト
        """
        results = []
        semaphore = asyncio.Semaphore(self.max_concurrent)

        # TCPConnectorでSSL検証を有効化し、接続プールを設定
        connector = aiohttp.TCPConnector(
            limit=self.max_concurrent, limit_per_host=self.max_concurrent, ttl_dns_cache=300, ssl=True
        )

        async with aiohttp.ClientSession(headers=self.headers, connector=connector) as session:
            total_ids = end_id - start_id + 1

            print(f"\nScraping menu IDs {start_id:04d} to {end_id:04d} ({total_ids} IDs)")
            print(f"Concurrent requests: {self.max_concurrent}")
            print(f"Batch size: {self.batch_size}")
            print(f"Rate limit: {self.rate_limit}s between batches")
            print(f"Estimated time: ~{total_ids * self.rate_limit / self.batch_size / 60:.1f} minutes\n")

            # プログレスバー付きでバッチ処理
            with tqdm(total=total_ids, desc="Scraping", unit="menu") as pbar:
                for batch_start in range(start_id, end_id + 1, self.batch_size):
                    batch_end = min(batch_start + self.batch_size - 1, end_id)

                    # バッチ内のタスクを作成
                    tasks = []
                    for menu_id_num in range(batch_start, batch_end + 1):
                        menu_id_str = str(menu_id_num).zfill(4)
                        tasks.append(self.scrape_menu(session, menu_id_str, semaphore))

                    # バッチを並行実行
                    batch_results = await asyncio.gather(*tasks)

                    # 結果を集約
                    for data in batch_results:
                        if data:
                            results.append(data)

                    # プログレスバー更新
                    pbar.update(len(tasks))
                    pbar.set_postfix({"found": len(results)})

                    # レート制限: バッチ間の待機（最後のバッチ以外）
                    if self.rate_limit > 0 and batch_end < end_id:
                        await asyncio.sleep(self.rate_limit)

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
    parser = argparse.ArgumentParser(description="Scrape Disney menu items (Async Batch version)")
    parser.add_argument("--start", type=int, default=0, help="Start ID (default: 0)")
    parser.add_argument("--end", type=int, default=9999, help="End ID (default: 9999)")
    parser.add_argument("--output", type=str, default="data/menus.json", help="Output file path")
    parser.add_argument(
        "--rate-limit", type=float, default=1.0, help="Rate limit between batches in seconds (default: 1.0)"
    )
    parser.add_argument("--timeout", type=int, default=20, help="Request timeout in seconds (default: 20)")
    parser.add_argument("--max-concurrent", type=int, default=5, help="Max concurrent requests (default: 5)")
    parser.add_argument("--batch-size", type=int, default=10, help="Batch size (default: 10)")

    args = parser.parse_args()

    print("=" * 60)
    print("Disney Menu Scraper (Async Batch)")
    print("=" * 60)
    print(f"Range: {args.start:04d} - {args.end:04d}")
    print(f"Batch size: {args.batch_size}")
    print(f"Max concurrent: {args.max_concurrent}")
    print(f"Rate limit: {args.rate_limit} seconds between batches")
    print(f"Timeout: {args.timeout} seconds")
    print(f"Output: {args.output}")
    print("=" * 60)

    try:
        scraper = SimpleMenuScraper(
            rate_limit=args.rate_limit,
            timeout=args.timeout,
            max_concurrent=args.max_concurrent,
            batch_size=args.batch_size,
        )
        menus = asyncio.run(scraper.scrape_range(args.start, args.end))

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
