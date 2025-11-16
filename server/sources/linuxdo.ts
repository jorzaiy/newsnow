// Use RSSHub to bypass Cloudflare protection on linux.do
// RSSHub provides a proxy that can fetch RSS feeds even when the original site blocks direct access
const hot = defineRSSHubSource("/linuxdo/hot")
const latest = defineRSSHubSource("/linuxdo/latest")

export default defineSource({
  "linuxdo": latest,
  "linuxdo-latest": latest,
  "linuxdo-hot": hot,
})
