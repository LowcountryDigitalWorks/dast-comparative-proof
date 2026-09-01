# Vendor Feedback — Decloak Enterprise One-Shot Synthetic Proof

This document is intentionally sanitized for sharing with Decloak. It contains no report-access token, customer data, production secret, or private source.

## Context

Lowcountry Digital Works built a frozen synthetic benchmark before Decloak received the target URL. The target was intentionally disposable and contained only fake data. We asked for one Enterprise scan with full investigation, Active Testing, API testing, AI Pentesting, and authenticated scanning using a synthetic session-start route.

The benchmark was not changed or rerun merely because Decloak missed a condition.

The purpose was not to see how many findings Decloak could generate. It was to answer a narrower question:

> Does Decloak provide material runtime/AppSec evidence that complements our existing dependency, secret, CI, browser, deterministic-test, website-quality, and static-analysis controls?

Our technical result is **MIXED — real distinct value demonstrated, with material detection and report-quality gaps remaining**.

## What worked especially well

### 1. Confirmed reflected XSS

The strongest result was the reflected-XSS test. Decloak first identified reflection and then dalfox confirmed executable DOM behavior for the seeded query parameter. This is exactly the kind of evidence we wanted from an active/pentest product: a confirmed runtime exploit rather than a heuristic warning.

This is materially more useful to us than another static or passive finding.

### 2. CORS behavior

Decloak correctly identified the endpoint reflecting arbitrary Origin while allowing credentials. That demonstrates useful active API-behavior testing.

One improvement would be to distinguish **configuration defect** from **proven authenticated-victim exploitability**. In our synthetic target the proof session cookie was `SameSite=Lax`, and the vulnerable profile endpoint itself did not require authentication. The configuration finding is valid; the report narrative that any arbitrary site can necessarily act as the logged-in victim is stronger than this specific proof established.

### 3. Forced browsing

Decloak found an unlinked administrative-style route and recorded the successful HTTP response. This is useful distinct attack-surface discovery.

### 4. OpenAPI and GraphQL discovery

Decloak detected the OpenAPI surface and GraphQL introspection. These are valuable capabilities for agency/client web and API assessment work.

### 5. postMessage analysis

Decloak correctly recognized the unsafe `postMessage` handler that writes attacker-controlled message data into `innerHTML` without origin validation. We also provided a safe sibling using origin validation plus `textContent`; we did not see that safe sibling escalated into a comparable exploit finding.

### 6. Source-map and browser-library analysis

Decloak found and fetched the exposed JavaScript source map and correctly detected the intentionally pinned jQuery 3.4.1 CVEs. These overlap some existing LDW controls, but the agent reasoning showing why it fetched and inspected those assets is useful.

### 7. Authenticated-scan workflow

Authenticated scanning successfully ran through the synthetic session-start path in the same proof. That was operationally useful because no LDW production credential or browser-session token had to be shared, and no second scan was needed.

## High-value misses / improvement opportunities

These are the areas that would most improve Decloak's distinct technical value for our workloads.

### 1. Known exploitable Hono -> D1 SQL injection remained inconclusive

We intentionally created a real but read-only SQL-injection condition in a Hono/Cloudflare D1 route. It performs only a `SELECT`, contains synthetic rows, rejects destructive SQL, and was independently verified before the scan to expand results with an `OR 1=1`-style predicate.

Decloak attempted SQL-injection testing but reported it as inconclusive rather than confirming the known condition.

This is the most important miss in our benchmark because framework-aware Hono/D1 security is one of the gaps we are specifically trying to cover with runtime testing.

Improvement ideas:

- improve boolean-based blind/content-difference confirmation for SQLite/D1-like behavior;
- retain candidate-specific baseline/differential responses across sqlmap attempts;
- identify serverless/edge SQL backends where timing-based techniques may be unreliable but content-based proof is strong;
- expose why sqlmap concluded inconclusive (parameter selection, response stability, WAF/edge effects, DBMS fingerprint, payload rejection, etc.).

### 2. Browser-JavaScript-derived API discovery missed an explicit fetch target

