import { test, expect } from '@fixtures';

const BACKPACK_SLUG = 'sauce-labs-backpack';

// Runs in the saucedemo-chromium-authenticated project: already logged in as
// standard_user via tests/ui/saucedemo/auth.setup.ts's saved storageState.
test.describe('Checkout', () => {
  test.beforeEach(async ({ saucedemoInventoryPage }) => {
    await test.step('Open the inventory page and add a product to the cart', async () => {
      await saucedemoInventoryPage.open();
      await saucedemoInventoryPage.addToCart(BACKPACK_SLUG);
    });
  });

  test(
    'SC-005 a full checkout completes and reaches the confirmation page',
    { tag: '@smoke', annotation: [{ type: 'scenario', description: 'SC-005' }] },
    async ({ saucedemoInventoryPage, saucedemoCartPage, saucedemoCheckoutPage }) => {
      await test.step('Go to cart and start checkout', async () => {
        await saucedemoInventoryPage.openCart();
        await saucedemoCartPage.checkout();
      });

      await test.step('Fill checkout info and continue', async () => {
        await saucedemoCheckoutPage.fillInfo('Test', 'User', '12345');
        await saucedemoCheckoutPage.continueToOverview();
      });

      await test.step('Verify the order total and finish', async () => {
        await expect(saucedemoCheckoutPage.totalLabel).toContainText('Total:');
        await saucedemoCheckoutPage.finish();
      });

      await test.step('Verify the confirmation page', async () => {
        await expect(saucedemoCheckoutPage.completeHeader).toHaveText('Thank you for your order!');
      });
    }
  );

  test(
    'SC-006 pressing Enter on checkout step one does not cancel the order',
    { tag: '@regression', annotation: [{ type: 'defect', description: 'DEF-001' }] },
    async ({ saucedemoInventoryPage, saucedemoCartPage, saucedemoCheckoutPage, page }) => {
      // Known defect DEF-001 (docs/targets/saucedemo-defects.md): Enter submits "Cancel"
      // instead of "Continue". Remove this test.fail() once DEF-001 is remediated,
      // then re-verify with a clean run before moving it to Verified.
      test.fail(true, 'DEF-001: Enter on checkout step one submits Cancel, not Continue');

      await test.step('Go to cart and start checkout', async () => {
        await saucedemoInventoryPage.openCart();
        await saucedemoCartPage.checkout();
      });

      await test.step('Fill checkout info and press Enter', async () => {
        await saucedemoCheckoutPage.fillInfo('Test', 'User', '12345');
        await saucedemoCheckoutPage.submitWithEnterKey();
      });

      await test.step('Verify checkout advanced to the overview, not back to the cart', async () => {
        await expect(page).toHaveURL(/checkout-step-two\.html/);
      });
    }
  );
});
