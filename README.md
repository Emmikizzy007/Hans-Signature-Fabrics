# Hans-Signature-Fabrics
An E-commerce website that sells ankara Fabrics

## Development

```bash
npm install
```

## Testing

Tests run with [Vitest](https://vitest.dev) in TypeScript.

```bash
npm test           # run the suite once
npm run test:watch # re-run on change
npm run coverage   # run with a coverage report (coverage/)
npm run typecheck  # tsc --noEmit
```

Coverage thresholds are enforced in `vitest.config.ts` (90% lines/functions/statements,
85% branches) and fail the run when unmet.

### Layout

- `src/` — application modules
- `tests/` — test files, mirroring the `src/` layout (`tests/<module>.test.ts`)

Co-located `src/**/*.test.ts` files are also picked up.

## CI

`.github/workflows/ci.yml` runs the typecheck and coverage on every push to `main`
and on every pull request, and uploads the coverage report as a build artifact.
