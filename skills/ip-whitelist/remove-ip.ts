#!/usr/bin/env bun
/**
 * Remove Whitelisted IP - Route 6
 * Usage:
 *   bun remove-ip.ts --env=<environment> --client-id=<client_id> --ip=<ip_address>
 *
 * Errors:
 *   - Missing required parameters
 *   - Invalid environment
 *   - API key not found
 *   - Environment not found in CSV
 *   - Fetch request failures
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';

/** Utility to print and exit on error */
function fatal(message: string) {
  console.error(`Error: ${message}`);
  process.exit(1);
}

/** Argument parsing */
function getArg(key: string, required = false): string | undefined {
  const out = process.argv.find((arg) => arg.startsWith(`--${key}=`));
  if (!out && required) fatal(`Missing required parameter --${key}`);
  return out ? out.substring(key.length + 3) : undefined;
}

async function main() {
  // Required args
  const env = getArg('env', true);
  const clientId = getArg('client-id', true);
  const ip = getArg('ip', true);
  if (!env || !clientId || !ip) return;

  // Step 2: Read API key from ~/.pnapass
  let apiKey: string | undefined;
  try {
    const passFile = await readFile(`${process.env.HOME}/.pnapass`, 'utf8');
    // Assume API key is before first ':'
    apiKey = passFile.split(':')[0].trim();
    if (!apiKey) throw new Error();
  } catch (err) {
    fatal('API key not found in ~/.pnapass');
  }

  // Step 3: Read environments.csv (relative to script dir)
  const skillDir = dirname(new URL(import.meta.url).pathname);
  let envCSV: string;
  try {
    envCSV = await readFile(join(skillDir, 'environments.csv'), 'utf8');
  } catch (err) {
    fatal('Could not read environments.csv');
  }

  const lines = envCSV.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const envMap = new Map<string, string>();
  for (const line of lines.slice(1)) {
    const [e, url] = line.split(',');
    if (e && url) envMap.set(e.trim(), url.trim());
  }
  const baseUrl = envMap.get(env);
  if (!baseUrl) fatal(`Environment '${env}' not found in environments.csv`);

  // Step 4: Make DELETE request
  const endpoint = `${baseUrl}/api/admin/clientIps/${clientId}/ip/${ip}`;
  let resp, respText;
  try {
    resp = await fetch(endpoint, {
      method: 'DELETE',
      headers: { 'x-api-key': apiKey, 'Accept': 'application/json' },
    });
    respText = await resp.text();
  } catch (err: any) {
    fatal(`Failed to fetch: ${err.message || err}`);
  }

  // Print status and pretty JSON or text
  console.log(`HTTP ${resp.status}`);
  try {
    const data = JSON.parse(respText);
    console.log(JSON.stringify(data, null, 2));
  } catch {
    console.log(respText);
  }

  // Exit nonzero if not 2xx
  if (!resp.ok) process.exit(1);
}

main().catch((e) => {
  fatal(e?.message || String(e));
});
