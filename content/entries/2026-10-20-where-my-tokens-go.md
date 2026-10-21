---
kind: essay
title: "Where my Claude Code tokens actually go"
summary: "11.5 billion tokens across 14 Claude Code sessions in under eight weeks. On my biggest project the agent read about 1,550 tokens for every one it wrote. The rest was the conversation being sent again, and that is how the bill is built."
topics: ["claude-code"]
lead: true
cover: "/covers/tokens.webp"
cover_alt: "A grid of 400 pale green dots on a white card, with a single dot lit in dark green."
cover_credit: "Cover: illustration by the author. One lit dot in 400 is roughly the share of tokens the model wrote in the one session I can measure exactly."
stats:
  - value: "11.5B"
    label: "tokens processed"
    detail: "14 sessions, 28 August to 19 October"
  - value: "98.8%"
    label: "re-read from cache"
    detail: "Context sent again on every call"
  - value: "1,550:1"
    label: "read to written"
    detail: "My biggest project, estimated"
  - value: "$5,100"
    label: "at API list prices"
    detail: "I'm on a subscription, so notional"
takeaways:
  - "I pushed 11.5 billion tokens through Claude Code in under eight weeks, about $5,100 at list prices."
  - "On my biggest project the agent read about 1,550 tokens for every one it wrote."
  - "Every call resends the whole conversation, so context length is the multiplier, not the work."
  - "Shorter sessions, a smaller CLAUDE.md and subagents for reading cut it the most."
---

I use a lot of tokens. I knew that from the rate limit warnings. I did not know
the number, or where the tokens went. So I pulled the usage records for every
Claude Code session I can still see and added them up.

The short version: in under eight weeks I pushed 11.5 billion tokens through
Claude. Almost none of them were the work.

## The number

Fourteen sessions between 28 August and 19 October. Eleven ran on my Mac through
Remote Control and three ran in the cloud. These are the ones that left records I
can read.

| Session | API calls | Tokens processed | At list price |
|---|---|---|---|
| Starkive Manifest, full Mac code audit | 7,512 | 4.11 billion | $2,402 |
| LLM Switcher, Splash support | 5,507 | 2.86 billion | $819 |
| Ollama network model sharing | 2,535 | 1.09 billion | $416 |
| Starkive for Windows, build | 1,815 | 847 million | $265 |
| Install git and node | 1,616 | 841 million | $494 |
| Push and analysis | 1,674 | 826 million | $471 |
| Ferry, Steam on macOS | 1,189 | 618 million | $165 |
| Let's Touch Base website | not recorded | 236 million | $83 |
| DePalo website | 447 | 73 million | $26 |
| Five small sessions | under 100 | 7 million | $3 |
| **Total** | | **11.5 billion** | **about $5,100** |

I'm on a subscription, so the last column is not what I paid. It is what the same
tokens would cost on the API at each model's list price. For the cloud sessions
that is the cost Claude Code reported. For the Mac sessions it is my estimate
from the token counts, and it covers the input side only, because those records
do not keep output.

## The biggest project

Starkive Manifest is the largest thing I have built with Claude. It is an IT
asset register for macOS and iOS. Since 24 June the repository has taken 1,632
commits, 1,404 of them co-authored by Claude. It is about 297,000 lines of Swift.

One session on it stands out. It started on 28 August as a code audit of the Mac
app, with DeepSeek and Kimi reviewing and Claude checking every claim against
the source. Then I told it "i want everything done", and it turned into twelve
days of fixing, testing and shipping.

| What it did | |
|---|---|
| My prompts | 446 |
| Commits | 179 |
| `xcodebuild` runs | 375 |
| `swift test` runs | 160 |
| Passing tests | 2,081 to 2,359 |

| What it processed | Tokens |
|---|---|
| API calls | 7,512 |
| Fresh input | 128,003 |
| Written to cache | 39.4 million |
| Read from cache | 4.07 billion |
| Written by the model, visible text | about 2.65 million |

The work itself, the code, commit messages, commands and replies the model wrote,
comes to roughly 2.65 million tokens. That is an estimate from the visible text,
and it leaves out thinking, which these records hide. Against that, the session
processed 4.11 billion tokens. About 1,550 read for every one written.

## Where the rest went

Claude does not remember anything between calls. Every call sends the whole
conversation again: the system prompt, the tool definitions, my CLAUDE.md, every
message, every file it has read, every command's output. The model reads all of
it, writes a little, and the next call starts from the top.

