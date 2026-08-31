# LDW DAST Comparative Proof

Public synthetic benchmark workspace for Lowcountry Digital Works (LDW) dynamic application security testing (DAST) evaluations.

## Current status

**DESIGN FROZEN / IMPLEMENTATION BLOCKED PENDING PORTFOLIO PHASE-B AUTHORIZATION**

This repository is not a production application, customer system, security product, or adopted LDW scanner integration. It exists only to hold reproducible synthetic proof material.

The current authorized Decloak evaluation is governed by the private `LowcountryDigitalWorks/business-operations` decision:

`docs/governance/decisions/2026-08-30-decloak-dast-controlled-proof-authorization.md`

At this design freeze, Portfolio main was observed at `fe4a848276e668ffb60895e291bf9bec2dd4b3d1`.

## One-shot proof rule

The planned first technical proof is intentionally one-shot: one isolated disposable target, one vendor-operated Enterprise scan, with full investigation + Active Testing + AI Pentesting enabled. Authenticated mode may be included only if it can be attached to that same scan with a synthetic session; otherwise it is skipped rather than requesting another proof scan.

See [`docs/ONE_SHOT_PROOF_DESIGN.md`](docs/ONE_SHOT_PROOF_DESIGN.md) for the frozen matrix and [`docs/RESULT_TEMPLATE.md`](docs/RESULT_TEMPLATE.md) for evidence capture.

## Hard boundaries

No customer or production target, PHI, CUI, customer data, real credentials/tokens, payment data, private source submission, production DNS, production bindings/storage, GitHub App, browser extension installed by LDW, webhook, CI/release dependency, or paid entitlement is permitted by this repository.

No target application code, Cloudflare deployment configuration, dependencies, or runtime resources may be added until Portfolio advances the Phase-B gate.
