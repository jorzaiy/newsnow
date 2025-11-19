import type { NewsItem } from "@shared/types"

interface LinuxDoTopic {
  id: number
  title: string
  slug: string
  posts_count: number
  reply_count: number
  highest_post_number: number
  image_url: string | null
  created_at: string
  last_posted_at: string
  bumped: boolean
  bumped_at: string
  archetype: string
  unseen: boolean
  pinned: boolean
  visible: boolean
  closed: boolean
  archived: boolean
  bookmarked: boolean | null
  liked: boolean | null
  tags: string[]
  views: number
  like_count: number
  has_summary: boolean
  last_poster_username: string
  category_id: number
  pinned_globally: boolean
  featured_link: string | null
  has_accepted_answer: boolean
  posters: Array<{
    extras: string | null
    description: string
    user_id: number
    primary_group_id: number | null
    flair_group_id: number | null
  }>
}

interface LinuxDoResponse {
  users: Array<{
    id: number
    username: string
    name: string
    avatar_template: string
  }>
  primary_groups: any[]
  flair_groups: any[]
  topic_list: {
    can_create_topic: boolean
    more_topics_url: string
    draft: any | null
    draft_key: string
    draft_sequence: number
    per_page: number
    topics: LinuxDoTopic[]
  }
}

const getLinuxDoSource = (type: "latest" | "top" | "hot") => {
  return defineSource(async () => {
    const cookie = process.env.LINUXDO_COOKIE
    const ua = process.env.LINUXDO_UA || "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"

    if (!cookie) {
      console.warn("[LinuxDo] LINUXDO_COOKIE is not set, skipping LinuxDo source")
      return []
    }

    const url = type === "hot" ? "https://linux.do/top.json" : "https://linux.do/latest.json"

    try {
      console.log(`[LinuxDo] Fetching ${url}`)
      const response: LinuxDoResponse = await myFetch(url, {
        headers: {
          Cookie: cookie,
          "User-Agent": ua,
          "Accept": "application/json, text/plain, */*",
          "Referer": "https://linux.do/",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
        },
      })

      if (!response?.topic_list?.topics) {
        console.error("[LinuxDo] Invalid response structure")
        return []
      }

      console.log(`[LinuxDo] Successfully fetched ${response.topic_list.topics.length} topics`)
      return response.topic_list.topics.map((topic): NewsItem => ({
        id: topic.id.toString(),
        title: topic.title,
        url: `https://linux.do/t/${topic.slug}/${topic.id}`,
        pubDate: topic.created_at,
        extra: {
          info: `💬 ${topic.reply_count}  👁️ ${topic.views}`,
          hover: topic.tags.join(", "),
        },
      }))
    } catch (error) {
      console.error("[LinuxDo] Failed to fetch topics:", error)
      return []
    }
  })
}

export default defineSource({
  "linuxdo": getLinuxDoSource("latest"),
  "linuxdo-latest": getLinuxDoSource("latest"),
  "linuxdo-hot": getLinuxDoSource("hot"),
})
