# Mobile API Documentation

This document describes the API endpoints that the Brief Harmony client should use to fetch news content from the NewsNow service.

## Overview

The NewsNow service provides a simple REST API for fetching news content from various sources. The API supports caching, rate limiting, and returns structured news data that can be easily consumed by mobile clients.

## Base URL

**Development**: `http://localhost:5173/api` (when running `pnpm dev`)
**Production**: `https://your-domain.com/api`

## Main Endpoint: `/api/s`

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | `SourceID` | Yes | The identifier of the news source |
| `latest` | boolean | No | When set to any value except "false", forces a fresh fetch if user is authenticated |

### Example Request

```bash
# Basic request (will use cache if available)
curl "https://your-domain.com/api/s?id=hackernews"

# Force latest content (requires authentication)
curl "https://your-domain.com/api/s?id=hackernews&latest=true"
```

### Response Format

```json
{
  "status": "success" | "cache",
  "id": "hackernews",
  "updatedTime": 1712345678901,
  "items": [
    {
      "id": "12345",
      "title": "Example News Title",
      "url": "https://example.com/news/12345",
      "mobileUrl": "https://m.example.com/news/12345",
      "pubDate": 1712345678000,
      "extra": {
        "hover": "Optional hover text",
        "date": "2024-04-05",
        "info": "Additional info",
        "diff": 42,
        "icon": {
          "url": "https://example.com/icon.png",
          "scale": 1.5
        }
      }
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | `"success" | "cache"` | `"success"` = fresh data, `"cache"` = cached data |
| `id` | `SourceID` | The source identifier |
| `updatedTime` | number | Unix timestamp of when the data was fetched |
| `items` | `NewsItem[]` | Array of news items |

### NewsItem Fields (Required for Harmony Client)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | ✓ | News headline/title |
| `url` | string | ✓ | Link to the full article |
| `mobileUrl` | string | - | Mobile-optimized link (fallback to `url`) |
| `pubDate` | number \| string | ✓ | Publication timestamp |
| `id` | string \| number | ✓ | Unique identifier for the item |

## Batch Endpoint: `/api/s/entire` (POST)

Fetches cached data for multiple sources in a single request.

### Request Body

```json
{
  "sources": ["hackernews", "github-trending-today", "v2ex-share"]
}
```

### Response Format

```json
[
  {
    "status": "cache",
    "id": "hackernews",
    "updatedTime": 1712345678901,
    "items": [...]
  },
  {
    "status": "cache",
    "id": "github-trending-today",
    "updatedTime": 1712345678901,
    "items": [...]
  }
]
```

## Cache Behavior

### TTL (Time To Live)
- **Default TTL**: 30 minutes (1,800,000 ms)
- Cache is considered stale after TTL expires
- Stale cache is still served if fresh fetch fails

### Source-specific Intervals
Each source has a configured refresh interval (minimum 2 minutes):
- **Realtime sources**: 2-5 minutes (e.g., financial news)
- **Hot topics**: 10 minutes (e.g., social media trends)
- **Static sources**: 30-60 minutes (e.g., RSS feeds)

### Cache Logic
1. **Fresh cache (< interval)**: Always served, regardless of `latest` parameter
2. **Stale cache (< TTL)**: Served unless `latest=true` and user is authenticated
3. **Expired cache (> TTL)**: Fresh fetch attempted, stale cache served on failure

## Available Sources

### Technology Sources

| SourceID | Name | Type | Interval | Description |
|----------|------|------|----------|-------------|
| `hackernews` | Hacker News | hottest | 10m | Top stories from HN |
| `github-trending-today` | GitHub | hottest | 10m | Today's trending repositories |
| `v2ex-share` | V2EX | realtime | 10m | Latest shares from V2EX |
| `ithome` | IT之家 | realtime | 10m | IT news from China |
| `solidot` | Solidot | realtime | 60m | Open source news |
| `producthunt` | Product Hunt | hottest | 10m | Daily product launches |
| `linuxdo-latest` | LINUX DO | realtime | 10m | Latest from Linux community |
| `linuxdo-hot` | LINUX DO | hottest | 30m | Today's hottest from Linux DO |
| `nodeseek-latest` | NodeSeek | realtime | 10m | Latest tech discussions |

### Finance Sources

| SourceID | Name | Type | Interval | Description |
|----------|------|------|----------|-------------|
| `wallstreetcn-quick` | 华尔街见闻 | realtime | 5m | Financial quick news |
| `cls-telegraph` | 财联社 | realtime | 5m | Financial telegraph |
| `xueqiu-hotstock` | 雪球 | hottest | 2m | Hot stock discussions |
| `fastbull-express` | 法布财经 | realtime | 2m | Financial express news |

### China Sources

| SourceID | Name | Type | Interval | Description |
|----------|------|------|----------|-------------|
| `zhihu` | 知乎 | hottest | 10m | Top topics from Zhihu |
| `weibo` | 微博 | hottest | 2m | Real-time trending topics |
| `bilibili-hot-search` | 哔哩哔哩 | hottest | 10m | Bilibili hot search |
| `douyin` | 抖音 | hottest | 10m | Douyin trending |
| `toutiao` | 今日头条 | hottest | 10m | Today's headlines |

### World Sources

| SourceID | Name | Type | Interval | Description |
|----------|------|------|----------|-------------|
| `zaobao` | 联合早报 | realtime | 30m | Singapore news |
| `sputniknewscn` | 卫星通讯社 | realtime | 10m | International news |

## Getting Source Names

### Option 1: From Source ID
Use the source ID directly as a display name (e.g., "hackernews" → "Hacker News")

### Option 2: From sources.json
Fetch the human-readable names from `shared/sources.json`:

```bash
curl "https://your-domain.com/shared/sources.json"
```

This returns a JSON object mapping SourceID to source metadata including:
- `name`: Human-readable name
- `title`: Optional subtitle
- `color`: UI color theme
- `home`: Source homepage URL

Example:
```json
{
  "hackernews": {
    "name": "Hacker News",
    "type": "hottest",
    "column": "tech",
    "home": "https://news.ycombinator.com/",
    "color": "orange",
    "interval": 600000
  }
}
```

## Rate Limits & Performance

### Rate Limits
- No explicit rate limiting implemented
- Respects source-specific intervals to prevent IP bans
- Client should implement reasonable request intervals (≥ 30 seconds)

### Performance Expectations
- **Cache hits**: < 100ms response time
- **Cache misses**: 500ms - 5s depending on source
- **Batch requests**: Recommended for multiple sources

### Error Handling
```json
{
  "statusCode": 500,
  "message": "Invalid source id"
}
```

Common errors:
- `400`: Missing or invalid `id` parameter
- `404`: Source not found
- `500`: Internal server error or source fetch failure

## Quick Verification

### 1. Start the Development Server
```bash
cd /path/to/newsnow
pnpm dev
```

### 2. Manual Testing
```bash
# Test a basic request
curl "http://localhost:5173/api/s?id=hackernews"

