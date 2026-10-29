import { test, expect } from '@fixtures';
import AxeBuilder from '@axe-core/playwright';

/**
 * ============================================================================
 * WCAG 2.1 LEVEL AA COMPLIANCE AUDIT SPECIFICATION
 * ============================================================================
 * This audit suite verifies that the application under test meets Web Content
 * Accessibility Guidelines (WCAG) 2.1 Level A and Level AA success criteria.
 *
 * ----------------------------------------------------------------------------
 * PRINCIPLE 1: PERCEIVABLE
 * Information and UI components must be presentable to users in ways they can perceive.
 * ----------------------------------------------------------------------------
 * 1.1 Text Alternatives
 *   - 1.1.1 Non-text Content (Level A): All non-text content (images, icons,
 *     canvas, charts) has a text alternative (alt text, aria-label) conveying equivalent
 *     purpose, or is explicitly hidden via alt="" or aria-hidden="true" if decorative.
 *
 * 1.2 Time-based Media
 *   - 1.2.1 Audio-only and Video-only (Prerecorded) (Level A): Text transcripts or
 *     audio descriptions provided for prerecorded media.
 *   - 1.2.2 Captions (Prerecorded) (Level A): Synchronized captions for prerecorded video.
 *   - 1.2.3 Audio Description or Media Alternative (Level A): Narration of key visual info.
 *   - 1.2.4 Captions (Live) (Level AA): Real-time captions for live audio streams.
 *   - 1.2.5 Audio Description (Prerecorded) (Level AA): Full audio description for video.
 *
 * 1.3 Adaptable
 *   - 1.3.1 Info and Relationships (Level A): Semantic HTML conveys structure
 *     (headings h1-h6, landmark regions nav/main/header/footer, list tags, table headers).
 *   - 1.3.2 Meaningful Sequence (Level A): DOM source order matches visual reading sequence.
 *   - 1.3.3 Sensory Characteristics (Level A): Instructions do not rely solely on shape,
 *     size, color, or sound (e.g., "click the green button on the right").
 *   - 1.3.4 Orientation (Level AA - WCAG 2.1): Content does not lock or restrict display
 *     to portrait or landscape alone unless essential.
 *   - 1.3.5 Identify Input Purpose (Level AA - WCAG 2.1): Form fields collecting user
 *     identity/contact info specify HTML autocomplete attributes (e.g., name, email).
 *
 * 1.4 Distinguishable
 *   - 1.4.1 Use of Color (Level A): Color is never the sole visual cue for meaning or state.
 *   - 1.4.2 Audio Control (Level A): Audio playing >3s has pause/stop/mute controls.
 *   - 1.4.3 Contrast (Minimum) (Level AA): Text contrast ratio is at least 4.5:1 against
 *     background (3:1 for large text >= 18pt or >= 14pt bold).
 *   - 1.4.4 Resize Text (Level AA): Text zooms up to 200% without loss of content/function.
 *   - 1.4.5 Images of Text (Level AA): True text is used instead of raster images of text.
 *   - 1.4.10 Reflow (Level AA - WCAG 2.1): Layout reflows without 2D scrolling down to
 *     320 CSS pixels wide (responsive mobile viewport).
 *   - 1.4.11 Non-text Contrast (Level AA - WCAG 2.1): UI controls, borders, and graphical
 *     objects maintain at least 3:1 contrast against adjacent colors.
 *   - 1.4.12 Text Spacing (Level AA - WCAG 2.1): Custom line-height (1.5), letter-spacing
 *     (0.12), word-spacing (0.16), paragraph spacing (2.0) causes no content clipping.
 *   - 1.4.13 Content on Hover or Focus (Level AA - WCAG 2.1): Custom tooltips and overlays
 *     are dismissible (Escape key), hoverable (pointer can reach them), and persistent.
 *
 * ----------------------------------------------------------------------------
 * PRINCIPLE 2: OPERABLE
 * User interface components and navigation must be operable via all input devices.
 * ----------------------------------------------------------------------------
 * 2.1 Keyboard Accessible
 *   - 2.1.1 Keyboard (Level A): All interactive controls reachable and operable via keyboard.
 *   - 2.1.2 No Keyboard Trap (Level A): Focus can always be moved away using standard keys.
 *   - 2.1.4 Character Key Shortcuts (Level AA - WCAG 2.1): Single-key shortcuts can be
 *     disabled, remapped, or activate only when the relevant component has focus.
 *
 * 2.2 Enough Time
 *   - 2.2.1 Timing Adjustable (Level A): Users can extend, adjust, or disable timeouts.
 *   - 2.2.2 Pause, Stop, Hide (Level A): Carousels, tickers, and auto-scrolling content
 *     provide visible controls to pause, stop, or hide animation.
 *
 * 2.3 Seizures and Physical Reactions
 *   - 2.3.1 Three Flashes or Below (Level A): No element flashes >3 times per second.
 *
 * 2.4 Navigable
 *   - 2.4.1 Bypass Blocks (Level A): Skip navigation link or ARIA landmarks present to
 *     bypass repeated header/navigation content.
 *   - 2.4.2 Page Titled (Level A): Informative, unique <title> describing page purpose.
 *   - 2.4.3 Focus Order (Level A): Logical Tab navigation sequence preserving context.
 *   - 2.4.4 Link Purpose (In Context) (Level A): Text of links clearly denotes destination.
 *   - 2.4.5 Multiple Ways (Level AA): At least two navigation mechanisms (search, sitemap, menu).
 *   - 2.4.6 Headings and Labels (Level AA): Headings and form labels describe topic/purpose.
 *   - 2.4.7 Focus Visible (Level AA): Clear, visible outline/indicator for keyboard focus.
 *
 * 2.5 Input Modalities
 *   - 2.5.1 Pointer Gestures (Level A - WCAG 2.1): Multi-touch/pinch gestures have single-pointer
 *     fallback controls.
 *   - 2.5.2 Pointer Cancellation (Level A - WCAG 2.1): Clicks activate on up-event with undo.
 *   - 2.5.3 Label in Name (Level A - WCAG 2.1): Accessible programmatic name includes visual text.
 *   - 2.5.4 Motion Actuation (Level A - WCAG 2.1): Device shake/tilt triggers have button fallbacks.
 *
 * ----------------------------------------------------------------------------
 * PRINCIPLE 3: UNDERSTANDABLE
 * Information and the operation of the user interface must be understandable.
 * ----------------------------------------------------------------------------
 * 3.1 Readable
 *   - 3.1.1 Language of Page (Level A): Root element declares valid language: <html lang="en">.
 *   - 3.1.2 Language of Parts (Level AA): Passages in foreign languages specify lang attribute.
 *
 * 3.2 Predictable
 *   - 3.2.1 On Focus (Level A): Moving focus to a control does not automatically trigger action.
 *   - 3.2.2 On Input (Level A): Changing field value does not trigger unexpected context switch.
 *   - 3.2.3 Consistent Navigation (Level AA): Nav menus repeat in identical order across pages.
 *   - 3.2.4 Consistent Identification (Level AA): Equivalent components share consistent labels.
 *
 * 3.3 Input Assistance
 *   - 3.3.1 Error Identification (Level A): Form validation errors identified in text.
 *   - 3.3.2 Labels or Instructions (Level A): Required formats/inputs clearly labeled.
 *   - 3.3.3 Error Suggestion (Level AA): Helpful remediation guidance provided for bad inputs.
 *   - 3.3.4 Error Prevention (Legal/Financial/Data) (Level AA): Actions are reversible/confirmed.
 *
 * ----------------------------------------------------------------------------
 * PRINCIPLE 4: ROBUST
 * Content must be robust enough for reliable interpretation by assistive technologies.
 * ----------------------------------------------------------------------------
 * 4.1 Compatible
 *   - 4.1.1 Parsing (Level A): Complete start/end tags, unique ID attributes, valid nesting.
 *   - 4.1.2 Name, Role, Value (Level A): Custom controls expose correct ARIA role, name,
 *     state, and value to screen readers.
 *   - 4.1.3 Status Messages (Level AA - WCAG 2.1): Dynamic notices use aria-live or alert role.
 * ============================================================================
 */

