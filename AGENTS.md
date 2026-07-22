# Repository Guidelines

## Project Structure & Module Organization
- `web/`: React + TypeScript frontend (Vite, Vitest, Storybook).
- `server/`: Go backend (GraphQL/HTTP adapters, usecases, infrastructure).
- `e2e/`: Playwright-based end-to-end test suite.
- `accounts/`: Accounts-related services and local integration resources.
- `docs/`: Developer and design documentation.
- `public/`: Static assets used by the frontend.
- `cerbos/`: Authorization policy configuration.

## Build, Test, and Development Commands
- Frontend (`/web`):
  - `yarn install`
  - `yarn lint`
  - `yarn build`
  - `CI=1 yarn test run`
- Backend (`/server`):
  - `make build`
  - `make test`
  - `make d-lint` (requires running Docker dev container)
- E2E (`/e2e`):
  - `npm install`
  - `npm run lint`
  - `npm run test:api:local` or `npm run test:local`

## Coding Style & Naming Conventions
- Web: TypeScript, ESLint + Prettier, existing React patterns and file naming conventions.
- Server: Go formatting via `gofmt`; keep packages lowercase and tests in `*_test.go`.
- Keep changes scoped, avoid unrelated refactors, and follow existing architecture per module.

## Testing Guidelines
- Run tests in the area you change first, then run broader checks when appropriate.
- For frontend changes, at minimum run `yarn lint` and related Vitest tests.
- For backend changes, run `make test` and any targeted package tests.
- For integration-impacting changes, run relevant e2e scenarios.

## Commit & Pull Request Guidelines
- Prefer Conventional Commits with scope (e.g. `feat(web): ...`, `fix(server): ...`).
- Include issue/ticket references when available.
- PRs should include: summary, impacted areas, test evidence, and screenshots for UI changes.

## Security & Configuration Tips
- Never commit secrets; use local env files (`.env`, `.env.op`) and secret managers.
- Keep Auth, API, and storage configuration consistent across frontend and backend env files.
- Validate that added dependencies and config changes do not introduce security risks.