The browser bundle contained a direct same-origin call to:

`/api/runtime?mode=summary`

That endpoint was intentionally omitted from OpenAPI so we could test whether Decloak would derive API attack surface from JavaScript/source-map analysis.

The agent fetched both the browser script and source map, but the report did not show discovery of this endpoint. Instead the agent tried generic status/API paths.

This suggests a high-value improvement area:

- parse first-party `fetch`, XHR, axios-like, WebSocket, GraphQL-client, and form-action targets from JavaScript/source maps;
- promote concrete same-origin URL strings into the API testing queue;
- show provenance such as "discovered from app.js line/source-map module".

For modern static/serverless applications, this would be very valuable.

### 3. Hidden parameter fuzzing missed a known `debug` parameter

The undocumented runtime endpoint had a real hidden `debug` parameter that materially changed the JSON response. Hidden-parameter fuzzing repeatedly returned nothing found or inconclusive.

This may partly cascade from the JavaScript-derived endpoint miss. Once a concrete endpoint is discovered, response-differential parameter fuzzing would help here.

### 4. JWT analysis reported `nothing to test` despite an observable proof JWT

The browser bundle also fetched `/api/session-info`, which returned a valid three-part HS256 JWT and rendered it into the page. The token used a deliberately weak/public proof key and had no real authority.

The report's jwt_tool result was `nothing to test`.

Improvement ideas:

- collect JWT-shaped values from JSON responses, DOM text, browser storage, cookies, Authorization headers, and source-map-discovered API responses;
- record why a token was or was not selected for jwt_tool;
- separate "no token discovered" from "token discovered but not eligible/testable".

### 5. HTTP-method probing missed a deliberately permissive route

One OpenAPI-documented route intentionally accepted no-op `PUT` and `DELETE` requests with HTTP 200. A safe sibling returned 405 with a narrow `Allow` header.

The active-testing summary reported HTTP methods clean, so this condition was missed.

A useful enhancement would compare methods against:

- OpenAPI-declared operations;
- GET-only neighboring routes;
- 2xx/4xx behavior by method;
- unexpected acceptance of methods with no authorization or state precondition.

### 6. Unauthenticated sensitive-looking export was not surfaced

A documented API endpoint returned a synthetic account export without authentication. The data was entirely fake but intentionally looked like account data.

We did not see a distinct finding for unauthenticated sensitive-data exposure/access control.

This is difficult to assess generically without business context, but heuristics combining endpoint names (`export`, `download`, `account`, `profile`, `report`) with structured sensitive-looking fields and absence of auth could produce a useful "review access control" candidate rather than asserting a vulnerability.

### 7. Form/body-input testing did not confirm a known reflected HTML sink

A standard HTML form accepted FormData and reflected the submitted value directly into HTML. The route was crawled, but we did not receive useful reflected-XSS confirmation for that body-input path.

Extending the same reflection -> dalfox confirmation pipeline used successfully for query parameters to form-urlencoded/multipart fields would improve coverage.

## Finding-quality and report-UX feedback

### 1. Distinguish confirmed exploit, configuration defect, heuristic, and informational observation

This distinction exists in parts of the product, but it should be much more prominent across the report.

For an analyst, the first view we want is approximately:

1. **Confirmed exploitable**
2. **Actively verified misconfiguration/behavior**
3. **Likely issue requiring manual validation**
4. **Passive configuration/dependency observation**
5. **Informational/clean check**

That would make the Enterprise value immediately visible.

### 2. Collapse repetitive page-level findings

Missing CSP/HSTS, server disclosure, source-map exposure, and similar findings repeat many times and inflate the report. A site-wide root finding with affected-page count plus expandable per-page evidence would reduce analyst triage substantially.

### 3. Clarify top-level counters

Our report displayed 141 findings, while the AI summary described 99 issues. The top metric displayed `3 / 43` critical/high while the prose summary described 2 critical and 43 high.

These may represent different grouping semantics, but the UI does not make that distinction obvious. A tooltip/label such as `141 observations -> 99 deduplicated issues` would resolve this if that is the intended meaning.

