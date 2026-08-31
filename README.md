# LDW DAST Comparative Proof

Public synthetic benchmark workspace for Lowcountry Digital Works (LDW) dynamic application security testing (DAST) evaluations.

## Current status

**PHASE B IMPLEMENTATION AUTHORIZED / IMPLEMENTATION CANDIDATE IN REVIEW / NOT YET DEPLOYED OR PROVIDED TO DECLOAK**

This repository is not a production application, customer system, security product, or adopted LDW scanner integration. It exists only to hold reproducible synthetic proof material.

Portfolio authorized the bounded Phase B implementation and one-shot execution in:

`LowcountryDigitalWorks/business-operations/docs/governance/decisions/2026-08-31-decloak-dast-phase-b-design-authorization.md`

The accepted proof-design baseline is main `904ad1a29306337a16fb076926a9d912ab348af5`.

## One-shot proof rule

The first technical proof remains intentionally one-shot: one isolated disposable target and one vendor-operated Enterprise scan sequence with full investigation + Active Testing + AI Pentesting enabled. Authenticated mode may be included only if it can be attached to that same scan with a synthetic session; otherwise it is marked NOT TESTED rather than requesting another proof scan.

See [`docs/ONE_SHOT_PROOF_DESIGN.md`](docs/ONE_SHOT_PROOF_DESIGN.md) for the frozen matrix, [`docs/IMPLEMENTATION_NOTES.md`](docs/IMPLEMENTATION_NOTES.md) for the current implementation choices, and [`docs/RESULT_TEMPLATE.md`](docs/RESULT_TEMPLATE.md) for evidence capture.

## Implementation boundary

The authorized candidate uses only one TypeScript/Hono Cloudflare Worker, one Worker static-assets binding, and one dedicated disposable D1 database containing synthetic rows. The committed Wrangler configuration intentionally contains a placeholder D1 identifier until the dedicated proof database is created during the authorized deployment step.

No custom domain, production DNS, production/shared Worker or D1 resource, customer data, PHI/CUI, real credentials/sessions, private source submission, GitHub App, Decloak token, webhook, or permanent Decloak CI/release dependency is permitted.

No target URL may be provided to Decloak until the implementation PR, local/CI validation, D1 read-only proof, deployment freeze, and deployed-target self-validation all pass.
