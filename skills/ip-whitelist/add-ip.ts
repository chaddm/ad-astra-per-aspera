#!/usr/bin/env bun
/**
 * Add Whitelisted IP for client/user (Routes 3, 4, 5 per API)
 * Usage:
 *   add-ip --env=<environment> --client-id=<client_id> --ip=<ip_address> [--user-id=<user_id>] [--netmask=<netmask>]
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

const env      = parseArg('env');
const clientId = parseArg('client-id');
const ip       = parseArg('ip');
const userId   = parseArg('user-id');
const netmask  = parseArg('netmask');

// Validate required params
if (!env)
  printErr('Missing required --env parameter (e.g., --env=localhost or --env localhost)', 2);
if (!clientId)
  printErr('Missing required --client-id parameter (e.g., --client-id=abcdef123)', 2);
if (!ip)
  printErr('Missing required --ip parameter (e.g., --ip=1.2.3.4)', 2);
// Validation: netmask without user-id not allowed
if (netmask && !userId) {
  printErr('Cannot specify --netmask without --user-id. If you want to use netmask, you must also specify --user-id.', 2);
}

const home = process.env.HOME || process.env.USERPROFILE;
const pnapassPath = `${home}/.pnapass`;
let apiKey: string;
try {
  const passFile = await fs.file(pnapassPath).text();
  const line = passFile.split('\n').find(l => l.trim().toLowerCase().startsWith(`${env.toLowerCase()}:`));
  if (!line) printErr(`API key for environment '${env}' not found in ${pnapassPath}.`, 3);
  apiKey = line.split(':').slice(1).join(':').trim();
  if (!apiKey) printErr(`API key for environment '${env}' not found in ${pnapassPath}.`, 3);
} catch (e: any) {
  if (e.code === 'ENOENT') {
    printErr(`API key file ${pnapassPath} not found.`);
  } else {
    printErr(`Failed to read ${pnapassPath}: ${e.message}`);
  }
}

// Read environments.csv relative to script directory
const scriptDir = new URL('.', import.meta.url).pathname;
const envCsvPath = `${scriptDir}/environments.csv`;
let baseUrl: string | null = null;
try {
  const envFile = await fs.file(envCsvPath).text();
  for (const rawLine of envFile.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const [csvEnv, csvUrl] = line.split(',').map(x => x.trim());
    if (csvEnv && csvEnv.toLowerCase() === env.toLowerCase()) {
      baseUrl = csvUrl;
      break;
    }
  }
  if (!baseUrl) printErr(`Base URL for environment '${env}' not found in ${envCsvPath}.`, 4);
} catch (e: any) {
  if (e.code === 'ENOENT') {
    printErr(`Environment config CSV ${envCsvPath} not found.`);
  } else {
    printErr(`Failed to read environment CSV: ${e.message}`);
  }
}

function encode(x: string | undefined) {
  return encodeURIComponent(x || '');
}

// Compose URL for PUT
// Priority: both userId/netmask: /<client_id>/ip/<ip>/<netmask>/userId/<user_id>
//           userId only:        /<client_id>/ip/<ip>/userId/<user_id>
//           neither:            /<client_id>/ip/<ip>
let putUrl = baseUrl!.replace(/\/$/, '') + `/api/admin/clientIps/${encode(clientId)}/ip/${encode(ip)}`;
if (userId && netmask) {
  putUrl += `/${encode(netmask)}/userId/${encode(userId)}`;
} else if (userId) {
  putUrl += `/userId/${encode(userId)}`;
} else if (netmask) {
  printErr('Specifying --netmask without --user-id is not valid. See usage documentation.', 2);
}

// Perform PUT request
let response;
try {
  response = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    }
  });
} catch (e: any) {
  printErr(`Fetch request failed: ${e.message}`, 5);
}

let dataText, data;
try {
  dataText = await response.text();
  data = JSON.parse(dataText);
} catch {
  data = dataText || '(no response body)';
}

console.log(`HTTP Status: ${response.status}`);
if (typeof data === 'object') {
  console.log(JSON.stringify(data, null, 2));
} else {
  console.log(data);
}
process.exit(0);
