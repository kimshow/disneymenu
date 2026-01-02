# Phase 7: データ分析とビジュアライゼーション - 実装計画書

**想定期間**: 2週間（実働14日）  
**開始予定**: Phase 6完了後  
**担当**: フロントエンド + データ分析  
**目的**: データの可視化によるユーザーの意思決定支援と滞在時間延長

---

## 📌 エグゼクティブサマリー

### 目標
- メニューデータを分析し、ユーザーに有益な洞察を提供
- ビジュアライゼーションで直感的なデータ理解を促進
- データエクスポート機能で外部利用を可能にする

### 主要機能（優先度順）

1. **統計ダッシュボード** 🔥（5日間）
   - 価格分布グラフ（Chart.js）
   - カテゴリ別メニュー数
   - パーク別比較

2. **トレンド分析** 🔥（4日間）
   - 人気メニューランキング
   - 価格帯別人気度
   - 季節限定メニューのタイムライン

3. **データエクスポート機能** 🟡（3日間）
   - CSV/JSONダウンロード
   - 統計レポート生成

4. **テスト・デバッグ** 🟢（2日間）
   - E2Eテスト追加（6件）
   - パフォーマンステスト

---

## 🎯 現状分析

### ✅ Phase 6完了時点での実装状況

#### データ構造
- ✅ MenuItem型（栄養成分含む）
- ✅ Restaurant型
- ❌ 集計データなし → Phase 7で計算・キャッシュ

#### 既存コンポーネント
- ✅ MenuList.tsx（グリッド表示）
- ✅ FilterPanel.tsx（フィルター機能）
- ❌ 統計表示コンポーネントなし

#### API
- ✅ `/api/menus`（全件取得可能）
- ❌ `/api/stats`エンドポイントなし → Phase 7で追加

---

## 🛠️ 技術設計

### 新規ライブラリ

#### グラフ描画ライブラリ比較

| ライブラリ | サイズ（gzip） | 特徴 | 採用判断 |
|-----------|---------------|------|---------|
| Chart.js | 197KB | 豊富なグラフ種類、軽量 | ✅ 採用 |
| Recharts | 280KB | React向け、宣言的 | ❌ サイズ大 |
| Victory | 350KB | アニメーション豊富 | ❌ サイズ大 |
| Nivo | 420KB | 美しいデザイン | ❌ サイズ大 |

**判断**: Chart.js v4.4.0を採用（軽量かつ実績豊富）

#### インストール
```bash
npm install chart.js@4.4.7 react-chartjs-2@5.2.0
npm install date-fns@3.2.0  # 日付操作
npm install file-saver@2.0.5 @types/file-saver  # ファイル保存
```

### データ集計ロジック

#### 統計データ型定義
```typescript
interface MenuStatistics {
  totalMenus: number;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  categoryDistribution: {
    [category: string]: number;
  };
  parkComparison: {
    disneyland: {
      count: number;
      avgPrice: number;
    };
    disneysea: {
      count: number;
      avgPrice: number;
    };
  };
  priceDistribution: {
    range: string;
    count: number;
  }[];
  popularMenus: {
    menuId: string;
    favoritesCount: number;
  }[];
}
```

#### API拡張（FastAPI）

`api/index.py`に追加：
```python
from collections import Counter
from statistics import mean

@app.get("/api/stats")
async def get_statistics():
    menus = load_menus()
    
    stats = {
        "totalMenus": len(menus),
        "averagePrice": mean([m["price"] for m in menus]),
        "priceRange": {
            "min": min(m["price"] for m in menus),
            "max": max(m["price"] for m in menus)
        },
        "categoryDistribution": dict(Counter(m["category"] for m in menus)),
        "parkComparison": calculate_park_comparison(menus),
        "priceDistribution": calculate_price_distribution(menus),
    }
    
    return {"success": True, "data": stats}

def calculate_price_distribution(menus):
    ranges = [
        ("~¥500", 0, 500),
        ("¥501-1000", 501, 1000),
        ("¥1001-1500", 1001, 1500),
        ("¥1501-2000", 1501, 2000),
        ("¥2001~", 2001, 999999)
    ]
    
    distribution = []
    for label, min_price, max_price in ranges:
        count = sum(1 for m in menus if min_price <= m["price"] <= max_price)
        distribution.append({"range": label, "count": count})
    
    return distribution
```

---

## 📅 実装手順

### Phase 7.1: 統計ダッシュボード（5日間）

#### Day 1: Chart.jsセットアップとデータ取得

**タスク 7.1.1: 必要なライブラリインストール**

