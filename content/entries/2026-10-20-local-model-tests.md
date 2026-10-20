---
kind: essay
title: "Testing local models on my own machine"
summary: "Twelve coding problems, a speed test and two full app builds against local models, and what the failures showed. Every number is a recorded test result rather than a model’s account of its own work."
topics: ["local-ai"]
---

I run models on my own machine and I want to know what they can be trusted with.
So I built a harness. It gives a model work I can grade, runs it against a local
server, and writes down what happened. Most of what it has written down is
failure.

Nothing here is a leaderboard. It is one Mac, a small number of runs, and a set
of results I did not expect.

## What it runs

The harness talks to oMLX on `127.0.0.1:8000`, taking its key from
`~/.omlx/settings.json`. `BENCH_BASE` overrides the address, which is how the
same tests run against other engines. Requests go to `/v1/chat/completions` at
temperature 0.2. `speed.py` also calls `/v1/messages`, the Anthropic shape,
because that is the path Claude Code uses.

`THINK_LEVEL` sets `reasoning_effort` to low, medium or high. Left unset, the
model uses its own default. That one setting mattered more than the choice of
model.

| Suite | What it asks | How it is graded |
|---|---|---|
| `hard_code.py` | 6 problems: calc, regex, topo, RangeSet, duration, LFU | Hidden assertions, 12k token cap |
| `harder_code.py` | 6 problems: json_parse, text_justify, sudoku, cheapest_flight, min_window, median_stream | Hidden assertions, 16k token cap, answers and RESULTS.md written to disk |
| `speed.py` | load, writing speed, reading an 11k token prompt, four requests at once, one tool call | Wall clock and tokens |
| app rounds | Build a complete SwiftUI app from a spec, then improve and review it | Real xcodebuild and simulator test runs |

The problems are picked so that a plausible answer is not a passing answer.
`json_parse` means writing a JSON parser with no `json` module. `min_window`
includes a 400,000 character case that has to finish in under three seconds.

## What keeps failing

The most common failure in the harder suite is spending the whole token budget
thinking and never writing the answer. It looks the same every time. The answer
is cut off at the cap and the graded run dies with `NameError: name 'json_parse'
is not defined`, because no function was ever emitted. gpt-oss did this at 16,000
tokens on four recorded runs. Flash-Next did it on a `json_parse.py` that reached
38,955 bytes without closing a string.

The loop experiment had the clean version of this. One variant ran a model whose
thinking could not be switched off. Every call came back at the token limit and
the draft was reasoning with no code in it. It scored nothing. Switching the
thinking off fixed it.

The second failure is claiming to be finished. A model that cannot run a
simulator still writes a confident `DONE.md`. One of them says it plainly:
"Tests were not executed here - no simulator runtime is available in this
sandbox." It also admits that a test file had been corrupted, and that a real bug
in the game only showed up when the harness ran the tests.

That was not a one-off. The next review round opens by telling the model that its
previous claims turned out false, and to trust only the code and the real output.
I do the same thing now. Every number on this page is a test result, not a
model's account of its own work.

## The code tests

Six hard problems, graded mechanically. Two runs of the same model are shown
because they scored differently.

| Model | Run | Score | What failed |
|---|---|---|---|
| Qwen3.8-Flash-Next-oQ4e-mtp | 1 | **3/6** | calc `SyntaxError`, regex `AssertionError`, duration `SyntaxError` |
| Qwen3.8-Flash-Next-oQ4e-mtp | 2 | **4/6** | calc `AssertionError`, intervals missing `add` |
| mellum2.1-thinking | 1 | **6/6** | nothing |

The harder six, where the failures say more than the scores.

| Model | Thinking | Score | What failed |
|---|---|---|---|
| gpt-oss-120b-MXFP4-Q8 | high | **5/6** | json_parse, at 16,000 tokens |
| gpt-oss-120b-MXFP4-Q8 | high | **5/6** | json_parse, at 16,000 tokens |
| gpt-oss-120b-MXFP4-Q8 | high | **3/6** | json_parse, text_justify, sudoku, all at 16,000 tokens |
| gpt-oss-120b-MXFP4-Q8 | max | **6/6** | nothing |
| gpt-oss-120b-MXFP4-Q8 | max | **6/6** | nothing |
| gpt-oss-120b-MXFP4-Q8 | max | **4/6** | json_parse, sudoku |
| Qwen3.8-Flash-Next-oQ4e-mtp | default | **5/6** | json_parse, at 16,000 tokens |
| mellum2.1-thinking | default | **3/6** | json_parse at the cap, text_justify, sudoku timed out |

Two things stand out. max is the only setting that ever reached 6/6, and the only
one that ever solved `json_parse`. Three runs at high failed it. Both successful
max runs passed it, in 133 seconds and 10,650 tokens. But max also produced a
4/6, and high dropped to 3/6 on its third run. More thinking did not always mean
a better result.

## Speed

Same Mac, one engine at a time, thinking off. Writing and reading are measured
separately, and the gap between them is much larger than the gap in writing
speed.

| Model | Load | Write tok/s | Read tok/s | ~70k setup | 4 at once |
|---|---|---|---|---|---|
| mellum2 BF16 12B | 0.2 s | 99.0 | 3,445 | 20 s | 207 tok/s |
| Qwen3.6-35B-A3B-8bit | 0.06 s | 152 | 5,169 | - | 240 tok/s |
| Qwen3.8-27B-8bit (Splash) | 0.14 s | 50.5 | 988 | - | 134 tok/s |
| Qwen3.8-27B (Mirai) | 0.58 s | 40.7 | 1,079 | - | 32 tok/s |
| Qwen3.8-Flash-Next-oQ4e-mtp | 16.6 s | 52.5 | 1,065 | 66 s | 79 tok/s |
| Qwen3.8-27B-oQ8e-mtp | 5.1 s | 17.3 | 769 | 91 s | 55 tok/s |

