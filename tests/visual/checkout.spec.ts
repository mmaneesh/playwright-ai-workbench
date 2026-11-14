import { test, expect } from '@fixtures';
import { SAUCEDEMO_ACCOUNTS, SAUCEDEMO_PASSWORD } from '@test-data/saucedemo-accounts.data';

test.describe('Checkout visual baseline', { tag: '@visual' }, () => {
  test.beforeEach(
    async ({
      saucedemoLoginPage,
      saucedemoInventoryPage,
      saucedemoCartPage,
      saucedemoCheckoutPage,
    }) => {
      await saucedemoLoginPage.open();
      await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.standard, SAUCEDEMO_PASSWORD);
      await saucedemoInventoryPage.addToCart('sauce-labs-backpack');
      await saucedemoInventoryPage.openCart();
      await saucedemoCartPage.checkout();
      await saucedemoCheckoutPage.firstNameInput.waitFor();
    }
  );

  test(
    'SC-014 the checkout information step matches its visual baseline',
    { annotation: [{ type: 'scenario', description: 'SC-014' }] },
    async ({ page }) => {
      await test.step('Compare against the baseline screenshot', async () => {
        await expect(page).toHaveScreenshot('checkout-info-step.png');
      });
    }
  );

  test(
    'SC-015 the checkout overview step matches its visual baseline',
    { annotation: [{ type: 'scenario', description: 'SC-015' }] },
    async ({ page, saucedemoCheckoutPage }) => {
      await test.step('Advance to the overview step', async () => {
        await saucedemoCheckoutPage.fillInfo('Jane', 'Doe', '12345');
        await saucedemoCheckoutPage.continueToOverview();
        await saucedemoCheckoutPage.totalLabel.waitFor();
      });

      await test.step('Compare against the baseline screenshot', async () => {
        await expect(page).toHaveScreenshot('checkout-overview-step.png');
      });
    }
  );
});
