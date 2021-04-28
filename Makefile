lint:
	golangci-lint run --fix

test:
	go test -race -v ./...

build:
	go build ./cmd/reearth

run-app:
	go run ./cmd/reearth

run-db:
	docker-compose up -d reearth-mongo

gen:
	go generate ./...

gen/gql:
	go generate ./internal/graphql

gen/builtin:
	go generate ./pkg/builtin

gen/manifest:
	go generate ./pkg/plugin/manifest

gen/id:
	go generate ./pkg/id

.PHONY: lint test build run-app run-db gen gen/gql gen/builtin gen/manifest gen/id