Load time decides whether a model is usable in a loop. 0.2 seconds is fine. 16.6
seconds means waiting before every run. Reading speed matters for the same
reason. The 70k column is what a Claude Code sized session costs in prompt
processing, and it ranges from 20 seconds to 91.

The fastest model here is not the best coder. Qwen3.6-35B-A3B writes at 152
tokens a second and reads at 5,169, and scored 16 out of 18. The slower
Qwen3.8-27B-8bit scored 17. Speed and quality came apart.

## Building a whole app

The code tests are small. The app rounds are not. The task is a complete Swift 6
SwiftUI party game with ten playable mini-games, a scoring engine and a real test
suite. Each round is driven headlessly and graded by running xcodebuild and the
simulator tests.

| Round | Model | What it did | Result |
|---|---|---|---|
| r2 | Qwen3.8-27B-8bit | Two review and fix passes over its own app, given real simulator output and a list of known bugs | 64 tests with 7 failures, then **78 tests, 0 failures** |
| r3 | Flash-Next | From scratch | 122 min, 52 files, 5,809 lines, 124 test functions |
| r4 | Flash-Next | Review, Liquid Glass, three RealityKit 3D games | **183 tests, 0 failures** |
| r5 | Flash-Next | Given only "Improve the app." at max effort | **195 tests, 0 failures** |
| r6 | Flash-Next | A 3D arcade section and a voxel runner | **208 tests, 0 failures** |
| r7 | MiniCPM-V-4.7-35B-A3B | The whole journey from scratch, six phases | **Blocked.** 31 files, 2,915 lines, 26 test functions, tests never ran |
| r8 | Flash-Next | Research the domain first, then implement | Research done in 7 minutes, stopped before implementing |

r7 is the row I keep coming back to. Same harness, same spec, same phases,
different model. Six build passes, tests that never ran once, and a `BLOCKED.md`
at phase five. Flash-Next had already taken that exact task to 208 passing tests.
Whatever separates those two models is not visible in a code benchmark. It is
whether the model can hold a large project together for two hours.

A separate test applies a visual overhaul to a real iOS app under hard
constraints. No new packages, no new assets, procedural textures only, game logic
frozen, and 254 existing tests that must keep passing. Phase 1 failed its first
attempt for a good reason. The model wrote `hashValue` in a comment, and the
check greps comments, because a hash seed changes on every launch. Phase 2 passed
with 267 then 268 tests. Phase 3 was stopped and handed off.

## Review rounds

The most useful experiment separates two things people usually mix up: how good a
model is, and how much a review round can repair. Each task is written, then
reviewed and fixed for several rounds, and scored twice. Once on the first draft
and once on the final code, against held-out tests with a different seed.

| Writer | Reviewer | First draft | After review |
|---|---|---|---|
| KAT-Coder-V2.5-Dev-VL-oQ8e-mtp | Qwen3.8-27B-8bit | 16.3% | **99.9%** |
| KAT-Coder-V2.5-Dev-VL-oQ8e-mtp | gpt-oss-120b-MXFP4-Q8 | 38.0% | **90.8%** |
| Tiel-Coder-35B-A3B-MLX-oQ6e-MTP | gpt-oss-120b-MXFP4-Q8 | 27.6% | **66.4%** |
| gpt-oss-120b-MXFP4-Q8 | gpt-oss-120b-MXFP4-Q8 | 25.8% | **55.9%** |
| Qwen3-Coder-Next-8bit | Qwen3-Coder-Next-8bit | 14.4% | **19.6%** |

The review round is worth more than the choice of writer. A model reviewing
itself barely moved, 14.4% to 19.6%. The same writer with a different model
reviewing it went from 16.3% to 99.9%.

It can also destroy working code. One regex answer scored 47.2% on the first
draft and nothing after review, because the module no longer loaded. A cron
implementation went from 78.2% to 42.0%. That is why the harness also scores the
best round. Fix rounds lift the average and occasionally wreck the one thing that
already worked.

## What I take from this

- The only numbers that meant anything came from running the code. Every model
  made confident, wrong claims about its own work.
- More thinking did not reliably help. max was the only setting that solved
  `json_parse`, and it also produced the second worst run.
- The reviewer mattered more than the writer. Self review moved 14.4% to 19.6%.
  Cross model review moved 16.3% to 99.9%.
- Speed and quality are unrelated. The fastest model here was not the best coder,
  and load time varies by two orders of magnitude between engines.
- Long horizon work is the real cliff. Two hours of multi-file work is where
  models stop resembling each other, and no code benchmark shows it.
- The instrument is part of the measurement. Half the improvements in these logs
  are to the harness itself, not to the models.

## What this is not

Most rows are single runs. The gpt-oss thinking comparison is three runs each,
and both settings fell off on the third, so run to run variance is real and I
have not measured it.

Several experiments are unfinished. A newer harder run has code but no results.
The six problem very hard suite, a Scheme interpreter, type inference and a Myers
diff, has no results file at all. The Tetris generations have raw HTML and logs,
and nobody recorded whether the games played.

The percentages across variants are not strictly comparable, because different
variants ran different subsets of tasks.

The app review folder holds reviews written by a cloud model, not a local one.
They are useful bug lists. They are not evidence about local models.

The multi phase visual test passed mechanical checks. Build, tests, greps, byte
identical frozen directories. It did not pass a human looking at it.

If you are running models locally, what does your testing actually catch?
