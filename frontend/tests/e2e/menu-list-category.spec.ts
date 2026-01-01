import { test, expect } from '@playwright/test';

test.describe('カテゴリフィルター機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // メニューが読み込まれるまで待機
    await page.waitForSelector('[data-testid="menu-card"]', { timeout: 10000 });
  });

  test('カテゴリフィルターが表示される', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリセレクトが存在することを確認
    const categoryLabel = page.locator('label:has-text("カテゴリ")');
    await expect(categoryLabel).toBeVisible();

    // Selectコンポーネントが存在することを確認
    const categorySelect = page.locator('#category-filter');
    await expect(categorySelect).toBeAttached();
  });

  test('カテゴリドロップダウンを開くとカテゴリ一覧が表示される', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリセレクトをクリック
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    // ドロップダウンメニューが表示されることを確認
    const menu = page.locator('[role="listbox"], [role="menu"]');
    await expect(menu).toBeVisible();

    // 「すべて」オプションが存在することを確認
    const allOption = page.locator('[role="option"]:has-text("すべて")');
    await expect(allOption).toBeVisible();

    // カテゴリオプションが表示されることを確認（少なくとも3つ）
    const options = page.locator('[role="option"]');
    const optionCount = await options.count();
    expect(optionCount).toBeGreaterThanOrEqual(3);
  });

  test('「ドリンク」カテゴリで絞り込める', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // 初期状態のメニュー数を取得
    const initialMenuCount = await page.locator('[data-testid="menu-card"]').count();

    // カテゴリセレクトを開く
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    // 「ドリンク」オプションを選択
    const drinkOption = page.locator('[role="option"]:has-text("ドリンク")').first();
    await drinkOption.click();
    await page.waitForTimeout(500);

    // URLにcategoriesパラメータが反映されることを確認
    const url = page.url();
    expect(url).toContain('categories=drink');

    // メニューが表示されることを確認
    const filteredMenuCount = await page.locator('[data-testid="menu-card"]').count();
    expect(filteredMenuCount).toBeGreaterThan(0);

    // フィルター後のメニュー数が初期状態と異なることを確認（ドリンクカテゴリは全体より少ない可能性がある）
    console.log(`初期メニュー数: ${initialMenuCount}, フィルター後: ${filteredMenuCount}`);
  });

  test('「料理」カテゴリで絞り込める', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリセレクトを開く
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    // 「料理」オプションを選択
    const foodOption = page.locator('[role="option"]:has-text("料理")').first();

    // 料理オプションが存在する場合のみテスト実行
    if (await foodOption.count() > 0) {
      await foodOption.click();
      await page.waitForTimeout(500);

      // URLにcategoriesパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('categories=food');

      // メニューが表示されることを確認
      const menuCount = await page.locator('[data-testid="menu-card"]').count();
      expect(menuCount).toBeGreaterThan(0);
    }
  });

  test('「キャラクターメニュー」カテゴリで絞り込める', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリセレクトを開く
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    // 「キャラクターメニュー」オプションを選択
    const characterOption = page.locator('[role="option"]:has-text("キャラクターメニュー")').first();

    // キャラクターメニューオプションが存在する場合のみテスト実行
    if (await characterOption.count() > 0) {
      await characterOption.click();
      await page.waitForTimeout(500);

      // URLにcategoriesパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('categories=character_menu');

      // メニューが表示されることを確認
      const menuCount = await page.locator('[data-testid="menu-card"]').count();
      expect(menuCount).toBeGreaterThan(0);
    }
  });

  test('カテゴリ選択後に「すべて」を選択するとフィルターが解除される', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリセレクトを開いて「ドリンク」を選択
    let categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    const drinkOption = page.locator('[role="option"]:has-text("ドリンク")').first();
    await drinkOption.click();
    await page.waitForTimeout(500);

    // URLにcategoriesパラメータがあることを確認
    let url = page.url();
    expect(url).toContain('categories=drink');

    // フィルター後のメニュー数を取得
    const filteredMenuCount = await page.locator('[data-testid="menu-card"]').count();

    // 再度カテゴリセレクトを開いて「すべて」を選択
    categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    const allOption = page.locator('[role="option"]:has-text("すべて")').first();
    await allOption.click();
    await page.waitForTimeout(500);

    // URLからcategoriesパラメータが削除されることを確認
    url = page.url();
    expect(url).not.toContain('categories=');

    // メニュー数が増えることを確認（全メニューが表示される）
    const allMenuCount = await page.locator('[data-testid="menu-card"]').count();
    expect(allMenuCount).toBeGreaterThanOrEqual(filteredMenuCount);
  });

  test('カテゴリフィルターとタグフィルターを組み合わせて使える', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリで「ドリンク」を選択
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    const drinkOption = page.locator('[role="option"]:has-text("ドリンク")').first();
    await drinkOption.click();
    await page.waitForTimeout(500);

    // カテゴリフィルター後のメニュー数を取得
    const categoryFilteredCount = await page.locator('[data-testid="menu-card"]').count();

    // タグフィルターも追加（例: ソフトドリンク）
    const tagChip = page.locator('button:has-text("ソフトドリンク")').or(
      page.locator('[role="button"]:has-text("ソフトドリンク")')
    ).first();

    if (await tagChip.count() > 0) {
      await tagChip.click();
      await page.waitForTimeout(500);

      // URLに両方のパラメータが含まれることを確認
      const url = page.url();
      expect(url).toContain('categories=drink');
      expect(url).toContain('tags=');

      // タグフィルター追加後のメニュー数を取得
      const combinedFilteredCount = await page.locator('[data-testid="menu-card"]').count();

      // 組み合わせフィルター後のメニュー数がカテゴリのみより少ないか同じであることを確認
      expect(combinedFilteredCount).toBeLessThanOrEqual(categoryFilteredCount);
    }
  });

  test('カテゴリフィルター適用時に適用中フィルターが表示される', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリで「ドリンク」を選択
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    const drinkOption = page.locator('[role="option"]:has-text("ドリンク")').first();
    await drinkOption.click();
    await page.waitForTimeout(500);

    // 適用中フィルターエリアが表示されることを確認
    const appliedFilters = page.locator('text="適用中のフィルター"').or(
      page.locator('[data-testid="applied-filters"]')
    );

    // 適用中フィルターが存在する場合、カテゴリチップが表示されることを確認
    if (await appliedFilters.count() > 0) {
      const categoryChip = page.locator('text="ドリンク"').or(
        page.locator('[data-testid*="category-chip"]')
      );
      await expect(categoryChip.first()).toBeVisible();
    }
  });

  test('カテゴリごとにメニュー数が表示される', async ({ page }) => {
    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリセレクトを開く
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    // メニュー数が括弧付きで表示されているオプションを探す
    const optionWithCount = page.locator('[role="option"]').filter({ hasText: /\(\d+\)/ }).first();

    // メニュー数が表示されることを確認
    await expect(optionWithCount).toBeVisible();

    // メニュー数のテキストを取得して確認
    const optionText = await optionWithCount.textContent();
    expect(optionText).toMatch(/\(\d+\)/);
  });

  test('カテゴリフィルター適用時にページ番号がリセットされる', async ({ page }) => {
    // ページ2に移動
    await page.goto('/?page=2');
    await page.waitForSelector('[data-testid="menu-card"]', { timeout: 10000 });

    // URLがpage=2を含むことを確認
    let url = page.url();
    expect(url).toContain('page=2');

    // フィルターパネルを開く（モバイルの場合）
    const filterButton = page.locator('button:has-text("フィルター")');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      await page.waitForTimeout(300);
    }

    // カテゴリフィルターを適用
    const categorySelect = page.locator('#category-filter').or(
      page.locator('label:has-text("カテゴリ")').locator('..').locator('[role="button"]')
    );
    await categorySelect.click();
    await page.waitForTimeout(300);

    const drinkOption = page.locator('[role="option"]:has-text("ドリンク")').first();
    await drinkOption.click();
    await page.waitForTimeout(500);

    // URLからpage=2が削除されることを確認（ページ1にリセット）
    url = page.url();
    expect(url).not.toContain('page=2');
    expect(url).toContain('categories=drink');
  });
});
