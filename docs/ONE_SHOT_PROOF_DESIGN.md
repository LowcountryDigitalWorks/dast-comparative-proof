# One-Shot Enterprise DAST Proof Design

Date: 2026-08-31

Status: **DESIGN FROZEN / IMPLEMENTATION BLOCKED PENDING PORTFOLIO PHASE-B AUTHORIZATION**

Technical owner: **LDW Developer Tooling & CI Orchestrator**

Proof repository: `LowcountryDigitalWorks/dast-comparative-proof`

Observed repository baseline before this design branch:

- main: `2ed4f7f33002de423c7c0242213e53d8c40a84a4`
- tree: `6ea5797d94a09310402da75444823e3e1c5da76e`

Observed Portfolio main at design freeze:

- `LowcountryDigitalWorks/business-operations`
- main: `fe4a848276e668ffb60895e291bf9bec2dd4b3d1`
- tree: `3c0ecffc781b3d77ef6be4273e5e51428abc9390`

Authoritative Portfolio decision:

`docs/governance/decisions/2026-08-30-decloak-dast-controlled-proof-authorization.md`

## Purpose

Build one small, disposable, intentionally vulnerable application that represents the web/application patterns LDW actually uses or can realistically expect to use, then run **one** vendor-operated Decloak Enterprise proof scan against it.

The benchmark must distinguish runtime security value from findings LDW already obtains cheaply through dependency scanning, secret scanning, deterministic tests, browser checks, Website Quality Toolkit evidence, and repository/security review.

The proof is intentionally black-box from Decloak's perspective. Decloak receives only the deployed proof target URL and any same-scan synthetic session instructions needed for authenticated mode. Do not provide the repository/source URL before the scan.

## One-shot rule

The first Decloak technical proof must use a single Enterprise scan sequence:

1. full Enterprise investigation;
2. **Active Testing enabled**;
3. **AI Pentesting enabled** with its separate consent;
4. authenticated scan mode included only if a synthetic session can be attached to that same scan.

If authenticated mode cannot be attached to the same scan, mark that capability **NOT TESTED**. Do not request a second courtesy scan solely for authentication.

No benchmark tuning or repeat scan is permitted merely because a seeded condition was missed.

## Representative LDW technology surface

The benchmark should represent actual LDW architectural patterns rather than adding runtimes only for language variety.

Current LDW evidence includes:

- Astro-generated static web content and browser JavaScript;
- Cloudflare Workers serving static assets plus dynamic routes;
- TypeScript/JavaScript application code;
- Hono-based HTTP applications;
- browser automation and Playwright-style behavior;
- serverless API integrations;
- D1/SQLite-style relational persistence in accepted product architecture;
- forms, redirects, authenticated portal-like flows, JSON APIs, and client-side scripting.

The proposed proof therefore uses:

- **Astro / HTML / CSS** for representative static-site output;
- **vanilla browser JavaScript** for client behavior;
- **TypeScript + Hono** for dynamic routes and API behavior;
- **Cloudflare Workers** as the serverless runtime;
- **Cloudflare D1 / SQL** for a real isolated injection target and safe parameterized control;
- **REST + OpenAPI/JSON** for normal API discovery;
- **GraphQL** for a current advertised Enterprise discovery/test path;
- **minimal WSDL/SOAP XML** as a secondary discovery-breadth check;
- **JWT/cookie/session behavior** for weak-token and optional authenticated-crawl evidence;
- **HTML forms / FormData** so request-body handling is represented.

Do **not** add Python, PHP, Java, .NET, or another server runtime merely to make the benchmark multilingual. DAST evaluates externally observable application behavior; extra backend runtimes would increase infrastructure and maintenance burden without materially improving this proof. Revisit a different runtime only when an actual LDW/client workload requires it.

## Deployment architecture

Phase B, if authorized, should create only:

