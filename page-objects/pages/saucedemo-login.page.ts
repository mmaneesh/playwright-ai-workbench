import type { Page, Locator } from '@playwright/test';
import { openRoute } from '@helpers/route.helper';

export class SaucedemoLoginPage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(readonly page: Page) {
    this.usernameInput = page.getByRole('textbox', { name: 'Username' }).describe('username input');
    this.passwordInput = page.getByRole('textbox', { name: 'Password' }).describe('password input');
    this.loginButton = page.getByRole('button', { name: 'Login' }).describe('login button');
    this.errorMessage = page.getByRole('alert').describe('login error message');
  }

  async open(): Promise<void> {
    await openRoute(this.page, '/', this.usernameInput);
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
