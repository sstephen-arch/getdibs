---
title: "Firasa"
summary: "A local classification pipeline. Classifies a domain on two axes, whether an enterprise would pay for it and what it actually does, and writes one provenance-stamped record per domain into Postgres."
status: building
year: "2026"
topics: ["building"]
---

The seeding pipeline runs against a local database. The core loop makes zero
external API calls.
