---
kind: essay
title: "AI Strategy Is Also Cost Management"
summary: "Giving everyone AI is like giving everyone anything that isn't free: sooner or later the bill becomes part of the strategy. Uber, Microsoft and AT&T are already making that trade, and the organizations that get it right will be the ones that can see what each use is worth."
topics: ["ai-strategy"]
audience: "IT, finance and engineering leaders"
checked: "2026-11-07"
---

Most AI strategies I see start with the same goal: democratize it. Put AI in
everyone's hands, let people find the uses, and measure adoption. I understand
the instinct. I also work in IT governance, and I've watched this play out
before with SaaS and cloud. When you hand out something that isn't free, the
strategy turns into cost management sooner or later.

AI is metered. Every prompt, every agent loop and every file an assistant reads
is billed by the token. Democratizing it means handing a metered tool to
thousands of people at once. That doesn't make it a bad idea. It makes cost one
of the decisions the strategy has to make on purpose.

## The bill arrives fast

Uber is the clearest example. It encouraged engineers to use AI coding tools as
much as possible and ranked teams on internal leaderboards. Claude Code adoption
across its 5,000-person engineering organization went from 32% in February to
84% in March. By April it had
[used up its AI budget for the whole year](https://finance.yahoo.com/sectors/technology/articles/uber-burned-entire-2026-ai-180347400.html).
Uber now caps spending at
[$1,500 per employee per tool each month](https://www.outlookbusiness.com/corporate/uber-caps-ai-tool-usage-after-exhausting-yearly-budget-in-just-4-months),
and its COO has questioned whether the spending is worth it.

Microsoft went further. It reportedly
[canceled most of its engineers' Claude Code licenses](https://me.peoplemattersglobal.com/news/ai-and-emerging-tech/microsoft-cancels-claude-code-licences-after-engineers-use-it-too-much-49918)
and pointed them at GitHub Copilot, a tool it controls. Its internal Claude
spending, once projected above $1 billion a year, was
[reportedly cut by more than a third](https://the-decoder.com/meta-and-microsoft-pull-back-from-claude-as-anthropic-transforms-from-partner-into-competitor/),
and Meta reportedly halved its own Claude Code use.

These are companies that can afford almost anything, and the numbers still got
their attention. They add up fast for anyone. In under eight weeks my own Claude
Code sessions [processed 11.5 billion tokens](/essays/where-my-tokens-go/),
about $5,100 at API list prices. That's one person. Scale it to an engineering
department and the budget conversation writes itself.

## From adoption to cost-benefit

The question leaders are asking has changed. It used to be how to get people
using AI. Now it's what each use is worth.

Apple's new CEO, John Ternus, put it plainly last week. Apple doesn't
[want to ship AI for AI's sake](https://techcrunch.com/2026/10/31/apple-ceo-says-the-company-doesnt-want-to-ship-ai-for-ais-sake/).
That isn't a rejection of AI. It's a cost-benefit test. Apple reportedly pays
Google [about $1 billion a year](https://www.pymnts.com/apple/2026/apples-new-ceo-inherits-an-ai-strategy-built-on-outsiders/)
for Gemini to power the new Siri, and Tim Cook told investors on the July
earnings call that Apple would "see what Siri AI does from the cost side of it."
When a company with Apple's margins talks about the cost side, everyone else
should be listening.

A real cost-benefit analysis needs both halves. The cost side is token prices,
usage, and the people and infrastructure around them. The benefit side is the
work that got done, and whether it would have been done anyway. Most
organizations can measure the first half today. Very few can measure the
second.

## You can't manage what you can't see

Token pricing makes this harder than it looks. Anthropic's own
[price list](https://www.anthropic.com/pricing) runs from 10 cents per million
input tokens for Haiku 5.5 to $10 for Fable 5.1, a hundredfold spread inside one
vendor. The same task can cost pennies or dollars depending on which model
handles it and how long the conversation runs.

Finance has noticed. The FinOps Foundation's
[State of FinOps 2026](https://data.finops.org/) found that 98% of practitioners
now manage AI spend, up from 31% two years earlier.

In IT asset management we learned this with SaaS. What you can't inventory, you
can't control. AI spend needs the same basics: who is using which model, for
which work, charged to which team. Part of Uber's fix was an internal dashboard
so employees could see their own usage. That's the right instinct. A budget
nobody can see is just a surprise scheduled for later.

## Open models are the cost lever

The other response is to stop sending everything to the most expensive model.
AT&T routes its AI traffic. Frontier models still handle code generation, while
open models like Nemotron, Llama and Gemma take summaries and lighter work. The
company [cut costs on coding and other advanced tasks by as much as 56%](https://www.pymnts.com/news/artificial-intelligence/2026/att-slashes-ai-costs-by-adopting-model-routers-and-open-source).
Open models now handle about 40% of its employee queries, with a target of 60 to
70%.

Others are testing the same idea. Fortune reported that Airbnb, Siemens and
DoorDash are
[experimenting with cheaper Chinese open models](https://fortune.com/2026/07/17/businesses-turn-to-cheaper-chinese-ai-models/).
I spent 13 days this fall [testing 21 local models](/essays/local-model-tests/)
on my own Macs, and plenty of everyday work doesn't need a frontier model.

Open isn't free, though. Someone pays for the GPUs, the engineers who run them
and the evaluations that prove a cheaper model is good enough. The winning
strategy isn't frontier or open. It's routing: the expensive model where it
earns its price, and something cheaper everywhere else.

## Democratized AI carries risk too

Cost pressure creates its own risks. Cap the approved tools without offering a
good alternative and people go looking. Some find
[grey-market API keys at 70 to 90% off](/essays/cheap-claude-api/), with an
unknown model and an unknown server on the other end. Cheaper models raise their
own questions about provenance and security, and the experts in Fortune's
reporting flagged exactly that about the Chinese models.

Risk belongs in the same analysis as cost. Every model, tool and route in the
plan needs an answer to who can see the data, who approved it, and what happens
when it fails.

## What a strategy has to answer

An AI strategy that only sets adoption targets is an invitation to Uber's April.
A real one decides which work gets which model, what a unit of that work is
worth, how spend is tracked and charged back, what happens when a team hits its
budget, and which risks are acceptable along the way.

None of those are technology decisions. They're the same cost, risk and
governance decisions IT has always made, applied to a resource that's billed by
the token.

Does your AI strategy have a budget line, or just an adoption target?
