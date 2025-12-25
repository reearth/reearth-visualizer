# =======================
# Variables
# =======================

TEST_DIR ?= ./...
TARGET_TEST := ./...
TEST_NAME ?=
REEARTH_DB := mongodb://localhost
REEARTH_DB_VIS := reearth
MIGRATION_KEY ?=
SCHEMATYPER := github.com/idubinskiy/schematyper
MANIFEST_DIR := pkg/plugin/manifest
DOCKER_COMPOSE := docker compose -f ../docker-compose.yml
DOCKER_COMPOSE_DEV := docker compose -f ../docker-compose.dev.yml
DOCKER_EXEC := docker exec reearth-visualizer-reearth-visualizer-dev-1

# =======================
# Default
# =======================

default: help

help:
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@echo ""
	@echo "Testing:"
	@echo "  lint              Run golangci-lint in Docker container"
	@echo "  test              Run unit tests (local, excludes e2e)"
	@echo "  test-docker       Run unit tests in Docker container"
	@echo "  e2e               Run all e2e tests in Docker"
	@echo "  e2e-test          Run specific e2e test (TEST_NAME=TestName)"
	@echo ""
	@echo "Build & Run:"
	@echo "  build             Build the reearth binary"
	@echo "  run               Start dev server with Docker Compose"
	@echo "  down              Stop Docker Compose services"
	@echo ""
	@echo "Database:"
	@echo "  migrate           Run database migration"
	@echo "  migrate-with-key  Run database migration with specific MIGRATION_KEY"
	@echo ""
	@echo "Code Generation:"
	@echo "  generate          Run all code generation"
	@echo "  gql               Generate GraphQL code"
	@echo "  grpc              Generate gRPC code"
	@echo "  grpc-doc          Generate gRPC documentation"
	@echo "  schematyper       Generate plugin manifest schema"
	@echo "  deep-copy         Generate deep-copy code"
	@echo "  error-msg         Generate i18n error messages"
	@echo ""
	@echo "Tools:"
	@echo "  dev-install       Install dev tools (air, stringer, etc.)"
	@echo "  init-gcs          Initialize GCS bucket"

# =======================
# Test
# =======================

lint:
	@echo "Running golangci-lint in Docker container..."
	@if docker ps --format '{{.Names}}' | grep -q '^reearth-visualizer-reearth-visualizer-dev-1$$'; then \
		${DOCKER_EXEC} golangci-lint run --fix --timeout=10m; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make run' first."; \
		exit 1; \
	fi

test:
	REEARTH_DB=${REEARTH_DB} go test ${TEST_DIR} -run ${TARGET_TEST}

test-docker:
	@echo "Running unit tests in Docker container (excluding e2e tests)..."
	@if docker ps --format '{{.Names}}' | grep -q '^reearth-visualizer-reearth-visualizer-dev-1$$'; then \
		${DOCKER_EXEC} go test ${TEST_DIR} -run ${TARGET_TEST}; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make run' first."; \
		exit 1; \
	fi

e2e:
	docker exec reearth-visualizer-reearth-visualizer-dev-1 sh -c "make e2e-docker"

e2e-docker:
	set -a && . ./.env.docker && set +a && go test -tags=e2e ./e2e/...

e2e-test:
	@if [ -z "$(TEST_NAME)" ]; then \
		echo "Error: TEST_NAME is required"; \
		echo "Usage: make e2e-test TEST_NAME=TestMockAuth"; \
		exit 1; \
	fi
	@echo "Running e2e test: $(TEST_NAME)"
	@if docker ps --format '{{.Names}}' | grep -q '^reearth-visualizer-reearth-visualizer-dev-1$$'; then \
		${DOCKER_EXEC} sh -c "set -a && . ./.env.docker && set +a && go test -v -tags=e2e -run $(TEST_NAME) ./e2e"; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make run' first."; \
		exit 1; \
	fi

# =======================
# Build & Run
# =======================

build:
	go build -ldflags="-X main.version=0.0.1" ./cmd/reearth

run:
	${DOCKER_COMPOSE_DEV} up reearth-visualizer-dev

down:
	${DOCKER_COMPOSE_DEV} down

# =======================
# Migration
# =======================

migrate:
	@echo "==== Running database migration ===="
	RUN_MIGRATION=true REEARTH_DB=${REEARTH_DB} REEARTH_DB_VIS=${REEARTH_DB_VIS} go run ./cmd/reearth
	@echo "✓ Migration complete!"

migrate-with-key:
	@if [ -z "$(MIGRATION_KEY)" ]; then \
		echo "Error: MIGRATION_KEY is not set."; \
		echo "Usage: make migrate-with-key MIGRATION_KEY=<key>"; \
		exit 1; \
	fi
	@echo "==== Running database migration with MIGRATION_KEY=$(MIGRATION_KEY) ===="
	RUN_MIGRATION=true MIGRATION_KEY=$(MIGRATION_KEY) REEARTH_DB=${REEARTH_DB} REEARTH_DB_VIS=${REEARTH_DB_VIS} go run ./cmd/reearth
	@echo "✓ Migration complete!"

# =======================
# Code Generation
# =======================

generate: dev-install
	go generate ./...

gql:
	go generate ./internal/adapter/gql/gqldataloader
	go generate ./internal/adapter/gql

schematyper:
	go run $(SCHEMATYPER) -o $(MANIFEST_DIR)/schema_translation.go --package manifest --prefix Translation ./schemas/plugin_manifest_translation.json
	go run $(SCHEMATYPER) -o $(MANIFEST_DIR)/schema_gen.go --package manifest ./schemas/plugin_manifest.json

deep-copy:
	(cd pkg/property && deep-copy --type Initializer --pointer-receiver -o initializer_gen.go .)

error-msg:
	go generate ./pkg/i18n/...

grpc:
	protoc --go_out=./internal/adapter/internalapi/ --go_opt=paths=source_relative \
      --go-grpc_out=./internal/adapter/internalapi/ --go-grpc_opt=paths=source_relative  \
        ./schemas/internalapi/v1/schema.proto

grpc-doc:
	protoc -I . \
	  --doc_out=schemas/internalapi/docs \
	  --doc_opt=markdown,schema.md \
	  schemas/internalapi/v1/schema.proto

# =======================
# Tools
# =======================

dev-install:
	@for bin in air stringer schematyper deep-copy; do \
		if ! which $$bin >/dev/null 2>&1; then \
			echo "$$bin is not installed. Installing..."; \
			case $$bin in \
				air) go install github.com/air-verse/air@v1.61.5 ;; \
				stringer) go install golang.org/x/tools/cmd/stringer@v0.39.0 ;; \
				schematyper) go install github.com/idubinskiy/schematyper ;; \
				deep-copy) go install github.com/globusdigital/deep-copy@v0.5.5-0.20251122193020-7cda106f7b4b ;; \
			esac; \
		else \
			echo "$$bin is already installed."; \
		fi; \
	done


init-gcs:
	curl -s -D - -o /dev/null \
		-H 'Content-Type: application/json' \
		-d '{"name": "test-bucket"}' \
		http://localhost:4443/storage/v1/b | head -n 1

.PHONY: default help lint test test-docker e2e e2e-docker e2e-test build run down \
        migrate migrate-with-key generate gql grpc grpc-doc schematyper deep-copy error-msg dev-install init-gcs
