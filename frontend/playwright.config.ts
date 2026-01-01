import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright設定
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './tests/e2e',

  /* 並列実行 */
  fullyParallel: true,

  /* CI環境での設定 */
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  /* レポート設定 */
  reporter: 'html',

  /* 共通設定 */
  use: {
    /* ベースURL */
    baseURL: 'http://localhost:5175',

    /* スクリーンショット */
    screenshot: 'only-on-failure',

    /* トレース */
    trace: 'on-first-retry',
  },

  /* テスト用プロジェクト設定 */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  /* 開発サーバー起動 */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5175',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2分
  },
});
