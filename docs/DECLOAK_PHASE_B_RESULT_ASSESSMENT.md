# Decloak Phase B One-Shot Result Assessment

Status: **TECHNICAL DISPOSITION FROZEN — MIXED / RUNTIME CLEANUP PENDING**

Assessment date: 2026-09-01

Proof source baseline:

- implementation merge: `60f872317232b558349785b4dd041b1308133b12`
- frozen design: `docs/ONE_SHOT_PROOF_DESIGN.md`
- implementation matrix: `docs/IMPLEMENTATION_MATRIX.md`
- vendor scan reference: Decloak scan ID `be4989ed-d9ff-4d79-9d2e-31bfbf59c0b7`
- report access token is intentionally **not** stored in this public repository

## Technical disposition

**MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN**

Decloak demonstrated material black-box/runtime value that LDW's current repository, dependency, secret, workflow, and deterministic browser controls do not fully duplicate. The strongest evidence was a dalfox-confirmed reflected XSS, correct discovery of an arbitrary-origin credential-compatible CORS configuration, forced-browsing discovery of an unlinked administrative route, OpenAPI discovery, source-map analysis, vulnerable browser-library identification, exposed synthetic `/.git/HEAD` detection, GraphQL-introspection detection, postMessage-risk detection, and successful use of the synthetic authenticated scan path.

The proof did **not** satisfy the stronger PASS bar because several deliberately seeded Enterprise/pentest targets were missed or only returned inconclusive evidence. Most importantly, the real read-only Hono -> D1 SQL-injection condition was not confirmed, the browser-JavaScript-derived undocumented `/api/runtime` endpoint was not evidenced as discovered, its hidden `debug` parameter was missed, the weak proof JWT was not recognized as testable, the unauthenticated synthetic export endpoint was not surfaced as a meaningful finding, and the deliberately permissive HTTP-method condition was reported clean. The FormData/body-input canary was crawled but did not receive useful exploit confirmation.

## Scan execution evidence

The vendor confirmed in writing that the one vendor-operated Enterprise scan enabled:

- full Enterprise investigation;
- Active Testing;
- API testing;
- AI Pentesting;
- authenticated scanning using the synthetic `/session/start` route.

No second courtesy scan was requested and no benchmark tuning/rerun occurred after the target was handed to Decloak.

Observed report-level metrics included:

- 16 pages;
- 141 findings;
- 3 / 43 critical/high shown in the top report metrics;
- 16 authenticated pages;
- 28 requests;
- 7 agent iterations.

The visible agent log ran approximately from 04:49:10 to 04:50:24, about 74 seconds of recorded investigation time. This does not include queueing or report-generation latency.

## Frozen matrix reconciliation

Legend:

- **DETECTED** — intended condition materially identified.
- **CONFIRMED** — exploitability was positively demonstrated, not merely inferred.
- **PARTIAL** — useful related evidence exists but the exact intended condition was not fully proven.
- **MISSED** — seeded condition was present but useful detection evidence was absent.
- **INCONCLUSIVE** — Decloak attempted the relevant test but did not reach a positive or negative determination.
- **NO HARMFUL FP OBSERVED** — no material false-positive escalation against the safe sibling was visible in the accessible report.

