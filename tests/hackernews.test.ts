import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test"
import { 
  getTopStoryIds, 
  getNewStoryIds, 
  getBestStoryIds, 
  getItem, 
  getUser 
} from "../tool/hackernews"

// Mock fetch for testing
const createMockFetch = () => {
  return mock((url: string) => {
    // Mock top stories
    if (url.includes("topstories.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => Array.from({length: 25}, (_,i) => i+1) // 25 items for ample coverage
      })
    }
    
    // Mock new stories
    if (url.includes("newstories.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => Array.from({length: 25}, (_,i) => 100+i) // 25 items
      })
    }
    
    // Mock best stories
    if (url.includes("beststories.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => Array.from({length: 25}, (_,i) => 200+i) // 25 items
      })
    }
    
    // Mock item by ID
    if (url.includes("item/1.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 1,
          type: "story",
          by: "testuser",
          time: 1704067200,
          title: "Test Story Title",
          url: "https://example.com",
          score: 100,
          descendants: 50
        })
      })
    }
    
    // Mock deleted item
    if (url.includes("item/999.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 999,
          deleted: true
        })
      })
    }
    
    // Mock dead item
    if (url.includes("item/998.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 998,
          dead: true
        })
      })
    }
    
    // Mock comment item
    if (url.includes("item/500.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: 500,
          type: "comment",
          by: "commenter",
          time: 1704070800,
          text: "<p>This is a test comment with <b>HTML</b> tags.</p>",
          parent: 1
        })
      })
    }
    
    // Mock user
    if (url.includes("user/testuser.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => ({
          id: "testuser",
          created: 1577836800,
          karma: 5000,
          about: "<p>Test user bio with <i>HTML</i></p>",
          submitted: [1, 2, 3, 4, 5]
        })
      })
    }
    
    // Mock non-existent user
    if (url.includes("user/nonexistent.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => null
      })
    }
    
    // Mock non-existent item
    if (url.includes("item/99999.json")) {
      return Promise.resolve({
        ok: true,
        json: async () => null
      })
    }
    
    // Default: not found
    return Promise.resolve({
      ok: false,
      json: async () => null
    })
  })
}

describe("hackernews - getTopStoryIds", () => {
  let originalFetch: typeof global.fetch
  
  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = createMockFetch() as any
  })
  
  afterEach(() => {
    global.fetch = originalFetch
  })
  
  it("returns an array of story IDs", async () => {
    const ids = await getTopStoryIds()
    expect(Array.isArray(ids)).toBe(true)
    expect(ids.length).toBe(20)
    expect(ids[0]).toBe(1)
  })
  
  it("respects the limit parameter", async () => {
    const ids = await getTopStoryIds(5)
    expect(ids.length).toBe(5)
  })
  
  it("returns empty array on fetch failure", async () => {
    global.fetch = mock(() => Promise.resolve({ ok: false, json: async () => null })) as any
    const ids = await getTopStoryIds()
    expect(ids).toEqual([])
  })
  
  it("handles maximum limit correctly", async () => {
    const ids = await getTopStoryIds(15)
    expect(ids.length).toBe(15)
  })
})

describe("hackernews - getNewStoryIds", () => {
  let originalFetch: typeof global.fetch
  
  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = createMockFetch() as any
  })
  
  afterEach(() => {
    global.fetch = originalFetch
  })
  
  it("returns an array of new story IDs", async () => {
    const ids = await getNewStoryIds()
    expect(Array.isArray(ids)).toBe(true)
    expect(ids.length).toBe(20)
    expect(ids[0]).toBe(100)
  })
  
  it("respects the limit parameter", async () => {
    const ids = await getNewStoryIds(3)
    expect(ids.length).toBe(3)
  })
  
  it("returns empty array on fetch failure", async () => {
    global.fetch = mock(() => Promise.resolve({ ok: false, json: async () => null })) as any
    const ids = await getNewStoryIds()
    expect(ids).toEqual([])
  })
})

