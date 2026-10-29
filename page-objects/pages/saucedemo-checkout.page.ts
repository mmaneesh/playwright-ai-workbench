import type { Page, Locator } from '@playwright/test';

// Covers all three checkout steps: they are one continuous, non-branching journey
// (see docs/targets/saucedemo.md Section 3.3), so one page object models all of it.
export class SaucedemoCheckoutPage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;
  readonly finishButton: Locator;
  readonly totalLabel: Locator;
  readonly completeHeader: Locator;

  constructor(readonly page: Page) {
    this.firstNameInput = page
      .getByRole('textbox', { name: 'First Name' })
      .describe('first name input');
    this.lastNameInput = page
      .getByRole('textbox', { name: 'Last Name' })
      .describe('last name input');
    this.postalCodeInput = page
      .getByRole('textbox', { name: 'Zip/Postal Code' })
      .describe('postal code input');
    // data-test, not data-testid - see saucedemo-inventory.page.ts for why getByTestId() won't work here.
    this.continueButton = page.locator('[data-test="continue"]').describe('continue button');
    this.finishButton = page.locator('[data-test="finish"]').describe('finish button');
    this.totalLabel = page.locator('[data-test="total-label"]').describe('order total');
    this.completeHeader = page
      .locator('[data-test="complete-header"]')
      .describe('order complete heading');
  }

  async fillInfo(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview(): Promise<void> {
    await this.continueButton.click();
  }

  // For DEF-001 (docs/targets/saucedemo-defects.md): pressing Enter here currently
  // triggers "Cancel", not "Continue". This method exists to reproduce that, not to work around it.
  async submitWithEnterKey(): Promise<void> {
    await this.postalCodeInput.press('Enter');
  }

  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