- one dedicated disposable Cloudflare Worker;
- one random/unlinked `workers.dev` hostname;
- one dedicated disposable D1 database containing only synthetic rows;
- static assets built from this proof repository.

No custom domain or production DNS is required.

No production Worker, Pages project, D1 database, KV namespace, R2 bucket, Queue, Durable Object, authentication provider, production secret, customer service, analytics platform, or production binding may be shared.

All responses should carry an indexing directive such as:

`X-Robots-Tag: noindex, nofollow, noarchive`

Do not use `robots.txt` rules that could prevent the DAST crawler from exercising the target.

The proof target makes no outbound calls to third-party services.

## Seeded expected-condition matrix

### A. Primary distinct-value canaries

These are the highest-value score-bearing conditions.

| ID | Condition | Representative surface | Expected Decloak path | Why it matters |
| --- | --- | --- | --- | --- |
| D01 | Reflected XSS from `q` into server-rendered HTML | Hono / HTML / query input | Active reflected-input finding -> `dalfox` confirmation | Runtime exploit confirmation beyond static modeling |
| D02 | Real read-only D1 SQL injection through an API query parameter | Hono / D1 / SQL / REST | API discovery -> `sqlmap` confirmation | Direct runtime counterpart to LDW's known Hono/D1 SAST gap |
| D03 | Arbitrary reflected `Origin` with credential-compatible CORS behavior on synthetic profile API | REST / headers | Active/API CORS probe | Common portal/API misconfiguration |
| D04 | Unnecessary PUT/DELETE support on a no-op configuration endpoint | REST / HTTP methods | Active HTTP-method probe | Tests method exposure without destructive behavior |
| D05 | Unsafe `postMessage` handler lacking origin validation and writing attacker-controlled data with an HTML sink | Browser JS | Active `postMessage` audit | Modern client-side application behavior |
| D06 | Unlinked common administrative route | Web routing | Forced browsing | Attack-surface discovery current tests may not enumerate |
| D07 | OpenAPI specification describing the public REST surface | OpenAPI / JSON | Structured API discovery | Validates advertised API-aware scan path |
| D08 | Same-origin REST endpoint called from browser JavaScript but intentionally omitted from OpenAPI | Browser JS / REST | JavaScript-derived API discovery | Tests discovery beyond documentation |
| D09 | Undocumented `debug` query parameter on the JS-discovered endpoint | REST | `ffuf` hidden-parameter discovery | Tests discovery beyond visible forms/specs |
| D10 | Fake, synthetic `/.git/HEAD` exposure that contains no repository data | Web exposure | Forced browsing/passive signal -> `nuclei` deepening | Exercises exposure confirmation safely |
| D11 | Valid proof-only JWT signed with an intentionally weak, public canary signing value | JWT | JWT discovery -> `jwt_tool` weak-secret analysis | Tests current pentest token capability without any real credential |
| D12 | Unauthenticated API path with sensitive-looking but completely synthetic account-export data | REST / access boundary | API auth heuristic | Relevant to future portal/API work |
| D13 | GraphQL endpoint with introspection enabled and conspicuously security-sensitive mutation names, but no destructive resolver behavior | GraphQL | GraphQL discovery/introspection analysis | Tests a specifically advertised Enterprise API capability |
| D14 | Authenticated-only synthetic private area | Cookie/JWT/session | Enterprise authenticated crawl | Tests behind-login coverage if attachable to same scan |

### B. Coverage / overlap canaries

These should be detected if the product performs as advertised, but they do not by themselves establish distinct value because LDW already has cheaper ways to surface them.

