import { tool } from "@opencode-ai/plugin";

/**
 * A simple tool that returns a joke prompt when called.
 * This tool demonstrates basic tool creation with no arguments.
 */
export const call_me = tool({
  description: "Returns a prompt to tell a programmer joke",
  args: {},
  async execute() {
    return "Tell a programmer joke.";
  },
});

export default call_me;
