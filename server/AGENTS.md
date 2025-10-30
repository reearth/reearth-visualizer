# Repository Guidelines

## Project Structure & Module Organization
- `cmd/reearth/`: CLI entrypoint (`main.go`, build tags `debug`/`release`).
- `internal/`: Application code (adapters: `gql`, `http`, `internalapi`; `usecase`; `infrastructure`: `mongo`, `gcs`, `s3`, `fs`; config, i18n).
- `pkg/`: Reusable libraries (domain models, utils, plugin manifest, property, scene, etc.).
- `gql/` + `gqlgen.yml`: GraphQL schema and codegen settings.
- `e2e/`: End-to-end tests.
- `schemas/`: Protobuf/internal API and plugin manifest schemas.
- `data/`, `tmp/`: Local data and scratch outputs.

## Build, Test, and Development Commands
- `make build`: Compile server binary from `cmd/reearth`.
- `make run-app`: Run locally without hot reload.
- `make dev`: Run with Air hot reload (installs tools if needed).
- `make lint`: Run `golangci-lint` with auto-fix.
- `make test`: Run unit tests (`go test ./...`).
- `make e2e`: Run end-to-end tests (`go test -v ./e2e/...`).
- `make run-db`: Start MongoDB via `../docker-compose.yml`.
- `make run-reset`: Reset local DB and seed mock user (destructive; removes `../mongo` and `data`).
- `make gql` / `make generate`: Run GraphQL and general codegen.

Examples:
- Coverage: `go test ./... -cover -coverprofile=coverage.txt`.
- Fake GCS: `make up-gcs` (see README for usage).

## Coding Style & Naming Conventions
- Language: Go. Format with `gofmt -s -w` (CI enforces via `golangci-lint`).
- Indentation: tabs (Go default). Line length: keep readable (~100–120).
- Packages: short, lowercase; files `snake_case.go`; tests end with `_test.go`.
- GraphQL: keep schema in `gql/`; regenerate after schema changes (`make gql`).

## Testing Guidelines
- Framework: standard `testing` and `testify`.
- Unit tests colocated with code; e2e tests in `e2e/`.
- Name tests `TestXxx` and table-driven where helpful.
- Aim for meaningful coverage of usecases and adapters; add regression tests for bugs.

## Commit & Pull Request Guidelines
- Convention: Conventional Commits with scope, e.g. `feat(server): add policy check [VIZ-1234]`.
- Include ticket IDs (`[VIZ-####]`) and reference PRs when applicable.
- PRs: clear description, linked issues, test coverage, and screenshots/logs for API changes (curl or GraphQL examples). Update docs and run codegen when schemas change.

## Security & Configuration Tips
- Use `.env` (see `.env.example`). Key vars: storage (`REEARTH_GCS_BUCKETNAME` or `REEARTH_S3_BUCKET_NAME`), `REEARTH_ASSETBASEURL`, Mongo URL (`REEARTH_DB`).
- Never commit secrets; prefer environment variables. Validate configs in `internal/app/config`.
