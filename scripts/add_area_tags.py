#!/usr/bin/env python3
"""
エリアタグ追加スクリプト

目的:
- restaurantsフィールドのarea情報をtagsに追加
- 各メニューに関連するエリアをタグとして付与

使用方法:
    python scripts/add_area_tags.py [--dry-run]

オプション:
    --dry-run  実際の変更を行わず、変更内容のみを表示
"""

import json
import shutil
from datetime import datetime
from pathlib import Path
from collections import Counter
import sys


def add_area_tags(data_path: Path, dry_run: bool = False) -> dict:
    """
    エリアタグを追加

    Args:
        data_path: データファイルのパス
        dry_run: True の場合、実際の変更を行わない

    Returns:
        実行結果の統計情報
    """
    # データ読み込み
    print(f"📂 データ読み込み: {data_path}")
    with open(data_path, "r", encoding="utf-8") as f:
        menus = json.load(f)

    total_menus = len(menus)

    # 変更前の統計
    areas_in_tags_before = Counter()
    for menu in menus:
        for tag in menu.get("tags", []):
            for restaurant in menu.get("restaurants", []):
                if tag == restaurant.get("area"):
                    areas_in_tags_before[tag] += 1

    print(f"\n📊 変更前の状態:")
    print(f"   - 総メニュー数: {total_menus:,} 件")
    print(f"   - エリアタグが既に付与されているメニュー数: {sum(areas_in_tags_before.values())} 件")
    print(f"   - ユニークエリアタグ数: {len(areas_in_tags_before)} 個")

    if areas_in_tags_before:
        print("\n   既存のエリアタグ:")
        for area, count in areas_in_tags_before.most_common():
            print(f"     - {area}: {count} 回")

    if dry_run:
        print("\n⚠️  --dry-run モードのため、実際の変更は行いません")

        # ドライランでの影響範囲を表示
        print("\n📝 追加されるエリアタグの予測:")
        areas_to_add = Counter()
        for menu in menus:
            current_tags = set(menu.get("tags", []))
            for restaurant in menu.get("restaurants", []):
                area = restaurant.get("area")
                if area and area not in current_tags:
                    areas_to_add[area] += 1

        for area, count in sorted(areas_to_add.items()):
            print(f"     - {area}: {count} メニューに追加")

        return {}

    # バックアップ作成
    backup_path = data_path.parent / f"menus_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    print(f"\n💾 バックアップ作成: {backup_path}")
    shutil.copy(data_path, backup_path)

    # 各メニューにエリアタグを追加
    print("\n🏷️  エリアタグ追加実行中...")
    changed_menus = 0
    added_tags_count = 0
    areas_added = Counter()

    for menu in menus:
        original_tags = menu.get("tags", [])
        current_tags = set(original_tags)
        tags_to_add = []

        # restaurantsフィールドからエリアを取得
        for restaurant in menu.get("restaurants", []):
            area = restaurant.get("area")

            # エリアがあり、まだタグに含まれていない場合
            if area and area not in current_tags:
                tags_to_add.append(area)
                current_tags.add(area)  # 重複チェック用
                areas_added[area] += 1

        # タグを追加
        if tags_to_add:
            new_tags = original_tags + tags_to_add
            menu["tags"] = new_tags
            changed_menus += 1
            added_tags_count += len(tags_to_add)

    # データ保存
    print(f"\n💾 変更後のデータ保存: {data_path}")
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(menus, f, ensure_ascii=False, indent=2)

    # 変更後の統計
    areas_in_tags_after = Counter()
    for menu in menus:
        for tag in menu.get("tags", []):
            for restaurant in menu.get("restaurants", []):
                if tag == restaurant.get("area"):
                    areas_in_tags_after[tag] += 1

    print("\n✅ エリアタグ追加完了")
    print(f"   - 変更されたメニュー数: {changed_menus:,} 件")
    print(f"   - 追加されたエリアタグ数: {added_tags_count:,} 個")
    print(f"   - ユニークエリア数: {len(areas_added)} 個")

    print("\n📊 追加されたエリア別統計:")
    for area, count in sorted(areas_added.items()):
        print(f"   - {area}: {count} メニューに追加")

    print(f"\n📊 変更後のエリアタグ出現回数:")
    for area, count in sorted(areas_in_tags_after.items()):
        print(f"   - {area}: {count} 回")

    return {
        "changed_menus": changed_menus,
        "added_tags_count": added_tags_count,
        "areas_added": dict(areas_added),
    }


def main():
    """メイン処理"""
    # コマンドライン引数の解析
    dry_run = "--dry-run" in sys.argv

    # データファイルのパス
    data_path = Path(__file__).parent.parent / "data" / "menus.json"

    if not data_path.exists():
        print(f"❌ エラー: データファイルが見つかりません: {data_path}")
        sys.exit(1)

    print("=" * 80)
    print("エリアタグ追加スクリプト")
    print("=" * 80)
    print()

    try:
        result = add_area_tags(data_path, dry_run=dry_run)

        if not dry_run:
            print("\n" + "=" * 80)
            print("✅ 処理が正常に完了しました")
            print("=" * 80)
            print()
            print("バックアップファイルから復元する場合:")
            print("  cp data/menus_backup_YYYYMMDD_HHMMSS.json data/menus.json")
            print()

    except Exception as e:
        print(f"\n❌ エラーが発生しました: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
