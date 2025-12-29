# Page snapshot

```yaml
- alert [ref=e4]:
  - img [ref=e6]
  - generic [ref=e8]:
    - heading "メニューの読み込みに失敗しました" [level=6] [ref=e9]
    - paragraph [ref=e10]: "エラー詳細:"
    - paragraph [ref=e11]: Network Error
    - paragraph [ref=e12]:
      - strong [ref=e13]: "対処方法:"
    - list [ref=e15]:
      - listitem [ref=e16]:
        - text: "バックエンドが起動しているか確認:"
        - code [ref=e17]: lsof -ti:8000
      - listitem [ref=e18]:
        - text: "バックエンドを起動:"
        - code [ref=e19]: cd api && uvicorn index:app --reload --port 8000
      - listitem [ref=e20]:
        - text: "APIが応答するか確認:"
        - code [ref=e21]: curl http://localhost:8000/api/menus
```