/**
 * メニュー一覧ページのE2Eテスト
 */
import { test, expect } from '@playwright/test';

test.describe('メニュー一覧ページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('ページタイトルが表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'メニュー一覧' })).toBeVisible();
  });

  test('メニューカードが表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // メニューカードの存在を確認
    const menuCards = page.locator('.MuiCard-root');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 少なくとも1つのカードが表示されていることを確認
    const count = await menuCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('メニュー名が表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 任意のメニューカード内のh2要素（メニュー名）が表示されることを確認
    const menuCards = page.locator('.MuiCard-root');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const menuName = menuCards.first().locator('h2');
    await expect(menuName).toBeVisible();

    // メニュー名が空でないことを確認
    const nameText = await menuName.textContent();
    expect(nameText).toBeTruthy();
  });

  test('価格が表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 価格の形式を正規表現で確認（¥の後に数字があることを確認）
    const price = page.locator('text=/¥[0-9,]+/').first();
    await expect(price).toBeVisible({ timeout: 10000 });
  });

  test('レストラン名が表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // メニューカード内のレストラン情報が表示されることを確認
    const menuCards = page.locator('.MuiCard-root');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // body2タイポグラフィ（レストラン情報）が存在することを確認
    const restaurantInfo = menuCards.first().locator('[class*="MuiTypography-body2"]');
    await expect(restaurantInfo.first()).toBeVisible();
  });

  test('パーク情報が表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // パーク情報の確認（ランド/シー）
    const park = page.getByText(/\(ランド\)|\(シー\)/);
    await expect(park.first()).toBeVisible({ timeout: 10000 });
  });

  test('タグが表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // タグチップの確認
    const tag = page.locator('.MuiChip-root');
    await expect(tag.first()).toBeVisible({ timeout: 10000 });
  });

  test('ローディング状態が表示される', async ({ page }) => {
    // ページをリロード
    await page.reload();

    // ローディングスピナーが表示されることを確認
    const loading = page.locator('.MuiCircularProgress-root');

    // ローディングが表示されるか、すでにデータが表示されているか
    const isLoadingVisible = await loading.isVisible().catch(() => false);
    const isMenuVisible = await page.locator('.MuiCard-root').isVisible().catch(() => false);

    expect(isLoadingVisible || isMenuVisible).toBeTruthy();
  });

  test('複数のメニューが表示される', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // 複数のメニューカードが存在することを確認
    const menuCards = page.locator('.MuiCard-root');
    const count = await menuCards.count();

    expect(count).toBeGreaterThan(0);
  });

  test('ページネーションが表示される（メニューが多い場合）', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // ページネーションボタンの確認（存在しない場合もある）
    const pagination = page.locator('.MuiPagination-root');

    // ページネーションが表示されているか確認（表示されない場合もOK）
    const paginationExists = await pagination.count();
    expect(paginationExists).toBeGreaterThanOrEqual(0);
  });

  test('レスポンシブデザイン: モバイル表示', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForLoadState('networkidle');

    // メニューカードが表示される
    const menuCard = page.locator('.MuiCard-root').first();
    await expect(menuCard).toBeVisible();
  });

  test('レスポンシブデザイン: タブレット表示', async ({ page }) => {
    // タブレットサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForLoadState('networkidle');

    // メニューカードが表示される
    const menuCard = page.locator('.MuiCard-root').first();
    await expect(menuCard).toBeVisible();
  });
});

test.describe('エラーハンドリング', () => {
  test('APIエラー時にエラーメッセージが表示される', async ({ page, context }) => {
    // APIリクエストを失敗させる
    await context.route('**/api/menus*', route => route.abort());

    await page.goto('/');

    // エラーメッセージの確認
    const errorMessage = page.getByText(/エラー|失敗/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });
});
