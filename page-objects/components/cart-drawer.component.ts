import type { Page, Locator } from '@playwright/test';

// The drawer is always in the DOM and slides in, so wait for its items, not for the drawer.
// Item and price ids are the documented exception to role-first (docs/targets/testdino.md 4.2).
export class CartDrawerComponent {
  readonly root: Locator;
  readonly items: Locator;
  readonly itemPrices: Locator;
  readonly removeButtons: Locator;
  readonly emptyMessage: Locator;

  constructor(readonly page: Page) {
    this.root = page.getByTestId('cart-drawer').describe('cart drawer');
    this.items = this.root.getByTestId('cart-item').describe('cart drawer items');
    this.itemPrices = this.items.getByTestId('item-price').describe('cart drawer item prices');
    this.removeButtons = this.root
      .getByRole('button', { name: 'Remove item' })
      .describe('cart drawer remove item buttons');
    this.emptyMessage = this.root
      .getByText('Your cart is empty')
      .describe('empty cart message in the drawer');
  }

  async removeFirstItem(): Promise<void> {
    await this.removeButtons.first().click();
  }
}
