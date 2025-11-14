import { tool } from "@opencode-ai/plugin"

const execAsync = async (command: string): Promise<{ stdout: string; stderr: string }> => {
  const process = Bun.spawn(command.split(' '), {
    stdout: "pipe",
    stderr: "pipe",
  })

  const stdout = await new Response(process.stdout).text()
  const stderr = await new Response(process.stderr).text()
  await process.exited

  return { stdout, stderr }
}

export default tool({
  description: "Get available models from opencode and format as markdown numeric list",
  args: {
    // No arguments needed
  },
  async execute(args, context) {
    try {
      // Execute opencode models command
      const { stdout, stderr } = await execAsync('opencode models')

      if (stderr) {
        return `Error executing opencode models: ${stderr}`
      }

      // Parse output and create markdown numeric list
      const models = stdout.trim().split('\n').filter((line: string) => line.trim())

      if (models.length === 0) {
        return "No models found."
      }

      // Format as markdown numeric list
      const markdownList = models
        .map((model: string, index: number) => `${index + 1}. ${model}`)
        .join('\n')

      return markdownList

    } catch (error) {
      return `Error: ${error instanceof Error ? error.message : String(error)}`
    }
  },
})