#!/usr/bin/env python3
"""
Menu data validation script
Usage: python scripts/validate_menus.py data/menus.json
"""
import json
import sys
from pathlib import Path
from collections import Counter
from typing import List, Dict


def validate_menus(file_path: str) -> Dict:
    """メニューデータを検証"""
    
    with open(file_path, 'r', encoding='utf-8') as f:
        menus = json.load(f)
    
    results = {
        "total_count": len(menus),
        "errors": [],
        "warnings": [],
        "statistics": {}
    }
    
    # 必須フィールド定義
    required_fields = ["id", "name", "price", "restaurants", "categories"]
    
    # 1. 必須フィールドチェック
    for idx, menu in enumerate(menus):
        for field in required_fields:
            if field not in menu or not menu[field]:
                results["errors"].append(
                    f"Menu {idx} (ID: {menu.get('id', 'unknown')}): Missing or empty '{field}'"
                )
    
    # 2. 重複ID検査
    ids = [m["id"] for m in menus]
    duplicates = [id for id, count in Counter(ids).items() if count > 1]
    if duplicates:
        results["errors"].append(f"Duplicate IDs found: {duplicates}")
    
    # 3. 価格範囲チェック
    prices = []
    for m in menus:
        price = m.get("price")
        if price:
            # priceがdictの場合はamountを取得
            if isinstance(price, dict):
                prices.append(price.get("amount", 0))
            else:
                prices.append(price)
    
    if prices:
        results["statistics"]["price"] = {
            "min": min(prices),
            "max": max(prices),
            "avg": sum(prices) // len(prices),
            "median": sorted(prices)[len(prices) // 2]
        }
        
        # 異常な価格値の警告
        for menu in menus:
            price = menu.get("price")
            price_amount = price.get("amount", 0) if isinstance(price, dict) else price if price else 0
            
            if price_amount > 10000:
                results["warnings"].append(
                    f"High price detected: {menu['name']} - ¥{price_amount}"
                )
            if price_amount < 100 and price_amount > 0:
                results["warnings"].append(
                    f"Low price detected: {menu['name']} - ¥{price_amount}"
                )
    
    # 4. パーク分布
    parks = []
    for m in menus:
        if m.get("restaurants"):
            for restaurant in m["restaurants"]:
                if isinstance(restaurant, dict):
                    park = restaurant.get("park", "")
                    if park == "tdl":
                        parks.append("ランド")
                    elif park == "tds":
                        parks.append("シー")
                    elif park:
                        parks.append(park)
    results["statistics"]["park_distribution"] = dict(Counter(parks))
    
    # 5. カテゴリー分布
    categories = []
    for menu in menus:
        if menu.get("categories"):
            categories.extend(menu["categories"])
    results["statistics"]["category_distribution"] = dict(Counter(categories).most_common(10))
    
    # 6. レストラン数
    restaurants = set()
    for menu in menus:
        if menu.get("restaurants"):
            for restaurant in menu["restaurants"]:
                if isinstance(restaurant, dict):
                    restaurants.add(restaurant.get("name", ""))
                else:
                    restaurants.add(str(restaurant))
    results["statistics"]["unique_restaurants"] = len(restaurants)
    
    # 7. 画像付きメニューの割合
    menus_with_images = sum(1 for m in menus if m.get("images") or m.get("image_url"))
    results["statistics"]["image_coverage"] = f"{menus_with_images}/{len(menus)} ({menus_with_images*100//len(menus) if len(menus) > 0 else 0}%)"
    
    return results


def print_validation_results(results: Dict):
    """検証結果を出力"""
    print("=" * 60)
    print("📊 Menu Data Validation Results")
    print("=" * 60)
    
    print(f"\n✅ Total Menus: {results['total_count']}")
    
    if results["errors"]:
        print(f"\n❌ Errors ({len(results['errors'])}):")
        for error in results["errors"][:10]:  # 最初の10件のみ表示
            print(f"  - {error}")
        if len(results["errors"]) > 10:
            print(f"  ... and {len(results['errors']) - 10} more errors")
    else:
        print("\n✅ No critical errors found")
    
    if results["warnings"]:
        print(f"\n⚠️  Warnings ({len(results['warnings'])}):")
        for warning in results["warnings"][:10]:
            print(f"  - {warning}")
        if len(results["warnings"]) > 10:
            print(f"  ... and {len(results['warnings']) - 10} more warnings")
    
    print("\n📈 Statistics:")
    stats = results["statistics"]
    
    if "price" in stats:
        print(f"  Price Range: ¥{stats['price']['min']} - ¥{stats['price']['max']}")
        print(f"  Average Price: ¥{stats['price']['avg']}")
        print(f"  Median Price: ¥{stats['price']['median']}")
    
    if "park_distribution" in stats:
        print(f"  Park Distribution:")
        for park, count in stats["park_distribution"].items():
            print(f"    - {park}: {count} menus")
    
    if "category_distribution" in stats:
        print(f"  Top Categories:")
        for category, count in list(stats["category_distribution"].items())[:5]:
            print(f"    - {category}: {count} items")
    
    if "unique_restaurants" in stats:
        print(f"  Unique Restaurants: {stats['unique_restaurants']}")
    
    if "image_coverage" in stats:
        print(f"  Image Coverage: {stats['image_coverage']}")
    
    print("\n" + "=" * 60)
    
    # 判定
    if results["errors"]:
        print("❌ Validation FAILED - Please fix errors above")
        return 1
    elif results["warnings"]:
        print("⚠️  Validation PASSED with warnings")
        return 0
    else:
        print("✅ Validation PASSED successfully")
        return 0


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/validate_menus.py data/menus.json")
        sys.exit(1)
    
    file_path = sys.argv[1]
    
    if not Path(file_path).exists():
        print(f"❌ Error: File not found: {file_path}")
        sys.exit(1)
    
    results = validate_menus(file_path)
    exit_code = print_validation_results(results)
    sys.exit(exit_code)
