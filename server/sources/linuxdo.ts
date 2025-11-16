// RSSHub-proxied feeds from linux.do to bypass Cloudflare protection
const hot = defineRSSHubSource("linuxdo/hot")
const latest = defineRSSHubSource("linuxdo/latest")

export default defineSource({
  "linuxdo": latest,
  "linuxdo-latest": latest,
  "linuxdo-hot": hot,
})
