lint:
	golangci-lint run --fix

test:
	go test -race -short -v ./...

e2e:
	go test -v ./e2e/...

build:
	go build ./cmd/reearth

run-app:
	go run ./cmd/reearth

run-db:
	docker compose -f ../docker-compose.yml up -d reearth-mongo

run-redis:
	docker compose -f ../docker-compose.yml up -d reearth-redis

run-cerbos:
	docker compose -f ../docker-compose.yml up -d reearth-cerbos

gql:
	go generate ./internal/adapter/gql

.PHONY: lint test e2e build run-app run-db run-redis gql
