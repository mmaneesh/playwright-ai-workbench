import { test, expect } from '@fixtures';
import { SAUCEDEMO_ACCOUNTS, SAUCEDEMO_PASSWORD } from '@test-data/saucedemo-accounts.data';

const BACKPACK_SLUG = 'sauce-labs-backpack';

// Sauce Demo's two other seeded-defect accounts, performance_glitch_user and
// visual_user, were explored under CH-001 (specs/saucedemo.plan.md) but are
// deliberately not automated here: a slow-login assertion would need a timing
// threshold that is inherently flaky across CI runners for no real product risk
// (it's an intentionally seeded demo account, not a regression that could ship),
// and the visual_user layout difference needs a screenshot baseline to assert
// reliably - see specs/saucedemo.plan.md's "Not covered" section.
test.describe('Seeded-defect accounts (CH-001)', () => {
  test(
    'SC-008 problem_user sees the same broken placeholder image for every product',
    { tag: '@regression', annotation: [{ type: 'defect', description: 'DEF-002' }] },
    async ({ saucedemoLoginPage, saucedemoInventoryPage }) => {
      await test.step('Log in as problem_user', async () => {
        await saucedemoLoginPage.open();
        await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.problem, SAUCEDEMO_PASSWORD);
      });

      await test.step('Verify every product image is the same broken placeholder', async () => {
        const srcs = await saucedemoInventoryPage.productImageSrcs();
        expect(srcs.length, 'inventory must list at least one product').toBeGreaterThan(0);
        const uniqueSrcs = new Set(srcs);
        expect(uniqueSrcs.size, 'DEF-002: every product renders the identical image').toBe(1);
      });
    }
  );

  test(
    'SC-010 error_user throws an uncaught exception while filling the checkout form',
    { tag: '@regression', annotation: [{ type: 'defect', description: 'DEF-003' }] },
    async ({
      page,
      saucedemoLoginPage,
      saucedemoInventoryPage,
      saucedemoCartPage,
      saucedemoCheckoutPage,
    }) => {
      const pageErrors: Error[] = [];
      page.on('pageerror', (error) => pageErrors.push(error));

      await test.step('Log in as error_user and reach checkout step one', async () => {
        await saucedemoLoginPage.open();
        await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.error, SAUCEDEMO_PASSWORD);
        await saucedemoInventoryPage.addToCart(BACKPACK_SLUG);
        await saucedemoInventoryPage.openCart();
        await saucedemoCartPage.checkout();
      });

      await test.step('Fill the checkout form', async () => {
        await saucedemoCheckoutPage.fillInfo('Test', 'User', '12345');
      });

      await test.step('Verify the seeded exception fires', async () => {
        expect(
          pageErrors.length,
          'DEF-003: error_user throws an uncaught TypeError while filling checkout fields'
        ).toBeGreaterThan(0);
      });
    }
  );
});
