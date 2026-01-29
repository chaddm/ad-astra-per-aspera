# Hacker News API Guide

## Overview

The official Hacker News API provides near real-time access to Hacker News data
through Firebase. This guide covers all available endpoints, data structures,
parameters, and usage examples.

**API Base URL**: `https://hacker-news.firebaseio.com/v0/`

**Key Features**:

- No authentication required (public API)
- No rate limiting
- Real-time data with Firebase support
- RESTful JSON endpoints
- Change notifications support (via Firebase client libraries)

**Contact**: Report bugs to [api@ycombinator.com](mailto:api@ycombinator.com)

---

## URI and Versioning

The current API version is `v0` with URIs prefixed with:

```
https://hacker-news.firebaseio.com/v0/
```

### Versioning Policy

- Only removal of non-optional fields or alteration of existing fields will be
  considered incompatible changes
- **Clients should gracefully handle additional fields** they don't expect and simply
  ignore them
- Future versions may add new fields without a version bump

### Response Format

All responses are in JSON format. You can add `?print=pretty` to any URL for
pretty-printed output:

```
https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty
```

---

## Data Structures

### Items

Stories, comments, jobs, Ask HNs, and polls are all "items" with unique integer IDs.

**Endpoint**: `/v0/item/<id>.json`

**Example**: https://hacker-news.firebaseio.com/v0/item/8863.json

#### Item Fields

| Field         | Type           | Required | Description                                                       |
| ------------- | -------------- | -------- | ----------------------------------------------------------------- |
| `id`          | integer        | **Yes**  | The item's unique id                                              |
| `deleted`     | boolean        | No       | `true` if the item is deleted                                     |
| `type`        | string         | No       | One of: `"job"`, `"story"`, `"comment"`, `"poll"`, or `"pollopt"` |
| `by`          | string         | No       | Username of the item's author                                     |
| `time`        | integer        | No       | Creation date (Unix timestamp in seconds)                         |
| `text`        | string         | No       | The comment, story, or poll text (HTML format)                    |
| `dead`        | boolean        | No       | `true` if the item is dead                                        |
| `parent`      | integer        | No       | The comment's parent (another comment or story ID)                |
| `poll`        | integer        | No       | The pollopt's associated poll ID                                  |
| `kids`        | array[integer] | No       | IDs of item's comments, in ranked display order                   |
| `url`         | string         | No       | The URL of the story                                              |
| `score`       | integer        | No       | The story's score, or votes for a pollopt                         |
| `title`       | string         | No       | The title of the story, poll, or job (HTML format)                |
| `parts`       | array[integer] | No       | List of related pollopts, in display order                        |
| `descendants` | integer        | No       | Total comment count (for stories or polls)                        |

#### Item Types

##### Story Example

```json
{
  "by": "dhouston",
  "descendants": 71,
  "id": 8863,
  "kids": [8952, 9224, 8917, 8884, 8887, 8943, 8869, 8958, 9005, 9671],
  "score": 111,
  "time": 1175714200,
  "title": "My YC app: Dropbox - Throw away your USB drive",
  "type": "story",
  "url": "http://www.getdropbox.com/u/2/screencast.html"
}
```

##### Comment Example

```json
{
  "by": "norvig",
  "id": 2921983,
  "kids": [2922097, 2922429, 2924562, 2922709, 2922573],
  "parent": 2921506,
  "text": "Aw shucks, guys ... you make me blush with your compliments.<p>Tell you what, Ill make a deal: I'll keep writing if you keep reading. K?",
  "time": 1314211127,
  "type": "comment"
}
```

##### Ask HN Example

```json
{
  "by": "tel",
  "descendants": 16,
  "id": 121003,
  "kids": [121016, 121109, 121168],
  "score": 25,
  "text": "<i>or</i> HN: the Next Iteration<p>I get the impression...",
  "time": 1203647620,
  "title": "Ask HN: The Arc Effect",
  "type": "story"
}
```

##### Job Example

```json
{
  "by": "justin",
  "id": 192327,
  "score": 6,
  "text": "Justin.tv is the biggest live video site online...",
  "time": 1210981217,
  "title": "Justin.tv is looking for a Lead Flash Engineer!",
  "type": "job",
  "url": ""
}
```

##### Poll Example

