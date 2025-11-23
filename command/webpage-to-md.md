# Instructions for converting a Webpage to Markdown

You will be given directory path to a Markdown file and the URL of a webpage. Your
task is to fetch the content of the webpage and convert it into proper Markdown
format. Use appropriate Markdown syntax for headings, lists, links, images, code
blocks, etc. Once converted, write the Markdown content to the specified file path.

Delegate to @general agent with the following instructions:

1. Purpose to create a markdown file at `<FILE_PATH>` from `<url>`.
2. Delegate to @web-fetch agent to fetch `<URL>` and convert its content to Markdown
   format.
3. Remove any HTML tags from the content and ensure it is in proper Markdown syntax.
   Remove HTML tags from codeblocks unless the codeblock is HTML code.
4. Write the converted Markdown content to `<FILE_PATH>`. Create file if it does not
   exist.
