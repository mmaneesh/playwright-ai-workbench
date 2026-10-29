import type { Page, Locator } from '@playwright/test';
import { openRoute } from '@helpers/route.helper';

export class ProductsPage {
  readonly heading: Locator;
  readonly searchInput: Locator;
  readonly resultsCount: Locator;
  readonly productHeaders: Locator;
  readonly productPrices: Locator;

  constructor(readonly page: Page) {
    this.heading = page.getByTestId('all-products-title').describe('products page title');
    this.searchInput = page.getByPlaceholder('Search products...').describe('product search input');
    this.resultsCount = page.getByTestId('all-products-results-count').describe('results count');
    this.productHeaders = page.getByTestId('all-products-header').describe('product names');
    this.productPrices = page.getByTestId('all-products-price').describe('product prices');
  }

  async open(): Promise<void> {
    await openRoute(this.page, '/products', this.heading);
  }

  async search(term: string): Promise<void> {
    await this.searchInput.fill(term);
  }

  // Add-to-cart buttons are icon-only and revealed on hover; narrow the list with search() first.
  async addToCart(): Promise<void> {
    await this.productHeaders.first().hover();
    await this.page.getByTestId('all-products-cart-button').first().click();
  }
}
