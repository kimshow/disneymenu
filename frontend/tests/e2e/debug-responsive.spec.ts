/**
 * レスポンシブUI問題調査用テスト
 */
import { test, expect } from '@playwright/test';

test.describe('DOM構造調査', () => {
  test('お気に入り空状態のDOM構造を調査', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // ページ全体のHTMLを取得
    const html = await page.content();
    console.log('===== お気に入り空状態のHTML =====');
    console.log(html);

    // ボタンの数を確認
    const buttons = await page.locator('button:has-text("メニュー一覧へ戻る")').count();
    console.log(`\n===== ボタンの数: ${buttons} =====`);

    // 各ボタンの詳細を確認
    for (let i = 0; i < buttons; i++) {
      const button = page.locator('button:has-text("メニュー一覧へ戻る")').nth(i);
      const text = await button.textContent();
      const classes = await button.getAttribute('class');
      console.log(`\nボタン ${i + 1}:`);
      console.log(`  テキスト: ${text}`);
      console.log(`  クラス: ${classes}`);
    }
  });

  test('お気に入りメニュー一覧のグリッド構造を調査', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
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

    // グリッドコンテナを探す
    const favoriteCards = page.locator('[data-testid="menu-card"]');
    await expect(favoriteCards).toHaveCount(3);

    // 親要素を順番に調査
    const firstCard = favoriteCards.first();
    console.log('\n===== グリッド構造調査 =====');

    // 親要素1
    const parent1 = firstCard.locator('..');
    const parent1HTML = await parent1.evaluate((el) => el.outerHTML.slice(0, 200));
    console.log('親要素1:', parent1HTML);

    // 親要素2（グリッドコンテナの可能性）
    const parent2 = parent1.locator('..');
    const parent2Styles = await parent2.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns,
        gap: styles.gap,
      };
    });
    console.log('親要素2のスタイル:', parent2Styles);

    // 正しいグリッドコンテナを探す
    const gridContainer = page.locator('[data-testid="menu-card"]').locator('xpath=ancestor::*[@style]').first();
    const gridHTML = await gridContainer.evaluate((el) => el.outerHTML.slice(0, 300));
    console.log('\nグリッドコンテナ候補:', gridHTML);
  });

  test('メニュー一覧のグリッド構造を調査', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    console.log('\n===== メニュー一覧のグリッド構造調査 =====');

    // 親要素を順番に調査
    const firstCard = menuCards.first();

    // 親要素1
    const parent1 = firstCard.locator('..');
    const parent1HTML = await parent1.evaluate((el) => el.outerHTML.slice(0, 200));
    console.log('親要素1:', parent1HTML);

    // 親要素2（グリッドコンテナの可能性）
    const parent2 = parent1.locator('..');
    const parent2Styles = await parent2.evaluate((el) => {
      const styles = window.getComputedStyle(el);
      return {
        display: styles.display,
        gridTemplateColumns: styles.gridTemplateColumns,
        gap: styles.gap,
      };
    });
    console.log('親要素2のスタイル:', parent2Styles);
  });
});
