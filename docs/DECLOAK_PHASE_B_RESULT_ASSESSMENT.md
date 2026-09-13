# Decloak Phase B One-Shot Result Assessment

Status: **DEEP EVIDENCE RECONCILIATION COMPLETE — MIXED / RUNTIME CLEANUP PENDING**

Assessment date: 2026-09-01

Proof source baseline:

- implementation merge: `60f872317232b558349785b4dd041b1308133b12`
- implementation tree: `ffc0b04cb0cffc20672b32d1916634fd1f65e479`
- frozen design: `docs/ONE_SHOT_PROOF_DESIGN.md`
- implementation matrix: `docs/IMPLEMENTATION_MATRIX.md`
- vendor scan reference: Decloak scan ID `be4989ed-d9ff-4d79-9d2e-31bfbf59c0b7`
- report access token is intentionally **not** stored in this repository

This reconciliation used the frozen design and matrix, the exact implementation source and tests, the D1 seed, the browser bundle/source-map behavior, live read-only target checks, the complete customer-visible Decloak report, and Stephen Gray's written scan-configuration confirmation. No rescan, benchmark tuning, target modification, or source disclosure to Decloak occurred.

**AI-assistance and accuracy disclaimer:** AI substantially assisted evidence extraction, comparison, reconciliation, and drafting. LDW reviewed the conclusions against the frozen benchmark, live read-only checks, and the customer-visible report, but route-specific interpretations may be corrected by Decloak's internal telemetry. This assessment is not a certification.

## Technical disposition

**MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN**

Decloak demonstrated distinct black-box/runtime value, led by a dalfox-confirmed reflected XSS, active CORS verification, useful forced browsing, OpenAPI and GraphQL discovery, JavaScript-derived API discovery, postMessage analysis, and an operational authenticated-scan mode.

The proof does not meet the frozen PASS bar. The known Hono -> D1 SQL injection was not confirmed; the discovered runtime endpoint's hidden `debug` parameter was missed after ffuf became inconclusive; an observable, browser-rendered weak JWT did not reach `jwt_tool`; the permissive HTTP-method behavior and unauthenticated export were missed as security conditions; the FormData XSS sink was not tested by dalfox; and authenticated private-route coverage was not demonstrated in customer-visible evidence.

## Commercial state does not alter the result

Eddie reports that LDW purchased Decloak AppSumo Tier 3 on 2026-09-01. A read-only Zoho order-confirmation review independently confirmed a Decloak line item purchased that day, but the email did not display the tier label. The technical disposition remains **MIXED**.

The purchase reflects sufficient distinct runtime value at the accepted one-time cost to justify continued use as a complementary sensor. It is not a retroactive PASS, an endorsement of every score/severity/narrative, production-standard approval, customer-scanning authorization, or replacement for existing LDW controls.

## Scan execution evidence

Stephen Gray confirmed in writing that the one vendor-operated Enterprise scan enabled:

- full Enterprise investigation;
- Active Testing;
- API testing;
- AI Pentesting;
- authenticated scanning using the synthetic `/session/start` URL.

Observed report metrics:

- 16 pages;
- 141 findings;
- 3 critical / 43 high in the headline counter;
- 2 third-party domains;
- 28 network requests, 21 unique;
- 7 agent iterations;
- 16 authenticated pages;
- 8 Active Testing checks, 3 flagged;
- 8 API checks, 15 discovered endpoint records, 3 flagged;
- 6 pentest checks, displayed as 2 confirmed, 1 not applicable, and 3 inconclusive.

The visible investigation log ran from approximately 04:49:10 to 04:50:24. Exact end-to-end queue/report-generation time and LDW analyst wall-clock time were not instrumented and are not fabricated.

## Evidence terms

- **CONFIRMED** — exploit execution was positively demonstrated.
- **DETECTED** — the intended route or behavior was materially identified.
- **SIGNAL ONLY** — useful evidence exists, but exploitability or the intended security consequence was not proved.
- **INCONCLUSIVE** — the relevant test ran but did not reach a reliable positive or negative verdict.
- **MISSED** — the seeded condition existed but the relevant security result was absent.
- **NOT TESTED** — no evidence shows the relevant behavior/input was exercised.

## Authoritative D01-D14 reconciliation