```bash
npm install chart.js@4.4.7 react-chartjs-2@5.2.0 date-fns@3.2.0
```

**タスク 7.1.2: useStatistics Hookの作成**

`hooks/useStatistics.ts`:
```typescript
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export const useStatistics = () => {
  return useQuery({
    queryKey: ['statistics'],
    queryFn: async () => {
      const response = await api.get('/api/stats');
      return response.data.data;
    },
    staleTime: 1000 * 60 * 60, // 1時間キャッシュ
  });
};
```

#### Day 2-3: 価格分布グラフ実装

**タスク 7.1.3: PriceDistributionChart.tsxコンポーネント**

```typescript
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Box, Typography, Paper } from '@mui/material';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface PriceDistributionChartProps {
  data: {
    range: string;
    count: number;
  }[];
}

export const PriceDistributionChart: React.FC<PriceDistributionChartProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => d.range),
    datasets: [
      {
        label: 'メニュー数',
        data: data.map(d => d.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '価格帯別メニュー数',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 50,
        },
      },
    },
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Bar data={chartData} options={options} />
    </Paper>
  );
};
```

**タスク 7.1.4: CategoryDistributionChart.tsx（円グラフ）**

```typescript
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export const CategoryDistributionChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const chartData = {
    labels: Object.keys(data),
    datasets: [
      {
        label: 'メニュー数',
        data: Object.values(data),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'カテゴリ別メニュー分布',
      },
    },
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Pie data={chartData} options={options} />
    </Paper>
  );
};
```

#### Day 4: パーク比較グラフ

**タスク 7.1.5: ParkComparisonChart.tsx（棒グラフ）**

```typescript
import { Bar } from 'react-chartjs-2';

export const ParkComparisonChart: React.FC<{
  data: {
    disneyland: { count: number; avgPrice: number };
    disneysea: { count: number; avgPrice: number };
  };
}> = ({ data }) => {
  const chartData = {
    labels: ['メニュー数', '平均価格'],
    datasets: [
      {
        label: 'ディズニーランド',
        data: [data.disneyland.count, data.disneyland.avgPrice],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
      {
        label: 'ディズニーシー',
        data: [data.disneysea.count, data.disneysea.avgPrice],
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'パーク別比較',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Bar data={chartData} options={options} />
    </Paper>
  );
};
```

#### Day 5: ダッシュボードページ統合

**タスク 7.1.6: Statistics.tsxページ作成**

```typescript
import { Container, Grid, Typography, CircularProgress, Alert } from '@mui/material';
import { useStatistics } from '../../hooks/useStatistics';
import { PriceDistributionChart } from '../../components/charts/PriceDistributionChart';
import { CategoryDistributionChart } from '../../components/charts/CategoryDistributionChart';
import { ParkComparisonChart } from '../../components/charts/ParkComparisonChart';

export const Statistics = () => {
  const { data: stats, isLoading, error } = useStatistics();

  if (isLoading) return <CircularProgress />;
  if (error) return <Alert severity="error">データの取得に失敗しました</Alert>;
  if (!stats) return null;

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        📊 統計ダッシュボード
      </Typography>

      {/* サマリーカード */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">{stats.totalMenus}</Typography>
            <Typography variant="body2">総メニュー数</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">¥{Math.round(stats.averagePrice)}</Typography>
            <Typography variant="body2">平均価格</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">¥{stats.priceRange.min}</Typography>
            <Typography variant="body2">最低価格</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">¥{stats.priceRange.max}</Typography>
            <Typography variant="body2">最高価格</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* グラフエリア */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <PriceDistributionChart data={stats.priceDistribution} />
        </Grid>
        <Grid item xs={12} lg={4}>
          <CategoryDistributionChart data={stats.categoryDistribution} />
        </Grid>
        <Grid item xs={12}>
          <ParkComparisonChart data={stats.parkComparison} />
        </Grid>
      </Grid>
    </Container>
  );
};
```

**タスク 7.1.7: ナビゲーションに統計ページ追加**

`components/layout/Header.tsx`:
```typescript
<Button component={Link} to="/statistics" color="inherit">
  統計
</Button>
```

---

### Phase 7.2: トレンド分析（4日間）

#### Day 6-7: 人気メニューランキング

**タスク 7.2.1: お気に入り数の集計**

バックエンド（`api/index.py`）:
```python
@app.get("/api/menus/popular")
async def get_popular_menus(limit: int = 10):
    # お気に入り数でソート（将来的にはDBから取得）
    # 現在は手動選定のpopular_menus.jsonを使用
    popular = load_popular_menus()
    return {"success": True, "data": popular[:limit]}
```

