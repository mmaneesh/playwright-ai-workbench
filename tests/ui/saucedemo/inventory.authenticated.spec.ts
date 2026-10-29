import { test, expect } from '@fixtures';

// Runs already logged in via tests/ui/saucedemo/auth.setup.ts's saved storageState.
test.describe('Inventory sorting', () => {
  test.beforeEach(async ({ saucedemoInventoryPage }) => {
    await saucedemoInventoryPage.open();
  });

  test(
    'SC-007 sorting by price (low to high) reorders the product list',
    { tag: '@edge', annotation: [{ type: 'scenario', description: 'SC-007' }] },
    async ({ saucedemoInventoryPage }) => {
      await test.step('Sort by Price (low to high)', async () => {
        await saucedemoInventoryPage.sortBy('Price (low to high)');
      });

      await test.step('Verify the prices are ascending', async () => {
        const priceTexts = await saucedemoInventoryPage.productPrices.allTextContents();
        const prices = priceTexts.map((text) => Number.parseFloat(text.replace('$', '')));
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
      });
    }
  );
});
