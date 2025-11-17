# =======================
# Variables
# =======================

TEST_DIR ?= ./...
TARGET_TEST := ./...
REEARTH_DB := mongodb://localhost
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
	@echo "  lint              Run golangci-lint with auto-fix (local)"
	@echo "  lint-docker       Run golangci-lint in Docker container"
	@echo "  test              Run unit tests (local)"
	@echo "  test-docker       Run unit tests in Docker container"
	@echo "  test-debug        Run unit tests with verbose output"
	@echo "  e2e               Run end-to-end tests"
	@echo "  build             Build the project"
	@echo "  dev-install       Install dev tools"
	@echo "  dev               Run the application with hot reload"
	@echo "  run-app           Run the application"
	@echo "  run               Start dev server with Docker Compose"
	@echo "  run-db            Start MongoDB with Docker Compose"
	@echo "  run-reset         Reset MongoDB data and add mock user"
	@echo "  reset             Reset database and GCS, reinitialize with mock data"
	@echo "  init              Initialize GCS bucket and create mock user"
	@echo "  init-gcs          Initialize GCS bucket only"
	@echo "  destroy           Remove ALL Docker resources and data (destructive)"
	@echo "  gql               Generate GraphQL code"
	@echo "  schematyper       Generate schema using schematyper"
	@echo "  deep-copy         Generate deep-copy code for Initializer"
	@echo "  mockuser          Create a mock user"
	@echo "  up-gcs            Start fake GCS server"
	@echo "  down-gcs          Stop fake GCS server"
	@echo "  down              Stop Docker Compose services"
	@echo "  clean             Clean Go cache"

# =======================
# Test
# =======================

lint:
	golangci-lint run --fix

lint-docker:
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
	@echo "Running tests in Docker container..."
	@echo "Note: Some e2e tests may fail due to MongoDB permission issues in Docker."
	@if docker ps --format '{{.Names}}' | grep -q '^reearth-visualizer-reearth-visualizer-dev-1$$'; then \
		${DOCKER_EXEC} go test ${TEST_DIR} -run ${TARGET_TEST}; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make run' first."; \
		exit 1; \
	fi

test-debug:
	go test -v -timeout 10s ${TEST_DIR} | tee test.log

e2e:
	go test -v ./e2e/...

# =======================
# Build & Run
# =======================

build:
	go build -ldflags="-X main.version=0.0.1" ./cmd/reearth

dev: dev-install
	air

run-app:
	go run -ldflags="-X main.version=0.0.1" ./cmd/reearth

run:
	${DOCKER_COMPOSE_DEV} up reearth-visualizer-dev

down:
	${DOCKER_COMPOSE_DEV} down

clean:
	go clean -modcache
	go clean -cache
	go clean -testcache

run-clean-start: clean run-app

# =======================
# Docker
# =======================

run-db:
	${DOCKER_COMPOSE} up -d reearth-mongo

run-reset:
	docker stop reearth-visualizer-reearth-mongo-1
	rm -rf ../mongo data
	make run-db
	make mockuser

reset:
	@echo "==== Stopping database and GCS services ===="
	${DOCKER_COMPOSE_DEV} down reearth-mongo reearth-gcs
	@echo ""
	@echo "==== Removing data directory (requires sudo password) ===="
	sudo rm -rf tmp/gcs tmp/mongo 
	@echo ""
	@echo "==== Starting database and GCS services ===="
	${DOCKER_COMPOSE_DEV} up -d reearth-mongo reearth-gcs
	@echo ""
	@echo "==== Waiting for services to be ready (3 seconds) ===="
	@echo "3..."
	sleep 1
	@echo "2..."
	sleep 1
	@echo "1..."
	sleep 1
	make init
	@echo "✓ Reset complete!"

up-gcs:
	${DOCKER_COMPOSE} up -d gcs

down-gcs:
	${DOCKER_COMPOSE} down gcs

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
				stringer) go install golang.org/x/tools/cmd/stringer@v0.29.0 ;; \
				schematyper) go install github.com/idubinskiy/schematyper ;; \
				deep-copy) go install github.com/globusdigital/deep-copy@dc4a8d91ed65656858cd53e6e83bbf7b83d5b7cb ;; \
			esac; \
		else \
			echo "$$bin is already installed."; \
		fi; \
	done

# =======================
# Others
# =======================

init:
	@echo "==== Initializing GCS bucket ===="
	make init-gcs
	@echo ""
	@echo "==== Creating mock user ===="
	make mockuser
	@echo ""

mockuser:
	curl -s -D - -o /dev/null \
		-H 'Content-Type: application/json' \
		http://localhost:8080/api/mockuser | head -n 1

init-gcs:
	curl -s -D - -o /dev/null \
		-H 'Content-Type: application/json' \
		-d '{"name": "test-bucket"}' \
		http://localhost:4443/storage/v1/b | head -n 1

destroy:
	@echo "⚠️  WARNING: This will remove ALL Docker resources!"
	@echo "This includes containers, images, volumes, and networks."
	@echo ""
	@read -p "Are you sure you want to continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker stop $(docker ps -q); \
		docker system prune -a --volumes -f; \
		docker network prune -f; \
		echo "✓ All Docker resources have been removed"; \
		echo "==== Removing data directory (requires sudo password) ===="; \
		sudo rm -rf tmp/gcs tmp/mongo 
		echo "✓ All data resources have been cleared"; \
	else \
		echo "✗ Operation cancelled"; \
	fi

.PHONY: default help lint lint-docker test test-docker test-debug e2e build dev-install dev run-app run-db stop-db run-reset run-clean-start clean \
        gql mockuser schematyper deep-copy up-gcs down-gcs generate reset init init-gcs destroy down