**タスク 7.2.2: PopularRanking.tsxコンポーネント**

```typescript
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

export const PopularRanking: React.FC<{ menus: MenuItem[] }> = ({ menus }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🔥 人気メニューランキング
      </Typography>
      <List>
        {menus.map((menu, index) => (
          <ListItem
            key={menu.id}
            component={Link}
            to={`/menu/${menu.id}`}
            sx={{
              borderRadius: 1,
              mb: 1,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: index < 3 ? 'primary.main' : 'grey.400' }}>
                {index + 1}
              </Avatar>
            </ListItemAvatar>
            <Avatar src={menu.imageUrl} sx={{ mr: 2 }} />
            <ListItemText
              primary={menu.name}
              secondary={menu.restaurant}
            />
            <Chip
              label={`¥${menu.price}`}
              size="small"
              color={index < 3 ? 'primary' : 'default'}
            />
            <TrendingUpIcon color="action" sx={{ ml: 1 }} />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};
```

#### Day 8: 価格帯別人気度

**タスク 7.2.3: PriceRangePopularity.tsx（横棒グラフ）**

```typescript
import { Bar } from 'react-chartjs-2';

export const PriceRangePopularity: React.FC = () => {
  const { data: menus } = useMenus({ limit: 1000 });
  
  // 価格帯ごとにお気に入り数を集計
  const priceRanges = ['~¥500', '¥501-1000', '¥1001-1500', '¥1501-2000', '¥2001~'];
  const popularityData = calculatePopularityByPriceRange(menus?.data || []);

  const chartData = {
    labels: priceRanges,
    datasets: [
      {
        label: '平均お気に入り数',
        data: popularityData,
        backgroundColor: 'rgba(255, 159, 64, 0.6)',
      },
    ],
  };

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '価格帯別人気度',
      },
    },
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Bar data={chartData} options={options} />
    </Paper>
  );
};
```

#### Day 9: 季節限定メニューのタイムライン

**タスク 7.2.4: SeasonalTimeline.tsxコンポーネント**

```typescript
import { Timeline, TimelineItem, TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot } from '@mui/lab';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export const SeasonalTimeline: React.FC = () => {
  const seasonalMenus = [
    { name: 'クリスマスケーキ', period: '12月', color: 'error' },
    { name: 'バレンタインチョコ', period: '2月', color: 'secondary' },
    { name: '春限定パフェ', period: '3-5月', color: 'success' },
    { name: '夏祭りかき氷', period: '7-8月', color: 'info' },
  ];

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        🗓️ 季節限定メニュー
      </Typography>
      <Timeline position="alternate">
        {seasonalMenus.map((menu, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={menu.color as any} />
              {index < seasonalMenus.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h6">{menu.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {menu.period}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Paper>
  );
};
```

---

### Phase 7.3: データエクスポート機能（3日間）

#### Day 10-11: CSV/JSONエクスポート

**タスク 7.3.1: file-saverインストール**

```bash
npm install file-saver@2.0.5 @types/file-saver
```

**タスク 7.3.2: exportUtils.tsユーティリティ作成**

```typescript
import { saveAs } from 'file-saver';

export const exportToCSV = (menus: MenuItem[], filename: string) => {
  const headers = ['ID', '名前', 'レストラン', 'パーク', '価格', 'カテゴリ'];
  const rows = menus.map(menu => [
    menu.id,
    menu.name,
    menu.restaurant,
    menu.park === 'disneyland' ? 'ディズニーランド' : 'ディズニーシー',
    menu.price,
    menu.category,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, `${filename}.csv`);
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  saveAs(blob, `${filename}.json`);
};
```

**タスク 7.3.3: ExportButtons.tsxコンポーネント**

```typescript
import { Button, ButtonGroup, Menu, MenuItem } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { useState } from 'react';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';

export const ExportButtons: React.FC<{ menus: MenuItem[] }> = ({ menus }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleExportCSV = () => {
    exportToCSV(menus, `disney-menus-${new Date().toISOString().split('T')[0]}`);
    setAnchorEl(null);
  };

  const handleExportJSON = () => {
    exportToJSON(menus, `disney-menus-${new Date().toISOString().split('T')[0]}`);
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        データをエクスポート
      </Button>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleExportCSV}>CSV形式</MenuItem>
        <MenuItem onClick={handleExportJSON}>JSON形式</MenuItem>
      </Menu>
    </>
  );
};
```

#### Day 12: 統計レポート生成

**タスク 7.3.4: StatisticsReport.tsxコンポーネント**

