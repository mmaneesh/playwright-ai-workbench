import fs from 'node:fs';
import path from 'node:path';
import { test as setup } from '@fixtures';

const authFile = path.join('playwright', '.auth', 'user.json');

// Dormant unless AUTH_EMAIL/AUTH_PASSWORD are set (see README: Authentication (storageState)).
// Without them, the ui config never registers the "setup" / "*-authenticated" projects,
// so this file is not even collected and the default anonymous suites are unaffected.
setup('authenticate and save storage state', async ({ page, loginPage }) => {
  const email = process.env.AUTH_EMAIL;
  const password = process.env.AUTH_PASSWORD;

  if (!email || !password) {
    setup.skip(true, 'AUTH_EMAIL / AUTH_PASSWORD not set; see README Authentication section');
    return;
  }

  await loginPage.open();
  await loginPage.login(email, password);
  await page.waitForURL((url) => !url.pathname.includes('/login'));

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
