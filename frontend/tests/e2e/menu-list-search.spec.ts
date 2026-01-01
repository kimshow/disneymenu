import { test, expect } from '@playwright/test';

test.describe('検索機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // メニューが読み込まれるまで待機
    await page.waitForSelector('[data-testid="menu-card"]', { timeout: 10000 });
  });

  test('検索バーが表示される', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="検索"]');
    await expect(searchInput).toBeVisible();
  });

  test('テキスト入力で検索結果が更新される', async ({ page }) => {
    // 初期状態のメニュー数を取得
    const initialCount = await page.locator('[data-testid="menu-card"]').count();
    expect(initialCount).toBeGreaterThan(0);

    // 検索実行
    await page.fill('input[placeholder*="検索"]', 'カレー');
    await page.waitForTimeout(500); // デバウンス待ち

    // 結果が表示されることを確認
    const resultCount = await page.locator('[data-testid="menu-card"]').count();
    expect(resultCount).toBeGreaterThan(0);
    expect(resultCount).toBeLessThanOrEqual(initialCount);
  });

  test('検索クエリがURLに反映される', async ({ page }) => {
    await page.fill('input[placeholder*="検索"]', 'カレー');
    await page.waitForTimeout(500);
    
    const url = page.url();
    expect(url).toContain('q=');
  });

  test('検索クリアボタンで検索がリセットされる', async ({ page }) => {
    // 検索実行
    await page.fill('input[placeholder*="検索"]', 'カレー');
    await page.waitForTimeout(500);

    // クリアボタンをクリック
    const clearButton = page.locator('button[aria-label="検索をクリア"]');
    await expect(clearButton).toBeVisible();
    await clearButton.click();
    await page.waitForTimeout(300);

    // 検索バーが空になることを確認
    const searchInput = page.locator('input[placeholder*="検索"]');
    await expect(searchInput).toHaveValue('');

    // URLからqパラメータが削除されることを確認
    const url = page.url();
    expect(url).not.toContain('q=');
  });

  test('検索結果が0件の場合、メッセージが表示される', async ({ page }) => {
    // 存在しないメニューを検索
    await page.fill('input[placeholder*="検索"]', 'xxxxxx12345zzzzz');
    await page.waitForTimeout(500);

    // "該当するメニューが見つかりません" または類似のメッセージを確認
    const noResultsMessage = page.locator('text=/該当|見つかりません|結果がありません/i');
    await expect(noResultsMessage).toBeVisible({ timeout: 3000 });
  });

  test('URLから検索クエリを読み込める', async ({ page }) => {
    // URLパラメータ付きでページを開く
    await page.goto('/?q=カレー');
    await page.waitForTimeout(500);

    // 検索バーに値が反映されることを確認
    const searchInput = page.locator('input[placeholder*="検索"]');
    await expect(searchInput).toHaveValue('カレー');

    // 検索結果が表示されることを確認
    const resultCount = await page.locator('[data-testid="menu-card"]').count();
    expect(resultCount).toBeGreaterThan(0);
  });
});
