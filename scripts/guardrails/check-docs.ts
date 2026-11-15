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
const SPECS_DIR = 'specs';
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

// Per docs/INTENT.md §4 and the rubric in docs/templates/README.md: every
// "## Confidence Log" entry in a spec file must have all three fields,
// Confidence an integer 1-10 - makes the confidence rubric mechanically
// enforced instead of an instruction nothing verifies (docs/PLAN.md Phase 3).
function checkConfidenceBlocks(): void {
  if (!fs.existsSync(SPECS_DIR)) return;
  for (const name of fs.readdirSync(SPECS_DIR)) {
    if (!name.endsWith('.plan.md')) continue;
    const file = path.join(SPECS_DIR, name);
    const content = read(file);
    const logSection = /## Confidence Log([\s\S]*)$/.exec(content)?.[1];
    if (logSection === undefined) {
      report(file, 'has no "## Confidence Log" section');
      continue;
    }
    const entries = logSection.split(/^### /m).slice(1);
    if (entries.length === 0) {
      report(file, '"## Confidence Log" has no dated entries');
      continue;
    }
    for (const entry of entries) {
      const heading = entry.split('\n')[0]?.trim() ?? '(unknown entry)';
      const confidence = /^-\s*Confidence:\s*(\S+)/m.exec(entry)?.[1];
      const unknowns = /^-\s*Unknowns:\s*(.+)$/m.exec(entry)?.[1]?.trim();
      const rationale = /^-\s*Rationale:\s*(.+)$/m.exec(entry)?.[1]?.trim();
      if (
        !confidence ||
        !/^\d+$/.test(confidence) ||
        Number(confidence) < 1 ||
        Number(confidence) > 10
      ) {
        report(file, `Confidence Log entry "${heading}" has no valid Confidence (1-10 integer)`);
      }
      if (!unknowns) report(file, `Confidence Log entry "${heading}" has no Unknowns field`);
      if (!rationale) report(file, `Confidence Log entry "${heading}" has no Rationale field`);
    }
  }
}

// Per docs/INTENT.md §2: a target's origin must be allowed before the browser MCP
// server can navigate there, and a config that lingers with a removed
// target's origin is itself a stale, orphaned entry nobody would notice.
function checkAllowedOrigins(): void {
  const registryPath = path.join(TARGETS_DIR, 'REGISTRY.md');
  if (!fs.existsSync(registryPath)) return;

  const activeOrigins = new Set<string>();
  for (const line of read(registryPath).split('\n')) {
    if (!line.startsWith('|') || line.startsWith('| :')) continue;
    const cell = line.split('|')[3];
    if (!cell || /archived/i.test(cell)) continue;
    const match = /`(https?:\/\/[^`]+)`/.exec(cell);
    if (match) activeOrigins.add(match[1]);
  }
  if (activeOrigins.size === 0) return;

  const configs = [
    { file: '.mcp.json', pattern: /--allowed-origins"\s*,\s*"([^"]+)"/ },
    {
      file: path.join('.agents', 'mcp_config.json'),
      pattern: /--allowed-origins"\s*,\s*"([^"]+)"/,
    },
    { file: path.join('.codex', 'config.toml'), pattern: /--allowed-origins","([^"]+)"/ },
  ];

  for (const { file, pattern } of configs) {
    if (!fs.existsSync(file)) continue;
    const match = pattern.exec(read(file));
    if (!match) {
      report(file, 'has no --allowed-origins list');
      continue;
    }
    const configuredOrigins = new Set(match[1].split(';'));
    for (const origin of activeOrigins) {
      if (!configuredOrigins.has(origin)) {
        report(file, `missing active target origin ${origin} from docs/targets/REGISTRY.md`);
      }
    }
    for (const origin of configuredOrigins) {
      if (!activeOrigins.has(origin)) {
        report(file, `allows ${origin}, which is not an active target in docs/targets/REGISTRY.md`);
      }
    }
  }
}

// Per docs/INTENT.md §2: the process layer must never name a specific target. Checks
// every name in docs/targets/REGISTRY.md against AGENTS.md, CORE_PRINCIPLES.md,
// and every agent/skill file - replacing the one-off grep done by hand before.
function checkProcessLayerAgnostic(): void {
  const registryPath = path.join(TARGETS_DIR, 'REGISTRY.md');
  if (!fs.existsSync(registryPath)) return;
  // Only the table's "Names" column (2nd cell) holds names to check - the rest
  // of the file is prose and may legitimately mention other backtick-quoted paths.
  const names: string[] = [];
  for (const line of read(registryPath).split('\n')) {
    if (!line.startsWith('|') || line.startsWith('| :')) continue;
    const cell = line.split('|')[2];
    if (!cell) continue;
    for (const match of cell.matchAll(/`([^`]+)`/g)) names.push(match[1].toLowerCase());
  }
  if (names.length === 0) return;

  const processFiles = [
    'AGENTS.md',
    'CORE_PRINCIPLES.md',
    ...listFiles(path.join('.claude', 'agents')),
    ...listFiles(path.join('.claude', 'skills')),
    ...listFiles(path.join('.agents', 'agents')),
    ...listFiles(path.join('.agents', 'skills')),
  ].filter((file) => fs.existsSync(file));

  for (const file of processFiles) {
    const lower = read(file).toLowerCase();
    for (const name of names) {
      if (lower.includes(name)) {
        report(file, `names a specific target ("${name}") - the process layer must stay agnostic`);
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

// Claude agent tool names must use a server that .mcp.json defines, and (closes L-001)
// the specific tool must actually exist on that server's pinned version, checked against
// a ground-truth allowlist captured from a live session - not just that the server exists.
function checkClaudeToolServers(): void {
  const agentsDir = path.join('.claude', 'agents');
  if (!fs.existsSync(agentsDir) || !fs.existsSync('.mcp.json')) return;
  const parsed: unknown = JSON.parse(read('.mcp.json'));
  const serverConfigs =
    typeof parsed === 'object' && parsed !== null && 'mcpServers' in parsed
      ? (parsed as { mcpServers: Record<string, { args?: string[] }> }).mcpServers
      : {};
  const servers = new Set(Object.keys(serverConfigs));

  const allowlistPath = path.join('scripts', 'guardrails', 'mcp-tool-allowlist.json');
  const allowlist: Record<string, Record<string, string[]>> = fs.existsSync(allowlistPath)
    ? JSON.parse(read(allowlistPath))
    : {};

  // Resolve each server's pinned "<package>@<version>" from its launch args, e.g.
  // "@playwright/mcp@0.0.83", so a version bump is visible without parsing lockfiles.
  const pinnedVersions = new Map<string, string>();
  for (const [server, config] of Object.entries(serverConfigs)) {
    const pinned = (config.args ?? []).find((arg) => /^@?[\w-]+\/[\w-]+@[\w.-]+$/.test(arg));
    if (pinned) pinnedVersions.set(server, pinned);
  }

  for (const name of fs.readdirSync(agentsDir)) {
    const file = path.join(agentsDir, name);
    const toolsLine = /^tools:\s*(.+)$/m.exec(read(file))?.[1] ?? '';
    for (const tool of toolsLine.split(',').map((t) => t.trim())) {
      const match = /^mcp__([^_]+(?:_[^_]+)*?)__(.+)$/.exec(tool);
      if (!match) continue;
      const [, server, toolName] = match;
      if (!servers.has(server)) {
        report(file, `tool ${tool} uses server "${server}" which .mcp.json does not define`);
        continue;
      }
      const serverAllowlist = allowlist[server];
      if (!serverAllowlist) {
        report(
          file,
          `server "${server}" has no entry in ${allowlistPath}; add one to verify ${tool}`
        );
        continue;
      }
      const pinned = pinnedVersions.get(server);
      const versionTools = pinned ? serverAllowlist[pinned] : undefined;
      if (!versionTools) {
        report(
          file,
          `${allowlistPath} has no tool list for ${server}@${pinned ?? 'unknown'}; regenerate it from a live session before trusting ${tool}`
        );
        continue;
      }
      if (!versionTools.includes(toolName)) {
        report(
          file,
          `tool ${tool} is not in the known tool set for ${pinned} - it was likely renamed or removed upstream`
        );
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

  checkFileReferences(files);
  checkLog();
  checkSkillCopies();
  checkAgentBodies();
  checkClaudeToolServers();
  checkInstructionStubs();
  checkAgentsDigest();
  checkMcpAllowlists();
  checkProcessLayerAgnostic();
  checkConfidenceBlocks();
  checkAllowedOrigins();

  if (problems.length === 0) {
    console.log(`✅ All documentation checks passed across ${files.length} files.`);
    return;
  }
  console.error(`❌ ${problems.length} documentation problem(s):`);
  for (const problem of problems) console.error(`  - ${problem.file}: ${problem.message}`);
  process.exit(1);
}

main();
