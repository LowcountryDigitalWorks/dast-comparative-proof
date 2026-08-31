# Phase B Implementation Matrix

Status: **CANDIDATE — MUST MATCH `ONE_SHOT_PROOF_DESIGN.md`**

| Frozen ID | Candidate implementation |
| --- | --- |
| D01 | `/search?q=` raw query interpolation into HTML |
| D02 | `/api/accounts?id=` dynamic read-only D1 SELECT with destructive-input guard |
| D03 | `/api/profile` arbitrary Origin reflection + credentials |
| D04 | `/api/config` accepts no-op methods including PUT/DELETE |
| D05 | `/embed` postMessage data -> `innerHTML` without origin validation |
| D06 | unlinked `/admin` route |
| D07 | `/openapi.json` |
| D08 | browser JS calls undocumented `/api/runtime` |
| D09 | `/api/runtime?debug=` hidden parameter |
| D10 | synthetic `/.git/HEAD` |
| D11 | browser-fetched `/api/session-info` exposes proof-only weak HS256 JWT |
| D12 | `/api/export` exposes sensitive-looking synthetic export data without auth |
| D13 | `/graphql` enables introspection and synthetic mutation names with no destructive resolver |
| D14 | `/session/start` -> proof-only cookie -> `/private` and `/private/reports` |
| O01 | CSP deliberately absent; other baseline headers present |
| O02 | locally served pinned `jquery@3.4.1` |
| O03 | public esbuild source map for browser bundle |
| O04 | `/service.wsdl` + `/soap` synthetic service |
| O05 | `/form` FormData input reflected into HTML |
| S01 | `/catalog?q=` HTML encodes input |
| S02 | `/api/orders?id=` D1 bound parameter |
| S03 | `/api/status` only permits one synthetic trusted Origin |
| S04 | `/api/preferences` rejects PUT/DELETE with 405 |
| S05 | `/widget` validates postMessage origin and uses `textContent` |
| S06 | `/api/account` requires proof-only session |
| S07 | `/graphql-internal` blocks introspection and exposes no mutation type |

Route names are deliberately neutral and the deployed application does not publish this matrix.