| ID  | Seeded condition                                               | Result                                                     | Assessment                                                                                                                                                                                                                                                                   |
| --- | -------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D01 | Reflected XSS on `/search?q=`                                  | **CONFIRMED**                                              | dalfox reported DOM-marker execution for parameter `q`; strongest proof result.                                                                                                                                                                                              |
| D02 | Real read-only Hono -> D1 SQL injection on `/api/accounts?id=` | **INCONCLUSIVE / EFFECTIVE MISS**                          | Multiple SQL-injection attempts were reported inconclusive. The seeded `OR 1=1` read expansion was independently validated before scan, so failure to confirm is a material blind spot.                                                                                      |
| D03 | Arbitrary Origin reflection + credentials on `/api/profile`    | **DETECTED**                                               | Decloak correctly identified arbitrary Origin reflection with `Access-Control-Allow-Credentials: true`. Exploit narrative slightly overstates authenticated-victim impact because the proof session cookie is `SameSite=Lax` and `/api/profile` itself is not session-gated. |
| D04 | No-op PUT/DELETE accepted on `/api/config`                     | **MISSED**                                                 | Active-testing summary reported permitted HTTP methods clean despite the seeded route accepting unsafe methods.                                                                                                                                                              |
| D05 | postMessage -> `innerHTML` without origin check on `/embed`    | **DETECTED**                                               | Decloak identified the unsafe listener and included the relevant code pattern. It was risk-detected rather than exploit-confirmed.                                                                                                                                           |
| D06 | Unlinked `/admin` route                                        | **DETECTED**                                               | Forced browsing found `/admin` and confirmed HTTP 200.                                                                                                                                                                                                                       |
| D07 | Public `/openapi.json`                                         | **DETECTED**                                               | OpenAPI/Swagger was discovered; report described 12 documented operations/endpoints.                                                                                                                                                                                         |
| D08 | Browser JS calls undocumented `/api/runtime`                   | **MISSED**                                                 | Agent fetched both `app.js` and its source map, but the report does not evidence discovery of `/api/runtime`; instead it guessed generic API/status paths. This is a meaningful JS-to-API discovery gap.                                                                     |
| D09 | Hidden `/api/runtime?debug=` parameter                         | **MISSED**                                                 | Hidden-parameter fuzzing repeatedly returned nothing found or inconclusive. D08's miss likely reduced the chance of reaching D09.                                                                                                                                            |
| D10 | Synthetic `/.git/HEAD` exposure                                | **DETECTED**                                               | Correctly found and escalated. Severity/exploitability narrative overstates the proof: only a synthetic HEAD-like response exists, not a reconstructable real Git object database.                                                                                           |
| D11 | Browser-fetched weak HS256 proof JWT from `/api/session-info`  | **MISSED**                                                 | `jwt_tool` reported `nothing to test` even though the browser bundle fetches and renders a valid proof-only JWT.                                                                                                                                                             |
| D12 | Unauthenticated synthetic account export `/api/export`         | **MISSED**                                                 | No report evidence surfaced the intentionally sensitive-looking unauthenticated export as a distinct access-control/data-exposure finding.                                                                                                                                   |
| D13 | GraphQL introspection + risky mutation names                   | **DETECTED**                                               | GraphQL introspection enabled was identified. No destructive resolver behavior existed by design.                                                                                                                                                                            |
| D14 | Synthetic authenticated `/private` area                        | **PARTIAL / AUTH MODE EXERCISED**                          | Vendor confirmed authenticated mode using `/session/start`, and report shows 16 authenticated pages. The accessible report does not give enough route-level evidence to prove `/private/reports` traversal specifically.                                                     |
| O01 | Missing CSP                                                    | **DETECTED**                                               | Repeatedly identified across pages.                                                                                                                                                                                                                                          |
| O02 | Local jQuery 3.4.1                                             | **DETECTED**                                               | CVE-2020-11022 and CVE-2020-11023 detected. This overlaps ordinary dependency scanning by design.                                                                                                                                                                            |
| O03 | Public browser source map                                      | **DETECTED**                                               | Source map repeatedly detected and fetched by the agent.                                                                                                                                                                                                                     |
| O04 | WSDL/SOAP discovery                                            | **DETECTED / DISCOVERY**                                   | Agent explicitly discovered and crawled `/service.wsdl`. No deeper SOAP-specific exploit evidence was required for this overlap canary.                                                                                                                                      |
| O05 | FormData/body input reflected into HTML                        | **INCONCLUSIVE / EFFECTIVE MISS**                          | `/form` was crawled and form SQL-injection testing was inconclusive, but no useful XSS/reflection exploit evidence was produced for the seeded body-input sink.                                                                                                              |
| S01 | Encoded sibling `/catalog?q=`                                  | **NO HARMFUL FP OBSERVED**                                 | `/catalog` was crawled; no confirmed-XSS escalation tied to the encoded sibling was visible.                                                                                                                                                                                 |
| S02 | Parameter-bound D1 sibling `/api/orders?id=`                   | **NO HARMFUL FP OBSERVED / PER-ROUTE SQL MAPPING UNCLEAR** | No positive SQLi finding was visible. The report's repeated inconclusive SQLi messages are not clearly mapped enough to distinguish every attempted route.                                                                                                                   |
| S03 | Restricted CORS `/api/status`                                  | **CORRECTLY CLEAN**                                        | Agent explicitly checked `/api/status`; active summary reported CORS clean while D03 was separately detected. Strong useful discrimination.                                                                                                                                  |
| S04 | Correct 405 sibling `/api/preferences`                         | **NO HARMFUL FP OBSERVED**                                 | No positive unsafe-method finding was visible, but the method engine also missed D04, limiting confidence in this discrimination.                                                                                                                                            |
| S05 | Origin-validated postMessage + `textContent` `/widget`         | **NO HARMFUL FP OBSERVED**                                 | `/widget` was crawled. The report identified the genuinely unsafe `/embed` pattern; no comparable harmful escalation of the safe sibling was visible.                                                                                                                        |
| S06 | Session-protected `/api/account`                               | **NO HARMFUL FP OBSERVED / COVERAGE UNCLEAR**              | No access-control false positive against the protected sibling was visible. Route-level authenticated coverage is not sufficiently explicit.                                                                                                                                 |
| S07 | Introspection-blocked `/graphql-internal`                      | **NO HARMFUL FP OBSERVED / COVERAGE UNCLEAR**              | Report identified introspection on the vulnerable GraphQL surface and did not visibly escalate the restricted sibling.                                                                                                                                                       |

