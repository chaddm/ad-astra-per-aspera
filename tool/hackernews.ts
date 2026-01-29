import { tool } from "@opencode-ai/plugin"

/**
 * Base URL for the Hacker News API
 */
const HN_API_BASE = "https://hacker-news.firebaseio.com/v0"

/**
 * Hacker News item types
 */
type HNItemType = "job" | "story" | "comment" | "poll" | "pollopt"

/**
 * Hacker News item structure
 */
interface HNItem {
  id: number
  deleted?: boolean
  type?: HNItemType
  by?: string
  time?: number
  text?: string
  dead?: boolean
  parent?: number
  poll?: number
  kids?: number[]
  url?: string
  score?: number
  title?: string
  parts?: number[]
  descendants?: number
}

/**
 * Fetch data from the Hacker News API
 * @param endpoint - API endpoint to fetch from
 * @returns Parsed JSON response or null on error
 */
const fetchFromHN = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const response = await fetch(`${HN_API_BASE}/${endpoint}`)
    if (!response.ok) return null
    return await response.json() as T
  } catch (error) {
    return null
  }
}

/**
 * Format a Hacker News item into a readable string
 * @param item - The HN item to format
 * @returns Formatted string representation of the item
 */
const formatHNItem = (item: HNItem): string => {
  if (!item || item.deleted || item.dead) {
    return "Item not available (deleted or dead)"
  }

  const parts: string[] = []
  
  if (item.title) {
    parts.push(`Title: ${item.title}`)
  }
  
  if (item.by) {
    parts.push(`By: ${item.by}`)
  }
  
  if (item.score !== undefined) {
    parts.push(`Score: ${item.score}`)
  }
  
  if (item.url) {
    parts.push(`URL: ${item.url}`)
  }
  
  if (item.text) {
    // Remove HTML tags for cleaner output
    const cleanText = item.text.replace(/<[^>]*>/g, "")
    parts.push(`Text: ${cleanText}`)
  }
  
  if (item.descendants !== undefined) {
    parts.push(`Comments: ${item.descendants}`)
  }
  
  if (item.time) {
    const date = new Date(item.time * 1000)
    parts.push(`Posted: ${date.toLocaleString()}`)
  }
  
  parts.push(`Type: ${item.type || "unknown"}`)
  parts.push(`ID: ${item.id}`)
  
  return parts.join("\n")
}

/**
 * Get top story IDs from Hacker News
 * @param limit - Maximum number of story IDs to return
 * @returns Array of story IDs
 */
export const getTopStoryIds = async (limit: number = 20): Promise<number[]> => {
  const ids = await fetchFromHN<number[]>("topstories.json")
  if (!ids) return []
  return ids.slice(0, limit)
}

/**
 * Get new story IDs from Hacker News
 * @param limit - Maximum number of story IDs to return
 * @returns Array of story IDs
 */
export const getNewStoryIds = async (limit: number = 20): Promise<number[]> => {
  const ids = await fetchFromHN<number[]>("newstories.json")
  if (!ids) return []
  return ids.slice(0, limit)
}

/**
 * Get best story IDs from Hacker News
 * @param limit - Maximum number of story IDs to return
 * @returns Array of story IDs
 */
export const getBestStoryIds = async (limit: number = 20): Promise<number[]> => {
  const ids = await fetchFromHN<number[]>("beststories.json")
  if (!ids) return []
  return ids.slice(0, limit)
}

/**
 * Get a Hacker News item by ID
 * @param id - The item ID to fetch
 * @returns The HN item or null if not found
 */
export const getItem = async (id: number): Promise<HNItem | null> => {
  return await fetchFromHN<HNItem>(`item/${id}.json`)
}

/**
 * Get a Hacker News user by username
 * @param username - The username to fetch
 * @returns User data or null if not found
 */
export const getUser = async (username: string): Promise<any | null> => {
  return await fetchFromHN<any>(`user/${username}.json`)
}

/**
 * Get top stories from Hacker News
 */
