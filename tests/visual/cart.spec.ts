import { test, expect } from '@fixtures';
import { SAUCEDEMO_ACCOUNTS, SAUCEDEMO_PASSWORD } from '@test-data/saucedemo-accounts.data';

test.describe('Cart page visual baseline', { tag: '@visual' }, () => {
  test.beforeEach(async ({ saucedemoLoginPage, saucedemoInventoryPage, saucedemoCartPage }) => {
    await saucedemoLoginPage.open();
    await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.standard, SAUCEDEMO_PASSWORD);
    await saucedemoInventoryPage.addToCart('sauce-labs-backpack');
    await saucedemoInventoryPage.addToCart('sauce-labs-bike-light');
    await saucedemoInventoryPage.openCart();
    await saucedemoCartPage.title.waitFor();
  });

  test(
    'SC-013 the cart with two items matches its visual baseline',
    { annotation: [{ type: 'scenario', description: 'SC-013' }] },
    async ({ page }) => {
      await test.step('Compare against the baseline screenshot', async () => {
        await expect(page).toHaveScreenshot('cart-page.png');
      });
    }
  );
});