## Detection-strength assessment

### Strongest distinct value

1. **Runtime exploit confirmation.** D01 was not just flagged as reflected input; dalfox verified executable DOM behavior. This is materially stronger than a generic SAST warning or passive header check.
2. **Active application-behavior checks.** D03, D05, and D06 demonstrate useful black-box behavior/security discovery independent of source access.
3. **Attack-surface enrichment.** OpenAPI, GraphQL introspection, WSDL discovery, source-map retrieval, and hidden-route probing are useful in customer-facing web/API review work.
4. **Authenticated scan path worked operationally.** The vendor successfully attached the synthetic session entry to the same scan without requiring LDW to install a browser extension or provide real credentials.
5. **Evidence transparency.** The agent log exposes substantial reasoning/crawl activity, which is useful for analyst review and explaining why a finding exists.

### Material blind spots

1. **Hono/D1 SQLi confirmation failed.** This was one of the highest-value seeded conditions because earlier generic SAST tools had trouble with Hono/D1 semantics. Decloak attempted SQLi testing but remained inconclusive on a known exploitable read-only predicate injection.
2. **JavaScript-derived API discovery underperformed.** The scanner fetched the exact browser bundle and source map but did not visibly turn the hard-coded `/api/runtime?mode=summary` fetch into discovered attack surface.
3. **Hidden-parameter discovery missed `debug`.** Repeated ffuf results were negative/inconclusive against a known hidden parameter.
4. **JWT analysis did not reach a clearly observable token.** `jwt_tool` said `nothing to test` even though `/api/session-info` returns a valid three-part JWT and the browser bundle renders it.
5. **Access-control/data-exposure reasoning missed `/api/export`.** The endpoint deliberately returned sensitive-looking unauthenticated synthetic account data yet was not surfaced as a distinct finding.
6. **HTTP-method probing missed `/api/config`.** The route accepts PUT/DELETE and was documented in OpenAPI, but the active summary still reported method testing clean.
7. **Body/FormData exploit handling was weak.** The form sink was present and independently validated, but the report did not provide useful exploit confirmation.

## False-positive, severity, and evidence-quality observations

No safe sibling was visibly escalated into a clear high/critical exploit finding, which is positive. However, report noise and evidence wording create analyst work:

