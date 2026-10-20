---
kind: link
title: "Next-Concept Modeling: Fast, Parallel Coarse-to-Fine Text Generation"
summary: "A Stanford lab's alternative to writing one token at a time: encode text as a hierarchy of codes, then write one level at a time with every code in a level in parallel. The reported speedup is 10 to 31 times over diffusion baselines."
url: "https://hazyresearch.stanford.edu/blog/2026-10-12-ncm"
source: "Hazy Research"
topics: []
---

Most text generation happens one token at a time. Diffusion language models are
the main alternative, and they refine the whole sequence over many steps. That is
parallel, but it is not cheap.

NCM takes a third route. Stage one trains a multiscale tokenizer that represents
text as a hierarchy of discrete codes, coarse at the top and detailed at the
bottom. Stage two freezes that tokenizer and trains a transformer to predict one
level at a time, with every code inside a level predicted in parallel. Generation
takes a handful of steps instead of hundreds.

The headline numbers are measured against diffusion baselines on a single H100.
21 times faster on LM1B, 10 times on OpenWebText, and 31 times on XSum at
matching ROUGE-L. It reaches better generative perplexity on LM1B with 12
function evaluations where DUO uses 128. Training used about 4.9 times fewer
tokens on LM1B and 4 times fewer on OpenWebText, counting the tokenizer.

The result I keep looking at is Sudoku. NCM fully solves 99.5% of easy boards and
86.1% of hard ones, against 84.7% and 58.4% for the strongest diffusion baseline.
The argument is that writing the coarse structure first is planning, and
constraint problems need planning.

What this is not: the models here run from 97M to 725M parameters, are evaluated
on academic benchmarks, and are compared to diffusion baselines rather than to
frontier language models. The paper does not claim parity with them. Code,
checkpoints and data are on GitHub and Hugging Face under MIT.

The open question is whether coarse-to-fine survives at larger scale. The authors
list further scaling, training the tokenizer and generator together, and letting
the model decide how much computation each example needs.
