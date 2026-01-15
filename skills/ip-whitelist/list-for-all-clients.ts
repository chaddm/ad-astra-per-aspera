#!/usr/bin/env bun
/**
 * List all whitelisted client IPs for the given environment (bun version)
 * Usage: list-for-all-clients --env <env>
 */

const fs = Bun;
const argv = process.argv.slice(2);

function printErr(msg, code = 1) {
  console.error(`Error: ${msg}`);
  process.exit(code);
}

// Parse --env argument (allow --env=env or --env env)
let env;
for (let i = 0; i < argv.length; i++) {
  const arg = argv[i];
  if (arg.startsWith('--env=')) {
    env = arg.slice('--env='.length);
    break;
  }
  if (arg === '--env') {
    if (argv[i + 1]) {
      env = argv[i + 1];
      break;
    } else {
      printErr('Missing value after --env', 2);
    }
  }
}

if (!env) {
  printErr('Missing required --env parameter (e.g., --env=localhost or --env localhost)', 2);
}

const home = process.env.HOME || process.env.USERPROFILE;
// Read ~/.pnapass
const pnapassPath = `${home}/.pnapass`;
let apiKey;
try {
  const passFile = await fs.file(pnapassPath).text();
  const line = passFile.split('\n').find(l => l.trim().toLowerCase().startsWith(`${env.toLowerCase()}:`));
  if (!line) printErr(`API key for environment '${env}' not found in ${pnapassPath}.`, 3);
  apiKey = line.split(':').slice(1).join(':').trim();
  if (!apiKey) printErr(`API key for environment '${env}' not found in ${pnapassPath}.`, 3);
} catch (e) {
  if (e.code === 'ENOENT') {
    printErr(`API key file ${pnapassPath} not found.`);
  } else {
    printErr(`Failed to read ${pnapassPath}: ${e.message}`);
  }
}

// Read environments.csv from the same directory as this script
const scriptDir = new URL('.', import.meta.url).pathname;
const envCsvPath = `${scriptDir}/environments.csv`;

try {
  const envFile = await fs.file(envCsvPath).text();
  // Remove tabs/spaces, ignore commented/empty lines
  let baseUrl = null;
  for (const rawLine of envFile.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const [csvEnv, csvUrl, ..._] = line.split(',').map(x => x.trim());
    if (csvEnv && csvEnv.toLowerCase() === env.toLowerCase()) {
      baseUrl = csvUrl;
      break;
    }
  }
  if (!baseUrl) printErr(`Base URL for environment '${env}' not found in ${envCsvPath}.`, 4);

  // Compose URL
  const url = baseUrl.replace(/\/$/, '') + '/api/admin/clientIps';

  // Fetch
  let response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      }
    });
  } catch (e) {
    printErr(`Fetch request failed: ${e.message}`, 5);
  }

  let dataText, data;
  try {
    dataText = await response.text();
    data = JSON.parse(dataText);
  } catch {
    // If not JSON
    data = dataText || '(no response body)';
  }

  console.log(`HTTP Status: ${response.status}`);
  if (typeof data === 'object') {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(data);
  }
  process.exit(0);
} catch (e) {
  if (e.code === 'ENOENT') {
    printErr(`Environment config CSV ${envCsvPath} not found.`);
  } else {
    printErr(`Failed to read environment CSV: ${e.message}`);
  }
}


