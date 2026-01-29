# Hacker News Tool Specification

## Overview

The Hacker News tool provides utilities to access the official Hacker News API (Firebase API v0) to retrieve stories, items, and user information. It is designed to be used as a plugin/tool in the OpenCode ecosystem, but the requirements are language-agnostic and can be implemented in any environment.

## Purpose

To supply users with:

- Top, new, and best stories from Hacker News
- Individual item details (stories, comments, polls, etc.) by ID
- User information and statistics by username
- Clean, formatted output with HTML tags removed for readability

## Requirements

### Functional Requirements

1. **Top Stories**: The tool must fetch and return the top stories currently on Hacker News.
2. **New Stories**: The tool must fetch and return the newest stories on Hacker News.
3. **Best Stories**: The tool must fetch and return the best stories on Hacker News.
4. **Item by ID**: The tool must fetch and return a specific item (story, comment, poll, etc.) by its numeric ID.
5. **User Information**: The tool must fetch and return user profile information by username.
6. **Configurable Limit**: Story fetching functions must accept an optional limit parameter (1-100) to control how many items are returned, with a default of 20.
7. **Formatted Output**: All outputs must be human-readable strings with:
   - HTML tags stripped from text content
   - Clear field labels (Title, By, Score, URL, etc.)
   - Proper date/time formatting
   - Separator lines between multiple items
8. **Error Handling**: The tool must handle:
   - API failures gracefully
   - Invalid item IDs
   - Non-existent usernames
   - Network errors
   - Deleted or dead items

### Non-Functional Requirements

1. **Language Independence**: The specification must be implementable in any programming language.
2. **API Compatibility**: The tool must use the official Hacker News Firebase API v0.
3. **No External Dependencies**: Beyond standard HTTP/fetch capabilities, no special libraries are required.
4. **Readability**: Output strings must be easily readable and suitable for display to end users.
5. **Performance**: Multiple items should be fetched concurrently when possible to improve performance.

## API Endpoints

The tool uses the following Hacker News API endpoints:

- `https://hacker-news.firebaseio.com/v0/topstories.json` - Array of top story IDs
- `https://hacker-news.firebaseio.com/v0/newstories.json` - Array of new story IDs
- `https://hacker-news.firebaseio.com/v0/beststories.json` - Array of best story IDs
- `https://hacker-news.firebaseio.com/v0/item/{id}.json` - Item details by ID
- `https://hacker-news.firebaseio.com/v0/user/{username}.json` - User profile by username

## Data Structures

### HN Item
Items can be stories, comments, jobs, polls, or poll options. Common fields include:

- `id` (number): The item's unique ID
- `deleted` (boolean): Whether the item is deleted
- `type` (string): One of "job", "story", "comment", "poll", or "pollopt"
- `by` (string): Username of the item's author
- `time` (number): Unix timestamp of item creation
- `text` (string): HTML content (for comments, poll text, etc.)
- `dead` (boolean): Whether the item is dead
- `parent` (number): Parent item ID (for comments)
- `kids` (array of numbers): IDs of item's comments (in ranked order)
- `url` (string): URL of the story
- `score` (number): Story score
- `title` (string): Story title
- `descendants` (number): Total comment count

### HN User
User profiles contain:

- `id` (string): Username (case-sensitive)
- `created` (number): Unix timestamp of account creation
- `karma` (number): User's karma
- `about` (string): User's self-description (HTML)
- `submitted` (array of numbers): List of submitted item IDs

## Acceptance Criteria

### Top Stories Tool
- [ ] Fetches top story IDs from the API
- [ ] Accepts optional `limit` parameter (1-100, default 20)
- [ ] Returns formatted stories with title, author, score, URL, comments, and timestamp
- [ ] Handles API failures with clear error messages
- [ ] Filters out deleted/dead items
- [ ] Separates multiple stories with visual dividers

### New Stories Tool
- [ ] Fetches new story IDs from the API
- [ ] Accepts optional `limit` parameter (1-100, default 20)
- [ ] Returns formatted stories identical to top stories format
- [ ] Handles API failures with clear error messages
- [ ] Filters out deleted/dead items

### Best Stories Tool
- [ ] Fetches best story IDs from the API
- [ ] Accepts optional `limit` parameter (1-100, default 20)
- [ ] Returns formatted stories identical to top stories format
- [ ] Handles API failures with clear error messages
- [ ] Filters out deleted/dead items

### Get Item by ID Tool
- [ ] Accepts a numeric ID parameter
- [ ] Fetches item details from the API
- [ ] Returns formatted item data appropriate to item type
- [ ] Handles invalid IDs with clear error messages
- [ ] Handles deleted/dead items appropriately
- [ ] Strips HTML tags from text content

### Get User Info Tool
- [ ] Accepts a username string parameter
- [ ] Fetches user profile from the API
- [ ] Returns formatted user information including username, creation date, karma, and about text
- [ ] Handles non-existent usernames with clear error messages
- [ ] Strips HTML tags from about text
- [ ] Shows submission count if available

## Example Outputs

### Top Stories (limit: 2)
```
Top 20 stories from Hacker News:

Title: Example Story Title
By: username123
Score: 542
URL: https://example.com/article
Comments: 187
Posted: 1/18/2026, 3:45:22 PM
Type: story
ID: 12345678

---

Title: Another Great Article
By: hacker_news_fan
Score: 421
Comments: 93
Posted: 1/18/2026, 2:30:15 PM
Type: story
ID: 12345679
```

### Get Item by ID
```
Title: Ask HN: What are you working on?
By: dang
Score: 234
Comments: 156
Posted: 1/18/2026, 1:15:00 PM
Type: story
ID: 12345680
```

### Get User Info
```
Username: pg
Created: 2/19/2007, 6:01:00 PM
Karma: 155040
About: Founder of Y Combinator, writer, and programmer.
Submissions: 2847
```

### Error Cases
```
Error: Unable to fetch top stories from Hacker News
Error: Item with ID 99999999999 not found
Error: User 'nonexistentuser12345' not found
Error: No valid stories found
```

## Out of Scope

- Searching Hacker News (not supported by the official API)
- Posting stories or comments (read-only API)
- Authentication (public API, no auth required)
- Real-time updates or webhooks
- Caching or rate limiting (implementation-specific concerns)
- Ask HN, Show HN, or Job story filtering (can be implemented later if needed)

## Notes

- The Hacker News API is public and does not require authentication
- The API returns data in JSON format
- Item IDs are sequential and permanent
- The API documentation is available at: https://github.com/HackerNews/API
- All times are Unix timestamps (seconds since epoch)
- HTML content should be stripped for cleaner display in terminal environments