| ID  | Intended route/input                                                          | Source and independent validation                                                                                                                                              | Decloak discovery/test evidence                                                                                                                                                                                                                                          | Final result                                                | Evidence/severity assessment                                                                                                                                                                                                                                    |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01 | `/search?q=` raw HTML reflection                                              | Source interpolates `q`; test and live request confirm raw payload reflection                                                                                                  | Crawled `/search?q=harbor`; Active Testing reflected `q` twice on the same route; dalfox used `/search?q=<payload>` and reported DOM-marker execution                                                                                                                    | **CONFIRMED**                                               | Genuine executable XSS. Strongest distinct result. Critical exploit label is technically supported as execution evidence, while real-world impact remains context-dependent and the target was synthetic.                                                       |
| D02 | `/api/accounts?id=` read-only D1 SQLi                                         | Dynamic `SELECT ... WHERE id = ${id}`; `OR 1=1` returned all four synthetic account rows live; destructive keywords/semicolon rejected; no write path                          | Route discovered via OpenAPI and included in sqlmap's 13-target list. Report exposes no method, selected parameter, payload, status, baseline/differential, raw output, or timeout. Generic result says inconclusive and speculates about connection/TLS or WAF blocking | **INCONCLUSIVE / EFFECTIVE MISS**                           | The known injectable parameter was not confirmed. Running sqlmap is not detection. The report's TLS/WAF explanation is a set of possibilities, not target-specific evidence; the customer-visible data does not establish that `id` was preserved or exercised. |
| D03 | `/api/profile`, arbitrary `Origin` + credentials                              | Source reflects any Origin and sets `Access-Control-Allow-Credentials: true`; live hostile-origin request confirmed both headers                                               | Discovered via OpenAPI; API Testing sent `https://decloak-api-cors-probe.invalid` and showed exact reflected ACAO plus credentials                                                                                                                                       | **DETECTED — ACTIVELY VERIFIED CONFIGURATION DEFECT**       | Configuration defect is proved. The stronger “logged-in victim” narrative is not: endpoint is unauthenticated and the proof cookie is `SameSite=Lax`. Critical consequence is overstated for this target.                                                       |
| D04 | `/api/config`, PUT/DELETE accepted with 200/no-op                             | Source accepts all methods; live DELETE returned 200, `accepted: true`, `changed: false`; safe sibling returned 405                                                            | OpenAPI inventory lists GET/PUT/DELETE. Active Testing nevertheless reports permitted methods “Clean” with no target detail                                                                                                                                              | **DETECTED — SIGNAL ONLY / MISSED SECURITY CONDITION**      | Method existence was inventoried, but the unsafe acceptance condition was not flagged. Discovery is not security validation.                                                                                                                                    |
| D05 | `/embed`, `postMessage` data -> `innerHTML`, no origin check                  | Source/test confirm handler and sink                                                                                                                                           | Route crawled. Active Testing and configuration analysis show exact handler, no origin check, and unsafe sink                                                                                                                                                            | **DETECTED — SIGNAL ONLY**                                  | Useful behavior detection, explicitly described as a static heuristic. No exploit execution was shown. Medium is reasonable as a review finding, not a confirmed exploit.                                                                                       |
| D06 | unlinked `/admin`                                                             | No application link exposes it; source/live response return 200                                                                                                                | Agent generically probed `/admin`; forced-browsing section records GET 200                                                                                                                                                                                               | **DETECTED**                                                | Strong attack-surface discovery. “Sensitive path” is a heuristic; no authentication bypass or sensitive content was proved.                                                                                                                                     |
| D07 | `/openapi.json`                                                               | Source exposes 12 documented operations                                                                                                                                        | API Testing fetched it; inventory lists the 12 operations; nuclei also reported OpenAPI detection                                                                                                                                                                        | **DETECTED — DISCOVERY**                                    | Spec discovery is proved. Public OpenAPI is not automatically a vulnerability; the separate “internal-looking” signal is name-based.                                                                                                                            |
| D08 | page-JS-derived `/api/runtime?mode=summary`                                   | Browser bundle performs the fetch; live request returns 200                                                                                                                    | API inventory explicitly says `GET /api/runtime — found in page JS · HTTP 200`; request inventory contains `/api/runtime?mode=summary`; sqlmap/dalfox/ffuf target lists include route                                                                                    | **DETECTED**                                                | Earlier LDW assessment incorrectly called this missed. JavaScript-derived API discovery worked. The UI's “JS analysis — Clean” means no issue was flagged, not that no endpoints were found, but the wording is ambiguous.                                      |
| D09 | hidden `/api/runtime?debug=`                                                  | Source changes JSON materially when any `debug` parameter is present; live request confirmed extra fields                                                                      | Route was discovered and selected for ffuf. ffuf reports this one target inconclusive due “connection failure or malformed output”; 12 other targets completed with nothing found                                                                                        | **INCONCLUSIVE / EFFECTIVE MISS**                           | Hidden parameter was not found. The report gives no raw command/output, baseline, candidate list, or differential evidence, so scanner orchestration versus target behavior cannot be resolved.                                                                 |
| D10 | synthetic `/.git/HEAD` only                                                   | Source exposes one 32-byte HEAD-like response; no refs, config, index, objects, packs, or repository exists                                                                    | Forced/sensitive-path logic got HTTP 200 and 32 bytes. No evidence shows any other `.git` object or reconstruction. nuclei's visible confirmation was OpenAPI, not Git reconstruction                                                                                    | **DETECTED — SIGNAL ONLY**                                  | Exposed path is real. Critical full-repository/secret-history narrative is unsupported and materially overstates consequence.                                                                                                                                   |
| D11 | `/api/session-info` JSON containing weak HS256 JWT; page renders it           | Browser bundle fetches endpoint and writes token to DOM; request inventory shows fetch; token decodes as HS256 and was independently verified as signed with weak key `secret` | API inventory says route was found in page JS and HTTP 200. sqlmap/dalfox/ffuf included it. `jwt_tool` says no JWT-shaped token was found on pages or cookies                                                                                                            | **MISSED**                                                  | Endpoint discovery succeeded, token ingestion failed. Report contradicts observable response/DOM path and does not distinguish “not collected” from “collected but ineligible.”                                                                                 |
| D12 | unauthenticated `/api/export` with synthetic sensitive-looking account fields | Source/live request return account ID/name/number/plan/balance without session                                                                                                 | Discovered via OpenAPI; included in sqlmap/dalfox/ffuf targets. API “Unauthenticated access on sensitive-looking API endpoint” reports Clean                                                                                                                             | **MISSED SECURITY CONDITION**                               | No access-control/data-exposure candidate was raised. This was a heuristic benchmark, so the absence is a coverage miss rather than proof of a universal vulnerability rule.                                                                                    |
| D13 | `/graphql` introspection + Mutation names                                     | Source exposes unauthenticated introspection and mutation type; live POST confirms `Mutation`                                                                                  | OpenAPI plus GraphQL discovery; API Testing shows POST introspection, 14 types, Query and Mutation                                                                                                                                                                       | **DETECTED — SIGNAL ONLY**                                  | Introspection is proved; mutation names and exploitability were not displayed. Medium configuration/review severity is more defensible than exploit language.                                                                                                   |
| D14 | `/session/start` -> cookie -> `/private` -> `/private/reports`                | Tests prove unauthenticated 401, session redirect/cookie, then authenticated access; live unauthenticated request returned 401                                                 | Vendor confirms authenticated mode and report shows authenticated badge/16 authenticated pages. Request inventory and agent log contain no `/session/start`, `/private`, or `/private/reports`                                                                           | **INCONCLUSIVE — AUTH MODE RAN, PRIVATE COVERAGE UNPROVED** | Session capture may occur outside the request inventory, but customer-visible evidence does not prove either private route was reached or a public/auth differential was exercised.                                                                             |

