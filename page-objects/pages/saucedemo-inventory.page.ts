import type { Page, Locator } from '@playwright/test';
import { openRoute } from '@helpers/route.helper';

// This site uses data-test (not Playwright's default data-testid), confirmed live
// (see docs/targets/saucedemo.md 1.7.4) - getByTestId() would silently match nothing,
// so every id-based locator here targets the attribute directly as a documented exception.
export class SaucedemoInventoryPage {
  readonly title: Locator;
  readonly sortDropdown: Locator;
  readonly cartBadge: Locator;
  readonly cartLink: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(readonly page: Page) {
    this.title = page.locator('[data-test="title"]').describe('inventory page title');
    this.sortDropdown = page
      .locator('[data-test="product-sort-container"]')
      .describe('product sort dropdown');
    this.cartBadge = page
      .locator('[data-test="shopping-cart-badge"]')
      .describe('cart item count badge');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]').describe('cart link');
    this.productNames = page.locator('[data-test="inventory-item-name"]').describe('product names');
    this.productPrices = page
      .locator('[data-test="inventory-item-price"]')
      .describe('product prices');
  }

  async open(): Promise<void> {
    await openRoute(this.page, '/inventory.html', this.title);
  }

  async addToCart(productSlug: string): Promise<void> {
    await this.page.locator(`[data-test="add-to-cart-${productSlug}"]`).click();
  }

  async sortBy(option: string): Promise<void> {
    await this.sortDropdown.selectOption({ label: option });
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
