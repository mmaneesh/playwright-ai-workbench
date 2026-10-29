import { test, expect } from '@fixtures';

test.describe('Home page visual', () => {
  test(
    'VIS-001 home page matches the approved visual baseline',
    {
      tag: ['@regression', '@visual'],
      annotation: [{ type: 'scenario', description: 'VIS-001' }],
    },
    async ({ homePage, page }) => {
      await test.step('Open the home page and await font readiness', async () => {
        await homePage.open();
        await page.evaluate(() => document.fonts.ready);
      });

      await test.step('Compare the viewport against the baseline with rotating carousels masked', async () => {
        await expect(page).toHaveScreenshot('home.png', { mask: [homePage.carousels] });
      });
    }
  );
});
