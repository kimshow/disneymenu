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
    "main_dish": {
        "label": "メインディッシュ",
        "description": "カトラリー必須のしっかりした食事（カレー、パスタ、丼、中華料理など）",
        "priority": 4,
        "tags": [
            "カレー",
            "カレー味",
            "パスタ",
            "ラーメン",
            "うどん",
            "そば",
            "中華",
            "イタリアン",
            "丼",
            "グラタン",
            "リゾット",
            "ヌードル",
            "点心",
            "餃子",
            "春巻き",
            "焼売",
            "エッグロール",
        ],
    },
    "quick_meal": {
        "label": "クイックミール",
        "description": "ワンハンドで食べられる軽食（バーガー、ホットドッグ、ピザなど）",
        "priority": 5,
        "tags": [
            "ワンハンドメニュー",
            "ワンハンド、食べ歩き、持ち歩き",
            "ハンバーガー",
            "ホットドッグ",
            "サンドイッチ",
            "カルツォーネ",
        ],
    },
    "side_dish": {
        "label": "サイド・トッピング",
        "description": "サイドメニューや追加トッピング（ライス、パン、スープ、サラダなど）",
        "priority": 8,
        "tags": [
            "サイド",
            "トッピング",
            "ライス",
            "ごはん",
            "パン",
            "パン/ライス",
            "サンドウィッチ・パン",
            "スープ",
            "サラダ",
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
        "tags": [
            "コース料理",
            "セット",
            "コース",
            "ディナーセット",
            "ランチセット",
            "モーニングセット",
            "お子様メニュー",
        ],
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
    メニューのタグとメニュー名に基づいてカテゴリを判定

    優先順位: character_menu > souvenir_menu > set_menu > sweets > quick_meal > main_dish > side_dish > drink > snack > other

    判定ロジック:
    1. タグベースの判定（既存ロジック）
    2. メニュー名ベースの判定（特定の料理名や特徴）
    3. ワンハンドメニューの特別判定
    """
    tags = set(menu.get("tags", []))
    menu_name = menu.get("name", "")

    # 特別な判定ルール（優先度順）

    # 1. ワンハンドメニュー判定（quick_mealへ）
    # ただし、サイドディッシュやスナックに該当するものは除外
    is_onehand = "ワンハンドメニュー" in tags or "ワンハンド、食べ歩き、持ち歩き" in tags
    is_side = any(keyword in menu_name.lower() for keyword in ["ライス", "パン", "スープ", "サラダ"])

    if is_onehand and not is_side:
        # スナックタグがある場合はスナック優先
        if not any(tag in tags for tag in ["スナック", "チュロス", "ポテト"]):
            return "quick_meal"

    # 2. サイド・トッピング判定
    side_keywords = ["ライス", "パン", "スープ", "チャウダー", "サラダ", "トッピング", "メンマ", "白髪ねぎ", "チーズ（"]
    if any(keyword in menu_name for keyword in side_keywords):
        # ただし、「コンビカリー」のような複合メニューは例外
        if "コンビカリー" in menu_name or "タンドーリチキン添え" in menu_name:
            return "main_dish"
        return "side_dish"

    # 3. メインディッシュの名前判定（ピザを含む）
    main_dish_keywords = {
        "チャーハン": "main_dish",
        "炒飯": "main_dish",
        "海老のチリソース": "main_dish",
        "マーボー豆腐": "main_dish",
        "麻婆豆腐": "main_dish",
        "ハンバーグ": "main_dish",
        "ピザ": "main_dish",  # ワンハンドでなければmain_dish
        "ピッツァ": "main_dish",
        "カルツォーネ": "main_dish",  # ワンハンドでなければmain_dish
        "ローストチキン": "main_dish",
        "フランクステーキ": "main_dish",
        "寿司": "quick_meal",  # 寿司ロールはワンハンド
        "タンドーリチキン": "side_dish",
        "春巻き": "side_dish",
        "餃子": "side_dish",
        "ポップン": "side_dish",
    }

    for keyword, category in main_dish_keywords.items():
        if keyword in menu_name:
            # ピザ・カルツォーネでワンハンドタグがある場合はquick_mealを維持
            if keyword in ["ピザ", "ピッツァ", "カルツォーネ"] and is_onehand:
                return "quick_meal"
            return category

    # 4. スイーツ判定（otherから移動）
    sweets_keywords = ["ブラウニー", "クッキー", "マフィン", "ケーキ", "タルト"]
    if any(keyword in menu_name for keyword in sweets_keywords):
        return "sweets"

    # 5. その他の特殊判定
    # カップサラダ、コーンチップスなどはside_dish
    if "カップサラダ" in menu_name or "コーンチップス" in menu_name:
        return "side_dish"

    # アソーテッドスナック、低アレルゲンメニュー、シリコーンモールドなどはother
    if any(keyword in menu_name for keyword in ["アソーテッド", "低アレルゲンメニュー", "シリコーンモールド"]):
        return "other"

    # 6. 通常のタグベース判定
    matched_categories = []
    for category_key, category_info in MENU_CATEGORIES.items():
        if category_key == "other":
            continue

        category_tags = set(category_info["tags"])
        if tags & category_tags:  # 交差があれば
            matched_categories.append((category_key, category_info["priority"]))

    # タグベースでマッチしない場合、メニュー名から判定
    if not matched_categories:
        food_name_keywords = {
            "バーガー": "quick_meal",
            "ハンバーガー": "quick_meal",
            "ホットドッグ": "quick_meal",
            "ドッグ": "quick_meal",
            "サンド": "quick_meal",
            "ポテト": "snack",
            "フライ": "snack",
            "チュロス": "snack",
        }

        for keyword, category_key in food_name_keywords.items():
            if keyword in menu_name:
                priority = MENU_CATEGORIES[category_key]["priority"]
                matched_categories.append((category_key, priority))
                break

    # それでもマッチしない場合は 'other'
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
