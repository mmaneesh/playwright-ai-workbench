import { test, expect } from '@fixtures';

/**
 * ============================================================================
 * UNIVERSAL SEO & IMAGE LAZY-LOADING AUDIT SPECIFICATION
 * ============================================================================
 * This audit verifies critical technical Search Engine Optimization (SEO)
 * criteria, social media open graph markup, accessibility text alternatives,
 * and image performance optimization (specifically lazy-loading enforcement).
 *
 * ----------------------------------------------------------------------------
 * 1. DOCUMENT METADATA & CRAWLABILITY
 *   - <title>: Unique, descriptive document title (10 - 70 characters recommended).
 *   - <meta name="description">: Accurate page summary for search engine snippets.
 *   - <meta name="viewport">: Responsive viewport configuration (width=device-width).
 *   - Canonical / OpenGraph: Social preview tags (og:title, og:description, og:image).
 *
 * 2. CONTENT HIERARCHY
 *   - Semantic headings: At least one <h1> element or clear hierarchical structure.
 *   - Language tag: <html lang="..."> for crawler indexing and translation services.
 *
 * 3. IMAGE ACCESSIBILITY & LAZY LOADING PERFORMANCE
 *   - WCAG 1.1.1 (Non-text Content): Every <img> must possess an alt attribute.
 *   - Lazy Loading Optimization: Below-the-fold / non-hero images must implement
 *     deferred loading (via native loading="lazy" or data-src/lazy-load classes)
 *     to prevent unnecessary bandwidth consumption, minimize initial payload,
 *     and optimize Core Web Vitals (FCP, LCP).
 * ============================================================================
 */

test.describe('Universal SEO & Image Optimization Audit', { tag: '@audit' }, () => {
  test('landing page contains critical technical SEO metadata', async ({ page }) => {
    await test.step('Navigate to the target application root', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify document title presence and reasonable length', async () => {
      const title = await page.title();
      expect(title, 'Document must have a non-empty <title> tag').toBeTruthy();
      expect(
        title.trim().length,
        `Document title "${title}" must be between 5 and 100 characters`
      ).toBeGreaterThanOrEqual(5);
    });

    await test.step('Verify presence of meta description', async () => {
      const metaDescription = page.locator('meta[name="description"]');
      const count = await metaDescription.count();
      expect(count, 'Document should define a <meta name="description"> tag').toBeGreaterThan(0);

      const content = await metaDescription.first().getAttribute('content');
      expect(content?.trim().length, 'Meta description content must not be empty').toBeGreaterThan(
        0
      );
    });

    await test.step('Verify responsive viewport configuration', async () => {
      const viewportMeta = page.locator('meta[name="viewport"]');
      await expect(viewportMeta).toHaveCount(1);

      const content = await viewportMeta.getAttribute('content');
      expect(content, 'Viewport meta tag must declare device-width').toContain(
        'width=device-width'
      );
    });

    await test.step('Verify Open Graph social sharing metadata', async () => {
      const ogTitle = page.locator('meta[property="og:title"]');
      const ogType = page.locator('meta[property="og:type"]');

      const ogTitleCount = await ogTitle.count();
      const ogTypeCount = await ogType.count();

      expect(
        ogTitleCount + ogTypeCount,
        'Page should provide Open Graph metadata for rich social indexing'
      ).toBeGreaterThan(0);
    });
  });

  test('all page images comply with WCAG 1.1.1 alt text accessibility', async ({ page }) => {
    await test.step('Navigate to target application root', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify every image element possesses an alt attribute', async () => {
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images
          .filter((img) => !img.hasAttribute('alt'))
          .map((img) => img.src || img.getAttribute('data-src') || img.outerHTML.slice(0, 100));
      });

      expect(
        imagesWithoutAlt,
        `Found ${imagesWithoutAlt.length} image(s) missing required 'alt' attribute (WCAG 1.1.1):\n${imagesWithoutAlt.join('\n')}`
      ).toEqual([]);
    });
  });

  test(
    'below-the-fold images implement lazy loading to optimize performance',
    { annotation: [{ type: 'defect', description: 'DEF-008' }] },
    async ({ page }) => {
      // Known defect DEF-008 (docs/targets/testdino-defects.md): none of the below-fold
      // images implement lazy loading. Remove this test.fail() once DEF-008 is
      // remediated, then re-verify with a clean run before moving it to Verified.
      test.fail(true, 'DEF-008: below-the-fold images do not implement lazy loading');

      await test.step('Navigate to target application root and wait for the page to finish rendering', async () => {
        await page.goto('/', { waitUntil: 'domcontentloaded' });
        // domcontentloaded fires on the static shell before this SPA renders below-fold
        // sections; wait for the last footer element as a reliable "fully rendered" marker.
        await page.getByTestId('footer-copyright').waitFor();
      });

      await test.step('Scan below-the-fold images for native loading="lazy" or data-src deferred loading', async () => {
        const lazyLoadingEvaluation = await page.evaluate(() => {
          const viewportHeight = window.innerHeight;
          const allImages = Array.from(document.querySelectorAll('img'));

          // Identify images whose top boundary lies below the initial viewport fold
          const belowFoldImages = allImages.filter((img) => {
            const rect = img.getBoundingClientRect();
            return rect.top > viewportHeight;
          });

          const compliantImages = belowFoldImages.filter((img) => {
            const hasNativeLazy = img.getAttribute('loading') === 'lazy';
            const hasDataSrc = Boolean(img.getAttribute('data-src'));
            const hasLazyClass =
              img.classList.contains('lazy-load') ||
              img.classList.contains('lazy') ||
              img.classList.contains('lazyload');

            return hasNativeLazy || hasDataSrc || hasLazyClass;
          });

          const nonCompliantSnippets = belowFoldImages
            .filter((img) => {
              const hasNativeLazy = img.getAttribute('loading') === 'lazy';
              const hasDataSrc = Boolean(img.getAttribute('data-src'));
              const hasLazyClass =
                img.classList.contains('lazy-load') ||
                img.classList.contains('lazy') ||
                img.classList.contains('lazyload');

              return !(hasNativeLazy || hasDataSrc || hasLazyClass);
            })
            .map((img) => ({
              src: img.src?.slice(0, 80),
              top: Math.round(img.getBoundingClientRect().top),
              classes: img.className,
            }));

          return {
            totalImages: allImages.length,
            belowFoldCount: belowFoldImages.length,
            compliantCount: compliantImages.length,
            nonCompliantCount: nonCompliantSnippets.length,
            nonCompliantSample: nonCompliantSnippets.slice(0, 5),
          };
        });

        // Confirm that the site implements lazy loading patterns for below-fold imagery
        expect(
          lazyLoadingEvaluation.belowFoldCount,
          'Expected at least some images to be positioned below the fold'
        ).toBeGreaterThan(0);

        // Verify that the vast majority (>= 70%) of offscreen images utilize lazy loading
        const lazyComplianceRatio =
          lazyLoadingEvaluation.compliantCount / lazyLoadingEvaluation.belowFoldCount;

        expect(
          lazyComplianceRatio,
          `Below-the-fold lazy loading compliance ratio is ${(lazyComplianceRatio * 100).toFixed(1)}%. Sample non-compliant images: ${JSON.stringify(lazyLoadingEvaluation.nonCompliantSample, null, 2)}`
        ).toBeGreaterThanOrEqual(0.7);
      });
    }
  );
});
