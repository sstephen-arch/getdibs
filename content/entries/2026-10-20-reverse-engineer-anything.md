---
kind: essay
title: "Reverse Engineer Anything. Just Don't Reverse Engineer Your Vendors."
summary: "A coding agent can now take a licensed app apart and hand back pseudocode from one command. The licence you signed still says no, and a clean room is the version that holds up."
topics: ["building"]
takeaways:
  - "A coding agent can now take a compiled app apart and hand back pseudocode from one command."
  - "Your vendor's license almost certainly bars reverse engineering, and those clauses usually survive cancelling."
  - "Clean-room building, on open standards and open source, is the version that holds up."
  - "Whatever you build or buy, read the data terms before you sign."
---

A GitHub repo called REA (Reverse Engineer Anything) has racked up over 300k stars. It lets a coding agent like Claude Code drive real reverse-engineering tools against compiled apps and hand back pseudocode and a map of how the software works. Work that took a security researcher weeks now starts with one command.

So naturally, someone in every IT department is thinking it. We pay Adobe six figures. Why not point REA at Acrobat and build our own?

Because you signed a contract. Adobe's license bars reverse engineering, with a narrow exception for interoperability. Cloning Acrobat doesn't qualify. Reverse engineering can be legal under copyright law, but your license is a contract, and those clauses usually survive after you cancel. An agent decompiling licensed binaries also leaves logs everywhere. That's discovery waiting to happen.

The legal path is clean-room engineering. Copyright protects code. The idea of a PDF editor or an approval workflow is fair game. Build from your own requirements, on open standards and permissive open-source libraries, with engineers who've never touched the vendor's binaries. Slower, yes. Defensible, completely.

This matters because building is getting cheap. Software stocks lost hundreds of billions in value this year on the fear that AI agents will let companies build instead of buy. I think the pendulum is swinging toward building, starting with niche single-purpose tools.

Alex Karp recently argued on CNBC that companies using OpenAI and Anthropic are handing over their IP. The vendors' contracts say otherwise, but his question applies to every tool in your stack. Where does your data go, and what can be done with it?

When SaaS took off, most organizations focused on breaches and uptime. What the vendor could do with the data was treated as the cost of doing business. With AI that gets harder to ignore, because your workflows and context can become something a model learns from. That's a different risk than a record sitting in someone's database.

So my tier list:

S tier: Building on open source. You skip reinventing the wheel and inherit code thousands of people have already tested.

A tier: Building from scratch. Clean, defensible, and entirely yours.

F tier: Reverse engineering your vendor. A lawsuit with extra steps.

And whichever tier you pick, read the data terms before you sign anything.
