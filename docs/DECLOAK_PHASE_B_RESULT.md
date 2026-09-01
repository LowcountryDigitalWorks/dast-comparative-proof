# Decloak Phase B One-Shot Result

Date: 2026-09-01

Status: **RESULT CAPTURED / TECHNICAL MIXED / CLEANUP PENDING**

This record captures the first and only vendor-operated Decloak Enterprise scan of the frozen synthetic benchmark. It intentionally omits the tokenized vendor report URL from this public repository.

## Frozen target

- repository: `LowcountryDigitalWorks/dast-comparative-proof`
- source commit: `60f872317232b558349785b4dd041b1308133b12`
- source tree: `ffc0b04cb0cffc20672b32d1916634fd1f65e479`
- implementation PR: `#2 — Phase B: implement one-shot synthetic DAST benchmark`
- proof hostname: `ldw-dast-proof-6e91c4.locodw.workers.dev`
- D1 seed SHA-256: `3978bb8f8db72fe92727963d7e1ca7bdb6fdc2e72e29278daf769a02f3638096`
- scan report date/time shown by Decloak: `1 Sept 2026, 04:50`
- Decloak scan identifier: `be4989ed-d9ff-4d79-9d2e-31bfbf59c0b7`

Exact Worker deployment/version and D1 resource metadata remain to be reconciled from the deployment workstream before this result PR is finalized.

## Scan configuration

Decloak CEO & Co-Founder Stephen Gray confirmed the vendor-operated scan used:

- Enterprise full investigation: **YES**
- Active Testing: **YES**
- API testing: **YES**
- AI Pentesting: **YES**
- Authenticated mode: **YES**, using the synthetic `/session/start` route
- source/repository access provided: **NO**
- customer/production data used: **NO**
- cash spend: **US$0**
- vendor-requested rerun/tuning after results: **NO**

The report shows 16 pages, 141 raw findings/events in the crawl output, and 16 authenticated pages. The report UI also presents different aggregate counts in different sections (for example, the AI summary versus the top metric block), so the technical disposition below uses the frozen seeded-condition matrix rather than Decloak's aggregate score/counts.

## Seeded-condition results

| ID | Expected condition | Result | Evidence / interpretation |
| --- | --- | --- | --- |
| D01 | Reflected XSS | **DETECTED — CONFIRMED** | `dalfox` confirmed execution for query parameter `q` with DOM verification. Strong exploit-quality evidence. |
| D02 | D1 SQL injection | **DETECTED — INCONCLUSIVE** | Decloak ran SQL-injection testing but reported it inconclusive; the seeded read-only Hono→D1 SQLi was not convincingly confirmed. This prevents a technical PASS under the frozen criteria. |
| D03 | Permissive CORS | **DETECTED — CONFIRMED** | `/api/profile` arbitrary Origin reflection plus credentials was identified with clear request/response behavior. |
| D04 | HTTP method exposure | **MISSED** | Active Testing reported permitted HTTP methods clean even though the seeded no-op PUT/DELETE behavior existed. |
| D05 | Unsafe postMessage | **DETECTED — SIGNAL ONLY** | Unsafe message listener / `innerHTML` pattern was identified and described as potentially cross-origin XSS; no equivalent exploit confirmation was shown. |
| D06 | Forced-browsing hidden route | **DETECTED — CONFIRMED** | Unlinked `/admin` returned HTTP 200 and was surfaced by forced browsing. |
| D07 | OpenAPI discovery | **DETECTED — CONFIRMED** | OpenAPI/Swagger specification was detected and reported as documenting 12 endpoints. |
| D08 | JavaScript-derived undocumented API | **MISSED** | No report evidence surfaced the browser-JS-only `/api/runtime` route as a discovered undocumented API. |
| D09 | Hidden parameter | **MISSED** | Hidden-parameter fuzzing repeatedly reported nothing found / inconclusive; seeded `debug` was not surfaced. |
| D10 | Synthetic exposed `.git/HEAD` | **DETECTED — CONFIRMED** | The synthetic `/.git/HEAD` route was found as publicly accessible. Decloak overstated downstream exploitability by asserting full repository reconstruction despite only the synthetic HEAD route being seeded. |
| D11 | Weak proof JWT | **MISSED** | Pentest log reported `JWT weak-secret check (jwt_tool): nothing to test` despite the proof-only weak JWT being externally observable by design. |
| D12 | Unauthenticated synthetic account-export API | **MISSED** | No accessible report evidence identified the seeded unauthenticated `/api/export` condition. |
| D13 | GraphQL introspection/risky mutation surface | **DETECTED — CONFIRMED** | GraphQL introspection enabled was explicitly reported. |
| D14 | Authenticated private-area crawl | **DETECTED — SIGNAL ONLY** | Vendor confirmed authenticated mode using `/session/start`, and the report shows 16 authenticated pages. The accessible report does not independently evidence the expected private-only route traversal, so authenticated-mode operation is confirmed but private-area coverage remains only partial evidence. |
| O01 | Missing CSP overlap canary | **DETECTED — CONFIRMED** | Missing CSP was repeatedly identified. |
| O02 | Known-vulnerable browser library | **DETECTED — CONFIRMED** | jQuery 3.4.1 CVE-2020-11022 and CVE-2020-11023 were identified. This overlaps existing dependency/browser controls. |
| O03 | Public source map | **DETECTED — CONFIRMED** | Public JavaScript source map was repeatedly identified and fetched during agent investigation. |
| O04 | SOAP/WSDL discovery | **DETECTED — SIGNAL ONLY** | `/service.wsdl` was discovered and crawled; accessible report evidence does not show meaningful SOAP endpoint testing beyond discovery. |
| O05 | Form/FormData input path | **DETECTED — INCONCLUSIVE** | `/form` was crawled and form-field SQLi testing ran, but result was inconclusive and no strong reflected-body exploit confirmation is visible. |

