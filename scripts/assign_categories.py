#!/usr/bin/env python3
"""
カテゴリ自動割り当てスクリプト

目的:
- メニューの種類に応じて適切なカテゴリを自動割り当て
- タグベースの判定ロジックで分類
- N/Aカテゴリを解消

使用方法:
    python scripts/assign_categories.py [--dry-run]

オプション:
    --dry-run  実際の変更を行わず、変更内容のみを表示
"""

import json
import shutil
from datetime import datetime
from pathlib import Path
from collections import Counter
import sys

# カテゴリ定義
MENU_CATEGORIES = {
    "food": {
        "label": "料理",
        "description": "食事メニュー（カレー、ピザ、パスタ、ハンバーガーなど）",
        "priority": 4,
        "tags": [
            "カレー",
            "ピザ",
            "ハンバーガー",
            "パスタ",
            "ラーメン",
            "うどん",
            "そば",
            "チャーハン",
            "サンドイッチ",
            "スープ",
            "サラダ",
            "ポップコーン",
            "ライス",
            "パン",
            "丼",
            "グラタン",
            "リゾット",
            "ヌードル",
            "点心",
            "餃子",
            "春巻き",
            "焼売",
            "エッグロール",
            "チキン",
            "ポーク",
            "ビーフ",
            "シーフード",
            "ベジタブル",
            "フライ",
            "グリル",
        ],
    },
    "drink": {
        "label": "ドリンク",
        "description": "飲み物全般（ソフトドリンク、アルコール含む）",
        "priority": 5,
        "tags": [
            "ソフトドリンク",
            "アルコールドリンク",
            "ビール",
            "カクテル",
            "ウィスキー",
            "ペットボトル",
            "フリー・リフィル",
            "ワイン",
            "スパークリング",
            "ジュース",
            "コーヒー",
            "ティー",
            "ラテ",
            "エスプレッソ",
            "カプチーノ",
            "ミルクシェイク",
            "スムージー",
        ],
    },
    "sweets": {
        "label": "スイーツ",
        "description": "デザート・お菓子類",
        "priority": 3,
        "tags": [
            "スウィーツ",
            "アイス",
            "アイスクリーム",
            "ケーキ",
            "パフェ",
            "プリン",
            "ムース",
            "タルト",
            "クレープ",
            "ワッフル",
            "パンケーキ",
            "ドーナツ",
            "マフィン",
            "クッキー",
            "チョコレート",
            "キャンディ",
        ],
    },
    "snack": {
        "label": "スナック",
        "description": "軽食・おつまみ",
        "priority": 6,
        "tags": ["スナック", "ポテト", "チュロス", "ナッツ", "チップス", "クラッカー", "プレッツェル"],
    },
    "set_menu": {
        "label": "セットメニュー",
        "description": "コース料理やセット商品",
        "priority": 7,
        "tags": ["コース料理", "セット", "コース", "ディナーセット", "ランチセット", "モーニングセット"],
    },
    "souvenir_menu": {
        "label": "スーベニア付きメニュー",
        "description": "お土産容器付きのメニュー",
        "priority": 2,
        "tags": ["スーベニア付きメニュー"],
    },
    "character_menu": {
        "label": "キャラクターメニュー",
        "description": "キャラクターモチーフの特別メニュー",
        "priority": 1,
        "tags": [
            "キャラクターモチーフのメニュー",
            "ミッキーマウス",
            "ミニーマウス",
            "ドナルドダック",
            "グーフィー",
            "プルート",
            "チップとデール",
        ],
    },
    "other": {"label": "その他", "description": "上記に該当しないメニュー", "priority": 999, "tags": []},
}


def determine_category(menu: dict) -> str:
    """
    メニューのタグに基づいてカテゴリを判定

    優先順位: character_menu > souvenir_menu > sweets > food > drink > snack > set_menu > other
    """
    tags = set(menu.get("tags", []))

    # カテゴリごとにマッチするタグをチェック
    matched_categories = []
    for category_key, category_info in MENU_CATEGORIES.items():
        if category_key == "other":
            continue

        category_tags = set(category_info["tags"])
        if tags & category_tags:  # 交差があれば
            matched_categories.append((category_key, category_info["priority"]))

    # マッチしたカテゴリがない場合は 'other'
    if not matched_categories:
        return "other"

    # 優先順位が最も高い（数値が小さい）カテゴリを選択
    matched_categories.sort(key=lambda x: x[1])
    return matched_categories[0][0]


def analyze_category_distribution(menus: list) -> dict:
    """カテゴリ分布を分析"""
    category_counter = Counter()
    for menu in menus:
        category = menu.get("category", "N/A")
        category_counter[category] += 1

    return {
        "total_menus": len(menus),
        "category_distribution": dict(category_counter),
        "unique_categories": len(category_counter),
    }


