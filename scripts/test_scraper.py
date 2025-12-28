"""
Simple synchronous test scraper
"""
import requests
from bs4 import BeautifulSoup
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from api.scraper import MenuScraper
import json

# Test with リトルグリーンまん (ID: 1779)
url = "https://www.tokyodisneyresort.jp/food/1779/"

print(f"Fetching: {url}")

try:
    response = requests.get(url, timeout=10)
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        scraper = MenuScraper()
        data = scraper.parse_menu_page(response.text, "1779")

        if data:
            print("\n✓ Successfully parsed menu data:")
            print(json.dumps(data, ensure_ascii=False, indent=2))

            # Save to file
            with open('data/test_single.json', 'w', encoding='utf-8') as f:
                json.dump([data], f, ensure_ascii=False, indent=2)
            print(f"\n✓ Saved to data/test_single.json")
        else:
            print("✗ Failed to parse menu data")
    else:
        print(f"✗ HTTP {response.status_code}")

except Exception as e:
    print(f"✗ Error: {e}")