# Test with latest parameter
curl "http://localhost:5173/api/s?id=hackernews&latest=true"

# Test batch request
curl -X POST "http://localhost:5173/api/s/entire" \
  -H "Content-Type: application/json" \
  -d '{"sources": ["hackernews", "v2ex-share"]}'

# Test sources metadata
curl "http://localhost:5173/shared/sources.json"
```

### 3. Verify Response Structure
Ensure the response contains:
- ✅ `status` field indicating cache/fresh data
- ✅ `id` matching your request
- ✅ `updatedTime` timestamp
- ✅ `items` array with required fields (`title`, `url`, `pubDate`)

### 4. Test Multiple Sources
Try different SourceID values from the table above to ensure they return valid data.

## Integration Notes for Brief Harmony

1. **Display Names**: Use `shared/sources.json` to get human-readable source names
2. **Refresh Logic**: Implement pull-to-refresh using the `latest=true` parameter
3. **Cache Indicators**: Show "cached" status when `status: "cache"` in response
4. **Error Handling**: Gracefully handle source failures by falling back to cached data
5. **Batch Loading**: Use `/api/s/entire` for loading multiple user-selected sources efficiently

## Support

For API issues or questions:
1. Check the server logs for detailed error information
2. Verify the source ID exists in `shared/sources.json`
3. Test with different sources to isolate the issue
4. Ensure proper network connectivity to external source websites
