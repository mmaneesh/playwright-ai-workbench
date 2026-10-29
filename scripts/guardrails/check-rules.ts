import fs from 'node:fs';
import path from 'node:path';

interface Violation {
  file: string;
  line?: number;
  rule: string;
  snippet: string;
}

const VIOLATION_RULES = [
  {
    id: 'NO_WAIT_FOR_TIMEOUT',
    pattern: /\.waitForTimeout\s*\(/,
    description:
      'Arbitrary sleeps (waitForTimeout) are forbidden by CORE_PRINCIPLES. Use web-first assertions or state predicates.',
  },
  {
    id: 'NO_XPATH',
    pattern: /(['"`])\/\/[^'"`]*\1|xpath=/,
    description:
      'XPath locators are forbidden by CORE_PRINCIPLES. Use accessible queries (getByRole, getByLabel, getByText).',
  },
  {
    id: 'NO_ANY_TYPE',
    pattern: /:\s*any\b|\bas\s+any\b/,
    description:
      'The TypeScript "any" type is forbidden by CORE_PRINCIPLES. Use explicit types or Zod schemas.',
  },
  {
    id: 'NO_PSEUDO_GHERKIN',
    pattern: /test\.step\s*\(\s*['"`](?:GIVEN|WHEN|THEN)\b/i,
    description:
      'Pseudo-Gherkin prefixes (GIVEN/WHEN/THEN) are forbidden in test.step. Use natural action descriptions.',
  },
];

function checkContent(filePath: string, content: string): Violation[] {
  const violations: Violation[] = [];
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      return;
    }

    for (const rule of VIOLATION_RULES) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: filePath,
          line: index + 1,
          rule: rule.id,
          snippet: trimmed,
        });
      }
    }

    if (filePath.endsWith('.spec.ts')) {
      if (filePath.includes(path.join('tests', 'ui')) && line.includes("from '@playwright/test'")) {
        violations.push({
          file: filePath,
          line: index + 1,
          rule: 'USE_FIXTURE_IMPORTS',
          snippet: trimmed,
        });
      }
    }
  });

  return violations;
}

function scanFile(filePath: string): Violation[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  return checkContent(filePath, content);
}

function walkDir(dir: string, fileList: string[] = []): string[] {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (
        !['node_modules', '.git', 'test-results', 'playwright-report', 'dist'].includes(entry.name)
      ) {
        walkDir(fullPath, fileList);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
      fileList.push(fullPath);
    }
  }

  return fileList;
}

function checkJsonTestData(): Violation[] {
  const violations: Violation[] = [];
  const testDataDir = path.resolve('test-data');
  if (!fs.existsSync(testDataDir)) return violations;

  const entries = fs.readdirSync(testDataDir, { recursive: true });
  for (const entry of entries) {
    const entryStr = entry.toString();
    if (entryStr.endsWith('.json')) {
      violations.push({
        file: path.join('test-data', entryStr),
        line: 1,
        rule: 'NO_JSON_TEST_DATA',
        snippet: 'JSON static data is forbidden. Use typed .ts files (as const) or factories.',
      });
    }
  }
  return violations;
}

async function handleClaudeHook(): Promise<void> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  const rawInput = Buffer.concat(chunks).toString('utf-8').trim();

  if (!rawInput) {
    process.exit(0);
  }

  try {
    const payload = JSON.parse(rawInput);
    const toolInput = payload.tool_input || {};
    const targetPath = (toolInput.path || toolInput.file_path || '').replace(/\\/g, '/');

    // Only inspect relevant code files
    if (!targetPath.endsWith('.ts') && !targetPath.endsWith('.json')) {
      process.exit(0);
    }

    // Check JSON in test-data
    if (targetPath.includes('test-data/') && targetPath.endsWith('.json')) {
      console.error(
        '\n🚫 [GUARDRAIL VIOLATION]: Static JSON test data is forbidden by CORE_PRINCIPLES.'
      );
      console.error('↳ Use typed TypeScript files with `as const` or dynamic factories instead.\n');
      process.exit(2);
    }

    let textToCheck = '';
    if (payload.tool_name === 'Write') {
      textToCheck = toolInput.content || '';
    } else if (payload.tool_name === 'Edit') {
      textToCheck = toolInput.new_string || '';
    } else if (payload.tool_name === 'MultiEdit' && Array.isArray(toolInput.edits)) {
      textToCheck = toolInput.edits
        .map((e: { new_string?: string }) => e.new_string || '')
        .join('\n');
    }

    const violations = checkContent(targetPath, textToCheck);

    if (violations.length > 0) {
      console.error(
        `\n🚫 [GUARDRAIL VIOLATION]: Intercepted ${violations.length} forbidden pattern(s) in proposed edit:`
      );
      for (const v of violations) {
        console.error(`  - Rule [${v.rule}]`);
        console.error(`    Snippet: "${v.snippet}"`);
      }
      console.error('\nRefer to CORE_PRINCIPLES.md for the non-negotiable standards.\n');
      process.exit(2);
    }

    process.exit(0);
  } catch {
    // If not valid hook JSON, allow through
    process.exit(0);
  }
}

function handleFileScan(): void {
  console.log('🔍 Running Playwright AI Workbench Guardrails Checker...');

  const targetDirs = ['tests', 'page-objects', 'fixtures', 'test-data', 'helpers'].map((d) =>
    path.resolve(d)
  );
  const filesToScan = targetDirs.flatMap((d) => walkDir(d));

  const codeViolations = filesToScan.flatMap((file) => scanFile(file));
  const jsonViolations = checkJsonTestData();
  const allViolations = [...codeViolations, ...jsonViolations];

  if (allViolations.length > 0) {
    console.error(`\n❌ Found ${allViolations.length} guardrail violation(s):\n`);
    for (const v of allViolations) {
      console.error(`  ${v.file}:${v.line} [${v.rule}]`);
      console.error(`    ↳ ${v.snippet}\n`);
    }
    process.exit(1);
  }

  console.log('✅ All guardrail checks passed! Zero violations detected.\n');
}

async function main(): Promise<void> {
  const isHookMode =
    process.argv.includes('--hook') || (!process.stdin.isTTY && Boolean(process.env.CLAUDE_CODE));

  if (isHookMode) {
    await handleClaudeHook();
  } else {
    handleFileScan();
  }
}

void main();
