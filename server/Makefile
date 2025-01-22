TEST_DIR ?= ./...

SCHEMATYPER := github.com/idubinskiy/schematyper
MANIFEST_DIR := pkg/plugin/manifest

default: help

help:
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  lint              Run golangci-lint with auto-fix"
	@echo "  test              Run unit tests with race detector in short mode"
	@echo "  failcheck         Run unit tests with fail-fast and no parallel execution"
	@echo "  e2e               Run end-to-end tests"
	@echo "  build             Build the project"
	@echo "  dev-install       Install tools for make dev - behavior not confirmed in windows."
	@echo "  dev               Run the application with hot reloading"
	@echo "  run-app           Run the application"
	@echo "  run-db            Run the MongoDB database using Docker Compose"
	@echo "  gql               Generate GraphQL code include dataloader"
	@echo "  mockuser          Create a mock user by executing a curl request"
	@echo "  schematyper       Generate schema using schematyper"

lint:
	golangci-lint run --fix

test:
	go test -race -short -v ./...

failcheck:
	go test -race -short -failfast -p 1 $(TEST_DIR)

e2e:
	go test -v ./e2e/...

build:
	go build ./cmd/reearth

AIR_BIN := $(shell which air)
dev-install:
ifndef AIR_BIN
	@echo "reflex is not installed. Installing..."
	@go install github.com/air-verse/air@v1.61.5
else
	@echo "air is already installed."
endif

dev: dev-install
	air

run-app:
	go run ./cmd/reearth

run-db:
	docker compose -f ../docker-compose.yml up -d reearth-mongo

gql:
	go generate ./internal/adapter/gql/gqldataloader
	go generate ./internal/adapter/gql

mockuser:
	curl -H 'Content-Type: application/json' -d '{"email": "mock@example.com", "username": "Mock User"}' http://localhost:8080/api/signup

schematyper:
	go run $(SCHEMATYPER) -o $(MANIFEST_DIR)/schema_translation.go --package manifest --prefix Translation ./schemas/plugin_manifest_translation.json
	go run $(SCHEMATYPER) -o $(MANIFEST_DIR)/schema_gen.go --package manifest ./schemas/plugin_manifest.json

.PHONY: lint test failcheck e2e build dev-install dev run-app run-db gql mockuser schematyper
