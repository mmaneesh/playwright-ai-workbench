import fs from 'node:fs';
import path from 'node:path';

// Mechanical consistency checks for the process documents (templates, workbooks, log).
// Judgement stays with the phase sign-off; this only checks what a script can see.

interface Problem {
  file: string;
  message: string;
}

const TEMPLATES_DIR = path.join('docs', 'templates');
const TARGETS_DIR = path.join('docs', 'targets');
const LOG_FILE = path.join('docs', 'LOG.md');
const LOG_ACTIVE_CAP = 30;
const SKIP_DIRS = new Set(['node_modules', '.git', 'test-results', 'playwright-report', 'dist']);

const problems: Problem[] = [];

function report(file: string, message: string): void {
  problems.push({ file, message });
}

function read(file: string): string {
  return fs.readFileSync(file, 'utf-8');
}

function collectMarkdown(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) collectMarkdown(full, out);
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

function phaseTemplates(): Map<number, string> {
  const found = new Map<number, string>();
  for (const name of fs.readdirSync(TEMPLATES_DIR)) {
    const match = /^0([1-6])-.*\.template\.md$/.exec(name);
    if (match) found.set(Number(match[1]), name);
  }
  return found;
}

// Every document path mentioned must exist. Paths with placeholders are skipped.
function checkFileReferences(files: string[]): void {
  const docPath =
    /docs\/(?:templates|targets)\/[A-Za-z0-9_.\-/<>]+\.md|docs\/[A-Z_]+\.md|CORE_PRINCIPLES\.md/g;
  const templateName = /\b0[1-6]-[A-Z-]+\.template\.md\b/g;
  for (const file of files) {
    const content = read(file);
    for (const match of content.matchAll(docPath)) {
      const ref = match[0];
      if (!ref.includes('<') && !fs.existsSync(ref)) report(file, `references missing file ${ref}`);
    }
    for (const match of content.matchAll(templateName)) {
      if (!fs.existsSync(path.join(TEMPLATES_DIR, match[0]))) {
        report(file, `references missing template ${match[0]}`);
      }
    }
  }
}