## Authoritative O01-O05 reconciliation

| ID  | Intended condition                      | Discovery/test evidence                                                                                                          | Final result                                                                                            | Assessment                                                                                                                                                                                                                                                                    |
| --- | --------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| O01 | missing CSP                             | Detailed findings report missing CSP on 18 observations/pages                                                                    | **DETECTED**                                                                                            | Correct overlap finding. Separately, the implementation also omitted HSTS despite design language expecting other baseline headers to remain sane. Missing HSTS is therefore a true but unplanned target condition; the compact header card incorrectly says HSTS is present. |
| O02 | local jQuery 3.4.1                      | Retire.js checked two JS files; CVE-2020-11022 and CVE-2020-11023 shown as two groups/four findings                              | **DETECTED**                                                                                            | Correct dependency overlap. No route-specific exploit was shown, nor was one required.                                                                                                                                                                                        |
| O03 | public source map                       | Agent repeatedly fetched `app.js.map`; report emits both High “Source Code Exposure” and Medium “Source Map Exposure” groups     | **DETECTED — DUPLICATED**                                                                               | Correct exposure signal, but duplicated wording/severity inflates triage and does not prove sensitive source content.                                                                                                                                                         |
| O04 | `/service.wsdl` + `/soap`               | Agent log and request inventory prove `/service.wsdl` crawl; API “SOAP/WSDL discovery” reports Clean; no SOAP request is visible | **DETECTED — CRAWL ONLY / SPECIALIZED CHECK AMBIGUOUS**                                                 | WSDL discovery occurred, but the specialized API result does not acknowledge it and no SOAP behavior was tested. Customer-visible scope semantics are unclear.                                                                                                                |
| O05 | `/form` FormData/body reflected to HTML | Test and live form submission confirm raw HTML reflection                                                                        | `/form` crawled; sqlmap `--forms` targeted it and was inconclusive; dalfox target list excludes `/form` | **INCONCLUSIVE / EFFECTIVE MISS**                                                                                                                                                                                                                                             | Form existence was discovered, but the intended body-input XSS was not tested by the successful reflection-to-dalfox path. |

