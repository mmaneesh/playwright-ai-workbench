import { test as base } from '@playwright/test';
import { HomePage } from '@page-objects/pages/home.page';
import { ProductsPage } from '@page-objects/pages/products.page';
import { LoginPage } from '@page-objects/pages/login.page';
import { HeaderComponent } from '@components/header.component';
import { CartDrawerComponent } from '@components/cart-drawer.component';

export interface UiFixtures {
  homePage: HomePage;
  productsPage: ProductsPage;
  loginPage: LoginPage;
  headerComponent: HeaderComponent;
  cartDrawerComponent: CartDrawerComponent;
}

export const test = base.extend<UiFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  headerComponent: async ({ page }, use) => {
    await use(new HeaderComponent(page));
  },
  cartDrawerComponent: async ({ page }, use) => {
    await use(new CartDrawerComponent(page));
  },
});

export { expect } from '@playwright/test';
