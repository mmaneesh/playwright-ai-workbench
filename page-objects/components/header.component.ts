import type { Page, Locator } from '@playwright/test';

// The store ships no landmarks or accessible names on header controls,
// so data-testid is the documented exception to role-first (see docs/targets/testdino.md 1.7).
export class HeaderComponent {
  readonly cartIcon: Locator;
  readonly cartCount: Locator;

  constructor(readonly page: Page) {
    this.cartIcon = page.getByTestId('header-cart-icon').describe('header cart icon');
    this.cartCount = page.getByTestId('header-cart-count').describe('header cart item count badge');
  }

  async openCart(): Promise<void> {
    await this.cartIcon.click();
  }
}