export const getTopStories = tool({
  description: "Get top stories from Hacker News",
  args: {
    limit: tool.schema.number()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Number of stories to fetch (1-100, default: 20)")
  },
  async execute(args) {
    const ids = await getTopStoryIds(args.limit)
    
    if (ids.length === 0) {
      return "Error: Unable to fetch top stories from Hacker News"
    }

    const stories = await Promise.all(
      ids.map(async (id) => {
        const item = await getItem(id)
        return item ? formatHNItem(item) : null
      })
    )

    const validStories = stories.filter((s): s is string => s !== null)
    
    if (validStories.length === 0) {
      return "Error: No valid stories found"
    }

    return `Top ${validStories.length} stories from Hacker News:\n\n${validStories.join("\n\n---\n\n")}`
  }
})

/**
 * Get new stories from Hacker News
 */
export const getNewStories = tool({
  description: "Get newest stories from Hacker News",
  args: {
    limit: tool.schema.number()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Number of stories to fetch (1-100, default: 20)")
  },
  async execute(args) {
    const ids = await getNewStoryIds(args.limit)
    
    if (ids.length === 0) {
      return "Error: Unable to fetch new stories from Hacker News"
    }

    const stories = await Promise.all(
      ids.map(async (id) => {
        const item = await getItem(id)
        return item ? formatHNItem(item) : null
      })
    )

    const validStories = stories.filter((s): s is string => s !== null)
    
    if (validStories.length === 0) {
      return "Error: No valid stories found"
    }

    return `New ${validStories.length} stories from Hacker News:\n\n${validStories.join("\n\n---\n\n")}`
  }
})

/**
 * Get best stories from Hacker News
 */
export const getBestStories = tool({
  description: "Get best stories from Hacker News",
  args: {
    limit: tool.schema.number()
      .min(1)
      .max(100)
      .optional()
      .default(20)
      .describe("Number of stories to fetch (1-100, default: 20)")
  },
  async execute(args) {
    const ids = await getBestStoryIds(args.limit)
    
    if (ids.length === 0) {
      return "Error: Unable to fetch best stories from Hacker News"
    }

    const stories = await Promise.all(
      ids.map(async (id) => {
        const item = await getItem(id)
        return item ? formatHNItem(item) : null
      })
    )

    const validStories = stories.filter((s): s is string => s !== null)
    
    if (validStories.length === 0) {
      return "Error: No valid stories found"
    }

    return `Best ${validStories.length} stories from Hacker News:\n\n${validStories.join("\n\n---\n\n")}`
  }
})

/**
 * Get a specific Hacker News item by ID
 */
export const getItemById = tool({
  description: "Get a specific Hacker News item (story, comment, poll, etc.) by its ID",
  args: {
    id: tool.schema.number()
      .min(1)
      .describe("The Hacker News item ID")
  },
  async execute(args) {
    const item = await getItem(args.id)
    
    if (!item) {
      return `Error: Item with ID ${args.id} not found`
    }

    return formatHNItem(item)
  }
})

/**
 * Get user information from Hacker News
 */
export const getUserInfo = tool({
  description: "Get information about a Hacker News user by username",
  args: {
    username: tool.schema.string()
      .min(1)
      .describe("The Hacker News username")
  },
  async execute(args) {
    const user = await getUser(args.username)
    
    if (!user) {
      return `Error: User '${args.username}' not found`
    }

    const parts: string[] = []
    
    parts.push(`Username: ${user.id}`)
    
    if (user.created) {
      const date = new Date(user.created * 1000)
      parts.push(`Created: ${date.toLocaleString()}`)
    }
    
    if (user.karma !== undefined) {
      parts.push(`Karma: ${user.karma}`)
    }
    
    if (user.about) {
      const cleanAbout = user.about.replace(/<[^>]*>/g, "")
      parts.push(`About: ${cleanAbout}`)
    }
    
    if (user.submitted && Array.isArray(user.submitted)) {
      parts.push(`Submissions: ${user.submitted.length}`)
    }

    return parts.join("\n")
  }
})

/**
 * Default export: Get top stories (most common use case)
 */
export default getTopStories