## Safe-control results

| ID | Safe control | False positive? | Evidence / notes |
| --- | --- | --- | --- |
| S01 | Encoded HTML rendering | **NO material FP observed** | `/catalog` was crawled; XSS testing on non-exploitable reflections reported no exploitable XSS. |
| S02 | Parameterized D1 query | **NO confirmed FP, weak discrimination** | No SQLi was confirmed against the safe sibling, but the SQLi engine was also inconclusive on the vulnerable D02 path, so this does not establish strong vulnerable-vs-safe discrimination. |
| S03 | Restricted CORS | **NO** | Decloak explicitly reported clean CORS checks while separately confirming the vulnerable `/api/profile` condition. Strong discrimination. |
| S04 | Narrow HTTP method handling | **NO confirmed FP, weak discrimination** | No safe-route false positive was visible, but D04 was also missed, so HTTP-method sensitivity is weak. |
| S05 | Origin-validated postMessage + textContent | **NO material FP observed** | Report identified the unsafe `/embed` pattern while only informationally detecting other message-listener behavior. |
| S06 | Session-protected account/profile API | **NOT ENOUGH ROUTE-SPECIFIC EVIDENCE** | Authenticated mode ran, but accessible report output does not clearly prove this safe sibling was independently tested. |
| S07 | GraphQL introspection disabled / no risky mutations | **NO material FP observed** | Vulnerable GraphQL introspection was reported; no false-positive finding against the hardened sibling is visible. |

## Material unexpected findings / noise

1. **HSTS was also absent.** The frozen overlap design intended CSP to be the deliberately missing header while other controllable baseline headers remained sane. The merged implementation sets several headers but does not set HSTS. Decloak correctly detected the omission. Treat this as an unexpected real implementation gap, not a vendor false positive.
2. **Large per-page duplication.** Missing CSP, missing HSTS, server-header disclosure, source-map signals, and negative test outcomes are repeated across pages, inflating raw finding counts and analyst triage burden.
3. **`/.git/HEAD` exploitability overstatement.** Decloak correctly found the seeded synthetic route, but the report says it exposes the full source repository. The benchmark intentionally exposes only synthetic HEAD-like content, not a reconstructable Git object database.
4. **DNS/mail findings are low-value for this target class.** No SPF, DMARC, MX, nameserver, DNSSEC, CAA, and similar findings against a random `workers.dev` proof hostname are not useful application-security evidence for this benchmark and add report noise.
5. **Aggregate reporting inconsistency.** Different parts of the report present different critical/issue totals. The report is information-rich but currently requires analyst reconciliation rather than providing one obvious normalized result set.
6. **Current report navigation has material UX friction.** The vendor independently acknowledged the report contains data across roughly 60 features and that report-navigation UX is being improved. This matches the observed triage burden.

## Distinct-value assessment

Decloak demonstrated **real distinct runtime value** beyond LDW's accepted deterministic/repository controls:

- exploit-confirmed reflected XSS with `dalfox` DOM verification;
- strong CORS misconfiguration evidence;
- forced-browsing discovery of an unlinked administrative route;
- unsafe browser `postMessage` signal;
- OpenAPI and GraphQL attack-surface discovery;
- authenticated scan operation without LDW installing the vendor extension;
- source-map/runtime evidence gathered black-box from the deployed target.

However, important advertised Enterprise paths were materially incomplete in this one-shot proof:

- the seeded Hono→D1 SQL injection was not confirmed;
- HTTP-method exposure was missed;
- JavaScript-derived undocumented API discovery was not evidenced;
- hidden-parameter discovery missed the seeded parameter;
- weak-JWT analysis reported nothing to test;
- the unauthenticated export API was not surfaced;
- private authenticated-route coverage is not strongly evidenced in the accessible report;
- SQL/form testing produced repeated inconclusive outcomes.

The frozen PASS definition required both D01 and D02 convincingly confirmed plus broad useful coverage across most D03-D13. That standard was not met. The frozen FAIL definition is also not met because Decloak did confirm a major runtime exploit and produced several materially useful black-box runtime/discovery findings.

## Technical disposition

**MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN**

This is a meaningful technical result, not a commercial purchase decision.

Decloak is materially stronger than a passive security-score/reporting tool for LDW's use case, but the one-shot proof shows enough missed/inconclusive Enterprise canaries and enough reporting noise that the technical evidence does not support an unqualified PASS.

## One-shot integrity

- vendor-operated scan count requested by LDW for this benchmark: **ONE**
- benchmark tuned after vendor result: **NO**
- rerun requested because of misses: **NO**
- seeded matrix disclosed before scan: **NO**
- private repository/source provided to Decloak: **NO**
- customer/production target used: **NO**
- real credentials/session used: **NO**
- PHI/CUI/payment/customer data used: **NO**
- cash spend: **US$0**

## Cleanup status

Cleanup is required before the Phase B workstream closes.

- proof Worker deleted: **PENDING**
- proof D1 deleted: **PENDING**
- proof hostname no longer serves target: **PENDING**
- synthetic session invalidated/removed: **PENDING**
- no production/customer resource changed: **YES, based on current proof scope; final deployment-workstream confirmation pending**

Do not merge/finalize this evidence record until cleanup metadata and deletion verification are reconciled.

## Handoff boundary

Commercial BUY / HOLD / PASS remains outside Developer Tooling authority. After cleanup is proven and this technical result is finalized, return `MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN` to Portfolio. Business Value Strategy / Tooling Procurement Strategy performs any commercial gate, and Portfolio retains purchase authority.
