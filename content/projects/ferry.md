---
title: "Ferry"
summary: "A self-built Steam Play runner for macOS. It forks NotProton and replaces CrossOver's closed-source Wine runtime with one compiled from CodeWeavers' published sources."
status: building
year: "2026"
links:
  - label: "GitHub"
    url: "https://github.com/sstephen-arch/ferry"
topics: ["building"]
featured: true
---

Ferry applies the `lsteamclient` Steam redirect directly in Wine's source instead
of binary-patching `ntdll.dll`, and ships DXMT for DX10 and DX11 with optional
D3DMetal for DX11 and DX12. It is built for personal use.