```typescript
export const StatisticsReport: React.FC = () => {
  const { data: stats } = useStatistics();
  const { data: response } = useMenus({ limit: 1000 });

  const generateReport = () => {
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalMenus: stats?.totalMenus,
        averagePrice: stats?.averagePrice,
        priceRange: stats?.priceRange,
      },
      categoryDistribution: stats?.categoryDistribution,
      parkComparison: stats?.parkComparison,
      topExpensiveMenus: response?.data
        .sort((a, b) => b.price - a.price)
        .slice(0, 10),
      topCheapMenus: response?.data
        .sort((a, b) => a.price - b.price)
        .slice(0, 10),
    };

    exportToJSON(report, `disney-menu-report-${format(new Date(), 'yyyy-MM-dd')}`);
  };

  return (
    <Button
      variant="contained"
      startIcon={<DownloadIcon />}
      onClick={generateReport}
    >
      統計レポートを生成
    </Button>
  );
};
```

---

### Phase 7.4: テスト・デバッグ（2日間）

#### Day 13: E2Eテスト作成

**タスク 7.4.1: Phase 7のE2Eテスト（6件）**

`statistics.spec.ts`:
```typescript
test('統計ダッシュボードが表示される', async ({ page }) => {
  await page.goto('/statistics');
  await expect(page.locator('h4:has-text("統計ダッシュボード")')).toBeVisible();
  await expect(page.locator('text=総メニュー数')).toBeVisible();
});

test('価格分布グラフが表示される', async ({ page }) => {
  await page.goto('/statistics');
  await expect(page.locator('canvas').first()).toBeVisible();
});

test('カテゴリ分布グラフが表示される', async ({ page }) => {
  await page.goto('/statistics');
  await expect(page.locator('canvas').nth(1)).toBeVisible();
});

test('CSVエクスポートが動作する', async ({ page }) => {
  await page.goto('/statistics');
  const downloadPromise = page.waitForEvent('download');
  await page.click('text=データをエクスポート');
  await page.click('text=CSV形式');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.csv');
});

test('JSONエクスポートが動作する', async ({ page }) => {
  await page.goto('/statistics');
  const downloadPromise = page.waitForEvent('download');
  await page.click('text=データをエクスポート');
  await page.click('text=JSON形式');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.json');
});

test('統計レポート生成が動作する', async ({ page }) => {
  await page.goto('/statistics');
  const downloadPromise = page.waitForEvent('download');
  await page.click('text=統計レポートを生成');
  await downloadPromise;
});
```

#### Day 14: パフォーマンステストと最終調整

**タスク 7.4.2: Chart.jsのパフォーマンス最適化**

```typescript
// グラフの遅延読み込み
const PriceDistributionChart = lazy(() => import('./PriceDistributionChart'));

// データのメモ化
const chartData = useMemo(() => {
  return calculateChartData(stats);
}, [stats]);
```

**タスク 7.4.3: バンドルサイズ確認**

```bash
npm run build -- --analyze
```

Phase 7追加分の目標:
- Chart.js: +197KB
- date-fns: +20KB
- file-saver: +5KB
- 合計: +220KB以内

**タスク 7.4.4: ドキュメント更新と本番デプロイ**

```bash
git add .
git commit -m "feat: Phase 7実装完了 - データ分析とビジュアライゼーション"
git push origin main
vercel --prod
```

---

## 🧪 テスト計画

### E2Eテスト追加（6件）

1. 統計ダッシュボードが表示される
2. 価格分布グラフが表示される
3. カテゴリ分布グラフが表示される
4. CSVエクスポートが動作する
5. JSONエクスポートが動作する
6. 統計レポート生成が動作する

### パフォーマンステスト

- Lighthouseスコア: 85点以上（グラフ描画のため若干低下許容）
- バンドルサイズ: +220KB以内
- グラフ描画速度: 500ms以内

---

## 📊 成果指標

### 定量指標

| 指標 | 目標 |
|------|------|
| 統計ページ訪問率 | 15%以上 |
| データエクスポート数 | 20回/月 |
| 統計ページ滞在時間 | 2分以上 |
| E2Eテスト総数 | 34件 |

---

## 🚀 次のPhase

### Phase 8予告: マップ機能（3週間）

- Google Maps API統合
- レストラン位置表示
- ルート案内機能

---

## 📚 参考資料

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [react-chartjs-2](https://react-chartjs-2.js.org/)
- [file-saver](https://github.com/eligrey/FileSaver.js/)
- [MUI Timeline](https://mui.com/material-ui/react-timeline/)
