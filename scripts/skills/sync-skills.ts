import fs from 'node:fs';
import path from 'node:path';

// .agents/skills is the source of truth. .claude/skills is a generated copy.
// npm run docs:check fails if the two ever differ.

const SOURCE = path.join('.agents', 'skills');
const COPY = path.join('.claude', 'skills');

if (!fs.existsSync(SOURCE)) {
  console.error(`❌ ${SOURCE} does not exist; nothing to sync.`);
  process.exit(1);
}

fs.rmSync(COPY, { recursive: true, force: true });
fs.cpSync(SOURCE, COPY, { recursive: true });
console.log(`✅ Synced ${SOURCE} to ${COPY}.`);
