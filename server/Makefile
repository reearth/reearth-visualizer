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
	docker compose up -f ../docker-compose.yml -d reearth-mongo

gql:
	go generate ./internal/adapter/gql

.PHONY: lint test e2e build run-app run-db gql
