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

# タグカテゴリ定義（Phase 4対応: 統合済み、新規メニュー反映）
TAG_CATEGORIES: Dict[str, List[str]] = {
    "food_type": [
        "カレー",
        "ピザ",
        "ハンバーガー",
        "ホットドッグ",
        "中華",
        "ワンハンドメニュー",
        "中華まん",  # 「肉まん」統合済み
        "肉巻",
        "カルツォーネ",
        "ライス",  # 「ごはん」統合済み
        "パスタ",
        "イタリアン",
        "タンドーリチキン",
        "ポップコーン",
        "セット",
        "お子様メニュー",
        "デザート／スウィーツ",
    ],
    "drink_type": [
        "ソフトドリンク",
        "アルコールドリンク",
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
        "ダッフィー",
        "ダッフィー＆フレンズ",
        "リーナ・ベル",
        "クッキー・アン",
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

# メニューカテゴリ定義（新構造: カトラリー要否で分類）
MENU_CATEGORIES: Dict[str, Dict[str, any]] = {
    "character_menu": {
        "label": "キャラクターメニュー",
        "description": "キャラクターモチーフの特別メニュー",
    },
    "souvenir_menu": {
        "label": "スーベニア付きメニュー",
        "description": "お土産容器付きのメニュー",
    },
    "set_menu": {
        "label": "セットメニュー",
        "description": "コース料理やセット商品",
    },
    "sweets": {
        "label": "スイーツ",
        "description": "デザート・お菓子類",
    },
    "main_dish": {
        "label": "メインディッシュ",
        "description": "カトラリー必須のしっかりした食事（カレー、パスタ、ピザなど）",
    },
    "quick_meal": {
        "label": "クイックミール",
        "description": "ワンハンドで食べられる軽食（バーガー、ホットドッグなど）",
    },
    "side_dish": {
        "label": "サイド・トッピング",
        "description": "サイドメニューや追加トッピング（ライス、パン、スープなど）",
    },
    "drink": {
        "label": "ドリンク",
        "description": "飲み物全般（ソフトドリンク、アルコール含む）",
    },
    "snack": {
        "label": "スナック",
        "description": "軽食・おつまみ",
    },
    "other": {
        "label": "その他",
        "description": "上記に該当しないメニュー",
    },
}
