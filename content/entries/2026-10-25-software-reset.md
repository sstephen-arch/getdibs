---
kind: essay
title: "The Software Reset: Code Is No Longer the Moat"
summary: "Someone who knows the business and can drive a coding assistant can now build a decent internal tool in days. SaaS isn't dead, but a product whose main value is a nice front end is in trouble, and building is the cheap part. Owning is what costs you."
topics: ["building"]
takeaways:
  - "Someone who knows the business and can drive a coding assistant can build a decent internal tool in days."
  - "SaaS isn't dead. Spend is still climbing. But a product whose main value is a nice front end is in trouble."
  - "Building is the cheap part. Owning is what costs you: an owner, security review, patching and a plan for when the author leaves."
  - "Sensitive data is moving toward private deployments, and full custody still means your own hardware."
checked: "2026-10-25"
---

For as long as I've been in enterprise IT, software has followed the same
recipe. Build a clean interface, put it on top of a database, solve one annoying
workflow, and charge per seat. I don't think that recipe holds up much longer.

## Code is cheap now

Someone who knows the business and can drive a modern coding assistant can now
build a decent internal tool in days, and the teams I talk to have noticed.
Retool surveyed
[817 of its customers and builders](https://retool.com/newsroom/build-vs-buy-report-2026)
late last year and found that 35% of teams had already replaced at least one
SaaS tool with something they built themselves, and 78% planned to build more
this year. Retool sells the tools for building, so take that with a grain of
salt, but it matches what I see.

That doesn't mean SaaS is dead. Zylo's
[2026 numbers](https://zylo.com/reports/2026-saas-management-index/) show average
SaaS spend still climbing, up 8% to about $55.7 million a year, while the number
of apps stayed flat at about 305. People are building, but they aren't canceling
much yet.

What it does mean is that a product whose main value is a nice front end is in
trouble. The vendors that last will be the ones holding something you can't
regenerate with a prompt: years of proprietary data, integrations into legacy
systems that took a decade to earn trust, and someone accountable when a process
worth millions breaks. If a sharp engineer can rebuild your product over a long
weekend, you're selling a feature.

## Building is the cheap part

On the buying side, I spend a lot of my time around renewals and application
governance, and my honest take is that building is the cheap part. Owning is
what costs you.

Every internal app needs an owner, a security review, patching, access control,
and a plan for when the person who wrote it leaves. Skip that and you've just
created shadow IT with a nicer name. So yes, look hard at the per-seat licenses
you pay for commodity work, but run anything you build through the same intake
and lifecycle process you'd use for a purchased app.

## Where the data goes

The other shift I'm watching is where company data goes. Risk teams are getting
less comfortable pushing trade secrets and regulated data through outside model
APIs, and the platforms are responding.

Microsoft Foundry already lets you run open-weight models on
[dedicated GPU capacity](https://learn.microsoft.com/en-gb/azure/foundry/concepts/managed-compute-overview).
At Build this year Microsoft added a curated
[Hugging Face catalog on managed compute](https://huggingface.co/blog/microsoft/foundry-managed-compute)
that can run inside a private network. It's still in preview, but it's a real
improvement. It's also still Microsoft's cloud, and true full custody means your
own hardware.

For individual builders, none of this is bad news. Between open models, coding
assistants and a decent laptop, testing an idea costs close to nothing now. A
prototype still isn't a product. But if you've been sitting on an idea because
you couldn't code it, that excuse is gone.

## What I'd do

- **SaaS companies:** Figure out what in your product can't be rebuilt with a
  prompt. Put your money into your data, your integrations, and the guarantees
  you stand behind.
- **Organizations:** Pull your renewal calendar and flag the commodity
  workflows. Price in the cost of owning a build, not only building it. Keep
  sensitive AI work on private deployments.
- **Small businesses:** Keep buying the core systems you rely on. Use AI to
  build the small tools for the odd workflows no vendor serves well.
- **Individuals:** Build the prototype you've been putting off. Then decide if
  it deserves to become a product.
