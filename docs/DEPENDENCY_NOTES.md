# Phase B Dependency Notes

All direct package versions are exact-pinned in `package.json`.

## Runtime

- `hono@4.13.1`: representative LDW HTTP framework for Cloudflare Worker routes.
- `graphql@16.14.2`: local-only GraphQL execution and introspection surface; no external GraphQL service.
- `jquery@3.4.1`: intentionally vulnerable browser-library overlap canary O02; served locally and not used for application logic.

## Development / validation

- `typescript@6.0.3`, `@types/node@24.13.3`: strict typechecking.
- `eslint@10.8.0`, `@eslint/js@10.0.1`, `typescript-eslint@8.65.0`, `globals@17.7.0`: linting.
- `prettier@3.9.6`: formatting.
- `vitest@4.1.10`: unit/integration-style matrix tests.
- `esbuild@0.28.1`: browser bundle and public source-map generation.
- `wrangler@4.127.1`: Cloudflare Worker dry-run build and later authorized disposable deployment.

The initial implementation candidate intentionally has no committed npm lockfile because this new proof repository began without a dependency baseline and the current control plane cannot safely generate one locally without registry access. The PR-local validation workflow installs exact direct versions and is intended to expose dependency-resolution/build issues before deployment. A lockfile should be generated and frozen before the final deployed source freeze if the authorized cloud execution path can do so without adding write-capable automation or another service.
