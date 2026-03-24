# =======================
# Variables
# =======================

TEST_DIR ?= ./...
TARGET_TEST := ./...
REEARTH_DB := mongodb://localhost
REEARTH_DB_VIS := reearth
REEARTH_DB_DOCKER := mongodb://reearth-mongo:27017/?directConnection=true
MIGRATION_KEY ?=
SCHEMATYPER := github.com/idubinskiy/schematyper
MANIFEST_DIR := pkg/plugin/manifest
DOCKER_COMPOSE := docker compose -f ../docker-compose.yml
DOCKER_EXEC := docker exec reearth-visualizer-reearth-visualizer-dev-1

# =======================
# Include Fragments
# =======================

include mk/local.mk
include mk/docker.mk
include mk/tools.mk

# =======================
# Default
# =======================

default: help

help:
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Local:"
	@echo "  build             Build the project"
	@echo "  clean             Clean Go cache"
	@echo "  deep-copy         Generate deep-copy code for Initializer"
	@echo "  dev               Run the application with hot reload"
	@echo "  dev-install       Install dev tools"
	@echo "  e2e               Run end-to-end tests"
	@echo "  error-msg         Generate error messages"
	@echo "  generate          Run go generate"
	@echo "  gql               Generate GraphQL code"
	@echo "  lint              Run golangci-lint with auto-fix"
	@echo "  migrate           Run database migration"
	@echo "  migrate-with-key  Run database migration with MIGRATION_KEY"
	@echo "  run-app           Run the application with accounts API"
	@echo "  run-standalone    Run the application in standalone mode"
	@echo "  schematyper       Generate schema using schematyper"
	@echo "  test              Run unit tests"
	@echo "  test-debug        Run unit tests with verbose output"
	@echo ""
	@echo "Docker:"
	@echo "  d-destroy         Remove ALL Docker resources and data (destructive)"
	@echo "  d-down            Stop Docker Compose services"
	@echo "  d-down-internal   Stop internal gRPC API container"
	@echo "  d-down-gcs        Stop fake GCS server"
	@echo "  d-logs-accounts   Follow accounts API logs"
	@echo "  d-lint            Run golangci-lint in Docker container"
	@echo "  d-migrate         Run database migration in Docker container"
	@echo "  d-migrate-with-key Run database migration with MIGRATION_KEY in Docker"
	@echo "  d-reset-data      Reset database and GCS, reinitialize with mock data"
	@echo "  d-run             Start all services including accounts API"
	@echo "  d-run-standalone  Start visualizer without accounts API (mongo + gcs only)"
	@echo "  d-run-accounts    Start accounts API with Docker Compose"
	@echo "  d-run-db          Start MongoDB with Docker Compose"
	@echo "  d-run-internal    Start internal gRPC API server with Docker Compose"
	@echo "  d-test            Run unit tests in Docker container"
	@echo "  d-up-gcs          Start fake GCS server"
	@echo ""
	@echo "Setup:"
	@echo "  init              Initialize GCS bucket and create mock user"
	@echo "  auth0-accounts    Create a user via Auth0 OIDC"
	@echo "  gcs-bucket        Initialize GCS bucket"
	@echo "  mockuser-accounts Create a mock user via accounts API"

.PHONY: default help
