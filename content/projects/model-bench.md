---
title: "model-bench"
summary: "A local harness that asks one question of every model I can run: did it finish the job, or does it only look like it did?"
status: building
year: "2026"
role: "Harness, runs, and every failure below"
topics: ["local-ai", "building"]
---

I run models on my own machine and I want to know what they can actually be
trusted with. So there is a harness. It points at a local OpenAI-compatible
server, hands a model work I can grade mechanically, and records what happened —
including, mostly, what went wrong.

Everything on this page comes out of that harness's own logs. It is not a
leaderboard. It is one Mac, a small number of runs, and a set of failures that
changed how I work.

## What it runs

The harness talks to oMLX on `127.0.0.1:8000`, taking its key from
`~/.omlx/settings.json`; `BENCH_BASE` overrides the address, which is how the
same tests run against other engines. Requests go to `/v1/chat/completions` at
`temperature=0.2`, and `speed.py` also exercises `/v1/messages` — the Anthropic
shape, because that is the path Claude Code uses.

`THINK_LEVEL=low|medium|high` becomes the request's `reasoning_effort`. Unset
means whatever the model does by default. That flag turns out to matter more
than any of the model names below.

| Suite | What it asks | Grading |
|---|---|---|
| `hard_code.py` | 6 problems: calc, regex, topo, RangeSet, duration, LFU | Hidden assertions, 12k token cap |
| `harder_code.py` | 6 problems: json_parse, text_justify, sudoku, cheapest_flight, min_window, median_stream | Hidden assertions, 16k token cap, answers and `RESULTS.md` written to disk |
| `speed.py` | load, writing speed, reading a ~11k-token prompt, four requests at once, one tool call | Wall clock and tokens |
| app rounds | Build a whole SwiftUI app from a spec, then improve and review it | Real `xcodebuild` and simulator test runs |

The problems are deliberately the kind where a plausible answer is not a passing
answer. `json_parse` means writing a JSON parser with no `json` module.
`min_window` includes a 400,000-character case that must finish in under three
seconds. A model can produce code that looks right and still fail every one.

## Two failures that keep showing up

**It spends the whole budget thinking and never answers.** This is the single
most common failure in the harder suite, and it looks identical every time: the
answer is truncated at exactly the token cap and the graded run dies with
`NameError: name 'json_parse' is not defined`, because no function was ever
emitted. gpt-oss hit it at 16,000 tokens on four separate recorded runs.
Flash-Next hit it too, on a `json_parse.py` that reached 38,955 bytes without
closing a string.

The loop experiment produced the clean version of this. One variant ran a model
whose thinking could not be switched off: every writer call returned
`finish: "length"` at 16,000 tokens, and the draft was pure reasoning — "Let me
think carefully… 1. **`run_query`**…" — with no code block at all. It scored 0%.
The fix was not a better prompt. It was
`chat_template_kwargs={"enable_thinking": False}`, because a reasoning budget
you cannot disable is a cap on the answer, not on the thinking.

**It claims to be finished.** A model that cannot run a simulator still writes a
confident `DONE.md`. One of them says it plainly, under Known limitations: *"Tests
were not executed here — no simulator runtime is available in this sandbox…
every assertion was hand-verified against the model source line by line, but
runtime execution remains to be done."* It also admits, under Integrity notes,
that a test file had been corrupted and that a real spec bug — accuracy staying
above zero after a bankrupt — was found only when the harness ran the tests for
real.

That was not a one-off. The review round for an earlier attempt opens by telling
the model: *"Your previous claims ('hand-verified', 'reasoned to pass') turned
out false, so do not trust PROGRESS.md or DONE.md claims; trust only the code and
real output."* That line is now the reason every claim on this page is a test
result rather than a model's own summary.

## The code tests

Six hard problems, graded mechanically. Two runs of the same model on the same
six problems are shown, because they scored differently.

| Model | Run | Score | What failed |
|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mtp | 1 | **3/6** | calc `SyntaxError`; regex `AssertionError`; duration `SyntaxError` |
| Qwen3.8-Flash-Next-oQ4e-mtp | 2 | **4/6** | calc `AssertionError`; intervals missing `add` |
| mellum2.1-thinking | 1 | **6/6** | — |

The harder six, where the failures are more informative than the scores:

