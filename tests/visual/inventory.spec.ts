import { test, expect } from '@fixtures';
import { SAUCEDEMO_ACCOUNTS, SAUCEDEMO_PASSWORD } from '@test-data/saucedemo-accounts.data';

test.describe('Inventory page visual baseline', { tag: '@visual' }, () => {
  test.beforeEach(async ({ saucedemoLoginPage, saucedemoInventoryPage }) => {
    await saucedemoLoginPage.open();
    await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.standard, SAUCEDEMO_PASSWORD);
    await saucedemoInventoryPage.title.waitFor();
  });

  test(
    'SC-012 the product grid matches its visual baseline',
    { annotation: [{ type: 'scenario', description: 'SC-012' }] },
    async ({ page }) => {
      await test.step('Compare against the baseline screenshot', async () => {
        await expect(page).toHaveScreenshot('inventory-page.png');
      });
    }
  );
});