// Every section mark in a template must point at a numbered heading in that template.
function checkSectionMarks(templates: Map<number, string>): void {
  for (const name of templates.values()) {
    const content = read(path.join(TEMPLATES_DIR, name));
    const headings = new Set([...content.matchAll(/^## (\d+)\./gm)].map((m) => m[1]));
    for (const match of content.matchAll(/§(\d+)/g)) {
      if (!headings.has(match[1]))
        report(name, `section mark §${match[1]} has no matching heading`);
    }
  }
}

// Phase N writes the N to N+1 handoff (N is 1 to 5) and deletes the inbound one (N is 2 to 6).
function checkHandoffChain(templates: Map<number, string>): void {
  for (let n = 1; n <= 6; n++) {
    const name = templates.get(n);
    if (!name) {
      report(TEMPLATES_DIR, `phase ${n} template is missing`);
      continue;
    }
    const content = read(path.join(TEMPLATES_DIR, name));
    const outbound = `<!-- HANDOFF ${n}→${n + 1} status=open -->`;
    if (n <= 5 && !content.includes(outbound)) report(name, `missing outbound block ${outbound}`);
    if (n === 6 && /<!-- HANDOFF 6→/.test(content))
      report(name, 'phase 6 must not write a handoff');
    if (n >= 2) {
      if (!content.includes(`HANDOFF ${n - 1}→${n}`)) {
        report(name, `does not reference inbound HANDOFF ${n - 1}→${n}`);
      }
      if (!/delete[^\n]*block|Delete the inbound/i.test(content)) {
        report(name, 'has no instruction to delete the inbound block');
      }
    }
  }
}

// Each README phase row must say the phase writes its own workbook section.
function checkReadmeOwnership(): void {
  const readmePath = path.join(TEMPLATES_DIR, 'README.md');
  const rows = read(readmePath).split('\n');
  for (let n = 1; n <= 6; n++) {
    const row = rows.find((line) => line.startsWith(`| ${n}   |`));
    if (!row) {
      report(readmePath, `phase map has no row for phase ${n}`);
      continue;
    }
    const writes = row.split('|').map((cell) => cell.trim())[5] ?? '';
    if (!new RegExp(`Section ${n}\\b`).test(writes)) {
      report(readmePath, `phase ${n} should write Section ${n}, found "${writes}"`);
    }
  }
}

// The log holds only active entries, unique IDs, valid phases, and stays under the cap.
function checkLog(): void {
  const ids = new Set<string>();
  let active = 0;
  for (const line of read(LOG_FILE).split('\n')) {
    const cells = line.split('|').map((cell) => cell.trim());
    const id = /^`([DL]-\d{3})`$/.exec(cells[1] ?? '')?.[1];
    if (!id) continue;
    if (ids.has(id)) report(LOG_FILE, `duplicate ID ${id}`);
    ids.add(id);
    const phase = cells[3] ?? '';
    const status = cells[4] ?? '';
    if (!/^(All|[1-6](, [1-6])*)$/.test(phase))
      report(LOG_FILE, `${id} has invalid phase "${phase}"`);
    if (status === 'Active') active++;
    else report(LOG_FILE, `${id} has status "${status}"; delete entries that are not Active`);
  }
  if (active > LOG_ACTIVE_CAP) {
    report(
      LOG_FILE,
      `${active} active entries exceed the cap of ${LOG_ACTIVE_CAP}; prune at sign-off`
    );
  }
}

// Workbook handoff blocks must be well formed, and none may outlive the phase that consumes it.
function checkWorkbookHandoffs(): void {
  if (!fs.existsSync(TARGETS_DIR)) return;
  for (const name of fs.readdirSync(TARGETS_DIR)) {
    if (!name.endsWith('.md') || name.endsWith('-defects.md')) continue;
    const file = path.join(TARGETS_DIR, name);
    const content = read(file);
    const opens = [...content.matchAll(/<!-- HANDOFF (\d)→(\d) status=(\w+) -->/g)];
    const closes = [...content.matchAll(/<!-- \/HANDOFF -->/g)];
    if (opens.length !== closes.length)
      report(file, 'handoff opening and closing markers do not pair');
    const statusLine = /\*\*Status\*\*: `?Phase (\d)([^`\n]*)/.exec(content);
    const signedOffPhase =
      statusLine && /Approved|Complete/.test(statusLine[2] ?? '') ? Number(statusLine[1]) : 0;
    for (const match of opens) {
      const from = Number(match[1]);
      const to = Number(match[2]);
      const state = match[3];
      const forward = to === from + 1 && state === 'open';
      const back = from > to && state === 'return';
      if (!forward && !back) report(file, `malformed handoff ${from}→${to} status=${state}`);
      if (forward && to <= signedOffPhase) {
        report(file, `stale handoff ${from}→${to}: phase ${signedOffPhase} is already signed off`);
      }
    }
  }
}

function listFiles(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else out.push(full);
  }
  return out;
}

function body(content: string): string {
  const parts = content.split(/^---\s*$/m);
  return parts.length >= 3 ? parts.slice(2).join('---').trim() : content.trim();
}

// The skills under .claude are a generated copy of .agents. They must never differ.
function checkSkillCopies(): void {
  const source = path.join('.agents', 'skills');
  const copy = path.join('.claude', 'skills');
  const relative = (root: string): string[] =>
    listFiles(root).map((file) => path.relative(root, file));
  const sourceFiles = relative(source).sort();
  const copyFiles = relative(copy).sort();
  if (sourceFiles.join('\n') !== copyFiles.join('\n')) {
    report(copy, 'file list differs from .agents/skills; run npm run skills:sync');
    return;
  }
  for (const file of sourceFiles) {
    if (read(path.join(source, file)) !== read(path.join(copy, file))) {
      report(path.join(copy, file), 'differs from .agents/skills; run npm run skills:sync');
    }
  }
}

// Agent bodies are identical across platforms; only the tool names in the frontmatter differ.
function checkAgentBodies(): void {
  const source = path.join('.agents', 'agents');
  if (!fs.existsSync(source)) return;
  for (const name of fs.readdirSync(source)) {
    const copy = path.join('.claude', 'agents', name);
    if (!fs.existsSync(copy)) {
      report(copy, 'missing Claude copy of the agent');
    } else if (body(read(path.join(source, name))) !== body(read(copy))) {
      report(copy, 'body differs from .agents/agents; keep the bodies identical');
    }
  }
}

