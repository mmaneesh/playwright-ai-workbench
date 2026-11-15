import { checkContent } from './check-rules';

// docs/PLAN.md Phase 3: a small, concrete eval pinned to known truth - protects
// check-rules.ts from being silently weakened (a pattern loosened, a rule
// dropped) without anyone noticing, since nothing else exercises its logic
// against deliberately bad and deliberately good code.

interface Case {
  name: string;
  code: string;
  expectRule: string | null; // the one rule that must fire, or null if none should
}

const cases: Case[] = [
  // Known-bad: each must be rejected by exactly the rule named.
  {
    name: 'waitForTimeout is rejected',
    code: `await page.waitForTimeout(2000);`,
    expectRule: 'NO_WAIT_FOR_TIMEOUT',
  },
  {
    name: 'XPath string locator is rejected',
    code: `await page.locator("//button[@id='submit']").click();`,
    expectRule: 'NO_XPATH',
  },
  {
    name: 'xpath= prefix locator is rejected',
    code: `await page.locator('xpath=//div').click();`,
    expectRule: 'NO_XPATH',
  },
  {
    name: 'any type annotation is rejected',
    code: `const value: any = response.data;`,
    expectRule: 'NO_ANY_TYPE',
  },
  {
    name: 'as any cast is rejected',
    code: `const value = response.data as any;`,
    expectRule: 'NO_ANY_TYPE',
  },
  {
    name: 'pseudo-Gherkin GIVEN is rejected',
    code: `await test.step('GIVEN the user is logged in', async () => {});`,
    expectRule: 'NO_PSEUDO_GHERKIN',
  },
  {
    name: 'pseudo-Gherkin WHEN is rejected',
    code: `await test.step('WHEN they click submit', async () => {});`,
    expectRule: 'NO_PSEUDO_GHERKIN',
  },
  // Known-good: none of these should trip any rule.
  {
    name: 'web-first assertion is allowed',
    code: `await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();`,
    expectRule: null,
  },
  {
    name: 'getByRole locator is allowed',
    code: `await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');`,
    expectRule: null,
  },
  {
    name: 'explicit typed variable is allowed',
    code: `const value: string = response.data;`,
    expectRule: null,
  },
  {
    name: 'plain-language test.step is allowed',
    code: `await test.step('Log in as standard_user', async () => {});`,
    expectRule: null,
  },
];

function run(): void {
  console.log('Running guardrail-checker eval...');
  let failures = 0;

  for (const testCase of cases) {
    const violations = checkContent('eval.spec.ts', testCase.code);
    const firedRules = violations.map((v) => v.rule);
    const fired =
      testCase.expectRule === null
        ? firedRules.length === 0
        : firedRules.includes(testCase.expectRule);

    if (fired) {
      console.log(`  PASS: ${testCase.name}`);
    } else {
      failures++;
      console.error(`  FAIL: ${testCase.name}`);
      console.error(`     expected: ${testCase.expectRule ?? 'no violation'}`);
      console.error(`     got: ${firedRules.length > 0 ? firedRules.join(', ') : 'no violation'}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} of ${cases.length} guardrail eval case(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${cases.length} guardrail eval cases passed.`);
}

run();
