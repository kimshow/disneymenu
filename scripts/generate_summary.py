#!/usr/bin/env python3
"""
GitHub Actions サマリー用のMarkdownを生成

使用方法:
    python scripts/generate_summary.py data/menus.json [changed]

引数:
    menus.json: メニューデータファイル
    changed: データが変更された場合は"changed"を指定（オプション）
"""

import json
import sys
from pathlib import Path
from collections import Counter


def generate_summary(menus_path: str, data_changed: bool = False) -> str:
    """GitHub Actions サマリー用のMarkdownを生成"""

    if not Path(menus_path).exists():
        return "❌ スクレイピングに失敗しました"

    with open(menus_path, "r", encoding="utf-8") as f:
        menus = json.load(f)

    total = len(menus)

    # パーク別統計
    tdl_count = sum(1 for m in menus if any(r.get("park") == "tdl" for r in m.get("restaurants", [])))
    tds_count = sum(1 for m in menus if any(r.get("park") == "tds" for r in m.get("restaurants", [])))

    # 料理種類タグ統計
    food_tags = ["麺類", "ご飯もの", "パン", "肉料理", "魚介料理", "ピザ", "スープ", "デザート", "アイスクリーム"]
    food_stats = []
    for tag in food_tags:
        count = sum(1 for m in menus if tag in m.get("tags", []))
        if count > 0:
            food_stats.append((tag, count))

    # カテゴリ統計
    categories = Counter(m.get("category", "unknown") for m in menus if m.get("category"))

    # Markdown生成
    lines = [
        "## 🍴 スクレイピング実行結果",
        "",
        f"✅ **総メニュー数**: {total}件",
        "",
        "### 📊 統計情報",
        f"- **ディズニーランド**: {tdl_count}件",
        f"- **ディズニーシー**: {tds_count}件",
    ]

    # 料理種類タグ
    if food_stats:
        lines.append("")
        lines.append("### 🍽️ 料理種類タグ（上位5件）")
        for tag, count in sorted(food_stats, key=lambda x: x[1], reverse=True)[:5]:
            lines.append(f"- {tag}: {count}件")

    # カテゴリ分布
    if categories:
        lines.append("")
        lines.append("### 📁 カテゴリ分布")
        for cat, count in categories.most_common(5):
            lines.append(f"- {cat}: {count}件")

    # 実行内容
    lines.append("")
    if data_changed:
        lines.extend(
            [
                "### 🔄 実行内容",
                "1. ✅ メニュースクレイピング",
                "2. ✅ カテゴリ自動割り当て",
                "3. ✅ タグ正規化",
                "4. ✅ 料理種類タグ付与",
                "5. ✅ データ検証",
                "6. ✅ Gitコミット・プッシュ",
                "7. 🚀 Vercel本番デプロイ",
                "",
                "🎉 **データが更新され、本番環境にデプロイされました！**",
            ]
        )
    else:
        lines.append("ℹ️ データに変更はありませんでした")

    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/generate_summary.py <menus.json> [changed]", file=sys.stderr)
        sys.exit(1)

    menus_path = sys.argv[1]
    data_changed = len(sys.argv) > 2 and sys.argv[2] == "changed"

    summary = generate_summary(menus_path, data_changed)
    print(summary)


if __name__ == "__main__":
    main()