// Claude agent tool names must use a server that .mcp.json defines.
function checkClaudeToolServers(): void {
  const agentsDir = path.join('.claude', 'agents');
  if (!fs.existsSync(agentsDir) || !fs.existsSync('.mcp.json')) return;
  const parsed: unknown = JSON.parse(read('.mcp.json'));
  const servers = new Set(
    typeof parsed === 'object' && parsed !== null && 'mcpServers' in parsed
      ? Object.keys((parsed as { mcpServers: Record<string, unknown> }).mcpServers)
      : []
  );
  for (const name of fs.readdirSync(agentsDir)) {
    const file = path.join(agentsDir, name);
    const toolsLine = /^tools:\s*(.+)$/m.exec(read(file))?.[1] ?? '';
    for (const tool of toolsLine.split(',').map((t) => t.trim())) {
      const server = /^mcp__([^_]+(?:_[^_]+)*?)__/.exec(tool)?.[1];
      if (server && !servers.has(server)) {
        report(file, `tool ${tool} uses server "${server}" which .mcp.json does not define`);
      }
    }
  }
}

// The stubs stay short and point at AGENTS.md.
function checkInstructionStubs(): void {
  for (const name of ['CLAUDE.md', 'GEMINI.md']) {
    if (!fs.existsSync(name)) {
      report(name, 'missing');
      continue;
    }
    const content = read(name);
    if (!content.includes('AGENTS.md')) report(name, 'does not point at AGENTS.md');
    if (content.split('\n').length > 25) report(name, 'is a stub and must stay under 25 lines');
  }
}

// Every ID cited in the AGENTS.md digest must exist and be Active in the log.
function checkAgentsDigest(): void {
  if (!fs.existsSync('AGENTS.md')) {
    report('AGENTS.md', 'missing');
    return;
  }
  const active = new Set<string>();
  for (const line of read(LOG_FILE).split('\n')) {
    const cells = line.split('|').map((cell) => cell.trim());
    const id = /^`([DL]-\d{3})`$/.exec(cells[1] ?? '')?.[1];
    if (id && cells[4] === 'Active') active.add(id);
  }
  const digest = /## Rules that cannot wait([\s\S]*?)(?=\n## |$)/.exec(read('AGENTS.md'))?.[1];
  if (digest === undefined) {
    report('AGENTS.md', 'has no "Rules that cannot wait" section');
    return;
  }
  for (const match of digest.matchAll(/\b([DL]-\d{3})\b/g)) {
    if (!active.has(match[1]))
      report('AGENTS.md', `cites ${match[1]}, which is not an Active log entry`);
  }
}

// The three MCP configs must allow the same origins, and compose defaults must stay inside them.
function checkMcpAllowlists(): void {
  const configs = [
    '.mcp.json',
    path.join('.agents', 'mcp_config.json'),
    path.join('.codex', 'config.toml'),
  ];
  const lists = new Map<string, string[]>();
  for (const file of configs) {
    if (!fs.existsSync(file)) continue;
    const raw = /--allowed-origins"\s*,\s*"([^"]+)"/.exec(read(file))?.[1];
    if (raw) lists.set(file, raw.split(';').sort());
    else report(file, 'has no --allowed-origins list');
  }
  const reference = [...lists.entries()][0];
  if (!reference) return;
  for (const [file, origins] of lists) {
    if (origins.join(';') !== reference[1].join(';')) {
      report(file, `allowed origins differ from ${reference[0]}`);
    }
  }
  if (fs.existsSync('docker-compose.yml')) {
    for (const match of read('docker-compose.yml').matchAll(/:-(https?:\/\/[^}\s]+)\}/g)) {
      if (!reference[1].includes(match[1])) {
        report('docker-compose.yml', `default ${match[1]} is not an allowed MCP origin`);
      }
    }
  }
}

function main(): void {
  console.log('🔍 Running Playwright AI Workbench Documentation Checker...');
  const files = collectMarkdown('.');
  const templates = phaseTemplates();

  checkFileReferences(files);
  checkSectionMarks(templates);
  checkHandoffChain(templates);
  checkReadmeOwnership();
  checkLog();
  checkWorkbookHandoffs();
  checkSkillCopies();
  checkAgentBodies();
  checkClaudeToolServers();
  checkInstructionStubs();
  checkAgentsDigest();
  checkMcpAllowlists();

  if (problems.length === 0) {
    console.log(`✅ All documentation checks passed across ${files.length} files.`);
    return;
  }
  console.error(`❌ ${problems.length} documentation problem(s):`);
  for (const problem of problems) console.error(`  - ${problem.file}: ${problem.message}`);
  process.exit(1);
}

main();
