# DAST Comparative Proof Result Template

Status: **EMPTY TEMPLATE — DO NOT PRE-FILL RESULTS**

Use only after the deployed proof target is frozen and the vendor-operated scan completes.

## Frozen target

- repository:
- commit:
- tree:
- Cloudflare proof Worker:
- random `workers.dev` hostname:
- D1 proof database identifier (non-secret metadata only):
- deployment timestamp:
- scan-request timestamp:
- scan-complete timestamp:

## Scan configuration

- Enterprise full investigation: YES / NO
- Active Testing: YES / NO
- AI Pentesting: YES / NO
- Authenticated mode: YES / NO / NOT TESTED
- source/repository access provided: **NO**
- customer/production data used: **NO**
- cash spend: **US$0**

## Seeded-condition results

| ID | Expected condition | Result | Layer/tool | Evidence quality | Existing LDW overlap | Triage minutes | Notes |
| --- | --- | --- | --- | --- | --- | ---: | --- |
| D01 | Reflected XSS | | | | | | |
| D02 | D1 SQL injection | | | | | | |
| D03 | Permissive CORS | | | | | | |
| D04 | HTTP method exposure | | | | | | |
| D05 | Unsafe postMessage | | | | | | |
| D06 | Forced-browsing hidden route | | | | | | |
| D07 | OpenAPI discovery | | | | | | |
| D08 | JavaScript-derived undocumented API | | | | | | |
| D09 | Hidden parameter | | | | | | |
| D10 | Synthetic exposed `.git/HEAD` | | | | | | |
| D11 | Weak proof JWT | | | | | | |
| D12 | Unauthenticated synthetic account-export API | | | | | | |
| D13 | GraphQL introspection/risky mutation surface | | | | | | |
| D14 | Authenticated private-area crawl | | | | | | |
| O01 | Missing CSP overlap canary | | | | | | |
| O02 | Known-vulnerable browser library overlap canary | | | | | | |
| O03 | Public source map | | | | | | |
| O04 | SOAP/WSDL discovery | | | | | | |
| O05 | Form/FormData input path | | | | | | |

Allowed result values:

- `DETECTED — CONFIRMED`
- `DETECTED — SIGNAL ONLY`
- `DETECTED — INCONCLUSIVE`
- `MISSED`
- `NOT TESTED`

## Safe-control results

| ID | Safe control | False positive? | Evidence / notes |
| --- | --- | --- | --- |
| S01 | Encoded HTML rendering | | |
| S02 | Parameterized D1 query | | |
| S03 | Restricted CORS | | |
| S04 | Narrow HTTP method handling | | |
| S05 | Origin-validated postMessage + textContent | | |
| S06 | Session-protected account/profile API | | |
| S07 | GraphQL introspection disabled / no risky mutations | | |

## Unexpected findings / noise

Record every unexpected finding rather than silently dropping it.

| Finding | True issue / false positive / informational | Existing LDW control? | Analyst minutes | Notes |
| --- | --- | --- | ---: | --- |
| | | | | |

## Time and operational burden

- implementation time:
- validation time before vendor handoff:
- deployment time:
- vendor coordination time:
- full investigation duration:
- Active Testing duration:
- AI Pentesting duration:
- triage time:
- report/export review time:
- cleanup time:
- unexpected operational friction:

## Data / privacy observations

- target data observed leaving LDW-controlled environment:
- headers/request/response evidence included:
- source-map/source reconstruction included:
- API discovery evidence included:
- session material used, if any:
- unexpected third-party/network behavior:
- retention/deletion observations:

## Reporting / automation observations

- main report usefulness:
- DAST report usefulness:
- Pentest report usefulness:
- evidence package usefulness:
- API/webhook/MCP relevance observed:
- customer-facing evidence usefulness:

## Distinct-value comparison

For each material Decloak result answer:

1. Would LDW's accepted current control set already identify it?
2. If yes, did Decloak materially improve exploitability evidence or analyst effort?
3. If no, is the additional result actionable and commercially relevant?
4. Did a safe comparator remain clean?

## Technical disposition

Choose exactly one after review:

- `PASS — DISTINCT VALUE DEMONSTRATED`
- `MIXED — VALUE EXISTS BUT MATERIAL LIMITS/NOISE REMAIN`
- `FAIL — NO DISTINCT ECONOMIC VALUE`

Disposition rationale:


## Cleanup confirmation

- proof Worker deleted: YES / NO
- proof D1 deleted: YES / NO
- proof hostname no longer serves target: YES / NO
- synthetic session invalidated/removed: YES / NO / NOT USED
- no production/customer resource changed: YES / NO

## Handoff

Commercial BUY / HOLD / PASS remains outside this repository's technical authority and must be performed by Business Value Strategy / Tooling Procurement Strategy, with Portfolio retaining purchase authority.
