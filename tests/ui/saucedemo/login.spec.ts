import { test, expect } from '@fixtures';
import { SAUCEDEMO_ACCOUNTS, SAUCEDEMO_PASSWORD } from '@test-data/saucedemo-accounts.data';

test.describe('Login', () => {
  test.beforeEach(async ({ saucedemoLoginPage }) => {
    await saucedemoLoginPage.open();
  });

  test(
    'SC-001 valid credentials reach the inventory page',
    { tag: '@smoke', annotation: [{ type: 'scenario', description: 'SC-001' }] },
    async ({ page, saucedemoLoginPage, saucedemoInventoryPage }) => {
      await test.step('Log in as standard_user', async () => {
        await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.standard, SAUCEDEMO_PASSWORD);
      });

      await test.step('Verify the inventory page loads', async () => {
        await expect(page).toHaveURL(/inventory\.html/);
        await expect(saucedemoInventoryPage.title).toHaveText('Products');
      });
    }
  );

  test(
    'SC-002 a locked-out user sees a clear, accessible error',
    { tag: '@regression', annotation: [{ type: 'scenario', description: 'SC-002' }] },
    async ({ page, saucedemoLoginPage }) => {
      await test.step('Log in as locked_out_user', async () => {
        await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.lockedOut, SAUCEDEMO_PASSWORD);
      });

      await test.step('Verify an accessible lockout error and no navigation', async () => {
        await expect(saucedemoLoginPage.errorMessage).toContainText('locked out');
        await expect(page).not.toHaveURL(/inventory\.html/);
      });
    }
  );
});
