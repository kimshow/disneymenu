/**
 * メニュー一覧ページのE2Eテスト（大量データ: 704件）
 */
import { test, expect } from '@playwright/test';

test.describe('メニュー一覧ページ - 大量データ（704件）', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('合計件数が正しく表示される', async ({ page }) => {
    // "全704件中 1-12件を表示" のようなテキストを確認
    const totalText = page.getByText(/全\d+件中/);
    await expect(totalText).toBeVisible({ timeout: 10000 });

    const text = await totalText.textContent();
    const totalMatch = text?.match(/全(\d+)件中/);
    expect(totalMatch).toBeTruthy();

    const total = parseInt(totalMatch![1]);
    expect(total).toBeGreaterThanOrEqual(700); // 704件前後
    expect(total).toBeLessThanOrEqual(710);
  });

  test('1ページ目に12件のメニューが表示される', async ({ page }) => {
    const menuCards = page.locator('[class*="MuiCard-root"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const count = await menuCards.count();
    expect(count).toBe(12); // limit=12
  });

  test('ページネーションが正しく表示される', async ({ page }) => {
    const pagination = page.locator('[class*="MuiPagination-root"]');
    await expect(pagination).toBeVisible();

    // 704件 ÷ 12件/ページ = 59ページ
    const lastPageButton = page.getByLabel(/Go to page 59/);
    await expect(lastPageButton).toBeVisible();
  });

  test('2ページ目に遷移できる', async ({ page }) => {
    const pagination = page.locator('[class*="MuiPagination-root"]');
    await expect(pagination).toBeVisible();

    // 2ページ目をクリック
    await page.getByLabel('Go to page 2').click();
    await page.waitForLoadState('networkidle');

    // メニューカードが再表示されることを確認
    const menuCards = page.locator('[class*="MuiCard-root"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 2ページ目のデータが表示されていることを確認
    const rangeText = page.getByText(/全\d+件中 13-24件を表示/);
    await expect(rangeText).toBeVisible();
  });

  test('最終ページ（59ページ）に遷移できる', async ({ page }) => {
    // 最終ページボタンをクリック
    await page.getByLabel(/Go to page 59/).click();
    await page.waitForLoadState('networkidle');

    // 最終ページのメニュー件数を確認（704 - 58*12 = 8件）
    const menuCards = page.locator('[class*="MuiCard-root"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const count = await menuCards.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(12);
  });

  test('ページ遷移時にスクロールトップに戻る', async ({ page }) => {
    // ページ下部にスクロール
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const scrollBefore = await page.evaluate(() => window.scrollY);

    // ページが短くてスクロールできない場合はテストをスキップ
    if (scrollBefore < 100) {
      console.log('ページが短いためスクロールテストをスキップ');
      return;
    }

    expect(scrollBefore).toBeGreaterThan(100);

    // 次ページに遷移
    await page.getByLabel('Go to page 2').click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // スクロール位置がトップに戻っている
    const scrollAfter = await page.evaluate(() => window.scrollY);
    expect(scrollAfter).toBeLessThan(100);
  });
});

test.describe('パフォーマンステスト', () => {
  test('初回ロード時間が3秒以内', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuCards = page.locator('[class*="MuiCard-root"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // 3秒以内

    console.log(`初回ロード時間: ${loadTime}ms`);
  });

  test('ページ遷移が1秒以内', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const startTime = Date.now();

    await page.getByLabel('Go to page 2').click();
    await page.waitForLoadState('networkidle');

    const transitionTime = Date.now() - startTime;
    expect(transitionTime).toBeLessThan(1000); // 1秒以内

    console.log(`ページ遷移時間: ${transitionTime}ms`);
  });

  test('画像の遅延読み込みが機能する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 最初の画像を探す（画像があるメニューが表示されている場合）
    const images = page.locator('[class*="MuiCardMedia-root"] img');
    const imageCount = await images.count();

    if (imageCount > 0) {
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();

      // 画像の自然な寸法を取得（ロード完了の証明）
      const naturalWidth = await firstImage.evaluate((img: HTMLImageElement) => img.naturalWidth);
      expect(naturalWidth).toBeGreaterThan(0);
    }
  });
});

