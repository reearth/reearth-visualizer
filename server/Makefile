TEST_DIR ?= ./...

help:
	@echo "Usage:"
	@echo "  make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  lint       Run golangci-lint with auto-fix"
	@echo "  test       Run unit tests with race detector in short mode"
	@echo "  failcheck  Run unit tests with fail-fast and no parallel execution"
	@echo "  e2e        Run end-to-end tests"
	@echo "  build      Build the project"
	@echo "  run-app    Run the application"
	@echo "  run-db     Run the MongoDB database using Docker Compose"
	@echo "  gql        Generate GraphQL code"
	@echo "  mockuser   Create a mock user by executing a curl request"

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

run-app:
	go run ./cmd/reearth

run-db:
	docker compose -f ../docker-compose.yml up -d reearth-mongo

gql:
	go generate ./internal/adapter/gql

mockuser:
	curl -H 'Content-Type: application/json' -d '{"email": "mock@example.com", "username": "Mock User"}' http://localhost:8080/api/signup

.PHONY: lint test failcheck e2e build run-app run-db gql mockuser
