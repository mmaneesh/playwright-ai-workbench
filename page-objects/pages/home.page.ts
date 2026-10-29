import type { Page, Locator } from '@playwright/test';
import { openRoute } from '@helpers/route.helper';

export class HomePage {
  readonly heroHeading: Locator;
  readonly shopNowButton: Locator;
  readonly carousels: Locator;

  constructor(readonly page: Page) {
    this.heroHeading = page
      .getByRole('heading', { level: 1, name: 'Demo E-commerce Testing Store' })
      .describe('home hero heading');
    this.shopNowButton = page.getByTestId('hero-shop-now').describe('hero Shop Now button');
    // react-slick sliders rotate content, so visual tests mask them.
    this.carousels = page.locator('.slick-slider').describe('home product carousels');
  }

  async open(): Promise<void> {
    await openRoute(this.page, '/', this.heroHeading);
  }
}
