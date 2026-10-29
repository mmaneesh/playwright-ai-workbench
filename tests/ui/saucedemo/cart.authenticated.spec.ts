import { test, expect } from '@fixtures';

const BACKPACK_SLUG = 'sauce-labs-backpack';

// Runs already logged in as standard_user via tests/ui/saucedemo/auth.setup.ts's
// saved storageState - cart behavior has nothing to do with login, so it shouldn't
// pay a fresh login cost or repeat credential-handling in every file.
test.describe('Cart', () => {
  test.beforeEach(async ({ saucedemoInventoryPage }) => {
    await saucedemoInventoryPage.open();
  });

  test(
    'SC-003 adding a product updates the badge and the cart page',
    { tag: '@smoke', annotation: [{ type: 'scenario', description: 'SC-003' }] },
    async ({ saucedemoInventoryPage, saucedemoCartPage }) => {
      await test.step('Add the backpack to the cart', async () => {
        await saucedemoInventoryPage.addToCart(BACKPACK_SLUG);
      });

      await test.step('Verify the header badge shows one item', async () => {
        await expect(saucedemoInventoryPage.cartBadge).toHaveText('1');
      });

      await test.step('Open the cart and verify the item is listed', async () => {
        await saucedemoInventoryPage.openCart();
        await expect(saucedemoCartPage.cartItems).toHaveCount(1);
      });
    }
  );

  test.describe('with one item in the cart', () => {
    test.beforeEach(async ({ saucedemoInventoryPage }) => {
      await test.step('Add the backpack to the cart', async () => {
        await saucedemoInventoryPage.addToCart(BACKPACK_SLUG);
        await expect(saucedemoInventoryPage.cartBadge).toHaveText('1');
      });
    });

    test(
      'SC-004 removing the only item clears the badge and empties the cart',
      { tag: '@regression', annotation: [{ type: 'scenario', description: 'SC-004' }] },
      async ({ saucedemoInventoryPage, saucedemoCartPage }) => {
        await test.step('Open the cart and remove the item', async () => {
          await saucedemoInventoryPage.openCart();
          await saucedemoCartPage.removeItem(BACKPACK_SLUG);
        });

        await test.step('Verify the cart is empty and the badge is gone', async () => {
          await expect(saucedemoCartPage.cartItems).toHaveCount(0);
          await expect(saucedemoInventoryPage.cartBadge).toBeHidden();
        });
      }
    );
  });
});