describe("hackernews - getBestStoryIds", () => {
  let originalFetch: typeof global.fetch
  
  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = createMockFetch() as any
  })
  
  afterEach(() => {
    global.fetch = originalFetch
  })
  
  it("returns an array of best story IDs", async () => {
    const ids = await getBestStoryIds()
    expect(Array.isArray(ids)).toBe(true)
    expect(ids.length).toBe(20)
    expect(ids[0]).toBe(200)
  })
  
  it("respects the limit parameter", async () => {
    const ids = await getBestStoryIds(7)
    expect(ids.length).toBe(7)
  })
})

describe("hackernews - getItem", () => {
  let originalFetch: typeof global.fetch
  
  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = createMockFetch() as any
  })
  
  afterEach(() => {
    global.fetch = originalFetch
  })
  
  it("returns a story item by ID", async () => {
    const item = await getItem(1)
    expect(item).not.toBeNull()
    expect(item?.id).toBe(1)
    expect(item?.type).toBe("story")
    expect(item?.title).toBe("Test Story Title")
  })
  
  it("returns null for non-existent item", async () => {
    const item = await getItem(99999)
    expect(item).toBeNull()
  })
  
  it("returns deleted item with deleted flag", async () => {
    const item = await getItem(999)
    expect(item?.deleted).toBe(true)
  })
  
  it("returns dead item with dead flag", async () => {
    const item = await getItem(998)
    expect(item?.dead).toBe(true)
  })
  
  it("returns comment item with text field", async () => {
    const item = await getItem(500)
    expect(item?.type).toBe("comment")
    expect(item?.text).toContain("HTML")
  })
  
  it("handles fetch errors gracefully", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network error"))) as any
    const item = await getItem(1)
    expect(item).toBeNull()
  })
})

describe("hackernews - getUser", () => {
  let originalFetch: typeof global.fetch
  
  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = createMockFetch() as any
  })
  
  afterEach(() => {
    global.fetch = originalFetch
  })
  
  it("returns user information by username", async () => {
    const user = await getUser("testuser")
    expect(user).not.toBeNull()
    expect(user?.id).toBe("testuser")
    expect(user?.karma).toBe(5000)
  })
  
  it("returns null for non-existent user", async () => {
    const user = await getUser("nonexistent")
    expect(user).toBeNull()
  })
  
  it("includes user submission count", async () => {
    const user = await getUser("testuser")
    expect(user?.submitted).toBeDefined()
    expect(Array.isArray(user?.submitted)).toBe(true)
    expect(user?.submitted.length).toBe(5)
  })
  
  it("includes user creation timestamp", async () => {
    const user = await getUser("testuser")
    expect(user?.created).toBe(1577836800)
  })
  
  it("includes user about text with HTML", async () => {
    const user = await getUser("testuser")
    expect(user?.about).toContain("HTML")
  })
  
  it("handles fetch errors gracefully", async () => {
    global.fetch = mock(() => Promise.reject(new Error("Network error"))) as any
    const user = await getUser("testuser")
    expect(user).toBeNull()
  })
})

describe("hackernews - integration tests", () => {
  let originalFetch: typeof global.fetch
  
  beforeEach(() => {
    originalFetch = global.fetch
    global.fetch = createMockFetch() as any
  })
  
  afterEach(() => {
    global.fetch = originalFetch
  })
  
  it("fetches multiple items concurrently", async () => {
    const ids = [1, 500]
    const items = await Promise.all(ids.map(id => getItem(id)))
    
    expect(items.length).toBe(2)
    expect(items[0]?.type).toBe("story")
    expect(items[1]?.type).toBe("comment")
  })
  
  it("handles mixed valid and invalid IDs", async () => {
    const ids = [1, 99999, 500]
    const items = await Promise.all(ids.map(id => getItem(id)))
    
    expect(items.length).toBe(3)
    expect(items[0]).not.toBeNull()
    expect(items[1]).toBeNull()
    expect(items[2]).not.toBeNull()
  })
  
  it("filters out deleted and dead items", async () => {
    const ids = [1, 999, 998, 500]
    const items = await Promise.all(ids.map(id => getItem(id)))
    
    const validItems = items.filter(item => 
      item && !item.deleted && !item.dead
    )
    
    expect(validItems.length).toBe(2)
  })
})
