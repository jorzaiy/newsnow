const hot = defineRSSSource("https://linux.do/hot.rss")

const latest = defineRSSSource("https://linux.do/latest.rss")

export default defineSource({
  "linuxdo": latest,
  "linuxdo-latest": latest,
  "linuxdo-hot": hot,
})