| Model | Thinking | Score | What failed |
|---|---|---|---|
| gpt-oss-120b-MXFP4-Q8 | high | **5/6** | json_parse, at 16,000 tokens |
| gpt-oss-120b-MXFP4-Q8 | high | **5/6** | json_parse, at 16,000 tokens |
| gpt-oss-120b-MXFP4-Q8 | high | **3/6** | json_parse, text_justify, sudoku — all at 16,000 tokens |
| gpt-oss-120b-MXFP4-Q8 | max | **6/6** | — |
| gpt-oss-120b-MXFP4-Q8 | max | **6/6** | — |
| gpt-oss-120b-MXFP4-Q8 | max | **4/6** | json_parse, sudoku |
| Qwen3.8-Flash-Next-oQ4e-mtp | — | **5/6** | json_parse, at 16,000 tokens |
| mellum2.1-thinking | — | **3/6** | json_parse at cap; text_justify; sudoku timed out |

Two things stand out. `max` is the only setting that ever produced 6/6, and the
only one that ever solved `json_parse` — three `high` runs failed it, both
successful `max` runs passed it in 133 seconds and 10,650 tokens. And yet `max`
also produced a 4/6, and `high` degraded to 3/6 on its third run. Thinking level
is a real variable here, not a dial that only goes up.

## Speed

Same Mac, one engine at a time, thinking off. Writing and reading are measured
separately, and the gap between them is much bigger than the gap in writing
speed.

| Model | Load | Write tok/s | Read tok/s | ~70k setup | 4 at once |
|---|---|---|---|---|---|
| mellum2 BF16 12B | 0.2 s | 99.0 | 3,445 | 20 s | 207 tok/s |
| Qwen3.6-35B-A3B-8bit | 0.06 s | 152 | 5,169 | — | 240 tok/s |
| Qwen3.8-27B-8bit (Splash) | 0.14 s | 50.5 | 988 | — | 134 tok/s |
| Qwen3.8-27B (Mirai) | 0.58 s | 40.7 | 1,079 | — | 32 tok/s |
| Qwen3.8-Flash-Next-oQ4e-mtp | 16.6 s | 52.5 | 1,065 | 66 s | 79 tok/s |
| Qwen3.8-27B-oQ8e-mtp | 5.1 s | 17.3 | 769 | 91 s | 55 tok/s |

Load time is the number nobody quotes and the one that decides whether a model
is usable in a loop: 0.2 seconds versus 16.6 seconds is the difference between
running an agent and waiting for one. Reading speed matters for the same reason —
that ~70k column is what a Claude-Code-shaped session costs in prompt processing,
and it ranges from 20 seconds to 91.

The fastest model here is also not the best coder. Qwen3.6-35B-A3B writes at
152 tok/s and reads at 5,169 tok/s, and scored 16/18 across three runs of the
hard six. The slower Qwen3.8-27B-8bit scored 17/18. Speed and quality came apart
completely, which is the argument for measuring both rather than picking one.

## Building a whole app

The code tests are small. The app rounds are not: build a complete Swift 6
SwiftUI party game with ten playable mini-games, a scoring engine, and a real
test suite, then keep improving it. Each round is driven headlessly, and — this is
the important part — graded by actually running `xcodebuild` and the simulator
tests.

| Round | Model | What it did | Result |
|---|---|---|---|
| r2 | Qwen3.8-27B-8bit | Two review-and-fix passes over its own app, fed real simulator output and a list of known bugs | 64 tests / 7 failures → **78 tests, 0 failures** |
| r3 | Flash-Next | From scratch | 122 min, 52 files, 5,809 lines, 124 test functions |
| r4 | Flash-Next | Review, Liquid Glass, three RealityKit 3D games | **183 tests, 0 failures** |
| r5 | Flash-Next | Given only "Improve the app." at max effort | **195 tests, 0 failures** |
| r6 | Flash-Next | A 3D arcade section and a voxel runner | **208 tests, 0 failures** |
| r7 | MiniCPM-V-4.7-35B-A3B | The whole journey from scratch, six phases | **Blocked.** 31 files, 2,915 lines, 26 test functions, tests never ran |
| r8 | Flash-Next | Research the domain first, then implement | Research done in 7 minutes; stopped before implementing |