| ID | Condition | Expected capability | Interpretation |
| --- | --- | --- | --- |
| O01 | One deliberately missing CSP while other controllable baseline headers remain sane | HTTP/header layer | Overlap control only |
| O02 | One locally served pinned browser library with a known vulnerability | JS CVE layer | Compare against dependency/browser evidence |
| O03 | Public JavaScript source map containing only harmless synthetic source/canary text | Full investigation/source-map analysis | Useful evidence quality test, not enough alone for PASS |
| O04 | Minimal WSDL/SOAP service with synthetic operations | SOAP/WSDL discovery | Secondary API-discovery breadth; not PASS-critical |
| O05 | Form-encoded Hono/FormData input reaching a deliberately unsafe reflected response or read-only query path | Forms / body input | Confirms request-body discovery; secondary to D01/D02 |

### C. Safe controls / false-positive checks

Safe controls must be structurally similar to vulnerable siblings and use neutral names so the scanner cannot infer the answer from route names.

| ID | Safe behavior | Comparator |
| --- | --- | --- |
| S01 | HTML-encode user input before rendering | D01 reflected XSS |
| S02 | D1 `prepare(...).bind(...)` parameterization | D02 SQL injection |
| S03 | Restrict CORS to the one expected synthetic origin and omit credential reflection | D03 permissive CORS |
| S04 | Reject unsupported methods with 405 and a narrow `Allow` header | D04 method exposure |
| S05 | Validate `postMessage` origin and assign untrusted data via `textContent` | D05 unsafe `postMessage` |
| S06 | Require the valid synthetic session for a parallel account/profile endpoint | D12 unauthenticated account-export path |
| S07 | Parallel GraphQL endpoint with introspection unavailable and no security-sensitive mutation surface | D13 GraphQL introspection |

## Route-design guidance

Exact route names are implementation details and should be finalized only after Phase B is authorized. Use neutral route names for vulnerable and safe siblings; do not name routes `vulnerable`, `safe`, `sql-injection`, or similar.

The deployed application itself must not expose this matrix or a list of seeded conditions.

The final public+API surface should stay well below Decloak's documented cap of 20 actively tested API endpoints per scan.

## Real D1 SQL-injection safety constraints

The D1 condition must be genuine enough for black-box exploitation confirmation while remaining incapable of harming anything outside the proof.

Requirements:

- dedicated D1 database;
- only synthetic rows;
- no shared bindings;
- vulnerable route performs a SELECT only;
- app-side defensive guard rejects obvious DDL/DML/destructive keywords before submitting the synthetic query;
- safe sibling uses parameter binding;
- no endpoint exposes mutation/write functionality;
- database can be discarded immediately after the proof.

Decloak's current AI Pentesting terms state that its confirmation techniques exclude payloads intended to write/delete/alter data, but the proof adds the guard above as defense in depth.

## Synthetic authentication design

Authenticated mode must not require LDW or customer credentials.

If Portfolio authorizes this portion:

- expose one intentionally unlinked synthetic session-entry route;
- visiting it creates a proof-only cookie/session that grants access only to the disposable target;
- the session contains no identity, customer data, or production authority;
- the session route is provided to Stephen only if authenticated mode can be attached to the same Enterprise scan;
- the private area contains only synthetic content and at least one private-only route so crawl coverage can be verified.

Do not install Decloak's browser extension in an LDW browser for this proof. Stephen may use Decloak's own test environment to capture the synthetic session if needed.

## Current Decloak Enterprise scan profile to request

Request one vendor-operated scan with:

- Enterprise full investigation;
- Active Testing **ON**;
- AI Pentesting **ON** with separate consent;
- API endpoint discovery/testing **ON** as part of Active Testing;
- authenticated scan/session capture **ON only if it can be included in the same scan**;
- no upcoming/unreleased Expert Mode assumption;
- no custom tuning to the known matrix;
- no source/repository access.

Current public Decloak documentation states that API discovery/testing runs automatically on Enterprise Active Testing and that AI Pentesting is a separately consented second phase using `sqlmap`, `dalfox`, `ffuf`, `nuclei`, and `jwt_tool` against candidates found by the preceding scan.

## Predeclared result interpretation

### PASS — DISTINCT VALUE DEMONSTRATED

