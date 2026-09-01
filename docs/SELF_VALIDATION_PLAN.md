# Phase B Self-Validation Plan

Status: **PRE-DEPLOYMENT CHECKLIST — NO RESULTS RECORDED YET**

Before any Decloak handoff, Developer Tooling must independently validate the frozen target in two stages.

## Candidate / CI stage

- formatting passes;
- lint passes;
- TypeScript typecheck passes;
- Vitest matrix tests pass;
- Wrangler dry-run build passes;
- API route-count ceiling remains below 20;
- D1 seed SHA-256 is recorded;
- exact PR head/tree and changed files are frozen;
- no write-capable public D1 route exists;
- no production/customer binding, data, credential, secret, or third-party outbound request exists.

## Deployed stage

After the one authorized disposable Worker and D1 are created:

- apply only `migrations/0001_seed.sql` to the dedicated proof D1;
- record row counts and seed hash before testing;
- exercise every D01-D14 condition that is locally testable;
- verify O01-O05;
- verify S01-S07 remain safe;
- exercise D02 with benign read-only injection payloads and verify row counts/data are unchanged afterward;
- verify destructive DDL/DML payloads are rejected before D1 preparation;
- verify no public mutation/write route exists;
- verify all responses include `X-Robots-Tag: noindex, nofollow, noarchive`;
- freeze exact Worker version and workers.dev hostname;
- verify target scope contains only that disposable hostname.

Do not contact Decloak until every applicable deployed-stage check passes. Do not modify the target after the vendor scan starts.
