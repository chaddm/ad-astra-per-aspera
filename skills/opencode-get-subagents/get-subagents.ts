#!/usr/bin/env bun

/**
 * OpenCode Get Subagents Skill
 * 
 * Returns information about active subagents in YAML format.
 * Reads agent configuration files from ~/.config/opencode/agent/
 * and extracts frontmatter properties.
 */

import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

interface AgentFrontmatter {
  name: string;
  [key: string]: any;
}

interface ErrorRecord {
  name: string;
  error: string;
}

/**
 * Extract YAML frontmatter from markdown content.
 * Returns parsed frontmatter object or throws error.
 */
function extractFrontmatter(content: string, filename: string): any {
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
    let currentKey = '';
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
        const key = trimmed.substring(0, colonIndex).trim().replace(/['"]/g, '');
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
 * Check if agent is a subagent based on mode or type property.
 */
function isSubagent(frontmatter: any): boolean {
  const mode = frontmatter.mode || frontmatter.type || 'primary';
  return mode === 'subagent';
}

/**
 * Check if agent is active.
 * Checks purpose.active first, then top-level active.
 * Defaults to true if not specified.
 */
function isActive(frontmatter: any): boolean {
  if (frontmatter.purpose?.active !== undefined) {
    return frontmatter.purpose.active === true;
  }
  
  if (frontmatter.active !== undefined) {
    return frontmatter.active === true;
  }
  
  return true; // Default to active
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
      return `"${value.replace(/"/g, '\\"')}"`;
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
 * Main execution function.
 */
function main(): void {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '';
  
  if (!homeDir) {
    console.error('Error: Unable to determine home directory');
    process.exit(1);
  }
  
  const agentDir = resolve(homeDir, '.config/opencode/agent');
  
  let files: string[];
  try {
    files = readdirSync(agentDir).filter(f => f.endsWith('.md'));
  } catch (error) {
    console.error(`Error: Unable to read agent directory: ${agentDir}`);
    process.exit(1);
  }
  
  const errors: ErrorRecord[] = [];
  const agents: AgentFrontmatter[] = [];
  
  for (const file of files) {
    try {
      const filePath = join(agentDir, file);
      const content = readFileSync(filePath, 'utf-8');
      const frontmatter = extractFrontmatter(content, file);
      
      if (isSubagent(frontmatter) && isActive(frontmatter)) {
        // Remove .md extension from filename
        const name = file.replace(/\.md$/, '');
        agents.push({
          name,
          description: frontmatter.description || '',
          purpose: frontmatter.purpose || {}
        });
      }
    } catch (error) {
      // Remove .md extension from filename in errors too
      const name = file.replace(/\.md$/, '');
      errors.push({
        name,
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }
  
  // Generate YAML output
  const output = toYaml({ errors, agents });
  console.log(output);
}

// Execute main function
main();
