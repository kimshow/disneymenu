#!/usr/bin/env python3
"""
GitHub Actionsのコミットメッセージ用の統計情報を生成

使用方法:
    python scripts/generate_commit_stats.py data/menus.json

出力:
    メニュー数と料理種類タグの統計（1行）
"""

import json
import sys
from pathlib import Path


def generate_stats(menus_path: str) -> dict:
    """統計情報を生成"""
    with open(menus_path, "r", encoding="utf-8") as f:
        menus = json.load(f)

    # 総メニュー数
    total = len(menus)

    # 料理種類タグの統計
    food_tags = ["麺類", "ご飯もの", "パン", "肉料理", "魚介料理", "ピザ", "デザート"]
    stats = []
    for tag in food_tags:
        count = sum(1 for m in menus if tag in m.get("tags", []))
        if count > 0:
            stats.append(f"{tag}:{count}")

    food_stats_str = ", ".join(stats[:5])  # 上位5つ

    return {"total": total, "food_stats": food_stats_str}


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate_commit_stats.py <menus.json>", file=sys.stderr)
        sys.exit(1)

    menus_path = sys.argv[1]

    if not Path(menus_path).exists():
        print(f"Error: {menus_path} not found", file=sys.stderr)
        sys.exit(1)

    stats = generate_stats(menus_path)

    # GitHub Actions用の出力
    print(f"MENU_COUNT={stats['total']}")
    print(f"FOOD_TAG_STATS={stats['food_stats']}")


if __name__ == "__main__":
    main()