def assign_categories(data_path: str, dry_run: bool = False) -> dict:
    """
    メニューにカテゴリを自動割り当て

    Args:
        data_path: menus.jsonへのパス
        dry_run: Trueの場合、実際の変更を行わない

    Returns:
        変更統計情報
    """
    data_path = Path(data_path)

    print("=" * 80)
    print("カテゴリ自動割り当てスクリプト".center(80))
    print("=" * 80)
    print()
    print(f"📂 データ読み込み: {data_path}")

    # データ読み込み
    with open(data_path, "r", encoding="utf-8") as f:
        menus = json.load(f)

    # 割り当て前の分析
    print("\n📊 割り当て前の分析...")
    before_stats = analyze_category_distribution(menus)
    print(f"   - 総メニュー数: {before_stats['total_menus']:,} 件")
    print(f"   - カテゴリ分布:")
    for cat, count in sorted(before_stats["category_distribution"].items(), key=lambda x: -x[1]):
        print(f"     • {cat}: {count:,} 件")

    # カテゴリ割り当て実行
    print("\n🏷️  カテゴリ割り当て中...")
    changes = []
    category_assignments = Counter()

    for menu in menus:
        old_category = menu.get("category", "N/A")
        new_category = determine_category(menu)

        if old_category != new_category:
            changes.append(
                {
                    "menu_id": menu.get("id"),
                    "menu_name": menu.get("name"),
                    "old_category": old_category,
                    "new_category": new_category,
                    "tags": menu.get("tags", []),
                }
            )
            menu["category"] = new_category

        category_assignments[new_category] += 1

    # 割り当て後の分析
    after_stats = analyze_category_distribution(menus)

    print(f"\n📊 割り当て結果:")
    print(f"   - 変更されたメニュー数: {len(changes):,} 件")
    print(f"\n   - カテゴリ別割り当て数:")
    for category_key in sorted(MENU_CATEGORIES.keys(), key=lambda k: MENU_CATEGORIES[k]["priority"]):
        count = category_assignments.get(category_key, 0)
        label = MENU_CATEGORIES[category_key]["label"]
        percentage = (count / len(menus)) * 100
        print(f"     • {label} ({category_key}): {count:,} 件 ({percentage:.1f}%)")

    # サンプル表示（各カテゴリから3件ずつ）
    print(f"\n📋 カテゴリ別メニューサンプル（各3件）:")
    for category_key in sorted(MENU_CATEGORIES.keys(), key=lambda k: MENU_CATEGORIES[k]["priority"]):
        label = MENU_CATEGORIES[category_key]["label"]
        sample_menus = [m for m in menus if m.get("category") == category_key][:3]
        if sample_menus:
            print(f"\n   【{label}】")
            for menu in sample_menus:
                tags_str = ", ".join(menu.get("tags", [])[:3])
                print(f"     - {menu.get('name')}: {tags_str}...")

    if not dry_run:
        # バックアップ作成
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = data_path.parent / f"menus_backup_{timestamp}.json"
        print(f"\n💾 バックアップ作成: {backup_path}")
        shutil.copy2(data_path, backup_path)

        # データ保存
        with open(data_path, "w", encoding="utf-8") as f:
            json.dump(menus, f, ensure_ascii=False, indent=2)

        print(f"💾 更新後のデータ保存: {data_path}")
        print("\n✅ カテゴリ割り当て完了")
    else:
        print("\n⚠️  --dry-run モードのため、実際の変更は行いません")

    return {"total_changes": len(changes), "category_assignments": dict(category_assignments), "changes": changes}


def main():
    """メインエントリポイント"""
    import argparse

    parser = argparse.ArgumentParser(
        description="メニューにカテゴリを自動割り当て", formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument("--dry-run", action="store_true", help="実際の変更を行わず、変更内容のみを表示")
    parser.add_argument(
        "--data", default="data/menus.json", help="menus.jsonファイルのパス（デフォルト: data/menus.json）"
    )

    args = parser.parse_args()

    try:
        result = assign_categories(args.data, dry_run=args.dry_run)

        print("\n" + "=" * 80)
        print("✅ 処理が正常に完了しました".center(80))
        print("=" * 80)
        print("\nバックアップファイルから復元する場合:")
        print("  cp data/menus_backup_YYYYMMDD_HHMMSS.json data/menus.json")

        sys.exit(0)
    except Exception as e:
        print(f"\n❌ エラーが発生しました: {str(e)}", file=sys.stderr)
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