### 4. Qualify provider-managed DNS/subdomain context

On a `workers.dev` proof hostname, findings such as SPF/DMARC/MX/CAA and `77 subdomains discovered` are not very actionable and can be misleading because the scanned host is inside a provider-managed hierarchy rather than a registrable customer domain.

Consider determining the registrable/eTLD+1 ownership boundary and suppressing or heavily qualifying controls that the target operator cannot reasonably configure.

### 5. Avoid overstating exploitability from a single exposed marker file

The scanner correctly found our synthetic `/.git/HEAD`, which was a good forced-browsing result. However, the report then stated that the entire source repository could be reconstructed.

Our target only exposed a fake HEAD-like response; no `.git/objects`, refs, index, or repository data existed.

A stronger evidence ladder would be:

- HEAD exposed -> sensitive path confirmed;
- HEAD + refs/config/index exposed -> likely repository exposure;
- object traversal/reconstruction succeeds -> repository reconstruction confirmed.

That would make critical severity much more defensible.

### 6. Separate application-observed third parties from scanner-initiated checks

One section showed two third-party domains while the network-request summary showed zero third-party requests. The agent log indicates it independently checked common CDN domains.

Those are useful actions, but the report should distinguish:

- third parties actually loaded/contacted by the application; and
- external domains the scanner independently chose to investigate.

### 7. Make per-test targeting and outcomes easier to inspect

For pentesting and active checks, a compact table would be extremely useful:

| Tool/check | Target                | Parameter/input     | Result             | Evidence            |
| ---------- | --------------------- | ------------------- | ------------------ | ------------------- |
| dalfox     | `/search`             | `q`                 | CONFIRMED          | DOM marker          |
| sqlmap     | `/api/accounts`       | `id`                | INCONCLUSIVE       | reason...           |
| ffuf       | `/api/runtime`        | parameter discovery | NOT REACHED / NONE | reason...           |
| jwt_tool   | observed token source | token               | NOTHING TO TEST    | discovery reason... |

This would drastically reduce manual report reconciliation.

## Safe-control discrimination

We deliberately paired several vulnerable routes with safe siblings. This was one of the more positive aspects of the result: we did not see clear high/critical false-positive escalation against the safe HTML-encoding, restricted-CORS, origin-validated postMessage, session-protected, or introspection-blocked siblings.

The strongest explicit discrimination was CORS: the vulnerable profile route was found while the constrained status route was tested clean.

For SQLi and HTTP methods, however, safe/unsafe discrimination cannot be credited strongly because the unsafe canaries themselves were not confirmed.

## What would move our result from MIXED toward PASS

For our use case, the highest-value improvements would be:

1. confirm the read-only Hono/D1 SQLi reliably;
2. discover concrete same-origin APIs directly from first-party JavaScript/source maps;
3. feed discovered endpoints into hidden-parameter/JWT/API testing automatically;
4. extend reflected-XSS confirmation to body/FormData inputs;
5. improve method/access-control behavior checks;
6. make exploit evidence and per-tool targeting easier to audit;
7. reduce repetitive/contextually irrelevant report noise.

The product already demonstrated something several generic static scanners did not for us: useful black-box runtime evidence and actual XSS exploit confirmation. The gap is consistency across the rest of the advertised active/pentest surface.

## Overall feedback

The proof was worthwhile. We would not characterize Decloak as "just another header scanner" after this test. The active engine, agent reasoning, API/security-surface work, and dalfox confirmation show real potential.

At the same time, the proof showed why we would still keep deterministic tests, dependency/secret scanning, browser checks, static/framework reasoning, and human review. Decloak currently looks complementary rather than comprehensive.

We appreciate the vendor-operated proof and the willingness to receive detailed technical feedback. The most valuable next improvements for LDW-style serverless web workloads are the Hono/D1 SQLi, JavaScript-derived API discovery, hidden parameter/JWT ingestion, body-input exploitation, and report evidence/triage improvements above.
