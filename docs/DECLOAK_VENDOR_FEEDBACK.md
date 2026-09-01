# Vendor Feedback — Decloak Enterprise One-Shot Synthetic Proof

This document is sanitized for sharing with Decloak. It contains no report-access token, customer data, production secret, or private source.

**AI-assistance and accuracy disclaimer:** AI substantially assisted evidence extraction, comparison, reconciliation, and drafting. LDW reviewed the conclusions against the frozen benchmark, live read-only checks, and the customer-visible report, but route-specific interpretations may be corrected by Decloak's internal telemetry. This feedback is not a certification.

## Context and disposition

Lowcountry Digital Works built and independently validated a frozen synthetic benchmark before Decloak received the target URL. The disposable target contained only fake data. Stephen Gray operated one Enterprise scan with full investigation, Active Testing, API Testing, AI Pentesting, and authenticated scanning through a synthetic session-start path.

The benchmark was not changed, tuned, or rerun after handoff. Our question was whether Decloak adds material runtime/AppSec evidence beyond our dependency, secret, CI, browser, deterministic-test, site-quality, and framework-aware source controls.

Our evidence-driven result remains:

**MIXED — real distinct value demonstrated, with material detection, orchestration, and report-quality limits.**

LDW subsequently purchased Decloak AppSumo Tier 3 because the proof demonstrated enough distinct runtime value at the accepted one-time cost to justify continued use as a complementary sensor. The purchase does not convert MIXED to PASS, endorse every score/severity/narrative, replace existing controls, or make Decloak an unattended authority.

## What worked especially well

### Confirmed reflected XSS

Decloak discovered reflection on `/search?q=`, then dalfox confirmed executable DOM behavior with a parameter-specific marker. This is exactly the distinct value we wanted: runtime exploit confirmation rather than another passive or heuristic warning.

### JavaScript-derived API discovery

Our first review incorrectly marked this missed. The deeper review found explicit report evidence that Decloak derived both `/api/runtime` and `/api/session-info` from page JavaScript and confirmed HTTP 200. The request inventory also shows the browser fetches, and the endpoints were promoted into sqlmap/dalfox/ffuf target lists.

That is valuable for modern static/serverless applications and should be made more prominent. The API card currently says “Undocumented API endpoint discovery (JS analysis) — Clean,” while its inventory immediately shows two endpoints found in page JS. We now interpret “Clean” as “no issue flagged,” not “nothing discovered,” but the wording obscures a real success.

### Active CORS verification

Decloak sent an explicit hostile Origin to `/api/profile` and displayed the reflected ACAO plus `Access-Control-Allow-Credentials: true`. This proves the configuration defect.

Please separate that from the stronger consequence narrative. The endpoint itself was unauthenticated, and the proof session cookie used `SameSite=Lax`, so the claim that any site can necessarily act as a logged-in victim was not demonstrated by this target.

### Forced browsing and API surface discovery

Decloak found the unlinked `/admin` route, recorded HTTP 200, discovered the OpenAPI operations, and proved GraphQL introspection with Query and Mutation types. The agent log and request inventory also prove that `/service.wsdl`, the browser script, and the source map were fetched.

### postMessage safe/unsafe distinction

The report identified `/embed` as lacking origin validation and passing message data into `innerHTML`. It also noticed the safe `/widget` sibling's nearby `event.origin` check and kept that observation Low rather than treating it as an active risk. That is useful discrimination, though the unsafe case remained a static/behavior signal rather than an executed exploit.

### Authenticated workflow operation

Authenticated mode ran without LDW sharing a real credential or installing Decloak's browser extension. That workflow is useful. Customer-visible route-level evidence needs improvement, discussed below.

## High-value misses and orchestration gaps

### Hono -> D1 SQL injection remained inconclusive

The known route `/api/accounts?id=` builds a real read-only D1 query using direct interpolation. `id=1 OR 1=1` returned all four synthetic rows during final independent validation. A destructive-input guard rejects semicolons and DDL/DML keywords, and there is no write endpoint. The safe `/api/orders?id=` sibling uses `prepare(...).bind(...)`.

Decloak discovered `/api/accounts` through OpenAPI and included the route in sqlmap's 13-target list, but the report does not disclose:

- HTTP method;
- selected parameter;
- preserved baseline query;
- payload;
- response status/body differential;
- sqlmap output or exit classification;
- timeout/retry behavior;
- WAF or TLS evidence.

The displayed explanation says either connection/TLS failed or a WAF/security plugin probably blocked/error-paged requests and that application logic was not exercised. Those are possibilities, not target-specific evidence. The target was reachable and the parameter remained exploitable.

This is our most important technical miss. Content-difference/boolean confirmation for SQLite/D1-like edge workloads and auditable candidate-specific evidence would materially improve the product.

### Hidden `debug` parameter missed after ffuf became inconclusive

Decloak correctly discovered `/api/runtime`, then selected it for ffuf. The report says this one target was inconclusive because of a connection failure or malformed output; 12 other targets completed with nothing found. The actual `debug` parameter materially changes the JSON response and remained live/reproducible.

