/**
 * お気に入り空状態の視覚的検証テスト
 */
import { test, expect } from '@playwright/test';

test.describe('お気に入り空状態の視覚的検証', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリア
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('iPhone 14 Proサイズで空状態が正しく中央揃えで表示される', async ({ page }) => {
    // iPhone 14 Proのビューポートサイズに設定
    await page.setViewportSize({ width: 393, height: 852 });

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // スクリーンショットを撮影
    await page.screenshot({
      path: 'test-results/favorites-empty-iphone.png',
      fullPage: true
    });

    // 空状態のコンテナを確認
    const emptyStateContainer = page.locator('text=お気に入りがありません').locator('..');
    await expect(emptyStateContainer).toBeVisible();

    // 中央揃えの検証：要素の位置を確認
    const containerBox = await emptyStateContainer.boundingBox();
    expect(containerBox).toBeTruthy();

    // ページ全体のコンテナを取得
    const mainContainer = page.locator('[class*="MuiContainer-root"]').first();
    const mainBox = await mainContainer.boundingBox();
    expect(mainBox).toBeTruthy();

    console.log('Empty State Container:', containerBox);
    console.log('Main Container:', mainBox);

    // アイコンの位置を確認
    const icon = page.locator('svg[data-testid="FavoriteIcon"]');
    const iconBox = await icon.boundingBox();
    expect(iconBox).toBeTruthy();
    console.log('Icon Position:', iconBox);

    // アイコンが中央付近にあることを確認（±50pxの誤差を許容）
    const centerX = mainBox!.x + mainBox!.width / 2;
    const iconCenterX = iconBox!.x + iconBox!.width / 2;
    const diff = Math.abs(centerX - iconCenterX);
    console.log(`Center X: ${centerX}, Icon Center X: ${iconCenterX}, Diff: ${diff}`);

    // 中央揃えの許容範囲を確認
    expect(diff).toBeLessThan(50);

    // 見出しの位置を確認
    const heading = page.locator('h4:has-text("お気に入りがありません")');
    const headingBox = await heading.boundingBox();
    expect(headingBox).toBeTruthy();
    console.log('Heading Position:', headingBox);

    // 見出しも中央付近にあることを確認
    const headingCenterX = headingBox!.x + headingBox!.width / 2;
    const headingDiff = Math.abs(centerX - headingCenterX);
    console.log(`Heading Center X: ${headingCenterX}, Diff: ${headingDiff}`);
    expect(headingDiff).toBeLessThan(50);
  });

  test('実際のContainer幅とBox設定を確認', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // Containerのスタイルを確認
    const container = page.locator('[class*="MuiContainer-root"]').first();
    const containerStyles = await container.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        maxWidth: styles.maxWidth,
        width: styles.width,
        marginLeft: styles.marginLeft,
        marginRight: styles.marginRight,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        display: styles.display,
      };
    });
    console.log('Container Styles:', containerStyles);

    // 中央揃えBoxのスタイルを確認
    const centerBox = page.locator('text=お気に入りがありません').locator('..');
    const centerBoxStyles = await centerBox.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        flexDirection: styles.flexDirection,
        alignItems: styles.alignItems,
        justifyContent: styles.justifyContent,
        minHeight: styles.minHeight,
        textAlign: styles.textAlign,
        paddingLeft: styles.paddingLeft,
        paddingRight: styles.paddingRight,
        width: styles.width,
      };
    });
    console.log('Center Box Styles:', centerBoxStyles);

    // スタイルが正しく適用されていることを確認
    expect(centerBoxStyles.display).toBe('flex');
    expect(centerBoxStyles.flexDirection).toBe('column');
    expect(centerBoxStyles.alignItems).toBe('center');
    expect(centerBoxStyles.justifyContent).toBe('center');
    expect(centerBoxStyles.textAlign).toBe('center');
  });

  test('親要素の階層構造を確認', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // 階層構造を出力
    const hierarchy = await page.evaluate(() => {
      const heading = document.querySelector('h4');
      if (!heading) return [];

      const parents = [];
      let current = heading.parentElement;
      let level = 0;

      while (current && level < 10) {
        const styles = window.getComputedStyle(current);
        parents.push({
          level,
          tagName: current.tagName,
          className: current.className,
          id: current.id,
          display: styles.display,
          flexDirection: styles.flexDirection,
          alignItems: styles.alignItems,
          justifyContent: styles.justifyContent,
          width: styles.width,
          maxWidth: styles.maxWidth,
        });
        current = current.parentElement;
        level++;
      }

      return parents;
    });

    console.log('\n===== 階層構造 =====');
    hierarchy.forEach(parent => {
      console.log(`Level ${parent.level}: ${parent.tagName} (${parent.className})`);
      console.log(`  Display: ${parent.display}, FlexDirection: ${parent.flexDirection}`);
      console.log(`  AlignItems: ${parent.alignItems}, JustifyContent: ${parent.justifyContent}`);
      console.log(`  Width: ${parent.width}, MaxWidth: ${parent.maxWidth}`);
      console.log('');
    });
  });
});
