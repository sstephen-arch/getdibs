---
kind: essay
title: "That Cheap Claude API Might Not Be Claude"
summary: "A whole market sells Claude tokens at 70 to 90% off. The margin comes from a swapped model, a farmed or stolen account, or your own prompts being resold, and it lands on IT's desk."
topics: ["claude-code"]
takeaways:
  - "Grey-market sellers offer Claude at 70 to 90% off through proxies called transfer stations."
  - "The discount comes from a swapped model, farmed or stolen accounts, or your prompts being harvested."
  - "SaaS discovery won't see it. One ANTHROPIC_BASE_URL setting sends everything to the proxy."
  - "Inventory AI endpoints, allowlist egress, and make the approved path easy."
audience: "IT, security and engineering leads"
checked: "2026-10-21"
---

I'm always looking for a better deal on Claude tokens. There's a whole market for it. Some sites sell seats on shared Claude chat accounts. Others sell API keys well below Anthropic's prices.

I thought it was a few side hustles. Then I watched [Wes Bos shop this market](https://www.youtube.com/watch?v=09UELaUhPEw) on Syntax. It's much bigger than I imagined, with storefronts, review sites and price rankings.

Those prices only work a few ways. The "Claude" you buy may not be Claude. If it is, the account behind it is often farmed or stolen, and your prompts are being sold too.

## How the market works

Sellers run proxies called transfer stations. You point your tools at their server instead of Anthropic's. They forward your requests through accounts they control. You never need an account of your own.

Researcher Zilan Qian [documented the setup](https://www.chinatalk.media/p/how-to-buy-cheap-claude-tokens-in). Sellers advertise openly on GitHub, Telegram, X and online marketplaces. Directories [rank them by price](https://the-decoder.com/how-chinas-gray-market-sells-claude-tokens-at-a-fraction-of-the-price/). Prices run [70 to 90% below list](https://aiweekly.co/alerts/chinas-grey-market-sells-claude-api-tokens-at-7090-off).

Nobody resells a frontier model at 10 cents on the dollar out of kindness. The margin comes from somewhere.

## The "Claude" you buy may not be Claude

**A different model.** Ask for Opus and you [may get Sonnet, Haiku or another vendor's model](https://www.chinatalk.media/p/how-to-buy-cheap-claude-tokens-in), relabeled. Token counts can expose a swap to another vendor. A swap between Claude tiers is harder to spot. A seller charging 10% of list for real Opus has to make up the gap somewhere. Swapping the model is the easiest way.

**Someone reading your prompts.** Every request runs through a server you know nothing about. Qian found signs this data is being resold, for model training and fraud, though no one has proven it at scale yet.

Anthropic's own reports show where some of it goes. In February it said three labs ran [16 million exchanges through about 24,000 fake accounts](https://techinformed.com/anthropic-accuses-chinese-ai-labs-of-claude-distillation/) to copy Claude. One proxy network [ran over 20,000 accounts at once](https://letsdatascience.com/blog/chinese-ai-labs-caught-stealing-claudes-intelligence-through-24000-fake-accounts) and mixed that traffic with paying customers. In June it reported [28.8 million more exchanges](https://www.mobileworldlive.com/ai-cloud/anthropic-accuses-alibaba-of-large-scale-distillation-attack/) from another lab. By September the count was [seven labs](https://letsdatascience.com/news/anthropic-reports-large-scale-claude-distillation-attempts-a23fb82f).

The paying customers are the cover.

## Where the cheap tokens come from

Most sellers handle one or two links in the chain. Upstream, operators [bulk-register accounts](https://www.chinatalk.media/p/how-to-buy-cheap-claude-tokens-in) to farm free credits, abuse corporate discounts, or split one $200 Max plan across dozens of users.

Stolen keys fill the gap. Security researchers call it [LLMjacking](https://thehackernews.com/2024/05/researchers-uncover-llmjacking-scheme.html). Stolen credentials [resell at 40 to 60% below list](https://labs.cloudsecurityalliance.org/research/csa-research-note-llmjacking-offensive-agentic-infrastructur/), and the victim pays the bill.

Bans barely slow it down. When one account gets cut off, the seller [switches to the next](https://daily.dev/posts/the-dark-side-of-1-ai-inside-the-underground-market-for-pirated-ai-access-bskrrdm2s).

## Why this lands on IT's desk

I work in IT governance, so this worried me more than it tempted me. Agentic coding burns tokens, and pricing is moving to metered usage. [GitHub moved Copilot to usage-based pricing](https://github.blog/changelog/2026/04/27/github-copilot-is-moving-to-usage-based-billing/) this year. If a 90% discount is one search away, someone on your engineering team will try it.

That puts source code, secrets and customer data in the hands of an unknown third party. No contract, no DPA, no audit trail. Possibly stolen credentials. A model you never approved.

SaaS discovery won't catch it. There's no new app, no SSO login, no OAuth grant. A developer sets `ANTHROPIC_BASE_URL` and Claude Code sends everything to the proxy. Cursor and Cline have similar base URL settings.

## What I'd do

1. **Inventory AI endpoints.** Pull base URL settings from developer machines. Anything off the approved list is a finding.
2. **Allowlist at egress.** Alert on AI API traffic to unknown hosts.
3. **Check expenses.** Small recurring charges to unknown AI resellers are the cheapest signal you'll get.
4. **Protect your own keys.** AI credential theft [rose 376%](https://labs.cloudsecurityalliance.org/research/csa-research-note-llmjacking-offensive-agentic-infrastructur/) from Q4 2025 to Q1 2026. Scan, scope and rotate.
5. **Make the approved path easy.** A sanctioned gateway with team budgets removes most of the reason to shop around.
6. **Put it in policy.** Name approved providers and endpoints so a finding has consequences.

Someone pays for a token sold at 10% of list. Usually it's a farmed account, a stolen key or the buyer's own data.

I'm still hunting for deals. Now I stick to prompt caching, batch pricing and volume terms from Anthropic, where I know which model answered.
