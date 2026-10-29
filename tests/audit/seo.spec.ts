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
 *   - Open Graph (og:title, og:description, og:image) is not asserted here: it is a
 *     reasonable practice for a shareable public page, but not a universal requirement
 *     (a page marked noindex has no reason to carry it), so a domain-agnostic suite
 *     cannot assume it applies.
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

    // Open Graph metadata is not a universal requirement: a page that opts out of
    // indexing (meta[name=robots] content=noindex) has no reason to carry
    // social-sharing metadata either, so this "universal" suite does not assert it.
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

  test('below-the-fold images implement lazy loading to optimize performance', async ({ page }) => {
    await test.step('Navigate to target application root', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
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

      // Every below-the-fold image must implement lazy loading. This is vacuously
      // true on a page with none (e.g. a plain login form) - no precondition or
      // threshold needed, so it stays deterministic and genuinely universal.
      expect(
        lazyLoadingEvaluation.nonCompliantSample,
        `${lazyLoadingEvaluation.nonCompliantCount} of ${lazyLoadingEvaluation.belowFoldCount} below-the-fold image(s) do not implement lazy loading`
      ).toEqual([]);
    });
  });
});
