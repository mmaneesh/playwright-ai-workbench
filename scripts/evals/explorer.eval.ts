import fs from 'node:fs';

// docs/PLAN.md Phase 3: "explorer eval ... assert the output names problem_user's
// broken image (DEF-002) and error_user's exception (DEF-003)."
//
// Honest scope: this does NOT re-run the explorer agent live against Sauce
// Demo (that needs a real LLM call and a browser - costly and flaky for a
// check that should run on every `npm run check`). It is a regression guard
// on the recorded ground truth instead: if a future exploration pass against
// this target ever loses these known findings from specs/saucedemo.plan.md,
// this fails loudly instead of the loss going unnoticed. A genuine live
// re-run is a separate, manual verification - see docs/PLAN.md Phase 3's "Still
// open" note for what this does not cover.

const SPEC_FILE = 'specs/saucedemo.plan.md';

interface Expectation {
  description: string;
  pattern: RegExp;
}

const expectations: Expectation[] = [
  {
    description: "problem_user's broken image finding is recorded (SC-008/DEF-002)",
    pattern: /SC-008.*problem_user.*broken placeholder image/is,
  },
  {
    description: 'DEF-002 is in the Not-covered-free scenario list with a status',
    pattern: /DEF-002.*Accepted/is,
  },
  {
    description: "error_user's uncaught exception finding is recorded (SC-010/DEF-003)",
    pattern: /SC-010.*error_user.*uncaught exception/is,
  },
  {
    description: 'DEF-003 is recorded with a status',
    pattern: /DEF-003.*Accepted/is,
  },
  {
    description: 'the known checkout defect DEF-001 is still recorded (SC-006)',
    pattern: /SC-006[\s\S]*?DEF-001/i,
  },
  {
    description:
      'performance_glitch_user and visual_user are explicitly Not covered, not silently dropped',
    pattern: /performance_glitch_user.*timing[\s\S]*visual_user.*layout/is,
  },
];

function run(): void {
  console.log('Running explorer ground-truth regression guard...');

  if (!fs.existsSync(SPEC_FILE)) {
    console.error(`${SPEC_FILE} does not exist.`);
    process.exit(1);
  }
  const content = fs.readFileSync(SPEC_FILE, 'utf-8');

  let failures = 0;
  for (const expectation of expectations) {
    if (expectation.pattern.test(content)) {
      console.log(`  PASS: ${expectation.description}`);
    } else {
      failures++;
      console.error(`  FAIL: ${expectation.description}`);
    }
  }

  if (failures > 0) {
    console.error(`\n${failures} of ${expectations.length} ground-truth check(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${expectations.length} ground-truth checks passed.`);
}

run();