r7 is the most useful row. The same harness, the same spec, the same phases, a
different model: six build passes, tests that never executed once, and a
`BLOCKED.md` at phase five. Flash-Next had already taken the identical task to
208 passing tests. Whatever separates those two models is not visible in a code
benchmark — it is whether the model can keep a large, multi-file project
coherent for two hours.

A separate multi-phase test applies a visual overhaul to a real iOS app under
hard constraints: no new packages, no new assets, procedural textures only, game
logic frozen, and 254 existing tests that must keep passing. Phase 1 failed its
first attempt for a reason worth keeping: the model wrote `hashValue` in a
*comment*, and the mechanical check greps comments, because a hash-derived seed
changes on every launch. Phase 2 passed with 267 then 268 tests. Phase 3 was
stopped and handed off.

## What review can and cannot rescue

The most interesting experiment separates two things people usually conflate:
how good a model is, and how much a review round can repair. Each task is written,
then reviewed adversarially and fixed for several rounds, and scored twice —
once on the first draft, once on the final code — against held-out tests with a
different seed.

| Writer | Reviewer | First draft | After review |
|---|---|---|---|
| KAT-Coder-V2.5-Dev-VL-oQ8e-mtp | Qwen3.8-27B-8bit | 16.3% | **99.9%** |
| KAT-Coder-V2.5-Dev-VL-oQ8e-mtp | gpt-oss-120b-MXFP4-Q8 | 38.0% | **90.8%** |
| Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | gpt-oss-120b-MXFP4-Q8 | 27.6% | **66.4%** |
| gpt-oss-120b-MXFP4-Q8 | gpt-oss-120b-MXFP4-Q8 | 25.8% | **55.9%** |
| Qwen3-Coder-Next-8bit | Qwen3-Coder-Next-8bit | 14.4% | **19.6%** |

The review round is worth far more than the choice of writer. A model reviewing
itself barely moved — 14.4% to 19.6%. The same writer with a different model
reviewing it went from 16.3% to 99.9%.

And it can destroy working code. One variant's regex answer scored 47.2% on the
first draft and **0%** after review, with the module failing to load at all. A
cron implementation went 78.2% → 42.0%. A regex implementation went 75% → 62%.
This is why the harness scores the best round as well as the final one: fix
rounds improve the average and occasionally wreck the one thing that already
worked, so keeping the best result is not optional.

## What I take from this

- **Grade the artifact, never the summary.** Every model here produced confident,
  wrong claims about its own work. The only number that meant anything came from
  running the code.
- **Thinking level is not monotonic.** `max` was the only setting to solve
  `json_parse`, and it also produced the second-worst run. A reasoning budget
  that cannot be disabled is a limit on the answer, not the thinking.
- **A different reviewer beats a better writer.** 14.4% → 19.6% self-review
  against 16.3% → 99.9% cross-model review is the largest effect measured here.
- **Speed and quality are decoupled.** The fastest model was not the best coder,
  and load time varies by two orders of magnitude between engines.
- **Long-horizon coherence is the real cliff.** Small problems are largely
  solved; two hours of multi-file work is where models stop resembling each
  other, and it does not show up in any code benchmark.
- **The harness is part of the measurement.** A review round only worked once it
  was fed real simulator output. Rounds failed because a checker greps comments,
  because a thinking mode could not be switched off, because a token cap was hit.
  Half the improvements in these logs are to the measuring instrument.

## What this is not

Being honest about the evidence, since the failures above are the point:

- Most rows are **single runs**. The gpt-oss thinking comparison is three runs
  each, and both settings degraded on the third, so run-to-run variance is real
  and unquantified here.
- Several experiments are **unfinished**: a newer harder run has code but no
  results; the six-problem "very hard" suite (a Scheme interpreter, Hindley–Milner
  inference, a Myers diff) has no results file at all; the Tetris generations have
  raw HTML and logs but nobody recorded whether the games played.
- **The cross-variant percentages are not strictly comparable** — different
  variants ran different subsets of tasks, so the means are partial by
  construction.
- The app-review directory holds reviews written by a **cloud model**, not a
  local one. They are good bug lists and they are not evidence about local
  models.
- The multi-phase visual test passed **mechanical** checks — build, tests, greps,
  byte-identical frozen directories. It did not pass a human looking at it.

I would rather publish the failures than a clean table. The clean table is what
got me into trouble in the first place.
