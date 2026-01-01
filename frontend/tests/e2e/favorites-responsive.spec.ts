/**
 * お気に入り機能のレスポンシブUIテスト
 */
import { test, expect, devices } from '@playwright/test';

test.describe('お気に入り空状態のレスポンシブUI', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリア
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');
  });

  test('モバイル（iPhone 14 Pro）で空状態が中央揃えで表示される', async ({ page }) => {
    // iPhone 14 Proのビューポートサイズに設定
    await page.setViewportSize({ width: 393, height: 852 });

    // 空状態のコンテナを確認
    const emptyStateContainer = page.locator('text=お気に入りがありません').locator('..');
    await expect(emptyStateContainer).toBeVisible();

    // 中央揃えのスタイルを確認
    const box = await emptyStateContainer.boundingBox();
    expect(box).toBeTruthy();

    // アイコンが表示されている
    const favoriteIcon = page.locator('svg[data-testid="FavoriteIcon"]');
    await expect(favoriteIcon).toBeVisible();

    // アイコンサイズがモバイルサイズ（80px）であることを確認
    const iconSize = await favoriteIcon.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    expect(iconSize).toBe('80px');

    // 見出しが表示されている
    const heading = page.locator('h4:has-text("お気に入りがありません")');
    await expect(heading).toBeVisible();

    // ボタンが表示されている（中央の大きいボタンのみ）
    const button = page.locator('button.MuiButton-sizeLarge:has-text("メニュー一覧へ戻る")');
    await expect(button).toBeVisible();

    // ボタンが全幅（最大300px）であることを確認
    const buttonBox = await button.boundingBox();
    expect(buttonBox).toBeTruthy();
    expect(buttonBox!.width).toBeLessThanOrEqual(300);
  });

  test('タブレット（iPad）で空状態が適切に表示される', async ({ page }) => {
    // iPadのビューポートサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });

    // 空状態のコンテナを確認
    const emptyStateContainer = page.locator('text=お気に入りがありません').locator('..');
    await expect(emptyStateContainer).toBeVisible();

    // アイコンが表示されている
    const favoriteIcon = page.locator('svg[data-testid="FavoriteIcon"]');
    await expect(favoriteIcon).toBeVisible();

    // アイコンサイズがデスクトップサイズ（120px）であることを確認
    const iconSize = await favoriteIcon.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    expect(iconSize).toBe('120px');
  });

  test('デスクトップで空状態が適切に表示される', async ({ page }) => {
    // デスクトップのビューポートサイズに設定
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 空状態のコンテナを確認
    const emptyStateContainer = page.locator('text=お気に入りがありません').locator('..');
    await expect(emptyStateContainer).toBeVisible();

    // アイコンが表示されている
    const favoriteIcon = page.locator('svg[data-testid="FavoriteIcon"]');
    await expect(favoriteIcon).toBeVisible();

    // アイコンサイズがデスクトップサイズ（120px）であることを確認
    const iconSize = await favoriteIcon.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    expect(iconSize).toBe('120px');

    // 見出しが表示されている
    const heading = page.locator('h4:has-text("お気に入りがありません")');
    await expect(heading).toBeVisible();

    // ボタンが表示されている（中央の大きいボタンのみ）
    const button = page.locator('button.MuiButton-sizeLarge:has-text("メニュー一覧へ戻る")');
    await expect(button).toBeVisible();

    // ボタンが自動幅であることを確認（全幅でない）
    const buttonBox = await button.boundingBox();
    expect(buttonBox).toBeTruthy();
    expect(buttonBox!.width).toBeLessThan(400); // 自動幅なので小さいはず
  });
});

