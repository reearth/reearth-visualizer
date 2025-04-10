# =======================
# Variables
# =======================

TEST_DIR ?= ./...
TARGET_TEST := ./...
REEARTH_DB := mongodb://localhost
SCHEMATYPER := github.com/idubinskiy/schematyper
MANIFEST_DIR := pkg/plugin/manifest
DOCKER_COMPOSE := docker compose -f ../docker-compose.yml

# =======================
# Default
# =======================

default: help

help:
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  lint              Run golangci-lint with auto-fix"
	@echo "  test              Run unit tests"
	@echo "  test-debug        Run unit tests with verbose output"
	@echo "  e2e               Run end-to-end tests"
	@echo "  build             Build the project"
	@echo "  dev-install       Install dev tools"
	@echo "  dev               Run the application with hot reload"
	@echo "  run-app           Run the application"
	@echo "  run-db            Start MongoDB with Docker Compose"
	@echo "  run-reset         Reset MongoDB data and add mock user"
	@echo "  gql               Generate GraphQL code"
	@echo "  schematyper       Generate schema using schematyper"
	@echo "  deep-copy         Generate deep-copy code for Initializer"
	@echo "  mockuser          Create a mock user"
	@echo "  up-gcs            Start fake GCS server"
	@echo "  down-gcs          Stop fake GCS server"
	@echo "  clean             Clean Go cache"

# =======================
# Test
# =======================

lint:
	golangci-lint run --fix

test:
	REEARTH_DB=${REEARTH_DB} go test ${TEST_DIR} -run ${TARGET_TEST}

test-debug:
	go test -v -timeout 10s ${TEST_DIR} | tee test.log

e2e:
	go test -v ./e2e/...

# =======================
# Build & Run
# =======================

build:
	go build ./cmd/reearth

dev: dev-install
	air

run-app:
	go run ./cmd/reearth

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

grpc:
	protoc --go_out=./internal/adapter/internalapi/ --go_opt=paths=source_relative \
      --go-grpc_out=./internal/adapter/internalapi/ --go-grpc_opt=paths=source_relative  \
        ./schemas/internalapi/v1/schema.proto

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

mockuser:
	curl -H 'Content-Type: application/json' \
		-d '{"email": "mock@example.com", "username": "Mock User"}' \
		http://localhost:8080/api/signup

.PHONY: default help lint test test-debug e2e build dev-install dev run-app run-db run-reset run-clean-start clean \
        gql mockuser schematyper deep-copy up-gcs down-gcs generate
