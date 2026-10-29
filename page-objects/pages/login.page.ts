import type { Page, Locator } from '@playwright/test';
import { openRoute } from '@helpers/route.helper';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly signInButton: Locator;

  constructor(readonly page: Page) {
    this.emailInput = page
      .getByRole('textbox', { name: 'Email Address *' })
      .describe('login email input');
    this.passwordInput = page
      .getByRole('textbox', { name: 'Password *' })
      .describe('login password input');
    this.signInButton = page.getByRole('button', { name: 'Sign in' }).describe('sign in button');
  }

  async open(): Promise<void> {
    await openRoute(this.page, '/login', this.emailInput);
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
