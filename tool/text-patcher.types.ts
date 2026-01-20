/**
 * Text Patcher Tool Types
 * 
 * Type definitions for the text-patcher tool, supporting integrity-checked
 * file reading and patching operations.
 */

/**
 * Parameters for reading a file
 */
export interface TextReadParams {
  /** Absolute path to the file to read */
  filename: string;
  /** Starting row number (1-based, inclusive) - used with limit */
  offset?: number;
  /** Number of rows to read from offset - used with offset */
  limit?: number;
  /** Starting row number (1-based, inclusive) - used with end */
  start?: number;
  /** Ending row number (1-based, inclusive) - used with start */
  end?: number;
}

/**
 * Frontmatter metadata returned by text_read
 */
export interface TextReadFrontmatter {
  /** Path to the file that was read */
  filename: string;
  /** SHA-256 hash token for integrity checking, or null for non-existent files */
  token: string | null;
  /** Starting offset if offset/limit was used */
  offset?: number;
  /** Limit if offset/limit was used */
  limit?: number;
  /** Start row if start/end was used */
  start?: number;
  /** End row if start/end was used */
  end?: number;
}

/**
 * A single patch operation
 */
export interface PatchOperation {
  /** Starting row number (1-based) - original row numbers from read */
  offset?: number;
  /** Number of rows to replace from offset */
  limit?: number;
  /** Starting row number (1-based, inclusive) - alternative to offset */
  start?: number;
  /** Ending row number (1-based, inclusive) - alternative to limit */
  end?: number;
  /** Replacement rows (empty array = deletion) */
  rows: string[];
}

/**
 * Parameters for patching a file
 */
export interface TextPatchParams {
  /** Absolute path to the file to patch */
  filename: string;
  /** SHA token from text_read, or null for new files */
  token: string | null;
  /** Array of patch operations to apply */
  patches: PatchOperation[];
}

/**
 * Success result from text_patch
 */
export interface TextPatchSuccess {
  success: true;
  message: string;
}

/**
 * Error result from text_patch
 */
export interface TextPatchError {
  success: false;
  error: string;
}

/**
 * Result type from text_patch operation
 */
export type TextPatchResult = TextPatchSuccess | TextPatchError;

/**
 * Internal representation of a normalized patch
 * Used after converting start/end to offset/limit
 */
export interface NormalizedPatch {
  /** Starting row (1-based, from original file) */
  offset: number;
  /** Number of rows to replace */
  limit: number;
  /** Replacement rows */
  rows: string[];
}
