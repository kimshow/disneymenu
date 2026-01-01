/**
 * お気に入り機能のE2Eテスト
 */
import { test, expect } from '@playwright/test';

test.describe('お気に入り機能', () => {
  test.beforeEach(async ({ page }) => {
    // localStorageをクリア（テストの独立性を保つ）
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('お気に入りボタンが各メニューカードに表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 最初のカードのお気に入りボタンを確認
    const firstCard = menuCards.first();
    const favoriteButton = firstCard.locator('[aria-label*="お気に入り"]');
    await expect(favoriteButton).toBeVisible();
  });

  test('お気に入りに追加できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 最初のメニューカードのお気に入りボタンをクリック
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const firstCard = menuCards.first();
    const favoriteButton = firstCard.locator('[aria-label*="お気に入り"]').first();

    // 追加前: アウトラインアイコン
    await expect(favoriteButton.locator('[data-testid="favorite-outline"]')).toBeVisible();

    // クリックしてお気に入りに追加
    await favoriteButton.click();

    // 追加後: 塗りつぶしアイコン
    await expect(favoriteButton.locator('[data-testid="favorite-filled"]')).toBeVisible({ timeout: 2000 });

    // localStorageに保存されていることを確認
    const favorites = await page.evaluate(() => {
      const data = localStorage.getItem('disney-menu-favorites');
      return data ? JSON.parse(data) : null;
    });

    expect(favorites).toBeTruthy();
    expect(favorites.favorites).toHaveLength(1);
  });

  test('ヘッダーのお気に入りバッジが更新される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 最初はバッジが表示されていない（0件）
    const badgeContainer = page.locator('button:has-text("お気に入り")');
    await expect(badgeContainer).toBeVisible();

    // メニューをお気に入りに追加
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const favoriteButton = menuCards.first().locator('[aria-label*="お気に入り"]').first();
    await favoriteButton.click();

    // バッジに「1」が表示される
    await expect(page.locator('.MuiBadge-badge:has-text("1")')).toBeVisible({ timeout: 2000 });
  });

  test('お気に入りページに遷移できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // ヘッダーのお気に入りボタンをクリック
    const favoritesButton = page.locator('button:has-text("お気に入り")');
    await favoritesButton.click();

    // お気に入りページに遷移
    await expect(page).toHaveURL('/favorites');

    // お気に入りページのタイトルが表示される
    await expect(page.locator('h4:has-text("お気に入り")')).toBeVisible();
  });

  test('お気に入り一覧ページに追加したメニューが表示される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 最初のメニューの名前を取得（h2要素、component="h2"で実装されている）
    const firstMenuName = await menuCards.first().locator('h2').first().textContent();

    // お気に入りに追加
    const favoriteButton = menuCards.first().locator('[aria-label*="お気に入り"]').first();
    await favoriteButton.click();
    
    // バッジが「1」と表示されるまで待機（お気に入りが追加されたことを確認）
    await expect(page.locator('[data-testid="favorites-badge"]')).toContainText('1', { timeout: 5000 });
    await page.waitForTimeout(500); // 状態更新の完了を確実にする

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const favMenuCards = page.locator('[data-testid="menu-card"]');
    await expect(favMenuCards).toHaveCount(1, { timeout: 10000 });

    // 追加したメニューが表示されることを確認（h2要素で実装されている）
    await expect(page.locator(`h2:has-text("${firstMenuName}")`)).toBeVisible({ timeout: 5000 });
  });

  test('お気に入りから削除できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューをお気に入りに追加
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const favoriteButton = menuCards.first().locator('[aria-label*="お気に入り"]').first();
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // もう一度クリックして削除
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // アウトラインアイコンに戻る
    await expect(favoriteButton.locator('[data-testid="favorite-outline"]')).toBeVisible();

    // localStorageが空になっていることを確認
    const favorites = await page.evaluate(() => {
      const data = localStorage.getItem('disney-menu-favorites');
      return data ? JSON.parse(data) : null;
    });

    expect(favorites.favorites).toHaveLength(0);
  });

  test('お気に入りページで空状態が表示される', async ({ page }) => {
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // 空状態メッセージが表示される
    await expect(page.locator('text=お気に入りがありません')).toBeVisible({ timeout: 5000 });

    // メニュー一覧へ戻るボタンが表示される（大きいボタンを選択）
    await expect(page.getByRole('button', { name: 'メニュー一覧へ戻る' }).last()).toBeVisible();
  });

  test('お気に入りページでソート機能が動作する', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 複数のメニューをお気に入りに追加
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 最初の3つのメニューを追加
    for (let i = 0; i < 3; i++) {
      const card = menuCards.nth(i);
      const favoriteButton = card.locator('[aria-label*="お気に入り"]').first();
      await favoriteButton.click();
      await page.waitForTimeout(300);
    }

    // バッジが「3」と表示されるまで待機
    await expect(page.locator('[data-testid="favorites-badge"]')).toContainText('3', { timeout: 5000 });
    await page.waitForTimeout(500); // 状態更新の完了を確実にする

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // メニューカードが表示されるまで待機
    const favMenuCards = page.locator('[data-testid="menu-card"]');
    await expect(favMenuCards).toHaveCount(3, { timeout: 10000 });

    // ソート機能が表示されることを確認
    await expect(page.getByLabel('並び替え')).toBeVisible();

    // Material-UI SelectをクリックしてプションOをCpen（role="combobox"で検索）
    await page.getByRole('combobox', { name: '並び替え' }).click();

    // ソートオプションが表示される
    await expect(page.getByRole('option', { name: '名前' })).toBeVisible();
    await expect(page.getByRole('option', { name: '価格' })).toBeVisible();
  });

  test('お気に入りページですべてクリアできる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューをお気に入りに追加
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const favoriteButton = menuCards.first().locator('[aria-label*="お気に入り"]').first();
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // 確認ダイアログのハンドラーを設定
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('すべてのお気に入り');
      await dialog.accept();
    });

    // すべてクリアボタンをクリック
    const clearButton = page.locator('button:has-text("すべてクリア")');
    await clearButton.click();

    // 空状態が表示される
    await expect(page.locator('text=お気に入りがありません')).toBeVisible({ timeout: 3000 });
  });

  test('複数のメニューをお気に入りに追加・削除できる', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    // 3つのメニューを追加
    for (let i = 0; i < 3; i++) {
      const card = menuCards.nth(i);
      const favoriteButton = card.locator('[aria-label*="お気に入り"]').first();
      await favoriteButton.click();
      await page.waitForTimeout(300);
    }

    // バッジに「3」が表示される
    await expect(page.locator('.MuiBadge-badge:has-text("3")')).toBeVisible({ timeout: 2000 });

    // お気に入りページに遷移
    await page.goto('/favorites');
    await page.waitForLoadState('networkidle');

    // 3件のメニューが表示される
    const favoritesCount = page.locator('h6:has-text("(3件)")');
    await expect(favoritesCount).toBeVisible();

    // メニューカードが3つ表示される
    const favoriteCards = page.locator('[data-testid="menu-card"]');
    await expect(favoriteCards).toHaveCount(3);
  });

  test('ページリロード後もお気に入りが保持される', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // メニューをお気に入りに追加
    const menuCards = page.locator('[data-testid="menu-card"]');
    await expect(menuCards.first()).toBeVisible({ timeout: 10000 });

    const favoriteButton = menuCards.first().locator('[aria-label*="お気に入り"]').first();
    await favoriteButton.click();
    await page.waitForTimeout(500);

    // ページをリロード
    await page.reload();
    await page.waitForLoadState('networkidle');

    // お気に入りが保持されていることを確認（塗りつぶしアイコン）
    const reloadedCards = page.locator('[data-testid="menu-card"]');
    await expect(reloadedCards.first()).toBeVisible({ timeout: 10000 });

    const reloadedButton = reloadedCards.first().locator('[aria-label*="お気に入り"]').first();
    await expect(reloadedButton.locator('[data-testid="favorite-filled"]')).toBeVisible();

    // バッジも保持されている
    await expect(page.locator('.MuiBadge-badge:has-text("1")')).toBeVisible();
  });
});
