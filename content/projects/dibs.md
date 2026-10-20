---
title: "Dibs"
summary: "A stock alert service. Paste a product link and Dibs polls the retailer's official product API and texts you the moment it flips back to buyable."
status: building
year: "2026"
topics: ["building"]
---

It never buys anything and never touches the retailer account. A Cloudflare Worker
polls on a one-minute cron, Supabase holds users, watches and stock state, and the
web app carries the dashboard and billing.