Please expose the raw failure class, request baseline, parameter candidates, and response differential. Without those, we cannot tell scanner orchestration failure from target behavior.

### Observable weak JWT did not reach `jwt_tool`

Decloak discovered `/api/session-info` from page JavaScript, the request inventory shows the fetch, and the page's browser code renders the response token into the DOM. The response contained a valid three-part HS256 proof JWT, independently verified as signed with the deliberately weak key `secret` and carrying only synthetic proof claims.

`jwt_tool` nevertheless says no JWT-shaped token was found on pages or cookies.

Please ingest JWT candidates from JSON responses, dynamically rendered DOM, browser storage, cookies, and Authorization headers, and distinguish:

- no token discovered;
- token discovered but excluded, with reason;
- token tested, no weak key found;
- token tested and confirmed weak.

### HTTP-method security condition missed despite OpenAPI inventory

Decloak inventoried GET, PUT, and DELETE on `/api/config`, but Active Testing reported permitted methods Clean. The route intentionally returned 200 for DELETE/PUT with `accepted: true` and no state change; `/api/preferences` returned 405 with `Allow: GET`.

This is a discovery-versus-validation gap. Compare declared methods, actual 2xx/4xx behavior, neighboring routes, authorization, and state preconditions, then show route-specific method outcomes.

### Unauthenticated synthetic export was inventoried but not surfaced

`/api/export` was discovered through OpenAPI and promoted into downstream tool lists. It returned synthetic account ID/name/number/plan/balance without a session. The API check “Unauthenticated access on sensitive-looking API endpoint” reported Clean.

We recognize that names and fake fields alone cannot prove a universal access-control vulnerability. A review candidate, with cautious language and endpoint/field/auth evidence, would still be useful.

### Form/body-input XSS was not tested by dalfox

`/form` was crawled and its form was passed to sqlmap `--forms`, which was inconclusive. The route reflects its `note` body field directly into HTML, but `/form` does not appear in dalfox's target list. Extending the successful reflection-to-dalfox path to form-urlencoded/multipart body fields would improve coverage.

### Authenticated private-route coverage is unproved

The report shows an authenticated badge and 16 authenticated pages, and Stephen confirmed the synthetic session-start path was used. But customer-visible requests/logs show no `/session/start`, `/private`, or `/private/reports`, and no public-versus-authenticated differential.

Session capture may occur outside the visible inventory, but the report should show a sanitized authenticated-coverage record:

- session establishment succeeded/failed;
- authenticated-only routes reached;
- routes newly discovered after authentication;
- public versus authenticated status differential;
- session expiry/rejection if relevant.

## Tool-by-tool reconciliation

| Tool     | What the report shows                                                                                                                    | Assessment / requested improvement                                                                                                                                                |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dalfox   | 13 targets; one confirmed `/search` `q` XSS with DOM marker; 12 API routes reported no exploitable reflection                            | Strong success. Rename “confirmed against 13 targets” to “tested 13 targets; one confirmed.” Include body/form candidates.                                                        |
| sqlmap   | 13 route names, including vulnerable `/api/accounts` and safe `/api/orders`, all grouped inconclusive; one form run grouped inconclusive | Expose method, parameter, request, payload class, baseline/differential, status, raw failure category, and exit result. Do not present speculative WAF/TLS causes as if observed. |
| ffuf     | Twelve routes completed with no differing parameter; `/api/runtime` alone inconclusive due connection failure or malformed output        | Show which failure occurred, raw parse/exit status, baseline, candidate names, and response differences. Hidden `debug` was missed.                                               |
| jwt_tool | “Nothing to test” because no JWT found on page/cookie                                                                                    | Candidate ingestion failed despite a JS-discovered, fetched, DOM-rendered weak token. Expand sources and explain eligibility decisions.                                           |
| nuclei   | Info OpenAPI detection after forced-browsing candidate                                                                                   | Valid detection, not an exploit. Do not let “2 confirmed exploits” count imply that OpenAPI discovery is a second exploit.                                                        |

## Safe-control assessment

| Safe control                              | Evidence                                                                                            | Credit                                         |
| ----------------------------------------- | --------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| encoded `/catalog?q=`                     | Crawled; aggregate reflected-input testing flagged only `/search` twice                             | **TESTED / NO ISSUE** at active layer          |
| bound `/api/orders?id=`                   | Included in sqlmap targets, but the entire SQLi result was inconclusive                             | **COVERAGE UNCLEAR**; no discrimination credit |
| restricted-CORS `/api/status`             | Discovered and explicitly requested; aggregate API CORS result found only `/api/profile`            | **TESTED / NO ISSUE**, aggregate evidence      |
| 405 `/api/preferences`                    | Discovered, but method check was globally Clean while unsafe sibling was missed                     | **COVERAGE UNCLEAR**; no discrimination credit |
| origin-checked/textContent `/widget`      | Crawled; report explicitly notes origin validation nearby and does not escalate active risk         | **TESTED / NO ISSUE**; useful differentiation  |
| session-protected `/api/account`          | Discovered and downstream-targeted, but no route-level auth evidence                                | **COVERAGE UNCLEAR / NO HARMFUL FP**           |
| introspection-blocked `/graphql-internal` | Discovered and downstream-targeted; only vulnerable `/graphql` has displayed introspection evidence | **COVERAGE UNCLEAR / NO HARMFUL FP**           |