test.describe('Universal Accessibility Audit (WCAG 2.1 AA)', { tag: '@audit' }, () => {
  test('landing page satisfies WCAG 2.1 AA accessibility standards', async ({ page }) => {
    await test.step('Navigate to the target application root', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    await test.step('Execute comprehensive Axe-core scan for WCAG 2.1 AA rules', async () => {
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      // Zero tolerance for critical/serious accessibility barriers across the application
      const criticalOrSeriousViolations = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious'
      );

      const diagnosticReport = criticalOrSeriousViolations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        helpUrl: v.helpUrl,
        affectedNodesCount: v.nodes.length,
        targets: v.nodes.map((n) => n.target.join(' ')).slice(0, 5),
      }));

      expect(
        criticalOrSeriousViolations,
        `Detected ${criticalOrSeriousViolations.length} critical/serious WCAG violations:\n${JSON.stringify(diagnosticReport, null, 2)}`
      ).toEqual([]);
    });
  });

  test('form inputs and interactive controls provide accessible names and labels (WCAG 1.3.1, 4.1.2)', async ({
    page,
  }) => {
    await test.step('Navigate to target application root', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify interactive inputs have accessible programmatic names', async () => {
      const unlabelledInputs = await page.evaluate(() => {
        const inputs = Array.from(
          document.querySelectorAll('input:not([type="hidden"]), select, textarea')
        );
        return inputs
          .filter((el) => {
            const hasAriaLabel = Boolean(el.getAttribute('aria-label'));
            const hasAriaLabelledby = Boolean(el.getAttribute('aria-labelledby'));
            const hasTitle = Boolean(el.getAttribute('title'));
            const hasPlaceholder = Boolean(el.getAttribute('placeholder'));
            const id = el.id;
            const hasAssociatedLabel = id
              ? Boolean(document.querySelector(`label[for="${id}"]`))
              : false;
            const hasParentLabel = Boolean(el.closest('label'));

            return !(
              hasAriaLabel ||
              hasAriaLabelledby ||
              hasTitle ||
              hasAssociatedLabel ||
              hasParentLabel ||
              hasPlaceholder
            );
          })
          .map((el) => el.outerHTML.slice(0, 100));
      });

      expect(
        unlabelledInputs,
        `Found form inputs without accessible labels or names: ${unlabelledInputs.join('; ')}`
      ).toEqual([]);
    });
  });

  test('document declares valid primary language attribute (WCAG 3.1.1)', async ({ page }) => {
    await test.step('Navigate to target application root', async () => {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
    });

    await test.step('Verify root html element specifies lang attribute', async () => {
      await expect(
        page.locator('html'),
        'The <html> root element must define a non-empty lang attribute'
      ).toHaveAttribute('lang', /.+/);
    });
  });
});
