#!/usr/bin/env python3
"""
タグクリーニングスクリプト

目的:
- 無意味なタグ（おすすめメニュー）の削除
- 冗長なタグ（価格帯、サービスタイプ）の削除
- タグ名の正規化（括弧付きタグの統一など）
- 重複タグの削除

使用方法:
    python scripts/clean_tags.py [--dry-run]

オプション:
    --dry-run  実際の変更を行わず、変更内容のみを表示
"""

import json
import shutil
from datetime import datetime
from pathlib import Path
from collections import Counter
import sys

# 削除対象タグ（Phase 1 - 既に実行済み）
REMOVE_TAGS_PHASE1 = [
    # 無意味なタグ
    "おすすめメニュー",  # ほぼ全メニューに付与されており無意味
    # 価格帯タグ（priceフィールドで検索可能）
    "～500円",
    "500～1000円",
    "1000～2000円",
    "2000円～",
    # サービスタイプタグ（restaurants.service_typesに移動すべき）
    "カウンターサービス",
    "テーブルサービス",
    "ブッフェサービス",
    "ワゴンサービス",
    "バフェテリアサービス",
    # カテゴリフィールドと重複
    "メインディッシュ",
    "サイド",
]

# 削除対象タグ（Phase 2 - 冗長・重複タグ）
REMOVE_TAGS_PHASE2 = [
    # アルコールドリンク重複
    "ドリンク（アルコールドリンク）",  # 'アルコールドリンク'で代替可能
    # 価格帯タグ（残存分）
    "2000～4000円",
    "4000円～",
]

# 統合削除リスト
REMOVE_TAGS = REMOVE_TAGS_PHASE1 + REMOVE_TAGS_PHASE2

# タグ正規化マップ
TAG_NORMALIZATION = {
    # 括弧付きタグを統一
    "ドリンク（ソフトドリンク）": "ソフトドリンク",
    "ひんやり（アイス）": "アイス",
    "あったかい（ホット）": "ホット",
    # 表記ゆれの統一
    "ミッキーモチーフのメニュー": "ミッキーマウス",
}


def analyze_tags(menus: list) -> dict:
    """タグの使用状況を分析"""
    all_tags = []
    menus_with_tags = 0
    tag_counter = Counter()

    for menu in menus:
        tags = menu.get("tags", [])
        if tags:
            menus_with_tags += 1
            all_tags.extend(tags)
            tag_counter.update(tags)

    return {
        "total_menus": len(menus),
        "menus_with_tags": menus_with_tags,
        "total_tags": len(all_tags),
        "unique_tags": len(tag_counter),
        "tag_counter": tag_counter,
    }


def clean_and_normalize_tags(data_path: Path, dry_run: bool = False) -> dict:
    """
    タグのクリーニングと正規化を実行

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

    # クリーニング前の分析
    print("\n📊 クリーニング前の分析...")
    before_stats = analyze_tags(menus)
    print(f"   - 総メニュー数: {before_stats['total_menus']:,} 件")
    print(f"   - タグが付与されているメニュー数: {before_stats['menus_with_tags']:,} 件")
    print(f"   - 総タグ数（重複含む）: {before_stats['total_tags']:,} 個")
    print(f"   - ユニークタグ数: {before_stats['unique_tags']:,} 個")

    # 削除対象タグの出現回数を表示
    print("\n🗑️  削除対象タグの出現回数:")
    for tag in REMOVE_TAGS:
        count = before_stats["tag_counter"].get(tag, 0)
        if count > 0:
            print(f"   - {tag}: {count:,} 回")

    # 正規化対象タグの出現回数を表示
    print("\n🔄 正規化対象タグの出現回数:")
    for old_tag, new_tag in TAG_NORMALIZATION.items():
        count = before_stats["tag_counter"].get(old_tag, 0)
        if count > 0:
            print(f"   - {old_tag} → {new_tag}: {count:,} 回")

    if dry_run:
        print("\n⚠️  --dry-run モードのため、実際の変更は行いません")
        return before_stats

    # バックアップ作成
    backup_path = data_path.parent / f"menus_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    print(f"\n💾 バックアップ作成: {backup_path}")
    shutil.copy(data_path, backup_path)

    # 各メニューのタグをクリーニング
    print("\n🧹 タグクリーニング実行中...")
    changed_menus = 0
    removed_tag_count = 0
    normalized_tag_count = 0

    for menu in menus:
        original_tags = menu.get("tags", [])

        if not original_tags:
            continue

        # 1. 削除対象タグを除外
        cleaned_tags = [tag for tag in original_tags if tag not in REMOVE_TAGS]
        removed_tag_count += len(original_tags) - len(cleaned_tags)

        # 2. 正規化
        normalized_tags = []
        for tag in cleaned_tags:
            normalized_tag = TAG_NORMALIZATION.get(tag, tag)
            normalized_tags.append(normalized_tag)
            if tag != normalized_tag:
                normalized_tag_count += 1

        # 3. 重複削除（順序を保持）
        unique_tags = list(dict.fromkeys(normalized_tags))

        # タグが変更された場合のみカウント
        if set(original_tags) != set(unique_tags):
            changed_menus += 1

        menu["tags"] = unique_tags

    # データ保存
    print(f"\n💾 クリーニング後のデータ保存: {data_path}")
    with open(data_path, "w", encoding="utf-8") as f:
        json.dump(menus, f, ensure_ascii=False, indent=2)

    # クリーニング後の分析
    print("\n📊 クリーニング後の分析...")
    after_stats = analyze_tags(menus)
    print(f"   - 総メニュー数: {after_stats['total_menus']:,} 件")
    print(f"   - タグが付与されているメニュー数: {after_stats['menus_with_tags']:,} 件")
    print(f"   - 総タグ数（重複含む）: {after_stats['total_tags']:,} 個")
    print(f"   - ユニークタグ数: {after_stats['unique_tags']:,} 個")

    # サマリー
    print("\n✅ クリーニング完了")
    print(f"   - 変更されたメニュー数: {changed_menus:,} 件")
    print(f"   - 削除されたタグ数: {removed_tag_count:,} 個")
    print(f"   - 正規化されたタグ数: {normalized_tag_count:,} 個")
    print(
        f"   - ユニークタグ数の変化: {before_stats['unique_tags']} → {after_stats['unique_tags']} ({after_stats['unique_tags'] - before_stats['unique_tags']:+d})"
    )

    # TOP 30 タグを表示
    print("\n📊 クリーニング後の TOP 30 タグ:")
    for i, (tag, count) in enumerate(after_stats["tag_counter"].most_common(30), 1):
        print(f"   {i:2d}. {tag}: {count:,} 回")

    return {
        "before": before_stats,
        "after": after_stats,
        "changed_menus": changed_menus,
        "removed_tag_count": removed_tag_count,
        "normalized_tag_count": normalized_tag_count,
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
    print("タグクリーニングスクリプト")
    print("=" * 80)
    print()

    try:
        result = clean_and_normalize_tags(data_path, dry_run=dry_run)

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
