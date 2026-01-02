# Disney Menu - Copilot Instructions

## Project Overview
FastAPI + React web application for browsing Tokyo Disney Resort food menus with search, tag filtering, and price filtering. Backend deployed on Vercel as serverless functions. Menu data scraped from `https://www.tokyodisneyresort.jp/food/****` (4-digit IDs).

## Constraints
- **output language**: ドキュメント・コメント・出力は日本語で記述すること
- **ターミナル運用ルール**: ターミナルは既存のものを再利用し、毎回新しいタブやウィンドウを開かないこと。新規でサーバを複数立てず、既に立てているサーバを再利用すること。バックエンドサーバ用、フロントエンドサーバ用それぞれのターミナルは1つずつに限定すること。


## Architecture

### Backend: FastAPI on Vercel Serverless
- **Framework**: FastAPI (required)
- Python 3.9+ runtime
- Entry point: `api/index.py` with FastAPI app
- All routes in `api/` folder following Vercel Python serverless structure
- Stateless design - no local file storage

### Frontend: React
- Separate React app (in `frontend/` or root)
- API calls to `/api/*` endpoints
- Build output served as static files on Vercel

### Project Structure
```
api/
  index.py          # FastAPI app with all routes
  scraper.py        # Web scraping logic (separate module)
  models.py         # Pydantic models
data/
  menus.json        # Scraped menu data (committed to repo)
frontend/          # React application
  src/
    components/
    services/       # API client
scripts/
  scrape_menus.py   # Scraping script (run locally/CI)
vercel.json         # Deployment + routing config
requirements.txt    # Python dependencies
```

## Data Collection & Management

### Web Scraping Strategy
- **Source**: `https://www.tokyodisneyresort.jp/food/{0000-9999}` (4-digit IDs)
- **Compliance**: robots.txt checked, 1 req/sec rate limit
- **Schedule**: Weekly scraping (GitHub Actions cron job recommended)
- **Storage**: Save to `data/menus.json` and commit to repo

### Scraping Implementation (`scripts/scrape_menus.py`)
```python
import time
import requests
from bs4 import BeautifulSoup

# Iterate 0000-9999, sleep(1) between requests
# Parse HTML for: name, price, restaurant, tags, allergens, images
# Save to data/menus.json
```

### Menu Data Schema (Pydantic)
```python
class MenuItem(BaseModel):
    id: str                    # 4-digit ID from URL
    name_ja: str
    name_en: Optional[str]
    description: Optional[str]
    price: int
    restaurant: str
    park: str                  # "Disneyland" or "DisneySea"
    category: str              # e.g., "Main", "Dessert", "Drink"
    tags: List[str]            # e.g., ["vegetarian", "seasonal"]
    allergens: List[str]
    image_url: Optional[str]
    scraped_at: datetime
```

## API Endpoints (FastAPI)

### Core Endpoints
```python
GET  /api/menus              # List menus with pagination
GET  /api/menus/{id}         # Get specific menu item
GET  /api/menus/search       # Search with query params
GET  /api/restaurants        # List all restaurants
GET  /api/tags               # List all available tags
GET  /api/stats              # Summary stats (total items, etc.)
```

### Query Parameters for `/api/menus` and `/api/menus/search`
- `q`: Search query (name, description)
- `tags`: Comma-separated tags (AND logic)
- `min_price`, `max_price`: Price range
- `park`: Filter by park (disneyland/disneysea)
- `restaurant`: Filter by restaurant name
- `category`: Filter by category
- `page`, `limit`: Pagination (default: page=1, limit=50)

### FastAPI Implementation Pattern
```python
from fastapi import FastAPI, Query
from typing import Optional, List

app = FastAPI()

@app.get("/api/menus")
async def get_menus(
    q: Optional[str] = None,
    tags: Optional[str] = None,
    min_price: Optional[int] = None,
    max_price: Optional[int] = None,
    park: Optional[str] = None,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    # Load from data/menus.json
    # Apply filters
    # Return paginated results
    pass
```

## Development Workflow

### Initial Setup
```bash
# Install Vercel CLI
npm i -g vercel

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run scraping script (first time)
python scripts/scrape_menus.py
```

### Local Development
```bash
# Run FastAPI locally with hot reload
cd api && uvicorn index:app --reload --port 8000

# Or use Vercel dev (simulates Vercel environment)
vercel dev

# Test API endpoints
curl http://localhost:8000/api/menus
```

### React Frontend Development
```bash
cd frontend
npm install
npm start  # Runs on localhost:3000
```

### Scraping Schedule
- **Manual**: Run `python scripts/scrape_menus.py`
- **Automated**: GitHub Actions workflow (weekly cron)
  ```yaml
  # .github/workflows/scrape.yml
  schedule:
    - cron: '0 0 * * 0'  # Every Sunday at midnight
  ```

### Testing
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest tests/

# Test specific endpoint
pytest tests/test_menus.py -v
```

### Deployment
```bash
# Deploy preview
vercel

# Deploy to production
vercel --prod
```

## Code Conventions

### Python Style
- Use Python 3.9+ features
- Type hints for function signatures
- Pydantic models for data validation (FastAPI requirement)
- Keep functions pure and stateless
- Async/await for I/O operations

### FastAPI Patterns
```python
# Use dependency injection for shared logic
from fastapi import Depends

def get_menu_data():
    # Load and cache menu data
    pass

@app.get("/api/menus")
async def get_menus(data = Depends(get_menu_data)):
    return data
```

### Environment Variables
- Store sensitive data in Vercel Environment Variables
- Access via `os.environ.get('VARIABLE_NAME')`
- Never commit secrets to repository

### Response Format
Return consistent JSON responses:
```python
{
  "success": true,
  "data": [...],
  "meta": {"total": 100, "page": 1, "limit": 50}
}
```

### React Conventions
- Functional components with hooks
- API calls in separate service layer (`services/api.ts`)
- Use TypeScript for type safety
- State management: Context API or React Query

## Important Constraints

1. **Stateless Design**: No session storage, no file writes during runtime (data updates via CI/CD only)
2. **Cold Starts**: Optimize FastAPI imports, lazy-load heavy dependencies, cache menu data in memory
3. **Timeout**: Vercel functions timeout at 10s (Hobby), 60s (Pro)
4. **Size Limits**: 50MB function size, 4.5MB response body
5. **CORS**: Configure in FastAPI middleware for React frontend:
   ```python
   from fastapi.middleware.cors import CORSMiddleware

   app.add_middleware(
       CORSMiddleware,
       allow_origins=["*"],  # Configure properly for production
       allow_methods=["GET"],
       allow_headers=["*"],
   )
   ```
6. **Scraping Ethics**: 1 request/second, respect robots.txt, weekly updates only

## Dependencies to Consider

### Python (requirements.txt)
```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
requests==2.31.0
beautifulsoup4==4.12.2
lxml==4.9.3
python-dotenv==1.0.0
```

### React (package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "axios": "^1.6.0",
    "react-router-dom": "^6.20.0"
  }
}
```

## Reference Files
When creating this project from scratch:
1. Start with `vercel.json` to define routes and rewrites
2. Create `requirements.txt` with FastAPI and scraping dependencies
3. Build `api/index.py` as FastAPI app entry point
4. Implement `scripts/scrape_menus.py` for data collection
5. Create `data/menus.json` structure
6. Set up React frontend with API integration
7. Configure GitHub Actions for weekly scraping
