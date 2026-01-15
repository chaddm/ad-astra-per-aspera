#!/usr/bin/env bun
/**
 * Find clients by name matching a regex (case-insensitive).
 * Usage:
 *   find-clients --regexp=<pattern>
 */

const fs = Bun;
const argv = process.argv.slice(2);

function printErr(msg: string, code = 1) {
  console.error(`Error: ${msg}`);
  process.exit(code);
}

function parseArg(name: string): string | undefined {
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith(`--${name}=`)) return arg.slice(name.length + 3);
    if (arg === `--${name}`) {
      if (argv[i + 1]) return argv[i + 1];
      printErr(`Missing value after --${name}`);
    }
  }
  return undefined;
}

const pattern = parseArg('regexp');
if (!pattern) {
  printErr('Missing required --regexp parameter (e.g., --regexp=united)', 2);
}

let regex: RegExp;
try {
  regex = new RegExp(pattern, 'i');
} catch (e: any) {
  printErr(`Invalid regular expression: ${e.message}`, 3);
}

// Find script directory and CSV path
const scriptDir = new URL('.', import.meta.url).pathname;
const clientsCsvPath = `${scriptDir}/clients.csv`;

let csvText: string;
try {
  csvText = await fs.file(clientsCsvPath).text();
} catch (e: any) {
  if (e.code === 'ENOENT') {
    printErr(`clients.csv file not found in ${scriptDir}`, 4);
  } else {
    printErr(`Failed to read clients.csv: ${e.message}`, 5);
  }
}

const lines = csvText.split(/\r?\n/);
const header = lines[0];
const rows = lines.slice(1).filter(line => line.trim().length > 0);
const matches: string[] = [];
for (const row of rows) {
  // row looks like: "id","name" or 31,"UnitedHealthcare (UHC)"
  // We'll simply split on the first comma, considering possible quoted strings
  const m = row.match(/^(\d+),"(.*)"$/);
  if (m) {
    const id = m[1];
    const name = m[2];
    if (regex.test(name)) {
      matches.push(`${id},"${name}"`);
    }
  }
}

console.log(header);
for (const m of matches) console.log(m);
console.log(`Matching rows: ${matches.length}`);
