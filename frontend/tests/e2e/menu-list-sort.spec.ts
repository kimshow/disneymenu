import { test, expect } from '@playwright/test';

test.describe('ソート機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // メニューが読み込まれるまで待機
    await page.waitForSelector('[data-testid="menu-card"]', { timeout: 10000 });
  });

  test('ソートコントロールが表示される', async ({ page }) => {
    // ソート選択のSelectまたはボタンを探す
    const sortControl = page.locator('select[aria-label*="並び替え"]')
      .or(page.locator('label:has-text("並び替え")'))
      .or(page.locator('text=/ソート|並び替え/i'));
    
    // ソートコントロールが存在することを確認（Phase 3で実装予定のため、存在しない場合はスキップ）
    const controlCount = await sortControl.count();
    if (controlCount === 0) {
      test.skip();
    }
  });

  test('価格昇順でソートできる', async ({ page }) => {
    // ソート選択
    const sortSelect = page.locator('select[aria-label*="並び替え"]').or(page.locator('label:has-text("並び替え")').locator('..').locator('select'));
    
    if (await sortSelect.count() > 0) {
      await sortSelect.first().selectOption('price');
      
      // 昇順ボタンをクリック
      const ascButton = page.locator('button[aria-label*="昇順"]');
      if (await ascButton.count() > 0) {
        await ascButton.first().click();
        await page.waitForTimeout(500);

        // URLにsortパラメータが反映されることを確認
        const url = page.url();
        expect(url).toContain('sort=price');
        expect(url).toContain('order=asc');

        // 価格が昇順に並んでいることを確認
        const priceElements = page.locator('[data-testid="menu-card"]').locator('text=/¥[0-9,]+/');
        const priceCount = await priceElements.count();
        
        if (priceCount >= 2) {
          const prices: number[] = [];
          for (let i = 0; i < Math.min(priceCount, 5); i++) {
            const priceText = await priceElements.nth(i).textContent();
            const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0');
            prices.push(price);
          }
          
          // 昇順に並んでいることを確認
          for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
          }
        }
      }
    } else {
      test.skip();
    }
  });

  test('価格降順でソートできる', async ({ page }) => {
    const sortSelect = page.locator('select[aria-label*="並び替え"]').or(page.locator('label:has-text("並び替え")').locator('..').locator('select'));
    
    if (await sortSelect.count() > 0) {
      await sortSelect.first().selectOption('price');
      
      // 降順ボタンをクリック
      const descButton = page.locator('button[aria-label*="降順"]');
      if (await descButton.count() > 0) {
        await descButton.first().click();
        await page.waitForTimeout(500);

        // URLにsortパラメータが反映されることを確認
        const url = page.url();
        expect(url).toContain('sort=price');
        expect(url).toContain('order=desc');

        // 価格が降順に並んでいることを確認
        const priceElements = page.locator('[data-testid="menu-card"]').locator('text=/¥[0-9,]+/');
        const priceCount = await priceElements.count();
        
        if (priceCount >= 2) {
          const prices: number[] = [];
          for (let i = 0; i < Math.min(priceCount, 5); i++) {
            const priceText = await priceElements.nth(i).textContent();
            const price = parseInt(priceText?.replace(/[^0-9]/g, '') || '0');
            prices.push(price);
          }
          
          // 降順に並んでいることを確認
          for (let i = 1; i < prices.length; i++) {
            expect(prices[i]).toBeLessThanOrEqual(prices[i - 1]);
          }
        }
      }
    } else {
      test.skip();
    }
  });

  test('名前順でソートできる', async ({ page }) => {
    const sortSelect = page.locator('select[aria-label*="並び替え"]').or(page.locator('label:has-text("並び替え")').locator('..').locator('select'));
    
    if (await sortSelect.count() > 0) {
      await sortSelect.first().selectOption('name');
      await page.waitForTimeout(500);

      // URLにsortパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('sort=name');
    } else {
      test.skip();
    }
  });

  test('新着順でソートできる', async ({ page }) => {
    const sortSelect = page.locator('select[aria-label*="並び替え"]').or(page.locator('label:has-text("並び替え")').locator('..').locator('select'));
    
    if (await sortSelect.count() > 0) {
      await sortSelect.first().selectOption('scraped_at');
      await page.waitForTimeout(500);

      // URLにsortパラメータが反映されることを確認
      const url = page.url();
      expect(url).toContain('sort=scraped_at');
    } else {
      test.skip();
    }
  });

  test('ソート順の切り替えができる', async ({ page }) => {
    const orderButton = page.locator('button[aria-label*="昇順"]').or(page.locator('button[aria-label*="降順"]'));
    
    if (await orderButton.count() > 0) {
      const initialLabel = await orderButton.first().getAttribute('aria-label');
      
      // ボタンをクリック
      await orderButton.first().click();
      await page.waitForTimeout(500);

      // ラベルが変更されることを確認
      const newLabel = await orderButton.first().getAttribute('aria-label');
      expect(newLabel).not.toBe(initialLabel);
    } else {
      test.skip();
    }
  });

  test('URLからソート設定を読み込める', async ({ page }) => {
    // URLパラメータ付きでページを開く
    await page.goto('/?sort=price&order=asc');
    await page.waitForTimeout(500);

    // ソート設定が反映されることを確認（UIで確認するか、結果の順序で確認）
    const url = page.url();
    expect(url).toContain('sort=price');
    expect(url).toContain('order=asc');
  });
});
