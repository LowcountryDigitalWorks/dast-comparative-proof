# LDW DAST Comparative Proof

Public synthetic benchmark workspace for Lowcountry Digital Works (LDW) dynamic application security testing (DAST) evaluations.

## Current status

**PHASE B EXECUTED / TECHNICAL DISPOSITION: MIXED / RUNTIME CLEANUP VERIFICATION PENDING**

The bounded Decloak Enterprise Phase B proof was executed against one isolated disposable synthetic target. The accepted technical disposition is:

**MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN.**

Decloak demonstrated distinct black-box/runtime value, including confirmed reflected XSS and useful active/API discovery, but material seeded conditions remained missed or inconclusive. The detailed evidence and final reconciliation live in [`docs/DECLOAK_PHASE_B_RESULT_ASSESSMENT.md`](docs/DECLOAK_PHASE_B_RESULT_ASSESSMENT.md). Sanitized vendor-facing feedback lives in [`docs/DECLOAK_VENDOR_FEEDBACK.md`](docs/DECLOAK_VENDOR_FEEDBACK.md).

The proof used only synthetic data and disposable proof infrastructure. No customer or production target, PHI, CUI, customer data, real credential/session, private source submission, production DNS, or production/shared application resource was part of the proof.

## One-shot integrity

The proof remained intentionally one-shot: one disposable target and one vendor-operated Enterprise scan sequence with full investigation, Active Testing, API testing, AI Pentesting, and synthetic authenticated scanning enabled.

The benchmark was not tuned, modified, or rerun merely because seeded conditions were missed. The frozen design and expected-condition matrix remain in [`docs/ONE_SHOT_PROOF_DESIGN.md`](docs/ONE_SHOT_PROOF_DESIGN.md).

## Runtime cleanup

Repository evidence confirms the proof result and one-shot integrity, but this repository does **not yet contain independently verified decommission evidence** for the disposable Worker and D1 runtime. Runtime cleanup therefore remains a closeout item and must not be represented as complete until authoritative deletion/hostname evidence is recorded.

No redeployment or rerun is required for this documentation closeout.

## Entitlement and use boundary

LDW's canonical Tool Register records Decloak AppSumo Tier 3 as activated/active. Ownership of that entitlement does **not** convert the technical result to PASS, authorize unrestricted customer/production scanning, make Decloak a sole source of truth, or replace existing LDW controls and human review.

This repository is a synthetic proof workspace, not a production application, customer system, security product, or permanent Decloak CI/release integration.

## Authority

Portfolio authorized the bounded one-shot Phase B proof in:

`LowcountryDigitalWorks/business-operations/docs/governance/decisions/2026-08-31-decloak-dast-phase-b-design-authorization.md`

The implementation merge was `60f872317232b558349785b4dd041b1308133b12`; the accepted deep evidence reconciliation was merged after the proof without changing benchmark behavior.