A prompt is not one call either. Every tool use is a round trip. Run a build,
read the error, open the file, make the edit, run the build again. That is five
calls. My 446 prompts in that session became 7,512 calls, about 17 per prompt.
The most expensive one was "i want everything done use deep and kimi". It ran
107 calls and read 81 million tokens.

The average call in that session carried 547,000 tokens of context. Multiply by
7,512 calls and you get 4.1 billion. That is the whole bill, almost exactly.

## How the tokens are priced

A Claude bill has four kinds of token, and they are priced very differently.

| Kind | What it is | Opus 5.5, per million |
|---|---|---|
| Fresh input | Anything not already in the cache | $4.00 |
| Cache write | Storing context so later calls can reuse it | $5.00 for 5 minutes, $8.00 for an hour |
| Cache read | Reusing stored context | $0.20 |
| Output | What the model writes, thinking included | $20.00 |

Opus 5, which ran most of the Starkive session, was $5 in and $25 out, with
cache reads at $0.50.

Caching is what makes this workable. Without it, the Starkive session's 4.07
billion re-read tokens would have cost over $20,000 at the full input price. As
cache reads they come to about $2,000.

Cheap per token is still not cheap. The one session with a complete bill, the
Let's Touch Base website, shows the split.

| | Share of tokens | Share of cost |
|---|---|---|
| Cache reads | 98.3% | 56% |
| Cache writes | 1.5% | 31% |
| Output | 0.2% | 13% |
| Fresh input | under 0.1% | under 1% |

Per token, writing is the expensive part. In total, reading is, because there is
so much of it. Thinking counts as output even when it is hidden. In that session
it was 16% of everything the model wrote.

## The multiplier is context length

Two things set the bill: how many calls, and how big the context is on each one.
The second grows on its own. Every file read and every build log stays in the
conversation until something removes it.

The Starkive session was compacted 13 times, 11 of them because it hit the 1
million token context ceiling. Each time, Claude Code summarized close to a
million tokens down to somewhere between 17,000 and 64,000, and the climb started
again. Near the ceiling, every tool call re-reads close to a million tokens, even
one that only runs `ls`. That is roughly twenty times what the same call reads at
the start of a session.

The instructions file is part of it. The project's CLAUDE.md rides along on every
call, and it grew from 9,703 words to 22,976 during those twelve days, because I
kept adding what the session learned. It is 27,244 words now. By my estimate
about 190 million of that session's reads, roughly 5%, were the instructions
file.

## Tokens are not what I pay. Limits are.

On a subscription, none of the dollar figures above are money I spent. What I
actually run into is the rate limit. In the Starkive session the five-hour window
peaked at 102% and five requests were refused. As I write this, my weekly window
is showing a warning. The limits fill up from the same work, so the same habits
help.

## What I'm changing

- **Shorter sessions.** A twelve-day session is twelve days of context. I'm ending
  sessions when the task ends, and starting the next one from a handoff file rather
  than a compacted transcript. Starkive already has one, `NEXT-SESSION-PROMPT.md`,
  and it is cheaper than any compaction.
- **A smaller CLAUDE.md.** Every word in it is read on every call. Rules that only
  matter for one part of the project belong in a doc the agent opens when it needs
  it.
- **Subagents for reading.** A subagent reads the forty files and returns a
  paragraph. The main conversation keeps the paragraph, not the forty files.
- **Stay away from the ceiling.** When a session is close to the context limit,
  that is the moment to wrap up and hand off, not to start the next feature.
- **Watch the ratio, not the total.** The one session where I can measure it
  exactly read about 420 tokens for every one it wrote. The Starkive marathon
  read about 1,550. Most of the difference, I think, is how long I let the
  conversation run.

One more number. The research and site work behind this page, in a single
session, had read 766 million cached tokens by the time the figures were in.

## What this is not

- These are the 14 sessions whose records I can still read, from 28 August to 19
  October. Sessions I ran locally without Remote Control do not show up, which
  includes most of Starkive Manifest's first two months.
- The Mac sessions do not record output or thinking tokens, so their dollar
  figures cover the input side only and are low. The Starkive output figure is an
  estimate from the visible text at roughly four characters a token, and so is
  the CLAUDE.md share.
- The dollar figures are list-price equivalents. For the cloud sessions they are
  reported by Claude Code. For the Mac sessions they are my estimates at each
  model's published rate. I checked the method against the one session with a
  reported cost, and it lands in range.
- Some subagent work in the biggest sessions is missing from their totals, so if
  anything those numbers are low.

How much of your agent's tokens are the actual work?
