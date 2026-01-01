"""
タグカテゴリ定義

タグを以下のカテゴリに分類:
- food_type: 料理の種類
- drink_type: ドリンク種類
- character: キャラクター
- area: エリア（動的に抽出）
- restaurant: レストラン（動的に抽出）
- features: 特徴
"""

from typing import Dict, List

# タグカテゴリ定義
TAG_CATEGORIES: Dict[str, List[str]] = {
    "food_type": [
        "カレー",
        "ピザ",
        "ハンバーガー",
        "ホットドッグ",
        "サンドウィッチ・パン",
        "中華",
        "ワンハンドメニュー",
        "肉まん",
        "中華まん",
        "肉巻",
        "カルツォーネ",
        "ごはん",
    ],
    "drink_type": [
        "ソフトドリンク",
        "アルコールドリンク",
        "ドリンク（アルコールドリンク）",
        "ペットボトル",
        "フリー・リフィル",
        "カクテル",
        "ビール",
        "ウィスキー",
        "ホット",
        "アイス",
    ],
    "character": [
        "キャラクターモチーフのメニュー",
        "ミッキーマウス",
        "ドナルドダック",
        "プルート",
    ],
    "features": [
        "ワンハンドメニュー",
        "ホット",
        "アイス",
        "スナック",
        "スウィーツ",
    ],
}

# カテゴリ名（日本語）
CATEGORY_LABELS: Dict[str, str] = {
    "food_type": "料理の種類",
    "drink_type": "ドリンク種類",
    "character": "キャラクター",
    "area": "エリア",
    "restaurant": "レストラン",
    "features": "特徴",
}

# メニューカテゴリ定義
MENU_CATEGORIES: Dict[str, Dict[str, any]] = {
    "character_menu": {
        "label": "キャラクターメニュー",
        "description": "キャラクターモチーフの特別メニュー",
    },
    "souvenir_menu": {
        "label": "スーベニア付きメニュー",
        "description": "お土産容器付きのメニュー",
    },
    "sweets": {
        "label": "スイーツ",
        "description": "デザート・お菓子類",
    },
    "food": {
        "label": "料理",
        "description": "食事メニュー（カレー、ピザ、パスタ、ハンバーガーなど）",
    },
    "drink": {
        "label": "ドリンク",
        "description": "飲み物全般（ソフトドリンク、アルコール含む）",
    },
    "snack": {
        "label": "スナック",
        "description": "軽食・おつまみ",
    },
    "set_menu": {
        "label": "セットメニュー",
        "description": "コース料理やセット商品",
    },
    "other": {
        "label": "その他",
        "description": "上記に該当しないメニュー",
    },
}