## Authoritative S01-S07 safe-control reconciliation

| ID  | Safe control                             | Evidence of meaningful exercise                                                                                                                    | Final classification                          | Discrimination credit                                                                                    |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| S01 | `/catalog?q=` HTML-encodes               | `/catalog?q=harbor` crawled; Active reflected-input check says 16 pages checked and flags only two `/search` observations                          | **TESTED / NO ISSUE**                         | Reasonable active-layer credit; dalfox itself did not list `/catalog`.                                   |
| S02 | `/api/orders?id=` bound parameter        | Discovered via OpenAPI and included in sqlmap target list, but all SQLi outcomes are one generic inconclusive group                                | **COVERAGE UNCLEAR / NO HARMFUL FP OBSERVED** | No SQLi false positive, but no safe/unsafe discrimination credit because D02 also remained inconclusive. |
| S03 | `/api/status` restricted CORS            | Discovered via OpenAPI; agent explicitly requested `/api/status`; aggregate API CORS check found only `/api/profile`                               | **TESTED / NO ISSUE — AGGREGATE EVIDENCE**    | Useful likely discrimination, though no per-route negative response is displayed.                        |
| S04 | `/api/preferences` PUT/DELETE -> 405     | Discovered via OpenAPI and included in downstream tool lists; Active method result is globally Clean without route detail                          | **COVERAGE UNCLEAR / NO HARMFUL FP OBSERVED** | No credit because unsafe D04 was also reported clean.                                                    |
| S05 | `/widget` origin check + `textContent`   | Crawled; report emits only Low “postMessage listener detected,” explicitly noting `event.origin` nearby and not treating it as active risk         | **TESTED / NO ISSUE**                         | Best explicit safe-code discrimination after CORS; no harmful escalation.                                |
| S06 | `/api/account` requires proof session    | Discovered via OpenAPI and included in tool lists; no route appears in request inventory and no auth differential is shown                         | **COVERAGE UNCLEAR / NO HARMFUL FP OBSERVED** | No access-control false positive, but no proof the session boundary was meaningfully tested.             |
| S07 | `/graphql-internal` blocks introspection | Discovered via OpenAPI and included in downstream lists; report flags its name as internal-looking but shows introspection only against `/graphql` | **COVERAGE UNCLEAR / NO HARMFUL FP OBSERVED** | No false vulnerable-introspection claim, but no displayed restricted-endpoint test.                      |

## External-tool orchestration audit

