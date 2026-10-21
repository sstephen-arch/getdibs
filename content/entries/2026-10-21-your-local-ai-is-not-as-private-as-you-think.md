---
kind: video
title: "Your Local AI Is Not as Private as You Think"
summary: "Running a model on your own machine keeps your prompts away from a provider. It does not stop a poisoned model, a leaky runner or an exposed server from sending your data somewhere else."
video_id: "3mx84MRj8lY"
channel: "Kai"
duration: "26:00"
topics: ["local-ai"]
---

A backdoored Qwen 2.5 7B passed 50 of 50 clean tests in a coding agent, then sent the project's `.env` file to a stranger's server on a two-word trigger. Kai walks through the five layers of a local AI setup where that kind of thing gets in: model downloads, chat templates, the runner itself, a server bound to `0.0.0.0`, and the weights.

It ends with five fixes worth doing before your next run:

1. Keep Ollama on `127.0.0.1`, and put Tailscale or an authenticated proxy in front of it.
2. Keep your runner up to date.
3. Use official weights for anything with tools.
4. Keep `.env` files, SSH keys and cloud credentials out of the agent's reach.
5. Split command execution from network access, and log what crosses between them.
