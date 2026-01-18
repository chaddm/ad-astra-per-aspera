#!/usr/bin/env bun

/**
 * OpenCode Get Subagent Skill
 * 
 * Returns information about a single agent in YAML format.
 * Reads a specific agent configuration file from ~/.config/opencode/agent/
 * and extracts all frontmatter properties.
 */

import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * Extract YAML frontmatter from markdown content.
 * Returns parsed frontmatter object or throws error.
 */
function extractFrontmatter(content: string): any {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  
  if (!match) {
    throw new Error('No frontmatter found');
  }
  
  const yamlContent = match[1];
  const frontmatter: any = {};
  
  try {
    // Simple YAML parser for basic key-value pairs and nested objects
    const lines = yamlContent.split('\n');
    let currentObj = frontmatter;
    let indentStack: any[] = [frontmatter];
    let keyStack: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (!line.trim() || line.trim().startsWith('#')) continue;
      
      const indent = line.search(/\S/);
      const trimmed = line.trim();
      
      // Adjust stack based on indentation
      while (indentStack.length > 1 && indent <= (keyStack.length - 1) * 2) {
        indentStack.pop();
        keyStack.pop();
      }
      
      currentObj = indentStack[indentStack.length - 1];
      
      if (trimmed.includes(':')) {
        const colonIndex = trimmed.indexOf(':');
        const key = trimmed.substring(0, colonIndex).trim().replace(/["']/g, '');
        let value = trimmed.substring(colonIndex + 1).trim();
        
        if (value === '') {
          // Nested object
          currentObj[key] = {};
          indentStack.push(currentObj[key]);
          keyStack.push(key);
        } else {
          // Parse value
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.slice(1, -1);
          } else if (value === 'true') {
            value = true;
          } else if (value === 'false') {
            value = false;
          } else if (value === 'null') {
            value = null;
          } else if (!isNaN(Number(value)) && value !== '') {
            value = Number(value);
          }
          
          currentObj[key] = value;
        }
      }
    }
    
    return frontmatter;
  } catch (error) {
    throw new Error(`Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Convert value to YAML format string
 */
function toYamlValue(value: any, indent: number = 0): string {
  const spaces = '  '.repeat(indent);
  
  if (value === null || value === undefined) {
    return 'null';
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  if (typeof value === 'string') {
    // Quote strings that contain special characters or start with special chars
    if (value.includes(':') || value.includes('#') || value.includes('\n') || 
        value.startsWith('-') || value.startsWith('[') || value.startsWith('{')) {
      return `"${value.replace(/\"/g, '\\"')}"`;
    }
    return value;
  }
  
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    let result = '\n';
    value.forEach(item => {
      result += `${spaces}- ${toYamlValue(item, indent + 1)}\n`;
    });
    return result.trimEnd();
  }
  
  if (typeof value === 'object') {
    let result = '\n';
    for (const [key, val] of Object.entries(value)) {
      const yamlVal = toYamlValue(val, indent + 1);
      if (yamlVal.startsWith('\n')) {
        result += `${spaces}${key}:${yamlVal}\n`;
      } else {
        result += `${spaces}${key}: ${yamlVal}\n`;
      }
    }
    return result.trimEnd();
  }
  
  return String(value);
}

/**
 * Convert object to YAML format
 */
function toYaml(obj: any): string {
  let yaml = '';
  
  for (const [key, value] of Object.entries(obj)) {
    const yamlValue = toYamlValue(value, 1);
    
    if (yamlValue.startsWith('\n')) {
      yaml += `${key}:${yamlValue}\n`;
    } else {
      yaml += `${key}: ${yamlValue}\n`;
    }
  }
  
  return yaml;
}

/**
 * Parse command line arguments
 */
function parseArgs(): { name: string | null } {
  const args = process.argv.slice(2);
  let name: string | null = null;
  
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && i + 1 < args.length) {
      name = args[i + 1];
      i++; // Skip next argument
    }
  }
  
  return { name };
}

/**
 * Main execution function.
 */
function main(): void {
  const { name } = parseArgs();
  
  if (!name) {
    console.error('Error: --name parameter is required');
    console.error('Usage: get-subagent --name <agent-name>');
    process.exit(1);
  }
  
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  
  if (!homeDir) {
    console.error('Error: Unable to determine home directory');
    process.exit(1);
  }
  
  const agentDir = resolve(homeDir, '.config/opencode/agent');
  const agentFile = `${name}.md`;
  const agentPath = join(agentDir, agentFile);
  
  try {
    const content = readFileSync(agentPath, 'utf-8');
    const frontmatter = extractFrontmatter(content);
    
    // Add name to the output
    const output = {
      name,
      ...frontmatter
    };
    
    console.log(toYaml(output));
  } catch (error) {
    if (error instanceof Error && 'code' in error && (error as any).code === 'ENOENT') {
      console.log('Agent not found.');
    } else {
      console.error(`Error: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  }
}

// Execute main function
main();
