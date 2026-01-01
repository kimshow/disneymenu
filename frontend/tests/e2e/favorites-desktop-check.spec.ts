/**
 * デスクトップサイズでの空状態検証
 */
import { test, expect } from '@playwright/test';

test.describe('デスクトップレイアウト検証', () => {
  test('デスクトップサイズで空状態のレイアウトを確認', async ({ page }) => {
    // デスクトップサイズに設定
    await page.setViewportSize({ width: 1920, height: 1080 });

  // localStorageをクリア
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());

  // お気に入りページに遷移
  await page.goto('/favorites');
  await page.waitForLoadState('networkidle');

  // スクリーンショットを撮影
  await page.screenshot({
    path: 'test-results/favorites-empty-desktop.png',
    fullPage: true
  });

// 外側のBoxの位置とスタイルを確認
  const outerBox = page.locator('body > div > div').first();
  const outerBoxBox = await outerBox.boundingBox();
  const outerBoxStyles = await outerBox.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      width: styles.width,
      display: styles.display,
      flexDirection: styles.flexDirection,
      alignItems: styles.alignItems,
      paddingLeft: styles.paddingLeft,
      paddingRight: styles.paddingRight,
    };
  });

  console.log('Outer Box Box:', outerBoxBox);
  console.log('Outer Box Styles:', outerBoxStyles);

  // 戻るボタンの位置を確認
  const backButton = page.locator('button:has-text("メニュー一覧へ戻る")').first();
  const backButtonBox = await backButton.boundingBox();
  console.log('Back Button Box:', backButtonBox);

  // 中央揃えBoxの位置を確認
  const centerBox = page.locator('text=お気に入りがありません').locator('..');
  const centerBoxBox = await centerBox.boundingBox();
  const centerBoxStyles = await centerBox.evaluate((el) => {
    const styles = window.getComputedStyle(el);
    return {
      display: styles.display,
      alignItems: styles.alignItems,
      justifyContent: styles.justifyContent,
      width: styles.width,
    };
  });

  console.log('Center Box Box:', centerBoxBox);
  console.log('Center Box Styles:', centerBoxStyles);

  // アイコンの位置を確認
  const icon = page.locator('svg[data-testid="FavoriteIcon"]');
  const iconBox = await icon.boundingBox();
  console.log('Icon Box:', iconBox);

  // 画面の中央位置を計算
  const screenCenterX = 1920 / 2;
  console.log('Screen Center X:', screenCenterX);

  // アイコンの中央位置を計算
  if (iconBox) {
    const iconCenterX = iconBox.x + iconBox.width / 2;
    console.log('Icon Center X:', iconCenterX);
    console.log('Icon Center Diff from Screen Center:', Math.abs(screenCenterX - iconCenterX));

    // アイコンが画面中央付近にあることを確認（±50pxの誤差を許容）
    expect(Math.abs(screenCenterX - iconCenterX)).toBeLessThan(50);
  }
});});