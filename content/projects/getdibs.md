---
title: "getdibs"
summary: "This site. Markdown in the repository, validated at build time, exported as static HTML and served from a Cloudflare Worker."
status: shipped
year: "2026"
links:
  - label: "GitHub"
    url: "https://github.com/sstephen-arch/getdibs"
topics: ["building"]
featured: true
---

Content is markdown with frontmatter. A content layer validates it and names the
file on any error, a pure function assembles the front page from whatever content
exists, and the build writes the RSS and JSON feeds, the sitemap and llms.txt.
There is no server and no database.
