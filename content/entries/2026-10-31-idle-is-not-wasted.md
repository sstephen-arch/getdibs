---
kind: essay
title: "My RAM Sits Idle Most of the Day. So Does My Car."
summary: "Sam Altman says it's 'quite terrible' that the world's DRAM sits in personal computers used 5% of the time. On utilization he's right. The same logic also condemns your car, your spare room and your groceries, and it points the memory at his own data centers."
topics: ["local-ai"]
cover: "/covers/local-ai.webp"
cover_alt: "Illustration of a MacBook whose screen shows a wireframe cube filled with glowing dots, standing for a model running on the laptop."
cover_credit: "Cover: illustration by the author."
takeaways:
  - "Sam Altman says PC memory used 5% of the time is a 'quite terrible' use of scarce DRAM. On utilization alone, he's right."
  - "The same logic condemns the parked car, the spare bedroom and wasted food. Owning things buys availability, privacy and control that utilization doesn't measure."
  - "OpenAI's Stargate has lined up as much as 40% of global DRAM output. The argument points the memory at the company making it."
  - "The answer to idle memory is to use it for local agents, not to give it up."
audience: "people running AI on their own hardware"
checked: "2026-10-31"
---

This week Sam Altman told Stripe's John Collison on the Cheeky Pint podcast that
local memory is a waste. [Every hardware site picked it up](https://www.tomshardware.com/tech-industry/data-centers/openai-ceo-says-its-quite-terrible-for-your-pc-to-have-ram-sam-altman-says-data-centers-offer-better-utilization):

> "From a global allocation perspective, actually it's quite terrible to have
> everyone have a bunch of the world's limited supply of DRAM sitting in their own
> computer, and be used 5% of the time."

I run models on my own Macs, so he's talking about people like me. I want to take
the point seriously, because part of it is right.

## He's right about utilization

Memory in a data center works harder than memory in my laptop. One server can run
a model for thousands of people at once, batching their requests through the same
chips. My Mac runs one model for one person, and most of the day it's waiting on
me.

If the only question is how much useful work each gigabyte does per hour, the
data center wins. It isn't close.

The shortage is real too. [Memory makers have shifted capacity toward AI servers](https://en.wikipedia.org/wiki/2024%E2%80%93present_global_memory_supply_shortage),
and everyone else pays for it. The 128 GB DGX Spark launched at $3,999. It
[now lists at $6,950](/projects/model-bench/).

## Apply the same rule to anything else you own

Utilization is a good way to run a data center. It's a strange way to decide who
gets to own things.

The average US household vehicle is
[parked 95% of the day](https://www.energy.gov/node/4843950). That's Altman's 5%,
the other way around. Nobody argues people should give up their cars because a
ride-share fleet would use them more.

Follow the logic and it doesn't stop at cars. A spare bedroom sits empty most
nights while people look for somewhere to live. A vacation home sits empty most
of the year. [30 to 40% of the US food supply](https://www.usda.gov/foodwaste/faqs)
is wasted. By pure allocation, all of it is "quite terrible." A perfect planner
could put the room, the house and the food to better use.

We don't do that, and it isn't because we can't count. Owning something gets you
things a utilization chart doesn't measure.

- **It's there when I need it.** In one long Claude Code session I
  [hit 102% of my five-hour limit](/essays/where-my-tokens-go/) and requests were
  refused. My Mac has never told me to come back later.
- **It stays mine.** What I run locally isn't logged on someone else's server,
  and it doesn't change when a provider changes its terms.
- **I already paid for it.** A model running on memory I own costs nothing extra
  and takes no chip from anyone.
- **It doesn't need a new building.** Local opposition
  [blocked or delayed 75 data center projects](/projects/model-bench/) in the
  first quarter of this year. Memory already on desks needs no permit.

## Notice who is making the argument

Every gigabyte that doesn't go into a laptop can go into a data center, and
OpenAI buys more memory than almost anyone. In October 2025, Samsung and SK hynix
signed letters of intent to supply OpenAI's Stargate project with
[up to 900,000 DRAM wafers a month](https://www.tomshardware.com/pc-components/dram/openais-stargate-project-to-consume-up-to-40-percent-of-global-dram-output-inks-deal-with-samsung-and-sk-hynix-to-the-tune-of-up-to-900-000-wafers-per-month).
That's roughly 40% of global DRAM output.

So the person saying memory is wasted in your computer runs the company that
would use it, and that company is one reason it's scarce.
[PC Gamer said it more bluntly](https://www.pcgamer.com/software/ai/sam-altman-argues-that-its-bad-you-want-dram-in-your-computer-and-not-a-data-center-actually/).

Psychologists have a name for this:
[motivated reasoning](https://en.wikipedia.org/wiki/Motivated_reasoning). We
reach the conclusion we have reasons to want, then build the argument that gets
us there. It isn't lying, and it doesn't make the utilization point false. It
lives in the step from "this memory is underused" to "it would be better off in
data centers like mine." That step is where the interest does the work.

Upton Sinclair put it plainly in 1935: "It is difficult to get a man to
understand something, when his salary depends on his not understanding it."

To be fair, the same applies to me. I build local AI tools, so I have my own
reasons to like local. Judge the argument on its merits, not on who makes it. On
the merits, utilization is one measure among several, and it happens to be the
one that favors whoever owns the biggest data center.

## Where I land

My view hasn't changed. Frontier models in the cloud handle the hard planning.
Local models run the repetitive agent work on hardware people already own.

Altman's own number makes the case for the second half. If my memory sits idle
95% of the time, that's capacity a local agent can use without a new fab, a new
data center, or anyone's permission.

The answer to idle capacity is to use it, not to give it up.

What's sitting idle on your desk that you'd still never hand over?
