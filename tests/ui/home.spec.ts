import { test, expect } from '@fixtures';

test.describe('Home page', () => {
  test(
    'SC-007 the hero Shop Now button leads to all products',
    { tag: '@regression', annotation: [{ type: 'scenario', description: 'SC-007' }] },
    async ({ homePage, productsPage, page }) => {
      await test.step('Open the home page', async () => {
        await homePage.open();
      });

      await test.step('Click Shop Now in the hero banner', async () => {
        await homePage.shopNowButton.click();
      });

      await test.step('Verify the all products page is shown', async () => {
        await expect(page).toHaveURL(/\/products$/);
        await expect(productsPage.heading).toBeVisible();
      });
    }
  );
});