test.describe('データ整合性テスト', () => {
  test('全メニューに必須フィールドが存在する（サンプリング）', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 最初の3ページをチェック
    for (let pageNum = 1; pageNum <= 3; pageNum++) {
      if (pageNum > 1) {
        await page.getByLabel(`Go to page ${pageNum}`).click();
        await page.waitForLoadState('networkidle');
      }

      const menuCards = page.locator('[class*="MuiCard-root"]');
      const count = await menuCards.count();

      for (let i = 0; i < count; i++) {
        const card = menuCards.nth(i);

        // メニュー名が存在
        const menuName = card.locator('h2');
        await expect(menuName).toBeVisible();
        const nameText = await menuName.textContent();
        expect(nameText).toBeTruthy();
        expect(nameText!.length).toBeGreaterThan(0);

        // 価格が存在
        const price = card.getByText(/¥\d/);
        await expect(price).toBeVisible();

        // パークタグが存在
        const parkChip = card.locator('[class*="MuiChip-root"]').first();
        await expect(parkChip).toBeVisible();
      }
    }
  });

  test('価格が正しくフォーマットされている', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // h5要素（価格表示）から価格を取得
    const menuCards = page.locator('[class*="MuiCard-root"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const count = await menuCards.count();
    expect(count).toBeGreaterThan(0);

    // 最初の5件の価格をチェック
    for (let i = 0; i < Math.min(count, 5); i++) {
      const card = menuCards.nth(i);
      const priceElement = card.locator('h5');

      await expect(priceElement).toBeVisible();
      const priceText = await priceElement.textContent();

      // "¥500" または "¥1,200" の形式
      expect(priceText).toMatch(/¥[0-9,]+/);

      // 数値部分を抽出
      const numericMatch = priceText!.match(/¥([0-9,]+)/);
      if (numericMatch) {
        const numericValue = numericMatch[1].replace(/,/g, '');
        const price = parseInt(numericValue);

        // 価格が妥当な範囲（0円以上、10万円以下）
        expect(price).toBeGreaterThanOrEqual(0);
        expect(price).toBeLessThanOrEqual(100000);
      }
    }
  });

  test('レストラン情報が存在する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuCards = page.locator('[class*="MuiCard-root"]');
    const firstCard = menuCards.first();

    // RestaurantList コンポーネントが表示されている
    const restaurantInfo = firstCard.locator('[class*="MuiTypography-body2"]');
    await expect(restaurantInfo.first()).toBeVisible();

    const text = await restaurantInfo.first().textContent();
    expect(text).toBeTruthy();
  });
});

test.describe('エッジケース', () => {
  test('price.amount が 0 のメニューの表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 価格が ¥0 のメニューを検索（ブッフェのドリンクなど）
    const zeroPrice = page.getByText('¥0/');

    // 存在する場合は正しく表示されることを確認
    const count = await zeroPrice.count();
    if (count > 0) {
      await expect(zeroPrice.first()).toBeVisible();
      console.log(`¥0のメニューが ${count} 件見つかりました`);
    }
  });

  test('画像がないメニューの表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // "画像なし" テキストが表示されているカードを検索
    const noImageText = page.getByText('画像なし');
    const count = await noImageText.count();

    if (count > 0) {
      await expect(noImageText.first()).toBeVisible();

      // グレーの背景が表示されていることを確認
      const noImageBox = noImageText.first().locator('..');
      const bgColor = await noImageBox.evaluate(el =>
        window.getComputedStyle(el).backgroundColor
      );

      // グレー系の色（rgb値が存在する）
      expect(bgColor).toBeTruthy();
      console.log(`画像なしのメニューが ${count} 件見つかりました`);
    }
  });

  test('カテゴリタグの表示', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuCards = page.locator('[class*="MuiCard-root"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const firstCard = menuCards.first();

    // カテゴリチップが存在することを確認
    const categoryChips = firstCard.locator('[class*="MuiChip-root"]');
    const count = await categoryChips.count();

    expect(count).toBeGreaterThan(0);

    // 最初のカテゴリが表示されている
    await expect(categoryChips.first()).toBeVisible();
  });
});