```json
{
  "by": "pg",
  "descendants": 54,
  "id": 126809,
  "kids": [126822, 126823, 126993, 126824],
  "parts": [126810, 126811, 126812],
  "score": 46,
  "text": "",
  "time": 1204403652,
  "title": "Poll: What would happen if News.YC had explicit support for polls?",
  "type": "poll"
}
```

##### Poll Option Example

```json
{
  "by": "pg",
  "id": 160705,
  "poll": 160704,
  "score": 335,
  "text": "Yes, ban them; I'm tired of seeing Valleywag stories on News.YC.",
  "time": 1207886576,
  "type": "pollopt"
}
```

---

### Users

Users are identified by case-sensitive usernames.

**Endpoint**: `/v0/user/<username>.json`

**Example**: https://hacker-news.firebaseio.com/v0/user/jl.json

**Note**: Only users with public activity (comments or story submissions) are
available through the API.

#### User Fields

| Field       | Type           | Required | Description                                            |
| ----------- | -------------- | -------- | ------------------------------------------------------ |
| `id`        | string         | **Yes**  | The user's unique username (case-sensitive)            |
| `created`   | integer        | **Yes**  | Account creation date (Unix timestamp)                 |
| `karma`     | integer        | **Yes**  | The user's karma score                                 |
| `about`     | string         | No       | User's self-description (HTML format)                  |
| `submitted` | array[integer] | No       | List of user's stories, polls, and comments (item IDs) |

#### User Example

```json
{
  "about": "This is a test",
  "created": 1173923446,
  "id": "jl",
  "karma": 2937,
  "submitted": [8265435, 8168423, 8090946, 8090326, 7699907, ...]
}
```

---

## API Endpoints

### Item Endpoints

#### Get Item by ID

**Endpoint**: `GET /v0/item/<id>.json`

**Parameters**:

- `id` (in URL): Item ID (integer)

**Returns**: Item object or `null` if not found

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/item/8863.json
```

---

### User Endpoints

#### Get User by Username

**Endpoint**: `GET /v0/user/<username>.json`

**Parameters**:

- `username` (in URL): Username (case-sensitive string)

**Returns**: User object or `null` if not found

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/user/jl.json
```

---

### Story List Endpoints

#### Top Stories

**Endpoint**: `GET /v0/topstories.json`

**Parameters**: None

**Returns**: Array of up to 500 top story IDs (includes jobs)

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/topstories.json
```

**Response**:

```json
[9129911, 9129199, 9127761, 9128141, 9128264, ...]
```

---

#### New Stories

**Endpoint**: `GET /v0/newstories.json`

**Parameters**: None

**Returns**: Array of up to 500 newest story IDs

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/newstories.json
```

---

#### Best Stories

**Endpoint**: `GET /v0/beststories.json`

**Parameters**: None

**Returns**: Array of up to 500 best story IDs

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/beststories.json
```

---

#### Ask HN Stories

**Endpoint**: `GET /v0/askstories.json`

**Parameters**: None

**Returns**: Array of up to 200 latest Ask HN story IDs

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/askstories.json
```

---

#### Show HN Stories

**Endpoint**: `GET /v0/showstories.json`

**Parameters**: None

**Returns**: Array of up to 200 latest Show HN story IDs

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/showstories.json
```

---

#### Job Stories

**Endpoint**: `GET /v0/jobstories.json`

**Parameters**: None

**Returns**: Array of up to 200 latest job story IDs

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/jobstories.json
```

---

### Live Data Endpoints

#### Max Item ID

**Endpoint**: `GET /v0/maxitem.json`

**Parameters**: None

**Returns**: Integer representing the current largest item ID

**Usage**: Walk backward from this ID to discover all items

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/maxitem.json
```

**Response**:

```json
9130260
```

---

#### Changed Items and Profiles

**Endpoint**: `GET /v0/updates.json`

**Parameters**: None

**Returns**: Object with `items` and `profiles` arrays containing IDs/usernames that
have changed

**Usage**: Monitor for real-time updates

**Example**:

```bash
curl https://hacker-news.firebaseio.com/v0/updates.json
```

**Response**:

```json
{
  "items": [8423305, 8420805, 8423379, 8422504, ...],
  "profiles": ["thefox", "mdda", "plinkplonk", "GBond", ...]
}
```

---

## Common Usage Patterns

### Getting Top Stories with Details

1. Fetch the top story IDs:

```bash
curl https://hacker-news.firebaseio.com/v0/topstories.json
```

2. For each ID, fetch the item details:

```bash
curl https://hacker-news.firebaseio.com/v0/item/9129911.json
```

**JavaScript Example**:

```javascript
// Get top 10 stories
const response = await fetch(
  "https://hacker-news.firebaseio.com/v0/topstories.json"
);
const storyIds = await response.json();
const top10Ids = storyIds.slice(0, 10);