test.describe('お気に入りメニュー一覧のレスポンシブUI', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリア
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('モバイルで1列グリッドレイアウトが表示される', async ({ page }) => {
    // iPhone 14 Proのビューポートサイズに設定
    await page.setViewportSize({ width: 393, height: 852 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 3つのメニューをお気に入りに追加
    for (let i = 0; i < 3; i++) {
      const card = menuCards.nth(i);
      const favoriteButton = card.locator('[aria-label*="お気に入り"]').first();
      await favoriteButton.click();
      await page.waitForTimeout(500);
    }

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // メニューカードが3つ表示されている
    const favoriteCards = page.locator('[data-testid="menu-card"]');
    await expect(favoriteCards).toHaveCount(3);

    // グリッドレイアウトのコンテナを取得
    const gridContainer = page.locator('[data-testid="favorites-grid-container"]');
    const gridStyle = await gridContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // モバイルでは1列グリッド
    // gridTemplateColumns: "repeat(1, 1fr)" → 計算値を確認
    const columnCount = gridStyle.split(' ').filter(s => s.includes('fr') || s.includes('px')).length;
    expect(columnCount).toBe(1);
  });

  test('タブレットで2列グリッドレイアウトが表示される', async ({ page }) => {
    // iPadのビューポートサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 4つのメニューをお気に入りに追加
    for (let i = 0; i < 4; i++) {
      const card = menuCards.nth(i);
      const favoriteButton = card.locator('[aria-label*="お気に入り"]').first();
      await favoriteButton.click();
      await page.waitForTimeout(500);
    }

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // メニューカードが4つ表示されている
    const favoriteCards = page.locator('[data-testid="menu-card"]');
    await expect(favoriteCards).toHaveCount(4);

    // グリッドレイアウトのコンテナを取得
    const gridContainer = page.locator('[data-testid="favorites-grid-container"]');
    const gridStyle = await gridContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // タブレットでは2列グリッド
    const columnCount = gridStyle.split(' ').filter(s => s.includes('fr') || s.includes('px')).length;
    expect(columnCount).toBe(2);
  });

  test('デスクトップで4-5列グリッドレイアウトが表示される', async ({ page }) => {
    // デスクトップのビューポートサイズに設定
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 6つのメニューをお気に入りに追加
    for (let i = 0; i < 6; i++) {
      const card = menuCards.nth(i);
      const favoriteButton = card.locator('[aria-label*="お気に入り"]').first();
      await favoriteButton.click();
      await page.waitForTimeout(500);
    }

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // メニューカードが6つ表示されている
    const favoriteCards = page.locator('[data-testid="menu-card"]');
    await expect(favoriteCards).toHaveCount(6);

    // グリッドレイアウトのコンテナを取得
    const gridContainer = page.locator('[data-testid="favorites-grid-container"]');
    const gridStyle = await gridContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // デスクトップでは4列以上のグリッド
    const columnCount = gridStyle.split(' ').filter(s => s.includes('fr') || s.includes('px')).length;
    expect(columnCount).toBeGreaterThanOrEqual(4);
    expect(columnCount).toBeLessThanOrEqual(5);
  });
});

test.describe('メニュー一覧のレスポンシブUI', () => {
  test('モバイルでメニュー一覧が1列グリッドで表示される', async ({ page }) => {
    // iPhone 14 Proのビューポートサイズに設定
    await page.setViewportSize({ width: 393, height: 852 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // グリッドレイアウトのコンテナを取得
    const gridContainer = page.locator('[data-testid="menu-list-grid-container"]');
    const gridStyle = await gridContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // モバイルでは1列グリッド
    const columnCount = gridStyle.split(' ').filter(s => s.includes('fr') || s.includes('px')).length;
    expect(columnCount).toBe(1);
  });

  test('タブレットでメニュー一覧が2列グリッドで表示される', async ({ page }) => {
    // iPadのビューポートサイズに設定
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // グリッドレイアウトのコンテナを取得
    const gridContainer = page.locator('[data-testid="menu-list-grid-container"]');
    const gridStyle = await gridContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // タブレットでは2列グリッド
    const columnCount = gridStyle.split(' ').filter(s => s.includes('fr') || s.includes('px')).length;
    expect(columnCount).toBe(2);
  });

  test('デスクトップでメニュー一覧が3-5列グリッドで表示される', async ({ page }) => {
    // デスクトップのビューポートサイズに設定
    await page.setViewportSize({ width: 1920, height: 1080 });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // グリッドレイアウトのコンテナを取得
    const gridContainer = page.locator('[data-testid="menu-list-grid-container"]');
    const gridStyle = await gridContainer.evaluate((el) => {
      return window.getComputedStyle(el).gridTemplateColumns;
    });

    // デスクトップでは3列以上のグリッド
    const columnCount = gridStyle.split(' ').filter(s => s.includes('fr') || s.includes('px')).length;
    expect(columnCount).toBeGreaterThanOrEqual(3);
    expect(columnCount).toBeLessThanOrEqual(5);
  });
});
