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
	@echo "  test-debug        Run unit tests with outpt log"
	@echo "  e2e               Run end-to-end tests"
	@echo "  build             Build the project"
	@echo "  dev-install       Install tools for make dev - behavior not confirmed in windows."
	@echo "  dev               Run the application with hot reloading"
	@echo "  run-app           Run the application"
	@echo "  run-db            Run the MongoDB database using Docker Compose"
	@echo "  run-reset         Initialize the MongoDB data"
	@echo "  up-gcs            Run the fake-gcs-server using Docker Compose"
	@echo "  down-gcs          Stop the fake-gcs-server using Docker Compose"
	@echo "  gql               Generate GraphQL code include dataloader"
	@echo "  mockuser          Create a mock user by executing a curl request"
	@echo "  schematyper       Generate schema using schematyper"

lint:
	golangci-lint run --fix

TARGET_TEST :=./...
REEARTH_DB := mongodb://localhost
test:
	REEARTH_DB=${REEARTH_DB} go test ./... -run ${TARGET_TEST}

test-debug:
	go test -v -timeout 10s ./... | tee test.log 

e2e:
	go test -v ./e2e/...

build:
	go build ./cmd/reearth

AIR_BIN := $(shell which air)
STRINGER_BIN := $(shell which stringer)
SCHEMATYPER_BIN := $(shell which schematyper)
DEEP_COPY_BIN := $(shell which deep-copy)
dev-install:
ifndef AIR_BIN
	@echo "reflex is not installed. Installing..."
	@go install github.com/air-verse/air@v1.61.5
else
	@echo "air is already installed."
endif
ifndef STRINGER_BIN
	@echo "Stringer is not installed. Installing..."
	@go install golang.org/x/tools/cmd/stringer@v0.29.0
else
	@echo "Stringer is already installed."
endif
ifndef SCHEMATYPER_BIN
	@echo "Schematyper is not installed. Installing..."
	@go install github.com/idubinskiy/schematyper
else
	@echo "Schematyper is already installed."
endif
ifndef DEEP_COPY_BIN
	@echo "Deep copy is not installed. Installing..."
	@go install github.com/globusdigital/deep-copy@dc4a8d91ed65656858cd53e6e83bbf7b83d5b7cb
else
	@echo "Deep copy is already installed."
endif

dev: dev-install
	air

run-app:
	go run ./cmd/reearth

run-clean-start:
	go clean -modcache
	go clean -cache
	go clean -testcache
	go run ./cmd/reearth

run-db:
	docker compose -f ../docker-compose.yml up -d reearth-mongo

run-reset:
	docker stop reearth-visualizer-reearth-mongo-1
	rm -rf ../mongo
	rm -rf data
	make run-db
	make mockuser

generate: dev-install
	go generate ./...

gql:
	go generate ./internal/adapter/gql/gqldataloader
	go generate ./internal/adapter/gql

up-gcs:
	docker compose -f ../docker-compose.yml up -d gcs

down-gcs:
	docker compose -f ../docker-compose.yml down gcs

mockuser:
	curl -H 'Content-Type: application/json' -d '{"email": "mock@example.com", "username": "Mock User"}' http://localhost:8080/api/signup

schematyper:
	go run $(SCHEMATYPER) -o $(MANIFEST_DIR)/schema_translation.go --package manifest --prefix Translation ./schemas/plugin_manifest_translation.json
	go run $(SCHEMATYPER) -o $(MANIFEST_DIR)/schema_gen.go --package manifest ./schemas/plugin_manifest.json

.PHONY: lint test test-debug e2e build dev-install dev run-app run-db run-reset gql up-gcs down-gcs mockuser schematyper
