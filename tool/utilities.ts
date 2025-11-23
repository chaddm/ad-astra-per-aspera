import { tool } from "@opencode-ai/plugin"
import { randomUUID } from "crypto"

/**
 * Returns a RFC4122 version 4 UUID string using the most secure available method.
 * Uses crypto.randomUUID() from the Node.js/Bun crypto module.
 */
export const uuid = tool({
  description: "Generate a RFC4122 version 4 UUID as a string.",
  args: {},
  async execute() {
    try {
      return randomUUID();
    } catch (e) {
      // Fallback: Polyfill (RFC4122 v4 compliant)
      // See: https://stackoverflow.com/a/2117523/109538
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    }
  },
});

export default uuid;
