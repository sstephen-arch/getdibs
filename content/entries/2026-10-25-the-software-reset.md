---
kind: essay
title: "The Software Reset: Code Is No Longer the Moat"
summary: "A clean interface on top of a database used to be enough to charge per seat. Now a team with a coding assistant can build that in days, and the vendors that last will be the ones holding something a prompt can't regenerate."
topics: ["building"]
checked: "2026-10-25"
takeaways:
  - "A team that knows the business and uses a coding assistant can now build a decent internal tool in days."
  - "Building is the cheap part. Owning it is what costs you."
  - "Vendors that last will hold proprietary data, hard integrations and real accountability."
  - "If a sharp engineer can rebuild your product over a long weekend, you're selling a feature."
---

For as long as I've been in enterprise IT, it seems like software has followed the same recipe: build a clean interface, put it on top of a database, solve one annoying workflow, and charge per seat. I don't think that recipe holds up much longer. Someone who knows the business and can drive a modern coding assistant can now build a decent internal tool in days, and the teams I talk to have noticed. Retool surveyed 817 enterprise builders late last year and found that [35% had already replaced at least one SaaS tool](https://www.businesswire.com/news/home/20260217548274/en/Retools-2026-Build-vs.-Buy-Report-Reveals-35-of-Enterprises-Have-Already-Replaced-SaaS-With-Custom-Software) with something they built themselves, and 78% planned to build more this year. That doesn't mean SaaS is dead. Zylo's 2026 numbers show [average enterprise SaaS spend still climbing](https://www.cio.com/article/4173257/the-saas-reckoning-why-ai-is-about-to-reprice-enterprise-software.html), to around $55.7 million a year, while the number of apps stayed flat at about 305. People are building, but they aren't canceling much yet. What it does mean is that a product whose main value is a nice front end is in trouble. The vendors that last will be the ones holding something you can't regenerate with a prompt: years of proprietary data, integrations into legacy systems that took a decade to earn trust, and someone accountable when a process worth millions breaks. If a sharp engineer can rebuild your product over a long weekend, you're selling a feature.

On the buying side, I spend a lot of my time around renewals and application governance, and my honest take is that building is the cheap part. Owning is what costs you. Every internal app needs an owner, a security review, patching, access control, and a plan for when the person who wrote it leaves. Skip that and you've just created shadow IT with a nicer name. So yes, look hard at the per-seat licenses you pay for commodity work, but run anything you build through the same intake and lifecycle process you'd use for a purchased app. The other shift I'm watching is where company data goes. Risk teams are getting less comfortable pushing trade secrets and regulated data through outside model APIs, and the platforms are responding. Microsoft Foundry already lets you [run open-weight models on dedicated virtual machines](https://learn.microsoft.com/azure/ai-foundry/concepts/foundry-models-overview), and at Build this year Microsoft added a [curated Hugging Face catalog on managed compute](https://hyper.ai/en/stories/37a75100de709a89d8edd3aa42e9faef) that can run inside private networks. That's a real improvement, though it's still Microsoft's cloud, and true full custody means your own hardware. For individual builders, none of this is bad news. Between open models, coding assistants, and a decent laptop, testing an idea costs close to nothing now. A prototype still isn't a product. But if you've been sitting on an idea because you couldn't code it, that excuse is gone.

If I had to boil it down to what I'd actually do:

- **SaaS companies:** Figure out what in your product can't be rebuilt with a prompt. Put your money into your data, your integrations, and the guarantees you stand behind.
- **Organizations:** Pull your renewal calendar and flag the commodity workflows. Price in the cost of owning a build, not only building it. Keep sensitive AI work on private deployments.
- **Small businesses:** Keep buying the core systems you rely on. Use AI to build the small tools for the odd workflows no vendor serves well.
- **Individuals:** Build the prototype you've been putting off. Then decide if it deserves to become a product.
