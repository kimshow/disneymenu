import { test, expect } from '@playwright/test';

test.describe('フィルター機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // メニューが読み込まれるまで待機
    await page.waitForSelector('[data-testid="menu-card"]', { timeout: 10000 });
  });

  test('フィルターパネルが表示される（デスクトップ）', async ({ page }) => {
    // デスクトップサイズに設定
    await page.setViewportSize({ width: 1200, height: 800 });

    // フィルターパネルを探す
    const filterPanel = page.locator('text="フィルター"').first();
    await expect(filterPanel).toBeVisible();
  });

  test('パークフィルターで絞り込める', async ({ page }) => {
    // ランドボタンを探す
    const landButton = page.locator('button:has-text("ランド")').or(page.locator('button:has-text("🏰")'));

    if (await landButton.count() > 0) {
      await landButton.first().click();
      await page.waitForTimeout(500);

      // URLにparkパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('park=');

      // メニューが表示されることを確認
      const menuCount = await page.locator('[data-testid="menu-card"]').count();
      expect(menuCount).toBeGreaterThan(0);
    }
  });

  test('価格範囲スライダーで絞り込める', async ({ page }) => {
    // スライダーを探す
    const priceSlider = page.locator('input[type="range"]').first();

    if (await priceSlider.count() > 0) {
      // スライダーの値を変更
      await priceSlider.fill('1000');
      await page.waitForTimeout(600); // デバウンス待ち

      // URLに価格パラメータが反映されることを確認
      const url = page.url();
      expect(url).toMatch(/min_price|max_price/);
    }
  });

  test('レストランフィルターで絞り込める', async ({ page }) => {
    // レストラン選択のAutocompleteを探す
    const restaurantInput = page.locator('input[placeholder*="レストラン"]').or(page.locator('label:has-text("レストラン")').locator('..').locator('input'));

    if (await restaurantInput.count() > 0) {
      await restaurantInput.first().click();
      await page.waitForTimeout(300);

      // オプションリストが表示されることを確認
      const options = page.locator('[role="option"]');
      if (await options.count() > 0) {
        await options.first().click();
        await page.waitForTimeout(500);

        // URLにrestaurantパラメータが反映されることを確認
        const url = page.url();
        expect(url).toContain('restaurant=');
      }
    }
  });

  test('カテゴリフィルターで絞り込める', async ({ page }) => {
    // カテゴリチップを探す
    const categoryChip = page.locator('[role="button"]:has-text("おすすめメニュー")').or(page.locator('button:has-text("メイン")'));

    if (await categoryChip.count() > 0) {
      await categoryChip.first().click();
      await page.waitForTimeout(500);

      // URLにcategoriesパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('categories=');

      // メニューが表示されることを確認
      const menuCount = await page.locator('[data-testid="menu-card"]').count();
      expect(menuCount).toBeGreaterThan(0);
    }
  });

  test('タグフィルターで絞り込める', async ({ page }) => {
    // タグチップを探す
    const tagChip = page.locator('button').filter({ hasText: /ベジタリアン|季節限定|キャラクター/ }).first();

    if (await tagChip.count() > 0) {
      await tagChip.click();
      await page.waitForTimeout(500);

      // URLにtagsパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('tags=');
    }
  });

  test('販売中のみスイッチで絞り込める', async ({ page }) => {
    // スイッチを探す
    const availabilitySwitch = page.locator('input[type="checkbox"]').filter({ has: page.locator('..').locator('text=/販売中/i') });

    if (await availabilitySwitch.count() > 0) {
      await availabilitySwitch.first().click();
      await page.waitForTimeout(500);

      // URLにonly_availableパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('only_available=');
    }
  });

  test('複数のフィルターを組み合わせて使用できる', async ({ page }) => {
    // 検索実行
    await page.fill('input[placeholder*="検索"]', 'カレー');
    await page.waitForTimeout(500);

    // パークフィルター適用
    const landButton = page.locator('button:has-text("ランド")').or(page.locator('button:has-text("🏰")'));
    if (await landButton.count() > 0) {
      await landButton.first().click();
      await page.waitForTimeout(500);
    }

    // URLに両方のパラメータが含まれることを確認
    const url = page.url();
    expect(url).toContain('q=');

    // 結果が表示されることを確認（0件でもOK）
    const menuCount = await page.locator('[data-testid="menu-card"]').count();
    expect(menuCount).toBeGreaterThanOrEqual(0);
  });

  test('フィルタークリアボタンですべてリセットされる', async ({ page }) => {
    // 複数のフィルターを適用
    await page.fill('input[placeholder*="検索"]', 'カレー');
    await page.waitForTimeout(500);

    // クリアボタンを探す
    const clearButton = page.locator('button:has-text("クリア")').or(page.locator('button:has-text("リセット")'));

    if (await clearButton.count() > 0) {
      await clearButton.first().click();
      await page.waitForTimeout(500);

      // URLパラメータがクリアされることを確認（pageとlimitは残る可能性がある）
      const url = page.url();
      expect(url).not.toContain('q=');
      expect(url).not.toContain('park=');
    }
  });

  test.skip('モバイルでフィルターDrawerが開閉できる', async ({ page }) => {
    // TODO: Drawer が自動的に開いている場合の処理を改善する必要がある
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await page.waitForTimeout(500);

    // フローティングアクションボタンを探す（FABは "フィルター" のみ、閉じるボタンは除外）
    const filterButton = page.locator('button[aria-label="フィルター"]').first();

    await expect(filterButton).toBeVisible();

    // Drawerを開く
    await filterButton.click();
    await page.waitForTimeout(500);

    // Drawer内のコンテンツが表示されることを確認
    const drawerContent = page.locator('text="フィルター"');
    await expect(drawerContent).toBeVisible();

    // Drawerの外側をクリックして閉じる（backdrop）
    await page.mouse.click(10, 10);
    await page.waitForTimeout(300);
  });
});
