# LDW DAST Comparative Proof

Public synthetic benchmark workspace for Lowcountry Digital Works (LDW) dynamic application security testing (DAST) evaluations.

## Current status

**PHASE B FULLY CLOSED / TECHNICAL DISPOSITION: MIXED / RUNTIME DECOMMISSIONED**

The bounded Decloak Enterprise Phase B proof was executed against one isolated disposable synthetic target. The accepted technical disposition remains:

**MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN.**

Decloak demonstrated distinct black-box/runtime value, including confirmed reflected XSS and useful active/API discovery, but material seeded conditions remained missed or inconclusive. The detailed evidence and final reconciliation live in [`docs/DECLOAK_PHASE_B_RESULT_ASSESSMENT.md`](docs/DECLOAK_PHASE_B_RESULT_ASSESSMENT.md). Sanitized vendor-facing feedback lives in [`docs/DECLOAK_VENDOR_FEEDBACK.md`](docs/DECLOAK_VENDOR_FEEDBACK.md).

The proof used only synthetic data and disposable proof infrastructure. No customer or production target, PHI, CUI, customer data, real credential/session, private source submission, production DNS, or production/shared application resource was part of the proof.

## One-shot integrity

The proof remained intentionally one-shot: one disposable target and one vendor-operated Enterprise scan sequence with full investigation, Active Testing, API testing, AI Pentesting, and synthetic authenticated scanning enabled.

The benchmark was not tuned, modified, or rerun merely because seeded conditions were missed. The frozen design and expected-condition matrix remain in [`docs/ONE_SHOT_PROOF_DESIGN.md`](docs/ONE_SHOT_PROOF_DESIGN.md).

## Runtime decommission

Owner-approved runtime deletion completed on 2026-09-14.

- disposable Worker `ldw-dast-proof-6e91c4` was removed;
- dedicated proof D1 `ldw-dast-proof-6e91c4` was removed;
- the former `workers.dev` proof hostname now returns HTTP 404 and no longer serves the synthetic benchmark;
- no production/shared dependency was affected;
- the unrelated `royal-cruise-tracker` D1 remained present and unchanged;
- no DNS, account, billing, security, Pages, KV, R2, Queue, tunnel, secret, other Worker, benchmark, redeployment, Decloak rerun, or tuning change occurred as part of decommissioning.

Any future re-proof or redeployment requires fresh explicit authorization and newly provisioned disposable runtime resources. The deleted Phase B runtime must not be recreated from historical repository configuration without that authorization.

## Historical configuration boundary

`wrangler.jsonc` is retained only as historical/template proof configuration. Its template Worker/D1 names and all-zero placeholder D1 identifier do **not** describe a currently deployed environment and must not be treated as deployable current state.

No live resource name or deleted D1 identifier has been substituted into the historical template.

## Entitlement and use boundary

LDW's canonical Tool Register records Decloak AppSumo Tier 3 as activated/active. Ownership of that entitlement does **not** convert the technical result to PASS, authorize unrestricted customer/production scanning, make Decloak a sole source of truth, or replace existing LDW controls and human review.

This repository is a synthetic proof workspace, not a production application, customer system, security product, or permanent Decloak CI/release integration.

## Authority

Portfolio authorized the bounded one-shot Phase B proof in:

`LowcountryDigitalWorks/business-operations/docs/governance/decisions/2026-08-31-decloak-dast-phase-b-design-authorization.md`

The implementation merge was `60f872317232b558349785b4dd041b1308133b12`; the accepted deep evidence reconciliation was merged after the proof without changing benchmark behavior.
