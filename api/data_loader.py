"""
Data loader for menu JSON files
"""

import json
from pathlib import Path
from typing import List, Dict, Optional
from functools import lru_cache
from datetime import datetime, date


class MenuDataLoader:
    """メニューデータローダー"""

    def __init__(self, data_path: str = "data/menus.json"):
        """
        初期化

        Args:
            data_path: メニューデータJSONファイルのパス
        """
        self.data_path = Path(data_path)
        self._cache_timestamp: Optional[datetime] = None

    def load_menus(self, force_reload: bool = False) -> List[Dict]:
        """
        メニューデータを読み込み

        Args:
            force_reload: キャッシュを無視して再読み込みするか

        Returns:
            メニューデータのリスト
        """
        if not self.data_path.exists():
            print(f"Warning: Data file not found: {self.data_path}")
            return []

        # ファイルの更新時刻をチェック
        file_mtime = datetime.fromtimestamp(self.data_path.stat().st_mtime)

        # キャッシュが有効かチェック
        if not force_reload and self._cache_timestamp and file_mtime <= self._cache_timestamp:
            return self._load_from_cache()

        # ファイルから読み込み
        try:
            with open(self.data_path, "r", encoding="utf-8") as f:
                data = json.load(f)
        except json.JSONDecodeError as e:
            print(f"Warning: Invalid JSON in {self.data_path}: {e}")
            return []

        self._cache_timestamp = datetime.now()
        return data

    @lru_cache(maxsize=1)
    def _load_from_cache(self) -> List[Dict]:
        """キャッシュから読み込み（内部使用）"""
        with open(self.data_path, "r", encoding="utf-8") as f:
            return json.load(f)

    def filter_by_availability(self, menus: List[Dict], check_date: Optional[date] = None) -> List[Dict]:
        """
        販売中のメニューのみフィルタ

        Args:
            menus: メニューデータリスト
            check_date: チェック日付（Noneの場合は今日）

        Returns:
            販売中のメニューリスト
        """
        if check_date is None:
            check_date = date.today()

        available_menus = []
        for menu in menus:
            # 各レストランで販売期間をチェック
            has_available_restaurant = False

            for restaurant in menu.get("restaurants", []):
                availability = restaurant.get("availability")

                # 販売期間指定がない場合は常に販売中
                if not availability:
                    has_available_restaurant = True
                    break

                start = availability.get("start_date")
                end = availability.get("end_date")

                # 開始日チェック
                if start:
                    try:
                        start_date = date.fromisoformat(start)
                        if check_date < start_date:
                            continue
                    except ValueError:
                        pass  # 無効な日付の場合はスキップ

                # 終了日チェック
                if end:
                    try:
                        end_date = date.fromisoformat(end)
                        if check_date > end_date:
                            continue
                    except ValueError:
                        pass

                has_available_restaurant = True
                break

            if has_available_restaurant:
                available_menus.append(menu)

        return available_menus

    def get_menu_by_id(self, menu_id: str) -> Optional[Dict]:
        """
        IDでメニューを取得

        Args:
            menu_id: メニューID

        Returns:
            メニューデータまたはNone
        """
        menus = self.load_menus()
        return next((m for m in menus if m["id"] == menu_id), None)

    def get_all_tags(self) -> List[str]:
        """
        全てのタグを取得

        Returns:
            タグのリスト（重複なし、ソート済み）
        """
        menus = self.load_menus()
        tags = set()

        for menu in menus:
            tags.update(menu.get("tags", []))

        return sorted(list(tags))

    def get_all_categories(self) -> List[str]:
        """
        全てのカテゴリを取得

        Returns:
            カテゴリのリスト（重複なし、ソート済み）
        """
        menus = self.load_menus()
        categories = set()

        for menu in menus:
            categories.update(menu.get("categories", []))

        return sorted(list(categories))

    def get_all_restaurants(self) -> List[Dict]:
        """
        全てのレストランを取得

        Returns:
            レストランのリスト（重複なし）
        """
        menus = self.load_menus()
        restaurants = {}

        for menu in menus:
            for restaurant in menu.get("restaurants", []):
                rid = restaurant["id"]
                if rid not in restaurants:
                    restaurants[rid] = restaurant

        return list(restaurants.values())

    def get_stats(self) -> Dict:
        """
        統計情報を取得

        Returns:
            統計情報の辞書
        """
        menus = self.load_menus()
        available_menus = self.filter_by_availability(menus)

        prices = [m["price"]["amount"] for m in menus if m.get("price", {}).get("amount", 0) > 0]

        stats = {
            "total_menus": len(menus),
            "available_menus": len(available_menus),
            "total_tags": len(self.get_all_tags()),
            "total_categories": len(self.get_all_categories()),
            "total_restaurants": len(self.get_all_restaurants()),
        }

        if prices:
            stats["min_price"] = min(prices)
            stats["max_price"] = max(prices)
            stats["avg_price"] = sum(prices) // len(prices)

        if menus:
            scraped_dates = [m.get("scraped_at") for m in menus if m.get("scraped_at")]
            if scraped_dates:
                stats["last_updated"] = max(scraped_dates)

        return stats