| Tool     | Customer-visible targets/input                                                                                                                                                             | Result                                                        | Orchestration assessment                                                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dalfox   | 13 targets: confirmed `/search` parameter `q`; negative list contains 12 APIs including `/api/runtime`, `/api/session-info`, `/api/export`, both GraphQL routes, and safe siblings         | One DOM-marker-confirmed XSS; 12 no exploitable reflection    | Successful on query XSS. Label “confirmed against 13 targets” is misleading because only one target was confirmed; it means test scope. Form/body route was not included.                                                                            |
| sqlmap   | 13 route names including `/api/accounts` and `/api/orders`; report does not expose method, parameter, request, payload, status, raw output, or differential. Separate forms run on `/form` | 13 API/URL targets inconclusive; one form target inconclusive | Material observability gap. Generic TLS/WAF/connection explanation is speculative. Cannot establish whether `id` was tested or application logic exercised.                                                                                          |
| ffuf     | 13 routes. Twelve completed with no materially different parameter response; `/api/runtime` alone inconclusive                                                                             | Hidden `debug` missed                                         | Failure classification says connection failure or malformed output but exposes neither. Because the target was discovered and responsive elsewhere, orchestration failure is plausible but not proved.                                               |
| jwt_tool | Supposed to use JWTs found on page/cookie                                                                                                                                                  | Nothing to test                                               | Discovery/ingestion failure: `/api/session-info` was found in page JS, fetched, returned a valid weak HS256 JWT, and the browser code rendered it. Report does not explain why JSON/DOM token was excluded.                                          |
| nuclei   | Site selected after forced-browsing exposure                                                                                                                                               | Info “OpenAPI - Detect” on `/openapi.json`                    | Valid technology detection, not exploit confirmation. Pentest summary's “2 confirmed exploits” conflates confirmed XSS with informational OpenAPI detection; the note says OpenAPI does not affect the score, but the count still says two exploits. |

## Report-count and customer-visible consistency audit

| Displayed values                                                                                                    | Best supported interpretation                                                                                                              | Status                                                   |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------- |
| 141 findings vs AI Summary “99 issues”                                                                              | Likely raw observations/events versus a partially grouped/deduplicated issue set, but no label or arithmetic explains 99                   | **UNEXPLAINED CUSTOMER-VISIBLE CONTRADICTION**           |
| Headline 3 critical / 43 high vs AI Summary 2 critical / 43 high                                                    | The third critical is the dalfox-confirmed XSS; AI Summary may have been generated before pentest enrichment or from a different issue set | **PLAUSIBLE SEMANTIC/TIMING EXPLANATION, NOT DISCLOSED** |
| Configuration & Behaviour 60 in 18 groups, 46 crit/high, plus 76 informational; Known Vulnerabilities 4 in 2 groups | Counts mix observations, grouped cards, and hidden informational items. Visible arithmetic does not fully explain the 141 total            | **UNEXPLAINED CUSTOMER-VISIBLE COUNT MODEL**             |
| Active CORS “Clean” vs API CORS Critical                                                                            | Active Testing appears page-scoped while API Testing is endpoint-scoped                                                                    | **LIKELY SCOPE DIFFERENCE, POORLY LABELED**              |
| Header summary HSTS “present” vs 18 High missing-HSTS findings and live responses without HSTS                      | Compact header card conflicts with detailed and independent evidence                                                                       | **UNEXPLAINED CUSTOMER-VISIBLE CONTRADICTION**           |
| WSDL request/crawl vs API SOAP/WSDL “Clean”                                                                         | Crawl discovery and specialized API issue classification may use different semantics                                                       | **SCOPE/SEMANTIC AMBIGUITY**                             |
| Third-party domains 2 with one request each vs network summary 0 third-party requests                               | Two domains were scanner-initiated “Checking domain” actions, not page-initiated network requests                                          | **EXPLAINABLE, BUT SECTION COPY IS MISLEADING**          |
| sqlmap/ffuf “confirmed against 13 targets” with no confirmed result                                                 | “Confirmed against” is being used for target scope, not positive confirmation                                                              | **MISLEADING WORDING**                                   |
| Pentest “2 confirmed exploits”                                                                                      | One is confirmed XSS; the other is informational OpenAPI detection that the report itself says does not affect the score                   | **SEMANTIC OVERSTATEMENT**                               |
| Reflected input affects 2 pages                                                                                     | Expanded details show `/search` twice, representing two crawls/probes of one route                                                         | **DUPLICATED OBSERVATION, NOT TWO DISTINCT ROUTES**      |
| 77 subdomains                                                                                                       | Wordlist hostnames under provider-managed wildcard `workers.dev`, all shown as HTTP 404 on Cloudflare IPs                                  | **CONTEXTUAL NOISE, NOT 77 LDW-OWNED SUBDOMAINS**        |

## False-positive, severity, and evidence-quality assessment

No safe sibling was escalated into a clear high/critical exploit, which is positive. The main problems are consequence overstatement, duplicate observations, provider-context noise, and incomplete negative-test evidence rather than classic fabricated route findings.

