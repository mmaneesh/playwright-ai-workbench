import { test, expect } from '@fixtures';

test.describe('Catalog search', () => {
  test.beforeEach(async ({ productsPage }) => {
    await productsPage.open();
  });

  test(
    'SC-001 searching a product name leaves only the matching product',
    { tag: '@smoke', annotation: [{ type: 'scenario', description: 'SC-001' }] },
    async ({ productsPage }) => {
      await test.step('Search for a product by name', async () => {
        await productsPage.search('mouse');
      });

      await test.step('Verify only matching products remain', async () => {
        await expect(productsPage.resultsCount).toHaveText('Showing 1 products');
        await expect(productsPage.productHeaders).toHaveText([/mouse/i]);
      });
    }
  );
});
