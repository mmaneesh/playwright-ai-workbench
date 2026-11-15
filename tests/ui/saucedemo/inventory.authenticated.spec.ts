import { test, expect } from '@fixtures';
import { SortOption } from '../../../types/sort-option.enum';

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
        await saucedemoInventoryPage.sortBy(SortOption.PRICE_LOW_TO_HIGH);
      });

      await test.step('Verify the prices are ascending', async () => {
        const priceTexts = await saucedemoInventoryPage.productPrices.allTextContents();
        expect(priceTexts.length, 'inventory must list at least one product').toBeGreaterThan(0);
        const prices = priceTexts.map((text) => Number.parseFloat(text.replace('$', '')));
        const sorted = [...prices].sort((a, b) => a - b);
        expect(prices).toEqual(sorted);
      });
    }
  );
});
