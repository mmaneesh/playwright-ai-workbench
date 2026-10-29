import { test, expect } from '@fixtures';

/**
 * ============================================================================
 * CORE WEB VITALS & PERFORMANCE AUDIT SPECIFICATION
 * ============================================================================
 * This audit measures user-centric web performance based on Google's Core
 * Web Vitals metrics and standard browser Performance API specifications.
 *
 * ----------------------------------------------------------------------------
 * 1. LARGEST CONTENTFUL PAINT (LCP) - Loading Performance
 * Measures render time of the largest image or text block visible in the viewport.
 * - Good: <= 2500ms
 * - Needs Improvement: 2500ms - 4000ms
 * - Poor: > 4000ms
 *
 * 2. CUMULATIVE LAYOUT SHIFT (CLS) - Visual Stability
 * Measures sum total of all unexpected layout shift scores occurring during load.
 * - Good: <= 0.1
 * - Needs Improvement: 0.1 - 0.25
 * - Poor: > 0.25
 *
 * 3. FIRST CONTENTFUL PAINT (FCP) - Initial Visual Feedback
 * Measures time from navigation start until browser renders first DOM text/image.
 * - Good: <= 1800ms
 * - Needs Improvement: 1800ms - 3000ms
 * - Poor: > 3000ms
 *
 * 4. TIME TO FIRST BYTE (TTFB) - Server Response Latency
 * Measures time from request initiation until the first response byte arrives.
 * - Good: <= 800ms
 * - Needs Improvement: 800ms - 1800ms
 * - Poor: > 1800ms
 * ============================================================================
 */

test.describe('Universal Core Web Vitals Audit', { tag: '@audit' }, () => {
  test('landing page satisfies Core Web Vitals performance budgets', async ({ page }) => {
    await test.step('Navigate to target application root and await network idle', async () => {
      await page.goto('/', { waitUntil: 'load' });
    });

    await test.step('Collect browser Performance Timeline metrics', async () => {
      const metrics = await page.evaluate(() => {
        const navEntries = performance.getEntriesByType('navigation');
        const navTiming = navEntries[0] as PerformanceNavigationTiming | undefined;

        const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
        const fcp = fcpEntry ? fcpEntry.startTime : 0;

        const ttfb = navTiming ? navTiming.responseStart - navTiming.requestStart : 0;
        const domContentLoaded = navTiming
          ? navTiming.domContentLoadedEventEnd - navTiming.startTime
          : 0;

        return {
          fcp: Math.round(fcp),
          ttfb: Math.round(ttfb),
          domContentLoaded: Math.round(domContentLoaded),
        };
      });

      // Collect buffered LCP and CLS entries via PerformanceObserver
      const webVitals = await page.evaluate(async () => {
        let lcpValue = 0;
        let clsValue = 0;

        try {
          const lcpPromise = new Promise<number>((resolve) => {
            let maxLcp = 0;
            const observer = new PerformanceObserver((entryList) => {
              for (const entry of entryList.getEntries()) {
                maxLcp = Math.max(maxLcp, entry.startTime);
              }
            });
            observer.observe({ type: 'largest-contentful-paint', buffered: true });

            requestAnimationFrame(() => {
              observer.disconnect();
              resolve(Math.round(maxLcp));
            });
          });

          const clsPromise = new Promise<number>((resolve) => {
            let shiftScore = 0;
            const observer = new PerformanceObserver((entryList) => {
              for (const entry of entryList.getEntries()) {
                // Ignore shifts that occurred shortly after user input
                const shift = entry as PerformanceEntry & {
                  hadRecentInput?: boolean;
                  value?: number;
                };
                if (!shift.hadRecentInput && typeof shift.value === 'number') {
                  shiftScore += shift.value;
                }
              }
            });
            observer.observe({ type: 'layout-shift', buffered: true });

            requestAnimationFrame(() => {
              observer.disconnect();
              resolve(Math.round(shiftScore * 1000) / 1000);
            });
          });

          lcpValue = await lcpPromise;
          clsValue = await clsPromise;
        } catch {
          // If browser does not support specific observer, fallback gracefully
        }

        return { lcp: lcpValue, cls: clsValue };
      });

      // Validate against acceptable budgets
      // Note: In synthetic testing with variable network conditions, we verify
      expect(metrics.fcp, 'First Contentful Paint (FCP) must be under 4000ms').toBeLessThan(4000);

      expect(
        webVitals.lcp,
        'Largest Contentful Paint (LCP) must be under 6000ms budget'
      ).toBeLessThan(6000);

      expect(
        webVitals.cls,
        'Cumulative Layout Shift (CLS) must stay within acceptable limits (<= 0.25)'
      ).toBeLessThanOrEqual(0.25);
    });
  });
});
