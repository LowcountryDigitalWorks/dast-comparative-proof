# Phase B Implementation Notes

Status: **IMPLEMENTATION CANDIDATE — NOT YET DEPLOYED / NOT YET PROVIDED TO DECLOAK**

This document records implementation choices that realize the frozen matrix in `ONE_SHOT_PROOF_DESIGN.md`.

## Runtime

The candidate uses one TypeScript/Hono Cloudflare Worker, one Worker static-assets binding, and one dedicated D1 binding. No application route makes an outbound third-party request.

The committed Wrangler configuration contains an all-zero placeholder D1 database ID. It must be replaced with the exact dedicated proof D1 identifier only after that disposable database is created under the separately authorized deployment step.

## Dependencies

Runtime dependencies are deliberately narrow:

- `hono@4.13.1` — LDW-representative Worker HTTP framework and direct counterpart to the prior Hono SAST proof.
- `graphql@16.14.2` — creates a real GraphQL schema/introspection surface without an external service.
- `jquery@3.4.1` — intentionally vulnerable, locally served browser-library overlap canary O02. It is not used for application logic.

Development-only tooling is limited to the existing LDW-compatible TypeScript/ESLint/Prettier/Vitest/esbuild baseline plus pinned Wrangler.

Because O02 intentionally pins a known-vulnerable browser dependency, dependency-vulnerability checks are expected to identify it. That expected finding is an overlap canary, not a defect in the proof design.

## D1 safety

`migrations/0001_seed.sql` creates only two synthetic tables with synthetic rows. The public Worker exposes no write/mutation route.

The D02 route dynamically builds only a `SELECT` statement and rejects semicolons plus obvious destructive SQL keywords before D1 preparation. S02 uses a bound placeholder.

The deployment gate still requires independent remote proof that D02 changes no D1 data before the vendor receives the target.

## Authentication

`/session/start` creates a short-lived proof-only cookie and redirects into a synthetic private area. It has no user identity, password, external auth provider, or production authority. It is included only so Decloak can attach a synthetic session to the same scan if its vendor test environment supports that path.

## Static/browser surface

The build copies the pinned jQuery overlap canary locally and bundles `src/browser.ts` into a browser asset with a public source map. The browser bundle references `/api/runtime`, which is intentionally absent from OpenAPI to exercise JavaScript-derived API discovery.

## Validation

The PR-local workflow has read-only GitHub permissions and no secrets. It runs formatting, lint, typecheck, Vitest, a Wrangler dry-run build, seed hashing, and a route-count ceiling check. It does not deploy or integrate Decloak.
