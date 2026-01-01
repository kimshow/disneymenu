"""
Scraping script for Disney menu items
Usage:
    python scripts/scrape_menus.py --start 0 --end 100  # Test with first 100 IDs
    python scripts/scrape_menus.py                       # Scrape all (0-9999)
"""

import asyncio
import aiohttp
import json
import sys
from pathlib import Path
from typing import List, Dict, Optional
from tqdm import tqdm
import argparse

# Add parent directory to path to import api modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from api.scraper import MenuScraper


async def scrape_menu(
    session: aiohttp.ClientSession, menu_id: str, scraper: MenuScraper, semaphore: asyncio.Semaphore
) -> Optional[Dict]:
    """
    単一メニューをスクレイピング

    Args:
        session: aiohttp session
        menu_id: メニューID（4桁）
        scraper: MenuScraperインスタンス
        semaphore: 同時接続数制限用

    Returns:
        パースされたメニューデータ、または None
    """
    url = f"https://www.tokyodisneyresort.jp/food/{menu_id}/"

    async with semaphore:
        try:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                if response.status == 200:
                    html = await response.text()
                    return scraper.parse_menu_page(html, menu_id)
                elif response.status == 404:
                    return None  # 存在しないID
                else:
                    return None
        except asyncio.TimeoutError:
            return None
        except Exception as e:
            return None


async def scrape_all_menus(
    start_id: int = 0, end_id: int = 9999, rate_limit: float = 1.0, max_concurrent: int = 5
) -> List[Dict]:
    """
    全メニューをスクレイピング

    Args:
        start_id: 開始ID
        end_id: 終了ID
        rate_limit: 各リクエスト間の待機時間（秒）
        max_concurrent: 最大同時接続数

    Returns:
        メニューデータのリスト
    """
    scraper = MenuScraper()
    results = []
    semaphore = asyncio.Semaphore(max_concurrent)

    # ヘッダー設定（より詳細なブラウザヘッダー）
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
        "Accept-Encoding": "gzip, deflate, br",
        "DNT": "1",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
    }

    # TCPConnectorでSSL検証を有効化し、接続プールを設定
    connector = aiohttp.TCPConnector(limit=max_concurrent, limit_per_host=max_concurrent, ttl_dns_cache=300, ssl=True)

    async with aiohttp.ClientSession(headers=headers, connector=connector) as session:
        total_ids = end_id - start_id + 1
        batch_size = 10  # 10件ずつバッチ処理

        print(f"\nScraping menu IDs {start_id:04d} to {end_id:04d} ({total_ids} IDs)")
        print(f"Concurrent requests: {max_concurrent}")
        print(f"Batch size: {batch_size}")
        print(f"Rate limit: {rate_limit}s between batches")
        print(f"Estimated time: ~{total_ids * rate_limit / batch_size / 60:.1f} minutes\n")

        # プログレスバー付きでバッチ処理
        with tqdm(total=total_ids, desc="Scraping", unit="menu") as pbar:
            for batch_start in range(start_id, end_id + 1, batch_size):
                batch_end = min(batch_start + batch_size - 1, end_id)

                # バッチ内のタスクを作成
                tasks = []
                for menu_id_num in range(batch_start, batch_end + 1):
                    menu_id_str = str(menu_id_num).zfill(4)
                    tasks.append(scrape_menu(session, menu_id_str, scraper, semaphore))

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
                if rate_limit > 0 and batch_end < end_id:
                    await asyncio.sleep(rate_limit)

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
        print("\nStatistics:")
        print(f"  Total menus: {len(menus)}")

        parks = {}
        for menu in menus:
            for restaurant in menu.get("restaurants", []):
                park = restaurant.get("park", "unknown")
                parks[park] = parks.get(park, 0) + 1

        for park, count in sorted(parks.items()):
            print(f"  {park.upper()}: {count} restaurant entries")

        # 価格統計
        prices = [m["price"]["amount"] for m in menus if m.get("price", {}).get("amount", 0) > 0]
        if prices:
            print(f"  Price range: ¥{min(prices)} - ¥{max(prices)}")
            print(f"  Average price: ¥{sum(prices) // len(prices)}")


def main():
    """メインエントリーポイント"""
    parser = argparse.ArgumentParser(description="Scrape Disney menu data")
    parser.add_argument("--start", type=int, default=0, help="Start menu ID (default: 0)")
    parser.add_argument("--end", type=int, default=9999, help="End menu ID (default: 9999)")
    parser.add_argument("--output", type=str, default="data/menus.json", help="Output file path")
    parser.add_argument(
        "--rate-limit", type=float, default=1.0, help="Rate limit between batches in seconds (default: 1.0)"
    )
    parser.add_argument("--max-concurrent", type=int, default=10, help="Max concurrent requests (default: 10)")

    args = parser.parse_args()

    print("=" * 60)
    print("Disney Menu Scraper")
    print("=" * 60)
    print(f"Range: {args.start:04d} - {args.end:04d}")
    print(f"Rate limit: {args.rate_limit} seconds")
    print(f"Max concurrent: {args.max_concurrent}")
    print(f"Output: {args.output}")
    print("=" * 60)

    # スクレイピング実行
    menus = asyncio.run(
        scrape_all_menus(
            start_id=args.start, end_id=args.end, rate_limit=args.rate_limit, max_concurrent=args.max_concurrent
        )
    )

    # 保存
    save_menus(menus, args.output)


if __name__ == "__main__":
    main()