- missing CSP/HSTS, server disclosure, source-map, and similar observations are repeated per page and materially inflate finding counts;
- DNS/email-control findings such as SPF/DMARC/MX/CAA on a disposable `workers.dev` proof hostname are low-value or contextually misleading for an application DAST assessment;
- `77 subdomains discovered` is difficult to interpret meaningfully for a provider-managed workers.dev hierarchy and should be strongly scope-qualified;
- the `/.git/HEAD` finding is real as an exposed path, but the report's statement that the full source repository can therefore be reconstructed is not demonstrated by this target; only a synthetic HEAD-like response exists;
- the CORS finding correctly identifies the configuration defect, but the claim that any website can necessarily act as a logged-in victim is stronger than the proof demonstrates given `SameSite=Lax` on the synthetic session and the unauthenticated nature of `/api/profile`;
- top-level report counters are not self-explanatory: the report shows 141 findings while the AI summary says 99 issues; top metrics show `3 / 43` critical/high while the summary says 2 critical and 43 high;
- the report shows two third-party domains in one section while the network-request summary shows zero third-party requests; these appear to mix scanner-initiated domain checks with application-observed traffic;
- security-header presentation should be reviewed for consistency because repeated findings/AI text describe missing HSTS while the compact header-summary presentation is ambiguous about which headers are present.

These are not reasons to reject the engine, but they increase analyst triage time and can make customer-facing interpretation harder than necessary.

## Analyst-effort assessment

Exact LDW wall-clock triage time was not instrumented and is therefore not fabricated here.

Qualitatively:

- setup burden was low once the synthetic target existed because the vendor operated the Enterprise scan;
- the scan itself appears fast from the visible agent timestamps;
- result triage burden was **moderate**, driven by 141 findings, repeated page-level observations, multiple report sections/tabs, and the need to reconcile pentest/API/active-test outputs manually against the frozen matrix;
- the report is information-rich but currently less efficient than it could be for an experienced analyst trying to answer "what was actually exploitable, what was merely observed, and what was tested clean?".

## Overlap with current LDW controls

Decloak does not replace existing LDW controls.

Mostly overlapping findings:

- browser-library CVEs -> dependency scanning;
- missing CSP/HSTS and ordinary headers -> Website Quality Toolkit/browser checks;
- public source maps -> deterministic deployment/browser checks;
- some exposed static paths -> deterministic tests or website-quality evidence.

Materially distinct or potentially distinct areas:

- dalfox-confirmed runtime XSS;
- active arbitrary-Origin CORS behavior;
- postMessage runtime/client behavior analysis;
- forced browsing;
- API/spec discovery;
- authenticated black-box crawling;
- pentest confirmation when the engine can reach a candidate.

The proof therefore supports **complementary DAST value**, not replacement of Betterleaks, OSV, actionlint/zizmor, project-native tests, WQT, or framework-aware static reasoning.

## Enterprise-tier technical conclusion

Enterprise remains the technically relevant tier for the LDW use case because the distinct value came from Active Testing, API testing, authenticated scanning, and AI Pentesting. Starter/Pro would preserve much of the passive/reporting overlap but would not answer the main runtime-exploitability hypothesis.

Direct vendor-confirmed practical limits remain:

- regular scans: 15/domain/day;
- Active Testing: 3/domain/day;
- AI Pentesting: 1/domain/day.

These limits should be treated as separate capability quotas, not one generic `15 scans/day` allowance.

## Why this is MIXED rather than PASS

The predeclared PASS standard expected strong material black-box value with D01 XSS and D02 Hono/D1 SQLi convincingly confirmed, useful discovery across most other primary canaries, good safe-control discrimination, and useful evidence.

Decloak strongly satisfied D01 and several discovery/runtime conditions, but D02 was not confirmed and multiple advertised Enterprise/pentest surfaces were missed. The product therefore demonstrated real distinct value, but not sufficiently comprehensive/reliable coverage to meet the frozen PASS threshold.

## One-shot integrity

- one vendor-operated Enterprise scan sequence only;
- Active Testing enabled;
- API testing enabled;
- AI Pentesting enabled;
- authenticated scanning enabled using synthetic session entry;
- no customer/production/sensitive/private-source target;
- no benchmark change after vendor handoff;
- no rerun merely because a condition was missed;
- no Decloak purchase;
- proof cash spend remained US$0.

## Remaining closure item

The disposable Worker and D1 must be deleted and cleanup independently verified before the Phase B workstream is marked fully closed. This document freezes the technical detection assessment; cleanup evidence may be recorded separately without changing the result merely because the scanner missed a seeded condition.
