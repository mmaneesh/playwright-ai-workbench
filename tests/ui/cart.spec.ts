import { test, expect } from '@fixtures';

test.describe('Cart', () => {
  test.beforeEach(async ({ productsPage }) => {
    await test.step('Open the catalog and narrow it to a single product', async () => {
      await productsPage.open();
      await productsPage.search('mouse');
      await expect(productsPage.productHeaders).toHaveCount(1);
    });
  });

  test(
    'SC-003 adding a product shows one cart line in the badge and the drawer',
    { tag: '@smoke', annotation: [{ type: 'scenario', description: 'SC-003' }] },
    async ({ productsPage, headerComponent, cartDrawerComponent }) => {
      await test.step('Add the product to the cart', async () => {
        await productsPage.addToCart();
      });

      await test.step('Verify the header badge shows one cart line', async () => {
        await expect(headerComponent.cartCount).toHaveText('1');
      });

      await test.step('Open the cart drawer and verify the product is listed', async () => {
        await headerComponent.openCart();
        await expect(cartDrawerComponent.items).toHaveCount(1);
        await expect(cartDrawerComponent.items).toContainText(/mouse/i);
      });
    }
  );

  test(
    'SC-004 the price on the listing card equals the price in the drawer',
    { tag: '@regression', annotation: [{ type: 'scenario', description: 'SC-004' }] },
    async ({ productsPage, headerComponent, cartDrawerComponent }) => {
      let listedPrice = '';

      await test.step('Read the price shown on the listing card', async () => {
        await expect(productsPage.productPrices).toHaveText(/^[$][0-9]+/);
        listedPrice = (await productsPage.productPrices.first().textContent()) ?? '';
      });

      await test.step('Add the product and open the cart drawer', async () => {
        await productsPage.addToCart();
        await headerComponent.openCart();
      });

      await test.step('Verify the drawer shows the same price', async () => {
        await expect(cartDrawerComponent.itemPrices).toHaveText([listedPrice]);
      });
    }
  );

  test.describe('with one item in the cart', () => {
    test.beforeEach(async ({ productsPage, headerComponent }) => {
      await test.step('Add the product to the cart', async () => {
        await productsPage.addToCart();
        await expect(headerComponent.cartCount).toHaveText('1');
      });
    });

    test(
      'SC-005 removing the only item shows the empty-cart state and clears the badge',
      { tag: '@regression', annotation: [{ type: 'scenario', description: 'SC-005' }] },
      async ({ headerComponent, cartDrawerComponent }) => {
        await test.step('Open the cart drawer and remove the item', async () => {
          await headerComponent.openCart();
          await cartDrawerComponent.removeFirstItem();
        });

        await test.step('Verify the empty-cart message is shown and no items remain', async () => {
          await expect(cartDrawerComponent.emptyMessage).toBeVisible();
          await expect(cartDrawerComponent.items).toHaveCount(0);
        });

        await test.step('Verify the header badge is gone', async () => {
          await expect(headerComponent.cartCount).toBeHidden();
        });
      }
    );

    test(
      'SC-006 cart contents survive a full page reload',
      { tag: '@regression', annotation: [{ type: 'scenario', description: 'SC-006' }] },
      async ({ page, headerComponent, cartDrawerComponent }) => {
        await test.step('Reload the page', async () => {
          await page.reload();
        });

        await test.step('Verify the badge still shows one cart line', async () => {
          await expect(headerComponent.cartCount).toHaveText('1');
        });

        await test.step('Open the cart drawer and verify the product is still listed', async () => {
          await headerComponent.openCart();
          await expect(cartDrawerComponent.items).toHaveCount(1);
          await expect(cartDrawerComponent.items).toContainText(/mouse/i);
        });
      }
    );
  });
});