// Fetch story details
const stories = await Promise.all(
  top10Ids.map(async (id) => {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    return res.json();
  })
);
```

---

### Counting Total Comments

To get the total number of comments on an article, use the `descendants` field:

```javascript
const response = await fetch("https://hacker-news.firebaseio.com/v0/item/8863.json");
const story = await response.json();
console.log(`Total comments: ${story.descendants}`);
```

---

### Traversing Comment Trees

To get all comments for a story:

1. Fetch the story to get the `kids` array (top-level comment IDs)
2. For each comment ID, fetch the comment
3. Recursively fetch child comments using each comment's `kids` array

**JavaScript Example**:

```javascript
async function fetchComments(itemId) {
  const response = await fetch(
    `https://hacker-news.firebaseio.com/v0/item/${itemId}.json`
  );
  const item = await response.json();

  if (!item || !item.kids) return item;

  // Recursively fetch child comments
  item.comments = await Promise.all(item.kids.map((kidId) => fetchComments(kidId)));

  return item;
}

// Usage
const storyWithComments = await fetchComments(8863);
```

---

### Getting User Submissions

1. Fetch the user:

```bash
curl https://hacker-news.firebaseio.com/v0/user/jl.json
```

2. The `submitted` array contains all item IDs the user has submitted
3. Fetch each item to get details

**JavaScript Example**:

```javascript
const response = await fetch("https://hacker-news.firebaseio.com/v0/user/jl.json");
const user = await response.json();

// Get latest 10 submissions
const latest10Ids = user.submitted.slice(0, 10);
const submissions = await Promise.all(
  latest10Ids.map(async (id) => {
    const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
    return res.json();
  })
);
```

---

### Monitoring for New Items

Use the `maxitem` endpoint to discover new items:

```javascript
let lastMaxId = null;

