import { tool } from "@opencode-ai/plugin";
import { z } from "zod";
import TurndownService from "turndown";
import { JSDOM } from "jsdom";

// Internal helpers
function stripUnwantedTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")
    .replace(/<footer[\s\S]*?<\/footer>/gi, "");
}

function guessCodeLang(element: Element): string | undefined {
  const classAttr = element.getAttribute("class") || "";
  const match = classAttr.match(/language-([\w-]+)/) || classAttr.match(/lang-([\w-]+)/);
  if (match) return match[1];
  const dataLang = element.getAttribute("data-language");
  if (dataLang) return dataLang;
  const typeAttr = element.getAttribute("type");
  if (typeAttr) {
    if (typeAttr.includes("javascript")) return "js";
    if (typeAttr.includes("html")) return "html";
    if (typeAttr.includes("xml")) return "xml";
    if (typeAttr.includes("css")) return "css";
  }
  return undefined;
}

function htmlToMarkdown(html: string): string {
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    fence: "```",
    preformattedCode: true,
  });
  turndownService.addRule("fencedCodeBlockWithLang", {
    filter: (node) => {
      return (
        (node.nodeName === "PRE" || node.nodeName === "CODE") &&
        (node.childNodes.length === 1 || node.nodeName === "CODE")
      );
    },
    replacement: (content, node) => {
      const el = node as Element;
      let code = node.textContent || "";
      code = code.replace(/^\n+|\n+$/g, "");
      const lang = guessCodeLang(el);
      const fence = "```";
      return `\n${fence}${lang ? lang : ""}\n${code}\n${fence}\n`;
    },
  });
  turndownService.addRule("noHtmlTags", {
    filter: (node) => {
      return node.nodeType === 1 && !["PRE", "CODE"].includes(node.nodeName);
    },
    replacement: (content) => content,
  });
  const dom = new JSDOM(html);
  return turndownService.turndown(dom.window.document.body);
}

async function getWebsiteMarkdown(url: string): Promise<string> {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (err) {
    throw new Error(`Failed to fetch URL: ${url}. Network error: ${err instanceof Error ? err.message : String(err)}`);
  }
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${url}. HTTP status: ${response.status} ${response.statusText}`);
  }
  let html: string;
  try {
    html = await response.text();
  } catch (err) {
    throw new Error(`Failed to read HTML from response: ${err instanceof Error ? err.message : String(err)}`);
  }
  let cleanedHtml: string;
  try {
    cleanedHtml = stripUnwantedTags(html);
  } catch (err) {
    throw new Error(`Failed to clean HTML: ${err instanceof Error ? err.message : String(err)}`);
  }
  let markdown: string;
  try {
    markdown = htmlToMarkdown(cleanedHtml);
  } catch (err) {
    throw new Error(`Failed to convert HTML to Markdown: ${err instanceof Error ? err.message : String(err)}`);
  }
  return markdown;
}

export const get_website = tool({
  description: "Fetch a web page and return its Markdown as a string.",
  args: {
    url: z.string().url().describe("The URL of the web page to fetch and convert"),
  },
  async execute({ url }) {
    return await getWebsiteMarkdown(url);
  },
});

export const website_to_file = tool({
  description: "Fetch a web page, convert to Markdown, and write to a file.",
  args: {
    url: z.string().url().describe("The URL of the web page to fetch and convert"),
    filename: z.string().min(1).describe("The output file path for the Markdown result"),
  },
  async execute({ url, filename }) {
    const md = await getWebsiteMarkdown(url);
    try {
      await Bun.write(filename, md);
    } catch (err) {
      if (err instanceof Error && err.message.includes('ENOENT')) {
        throw new Error(`Failed to write Markdown to file '${filename}': ENOENT: no such file or directory`);
      }
      throw new Error(`Failed to write Markdown to file '${filename}': ${err instanceof Error ? err.message : String(err)}`);
    }
    return `Markdown written to ${filename}`;
  },
});

export const get_webpage = tool({
  description: "Fetch a web page and return its Markdown as a string (alias for get_website).",
  args: {
    url: z.string().url().describe("The URL of the web page to fetch and convert"),
  },
  async execute({ url }) {
    return await getWebsiteMarkdown(url);
  },
});

// For direct import usage in tests or scripts
export { getWebsiteMarkdown };
