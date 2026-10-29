import type { Page, Locator } from '@playwright/test';
import { openRoute } from '@helpers/route.helper';

// data-test, not data-testid - see saucedemo-inventory.page.ts for why getByTestId() won't work here.
export class SaucedemoCartPage {
  readonly title: Locator;
  readonly cartItems: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(readonly page: Page) {
    this.title = page.locator('[data-test="title"]').describe('cart page title');
    this.cartItems = page.locator('[data-test="inventory-item"]').describe('cart line items');
    this.checkoutButton = page.locator('[data-test="checkout"]').describe('checkout button');
    this.continueShoppingButton = page
      .locator('[data-test="continue-shopping"]')
      .describe('continue shopping button');
  }

  async open(): Promise<void> {
    await openRoute(this.page, '/cart.html', this.title);
  }

  async removeItem(productSlug: string): Promise<void> {
    await this.page.locator(`[data-test="remove-${productSlug}"]`).click();
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