async function checkForNewItems() {
  const response = await fetch("https://hacker-news.firebaseio.com/v0/maxitem.json");
  const currentMaxId = await response.json();

  if (lastMaxId === null) {
    lastMaxId = currentMaxId;
    return;
  }

  // Fetch all new items
  const newIds = [];
  for (let id = lastMaxId + 1; id <= currentMaxId; id++) {
    newIds.push(id);
  }

  const newItems = await Promise.all(
    newIds.map(async (id) => {
      const res = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`
      );
      return res.json();
    })
  );

  lastMaxId = currentMaxId;
  return newItems.filter((item) => item !== null);
}

// Poll every 60 seconds
setInterval(checkForNewItems, 60000);
```

---

### Using the Updates Endpoint

Monitor changes to items and profiles:

```javascript
async function getUpdates() {
  const response = await fetch("https://hacker-news.firebaseio.com/v0/updates.json");
  const updates = await response.json();

  console.log(`${updates.items.length} items updated`);
  console.log(`${updates.profiles.length} profiles updated`);

  return updates;
}
```

---

## Data Considerations

### HTML Content

The `text`, `title`, and `about` fields contain HTML markup. Common patterns:

- `<p>` for paragraphs
- `<i>` and `<b>` for emphasis
- `<a href="...">` for links
- Newlines are represented as `<p>` tags

**HTML Stripping Example**:

```javascript
function stripHtml(html) {
  return html.replace(/<[^>]*>/g, "");
}
```

---

### Unix Timestamps

All timestamps are in Unix time (seconds since epoch), not milliseconds:

```javascript
// Convert to JavaScript Date
const date = new Date(item.time * 1000);
console.log(date.toLocaleString());
```

---

### Deleted and Dead Items

Items may be marked as `deleted` or `dead`:

```javascript
function isValidItem(item) {
  return item && !item.deleted && !item.dead;
}
```

---

### Case-Sensitive Usernames

Usernames are case-sensitive. `"jl"` and `"JL"` are different users.

---

## API Design Notes

The HN API is essentially a dump of internal data structures:

- **No aggregations**: To count comments, traverse the tree
- **No filtering**: You must fetch items and filter client-side
- **Denormalized**: Story lists return IDs only; you must fetch each item
- **Walking backward**: The newest page walks backward from `maxitem`, keeping only
  top-level stories

This design is intentional and reflects how HN works internally.

---

## Firebase Client Libraries

For real-time updates and efficient networking, use Firebase client libraries:

- [Android](https://firebase.google.com/docs/android/setup)
- [iOS](https://firebase.google.com/docs/ios/setup)
- [Web](https://firebase.google.com/docs/web/setup)
- [Servers](https://firebase.google.com/docs/server/setup)

Firebase libraries provide:

- Change notifications
- Efficient networking
- Automatic reconnection
- Event-based updates

**Web Example with Firebase**:

```javascript
import { getDatabase, ref, onValue } from "firebase/database";

const db = getDatabase();
const topStoriesRef = ref(db, "v0/topstories");

onValue(topStoriesRef, (snapshot) => {
  const storyIds = snapshot.val();
  console.log("Top stories updated:", storyIds);
});
```

---

## Rate Limiting

**There is currently no rate limit** on the API. However, be respectful:

- Cache responses when possible
- Use conditional requests if implementing a client
- Don't hammer the API unnecessarily
- Consider using Firebase libraries for efficient updates

---

## Best Practices

### 1. Batch Requests

Fetch multiple items concurrently:

```javascript
await Promise.all(ids.map((id) => fetchItem(id)));
```

### 2. Handle Null Responses

Items may return `null` if deleted or non-existent:

```javascript
const item = await fetchItem(id);
if (!item) {
  console.log("Item not found");
  return;
}
```

### 3. Filter Invalid Items

Check for deleted/dead items:

```javascript
const validItems = items.filter((item) => item && !item.deleted && !item.dead);
```

### 4. Use Pagination

Don't fetch all 500 stories at once; paginate client-side:

```javascript
const storyIds = await fetchTopStories();
const page1 = storyIds.slice(0, 30);
const page2 = storyIds.slice(30, 60);
```

### 5. Cache Aggressively

Stories and comments rarely change after posting. Cache them:

```javascript
const cache = new Map();

async function fetchItemCached(id) {
  if (cache.has(id)) return cache.get(id);

  const item = await fetchItem(id);
  cache.set(id, item);
  return item;
}
```

### 6. Handle Errors Gracefully

Network errors happen; retry or skip gracefully:

```javascript
async function fetchItemSafe(id) {
  try {
    const response = await fetch(
      `https://hacker-news.firebaseio.com/v0/item/${id}.json`
    );
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch item ${id}:`, error);
    return null;
  }
}
```

---

## Complete Endpoint Reference

| Endpoint                   | Method | Returns                 | Description                         |
| -------------------------- | ------ | ----------------------- | ----------------------------------- |
| `/v0/item/<id>.json`       | GET    | Item object or null     | Get a specific item by ID           |
| `/v0/user/<username>.json` | GET    | User object or null     | Get a user by username              |
| `/v0/maxitem.json`         | GET    | Integer                 | Current largest item ID             |
| `/v0/topstories.json`      | GET    | Array[integer]          | Up to 500 top story IDs             |
| `/v0/newstories.json`      | GET    | Array[integer]          | Up to 500 new story IDs             |
| `/v0/beststories.json`     | GET    | Array[integer]          | Up to 500 best story IDs            |
| `/v0/askstories.json`      | GET    | Array[integer]          | Up to 200 Ask HN story IDs          |
| `/v0/showstories.json`     | GET    | Array[integer]          | Up to 200 Show HN story IDs         |
| `/v0/jobstories.json`      | GET    | Array[integer]          | Up to 200 job story IDs             |
| `/v0/updates.json`         | GET    | Object{items, profiles} | Recently changed items and profiles |

---

## Additional Resources

- **Official API Repository**: https://github.com/HackerNews/API
- **Firebase Documentation**: https://firebase.google.com/docs
- **Hacker News**: https://news.ycombinator.com
- **Contact**: api@ycombinator.com

---

## License

The Hacker News API is provided by Y Combinator and Firebase. This guide is for
educational purposes.
