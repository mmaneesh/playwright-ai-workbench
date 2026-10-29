import type { Locator, Page } from '@playwright/test';

// The one place that encodes "navigate, then wait for a ready marker", never networkidle.
export async function openRoute(page: Page, path: string, readyMarker: Locator): Promise<void> {
  await page.goto(path);
  await readyMarker.waitFor();
}
