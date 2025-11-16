const latest = defineSource(async () => {
  const url = "https://r.jina.ai/http://www.nodeseek.com"
  const response = await myFetch(url)

  // 使用正则表达式解析帖子信息
  // 寻找所有包含 post- 的链接，然后过滤出真正的帖子
  const postLinks = [...response.matchAll(/\[([^\]]+)\]\(([^)]*post-[^)]+)\)/g)]
  const timePattern = /\[(\d+[hd]|(\d+)s?|\d+min) ago\]\([^)]+\)/g
  const categoryPattern = /\[([^\]]+)\]\([^)]*categories\/[^)]+\)/g

  const timeMatches = [...response.matchAll(timePattern)]
  const categoryMatches = [...response.matchAll(categoryPattern)]

  // 过滤出真正的帖子链接（排除评论链接和时间链接）
  const posts = []
  let timeIndex = 0
  let categoryIndex = 0

  for (const match of postLinks) {
    const title = match[1]
    const postUrl = match[2]

    // 跳过评论链接（包含 #）和时间链接（包含 "ago"）
    if (postUrl.includes("#") || title.includes("ago") || title.includes("min") || title.includes("h") || title.includes("s") || title.includes("d")) {
      continue
    }

    // 获取对应的时间
    let pubDate = Date.now()
    if (timeIndex < timeMatches.length) {
      const timeText = timeMatches[timeIndex][1]
      if (timeText.includes("s")) {
        const seconds = Number.parseInt(timeText)
        pubDate = Date.now() - seconds * 1000
      } else if (timeText.includes("min")) {
        const minutes = Number.parseInt(timeText)
        pubDate = Date.now() - minutes * 60 * 1000
      } else if (timeText.includes("h")) {
        const hours = Number.parseInt(timeText)
        pubDate = Date.now() - hours * 60 * 60 * 1000
      } else if (timeText.includes("d")) {
        const days = Number.parseInt(timeText)
        pubDate = Date.now() - days * 24 * 60 * 60 * 1000
      }
      timeIndex++
    }

    // 获取对应的分类
    let category = "日常"
    if (categoryIndex < categoryMatches.length) {
      category = categoryMatches[categoryIndex][1]
      categoryIndex++
    }

    posts.push({
      id: postUrl.split("/post-")[1]?.split("-")[0] || posts.length,
      title,
      url: postUrl.startsWith("http") ? postUrl : `https://www.nodeseek.com${postUrl}`,
      pubDate,
      extra: {
        category,
      },
    })

    if (posts.length >= 20) break // 只取前20个帖子
  }

  return posts
})

const tech = defineSource(async () => {
  const url = "https://r.jina.ai/http://www.nodeseek.com/categories/tech"
  const response = await myFetch(url)

  // 使用相同的解析逻辑
  const postLinks = [...response.matchAll(/\[([^\]]+)\]\(([^)]*post-[^)]+)\)/g)]
  const timePattern = /\[(\d+[hd]|(\d+)s?|\d+min) ago\]\([^)]+\)/g

  const timeMatches = [...response.matchAll(timePattern)]

  // 过滤出真正的帖子链接
  const posts = []
  let timeIndex = 0

  for (const match of postLinks) {
    const title = match[1]
    const postUrl = match[2]

    // 跳过评论链接和时间链接
    if (postUrl.includes("#") || title.includes("ago") || title.includes("min") || title.includes("h") || title.includes("s") || title.includes("d")) {
      continue
    }

    // 获取对应的时间
    let pubDate = Date.now()
    if (timeIndex < timeMatches.length) {
      const timeText = timeMatches[timeIndex][1]
      if (timeText.includes("s")) {
        const seconds = Number.parseInt(timeText)
        pubDate = Date.now() - seconds * 1000
      } else if (timeText.includes("min")) {
        const minutes = Number.parseInt(timeText)
        pubDate = Date.now() - minutes * 60 * 1000
      } else if (timeText.includes("h")) {
        const hours = Number.parseInt(timeText)
        pubDate = Date.now() - hours * 60 * 60 * 1000
      } else if (timeText.includes("d")) {
        const days = Number.parseInt(timeText)
        pubDate = Date.now() - days * 24 * 60 * 60 * 1000
      }
      timeIndex++
    }

    posts.push({
      id: postUrl.split("/post-")[1]?.split("-")[0] || posts.length,
      title,
      url: postUrl.startsWith("http") ? postUrl : `https://www.nodeseek.com${postUrl}`,
      pubDate,
      extra: {
        category: "技术",
      },
    })

    if (posts.length >= 20) break
  }

  return posts
})

export default defineSource({
  "nodeseek": latest,
  "nodeseek-latest": latest,
  "nodeseek-tech": tech,
})
