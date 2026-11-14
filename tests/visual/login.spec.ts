import { test, expect } from '@fixtures';

test.describe('Login page visual baseline', { tag: '@visual' }, () => {
  test(
    'SC-011 the empty login page matches its visual baseline',
    { annotation: [{ type: 'scenario', description: 'SC-011' }] },
    async ({ page, saucedemoLoginPage }) => {
      await test.step('Open the login page', async () => {
        await saucedemoLoginPage.open();
      });

      await test.step('Compare against the baseline screenshot', async () => {
        await expect(page).toHaveScreenshot('login-page.png');
      });
    }
  );
});