## Finding quality, severity, and report UX

### Consequence calibration

- `/.git/HEAD` was genuinely reachable and returned 32 bytes, but no refs, config, index, objects, packs, repository reconstruction, or historical secrets were shown. Treat HEAD exposure, likely repository exposure, and successful reconstruction as separate evidence levels.
- CORS headers were actively verified; logged-in-victim exploitability was not.
- `/admin` is an unlinked 200 route, not proof of sensitive content or authorization bypass.
- public OpenAPI and GraphQL introspection are attack-surface/configuration observations, not exploits by themselves.

### Count and label clarity

- 141 findings versus AI Summary 99 issues is not explained.
- 3 critical / 43 high versus AI Summary 2 critical / 43 high is plausibly a pre/post-pentest grouping difference, but not labeled.
- “Configuration & Behaviour Findings (60) in 18 groups,” 46 critical/high, plus 76 informational items does not visibly reconcile to 141.
- Active CORS Clean versus API CORS Critical likely reflects page versus API scope, but the scope is not shown.
- the header card says HSTS present while 18 High findings and live responses show HSTS missing.
- WSDL is crawled, but the specialized SOAP/WSDL discovery check says Clean.
- “confirmed against 13 targets” means target scope even when every result is inconclusive/negative.
- Pentest says two confirmed exploits even though the second visible item is informational OpenAPI detection and explicitly does not affect the score.
- reflected input “affects 2 pages,” but expanded evidence shows `/search` twice, not two distinct routes.

Please label raw observations, deduplicated issues, grouped cards, affected requests, and score-contributing findings separately.

### Duplicate and provider-context noise

- Source-map exposure appears in separate High and Medium groups.
- CSP and HSTS are repeated across page observations rather than presented as one site-wide root issue with affected routes.
- SPF, DMARC, MX, CAA, DNSSEC, and 77 wordlist “subdomains” are misleading on a provider-managed `workers.dev` hostname. All 77 shown hostnames return Cloudflare 404s and are not 77 LDW-owned subdomains.
- The “Third-Party Domains” section calls two scanner-initiated CDN checks services contacted while crawling, while the application network summary correctly shows zero third-party requests. Distinguish scanner-selected external checks from page-initiated traffic.

### Desired evidence model

The most useful analyst table would be:

| Layer/tool | Target                       | Method | Input/parameter  | Discovery provenance | Outcome      | Evidence/failure reason          |
| ---------- | ---------------------------- | ------ | ---------------- | -------------------- | ------------ | -------------------------------- |
| dalfox     | `/search`                    | GET    | `q`              | crawl/reflection     | CONFIRMED    | DOM marker                       |
| sqlmap     | `/api/accounts`              | GET    | `id`             | OpenAPI              | INCONCLUSIVE | exact exit/baseline/differential |
| ffuf       | `/api/runtime`               | GET    | hidden parameter | page JS              | INCONCLUSIVE | connection or parse detail       |
| jwt_tool   | `/api/session-info` response | GET    | JSON/DOM token   | page JS              | NOT INGESTED | exclusion reason                 |

## Prioritized improvements

1. Make sqlmap content-difference confirmation reliable and auditable for SQLite/D1-like serverless behavior.
2. Preserve the successful page-JavaScript endpoint discovery and make it visible as a positive result.
3. Feed discovered JSON/DOM JWTs and body/form inputs into the appropriate tools.
4. Expose route/method/input-level positive, negative, and inconclusive evidence.
5. Improve hidden-parameter orchestration diagnostics and response-differential reporting.
6. Compare accepted HTTP methods and access-control behavior route by route.
7. Show authenticated-only coverage and public/auth differentials.
8. Separate exploit, verified configuration, heuristic, passive observation, clean test, and inconclusive test.
9. Collapse duplicates and explain every top-level count/score.
10. Qualify provider-managed DNS/subdomain context and scanner-initiated third parties.

## Overall feedback

The proof was worthwhile. Decloak is not merely a header scanner: the active engine, agent reasoning, JavaScript/API discovery, and dalfox confirmation showed real potential and enough distinct value for LDW to purchase Tier 3 as a complementary control.

The same proof also shows why LDW will continue deterministic tests, dependency/secret scanning, browser/site checks, framework-aware source review, and human validation. The highest-value next step is not more findings; it is reliable candidate handoff between discovery and tools, route/input-level evidence, and clearer consequence/count semantics.

We appreciate Stephen's generosity, the time spent answering our questions, and the vendor-operated proof. We are sharing this detailed reconciliation in the spirit of reciprocity and welcome corrections based on Decloak's internal telemetry. No rescan is requested.
