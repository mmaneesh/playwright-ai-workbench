import fs from 'node:fs';
import path from 'node:path';
import { test as setup } from '@fixtures';
import { SAUCEDEMO_ACCOUNTS, SAUCEDEMO_PASSWORD } from '@test-data/saucedemo-accounts.data';

const authFile = path.join('playwright', '.auth', 'user.json');

// Runs unconditionally: Sauce Labs publishes these credentials for exactly this
// purpose. Adapting this framework to a real app with private credentials means
// editing this file to read them from env vars instead, following the same shape.
setup(
  'authenticate as standard_user and save storage state',
  async ({ page, saucedemoLoginPage }) => {
    await saucedemoLoginPage.open();
    await saucedemoLoginPage.login(SAUCEDEMO_ACCOUNTS.standard, SAUCEDEMO_PASSWORD);
    await page.waitForURL('**/inventory.html');

    fs.mkdirSync(path.dirname(authFile), { recursive: true });
    await page.context().storageState({ path: authFile });
  }
);
