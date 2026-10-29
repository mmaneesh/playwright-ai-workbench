import { test as base } from '@playwright/test';
import { SaucedemoLoginPage } from '@page-objects/pages/saucedemo-login.page';
import { SaucedemoInventoryPage } from '@page-objects/pages/saucedemo-inventory.page';
import { SaucedemoCartPage } from '@page-objects/pages/saucedemo-cart.page';
import { SaucedemoCheckoutPage } from '@page-objects/pages/saucedemo-checkout.page';

export interface UiFixtures {
  saucedemoLoginPage: SaucedemoLoginPage;
  saucedemoInventoryPage: SaucedemoInventoryPage;
  saucedemoCartPage: SaucedemoCartPage;
  saucedemoCheckoutPage: SaucedemoCheckoutPage;
}

export const test = base.extend<UiFixtures>({
  saucedemoLoginPage: async ({ page }, use) => {
    await use(new SaucedemoLoginPage(page));
  },
  saucedemoInventoryPage: async ({ page }, use) => {
    await use(new SaucedemoInventoryPage(page));
  },
  saucedemoCartPage: async ({ page }, use) => {
    await use(new SaucedemoCartPage(page));
  },
  saucedemoCheckoutPage: async ({ page }, use) => {
    await use(new SaucedemoCheckoutPage(page));
  },
});

export { expect } from '@playwright/test';