Use PASS only if the single scan shows material black-box value beyond LDW's existing controls. A strong PASS should include:

- both D01 XSS and D02 D1 SQL injection confirmed with exploit-quality request/response evidence; and
- useful detection/discovery across most of D03-D13; and
- safe controls are substantially distinguished from vulnerable siblings; and
- evidence reduces analyst investigation effort rather than merely producing more findings.

Authenticated D14 and SOAP/WSDL O04 are coverage breadth checks and are not individually required for PASS.

### MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN

Use MIXED if at least one major runtime vulnerability is convincingly confirmed or attack-surface discovery is materially useful, but one or more of the following remains substantial:

- another major seeded class is missed;
- API/discovery coverage is inconsistent;
- multiple safe controls are flagged as vulnerable;
- evidence is weak or requires large analyst effort;
- operational limitations materially constrain realistic service use.

### FAIL — NO DISTINCT ECONOMIC VALUE

Use FAIL if the scan mainly returns passive/header/dependency/source-map findings LDW already obtains cheaply, neither major runtime exploit canary is convincingly confirmed, or false-positive/noise burden destroys useful signal.

Do not use Decloak's letter/security score as the disposition criterion.

## Known current coverage exclusions

Do not deliberately seed vulnerability classes Decloak currently states its AI Pentesting does not attempt merely to manufacture misses. Current public documentation explicitly excludes classes including SSRF, XXE, command injection, CSRF, and IDOR/BOLA from exploitation confirmation.

Those remain documented product limitations and may be considered later during commercial/technical fit review without turning this proof into a trap.

## Evidence to capture from the one scan

For every seeded and safe condition record:

- detected / missed / not tested;
- Decloak layer that produced it;
- severity;
- exact evidence quality;
- exploit-confirmed / signal-only / inconclusive;
- whether the evidence identifies the relevant route/input/sink;
- whether a safe sibling was also flagged;
- analyst triage time;
- remediation usefulness;
- whether an existing LDW control would already find it.

Also capture:

- setup/build/deployment time;
- vendor handoff time;
- scan duration for full investigation, Active Testing, and AI Pentesting where separately reported;
- report/export quality;
- any rate/quota behavior;
- operational friction;
- unexpected network/data requirements;
- final cleanup time.

Use `docs/RESULT_TEMPLATE.md`.

## Proof integrity rules

- One vendor-operated scan only for the first proof.
- Do not provide source/repository access to Decloak.
- Do not tell the vendor exact seeded routes or expected vulnerabilities before the scan.
- Provide only target URL, authorization confirmation, and same-scan synthetic session entry if needed.
- Do not modify the target after the scan starts.
- Freeze exact deployed commit/tree and D1 seed manifest before requesting the scan.
- Independently validate each seeded vulnerable and safe condition before handoff.
- Do not rerun merely to improve the score.

## Stop conditions

Stop before deployment if implementation would require:

- production DNS;
- customer or production data;
- real secrets/credentials/sessions;
- private source submission;
- broad third-party permissions;
- a paid service;
- a non-disposable production binding;
- a cloud/account mutation outside the Portfolio-authorized Phase-B package.

Stop the active proof if Decloak cannot scope AI Pentesting exclusively to the disposable proof target.

## Rollback / cleanup

After evidence collection:

1. preserve the frozen proof repository and sanitized result matrix;
2. delete the dedicated proof Worker/runtime;
3. delete the dedicated proof D1 database;
4. verify the random `workers.dev` target no longer resolves to the proof app;
5. preserve no tokens, sessions, deployment secrets, or runtime data.

No production rollback should be required because no production resource is modified.

## Implementation gate

This document authorizes **nothing** by itself.

No application source, dependencies, workflow, Cloudflare resource, D1 database, scan, account, or vendor action may be created from this design until Portfolio Orchestrator 2 explicitly advances the current Decloak Phase-B synthetic-proof gate.