- `/.git/HEAD` is a true exposed marker path, but full repository reconstruction and historical-secret access were not demonstrated; Critical is unsupported by shown evidence.
- CORS configuration is actively verified, but authenticated-victim consequence is unproved on this unauthenticated endpoint with a `SameSite=Lax` proof cookie.
- `/admin` is a genuine unlinked 200 route, but “sensitive” content or auth bypass is not established.
- GraphQL introspection and public OpenAPI are real observations, not exploits by themselves.
- source-map exposure is duplicated across High and Medium groups.
- missing CSP and HSTS repeat across page observations; HSTS is a true unplanned target condition, while the header card incorrectly says present.
- SPF, DMARC, MX, CAA, DNSSEC, and 77 wildcard/provider subdomain observations are low-value or misleading on a disposable `workers.dev` hostname outside LDW's registrable-domain control.
- the report would be materially more auditable if every tool exposed target, method, parameter/input, baseline, request/response status, result category, and raw failure reason.

## Authenticated-coverage assessment

Authenticated mode operationally ran according to the vendor and report badge. That establishes product workflow execution, not private-route coverage.

Customer-visible evidence shows:

- “Authenticated Scan” badge;
- 16 authenticated pages;
- vendor confirmation that `/session/start` was used.

Customer-visible evidence does **not** show:

- `/session/start` in request/log inventory;
- session/cookie establishment;
- `/private` or `/private/reports` request;
- 401-versus-200 differential;
- authenticated-only content discovery.

Therefore D14 remains inconclusive. The product should expose a concise authenticated-coverage table with session-establishment status, authenticated-only routes, public/auth differentials, and sanitized cookie/session evidence.

## Analyst and report-UX assessment

Setup burden was low after the synthetic target existed because Stephen operated the scan. The visible scan was fast. Analyst burden was **moderate to high** because the 141 observations are split across overlapping tabs, negative outcomes are usually aggregate-only, and grouping/score semantics require manual reconstruction.

Most valuable UX improvements:

1. separate confirmed exploit, actively verified behavior, heuristic, passive observation, negative test, and inconclusive test;
2. use “tested 13 targets” rather than “confirmed against 13 targets”;
3. show one tool-target-method-input-outcome table;
4. collapse site-wide duplicate findings while preserving affected-route evidence;
5. label raw observations versus deduplicated issues and explain score inputs;
6. distinguish application-observed third parties from scanner-initiated domains;
7. show authenticated-only coverage explicitly;
8. suppress or qualify controls outside the registrable-domain/operator boundary.

## Overlap with current LDW controls

Mostly overlapping:

- browser-library CVEs -> dependency scanning;
- missing CSP/HSTS and ordinary headers -> deterministic browser/site checks;
- public source maps -> deployment/browser checks;
- some known path exposures -> targeted deterministic tests.

Materially distinct or potentially distinct:

- dalfox-confirmed runtime XSS;
- active arbitrary-Origin CORS verification;
- postMessage behavior analysis;
- forced browsing;
- OpenAPI/GraphQL/JavaScript-derived API discovery;
- authenticated black-box workflow;
- pentest confirmation when candidate ingestion/orchestration succeeds.

Decloak is complementary. It does not replace Betterleaks, OSV, actionlint/zizmor, project-native tests, Website Quality Toolkit evidence, framework-aware source review, or human validation.

## Why this remains MIXED

The frozen PASS standard expected both D01 and D02 convincingly confirmed, useful discovery across most primary canaries, meaningful safe-control discrimination, and evidence that reduced analyst work.

Decloak strongly confirmed D01 and discovered more attack surface than the earlier assessment credited, including D08. But D02, D09, D11, D12, O05, and authenticated private coverage remain missed or inconclusive; D04's methods were inventoried without the security condition being flagged; safe-control credit is uneven; and reporting contradictions create material triage effort.

The product demonstrated enough distinct value to justify the user's reported Tier 3 purchase as a complementary sensor at the accepted one-time cost. That commercial choice does not change the evidence-driven **MIXED** result.

## One-shot integrity and remaining closure

- one vendor-operated Enterprise scan only;
- Active Testing, API Testing, AI Pentesting, and authenticated mode enabled;
- no rerun, benchmark tuning, or post-handoff target modification;
- no customer/production/sensitive/private-source target;
- synthetic D1 remained four account rows and three order rows with zero writes during final read-only verification;
- proof cash spend remained US$0;
- disposable Worker and D1 cleanup remains the final runtime closure action.
