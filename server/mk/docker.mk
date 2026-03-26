# =======================
# Docker
# =======================
DOCKER_COMPOSE := docker compose -f ../docker-compose.yml
DOCKER_VIS_EXEC := ${DOCKER_COMPOSE} exec -T reearth-visualizer-dev
DOCKER_MONGO_EXEC := ${DOCKER_COMPOSE} exec -T reearth-mongo

d-destroy:
	@echo "⚠️  WARNING: This will remove ALL Docker resources!"
	@echo "This includes containers, images, volumes, and networks."
	@echo ""
	@read -p "Are you sure you want to continue? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		containers=$$(docker ps -q); \
		if [ -n "$$containers" ]; then \
			docker stop $$containers; \
		else \
			echo "No running containers to stop."; \
		fi; \
		docker system prune -a --volumes -f; \
		docker network prune -f; \
		echo "✓ All Docker resources have been removed"; \
		echo "==== Removing data directory (requires sudo password) ===="; \
		sudo rm -rf tmp/gcs tmp/mongo; \
		echo "✓ All data resources have been cleared"; \
	else \
		echo "✗ Operation cancelled"; \
	fi

d-down:
	${DOCKER_COMPOSE} --profile accounts down

d-down-gcs:
	${DOCKER_COMPOSE} stop reearth-gcs
	${DOCKER_COMPOSE} rm -f reearth-gcs || true

d-down-internal:
	${DOCKER_COMPOSE} stop reearth-visualizer-internal-api
	${DOCKER_COMPOSE} rm -f reearth-visualizer-internal-api || true

d-lint:
	@echo "Running golangci-lint in Docker container..."
	@if ${DOCKER_COMPOSE} ps --format '{{.Names}}' | grep -q 'reearth-visualizer-dev'; then \
		${DOCKER_VIS_EXEC} golangci-lint run --fix --timeout=10m; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make d-run' first."; \
		exit 1; \
	fi

d-logs-accounts:
	docker logs -f reearth-visualizer-reearth-accounts-api-1

d-migrate:
	@echo "==== Running database migration in Docker container ===="
	@if ${DOCKER_COMPOSE} ps --format '{{.Names}}' | grep -q 'reearth-visualizer-dev'; then \
		${DOCKER_VIS_EXEC} sh -c "RUN_MIGRATION=true REEARTH_DB='${REEARTH_DB_DOCKER}' REEARTH_DB_VIS='${REEARTH_DB_VIS}' go run ./cmd/reearth"; \
		echo "✓ Migration complete!"; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make d-run' first."; \
		exit 1; \
	fi

d-migrate-with-key:
	@if [ -z "$(MIGRATION_KEY)" ]; then \
		echo "Error: MIGRATION_KEY is not set."; \
		echo "Usage: make d-migrate-with-key MIGRATION_KEY=<key>"; \
		exit 1; \
	fi
	@echo "==== Running database migration with MIGRATION_KEY=$(MIGRATION_KEY) in Docker container ===="
	@if ${DOCKER_COMPOSE} ps --format '{{.Names}}' | grep -q 'reearth-visualizer-dev'; then \
		${DOCKER_VIS_EXEC} sh -c "RUN_MIGRATION=true MIGRATION_KEY='$(MIGRATION_KEY)' REEARTH_DB='${REEARTH_DB_DOCKER}' REEARTH_DB_VIS='${REEARTH_DB_VIS}' go run ./cmd/reearth"; \
		echo "✓ Migration complete!"; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make d-run' first."; \
		exit 1; \
	fi

d-reset-data:
	@echo "==== Stopping all services ===="
	${DOCKER_COMPOSE} --profile accounts down
	@echo ""
	@echo "==== Removing data directory (requires sudo password) ===="
	sudo rm -rf tmp/gcs tmp/mongo
	@echo ""
	@echo "==== Starting all services ===="
	${DOCKER_COMPOSE} --profile accounts up -d reearth-mongo reearth-gcs reearth-accounts-api
	@echo ""
	@echo "==== Waiting for services to be ready (3 seconds) ===="
	@echo "3..."
	sleep 1
	@echo "2..."
	sleep 1
	@echo "1..."
	sleep 1
	@echo "==== Initializing GCS bucket and mock user ===="
	make setup-dev
	@echo ""
	@echo "✓ Reset complete!"

d-run:
	@if [ ! -f .env.docker ]; then \
		echo "Creating .env.docker from .env.docker.example..."; \
		cp .env.docker.example .env.docker; \
	fi
	@if [ ! -f .env.accounts.docker ]; then \
		echo "Creating .env.accounts.docker from .env.accounts.docker.example..."; \
		cp .env.accounts.docker.example .env.accounts.docker; \
	fi
	${DOCKER_COMPOSE} --profile accounts up reearth-visualizer-dev

d-run-accounts:
	@if [ ! -f .env.accounts.docker ]; then \
		echo "Creating .env.accounts.docker from .env.accounts.docker.example..."; \
		cp .env.accounts.docker.example .env.accounts.docker; \
	fi
	${DOCKER_COMPOSE} up -d reearth-accounts-api

# This is alias for backward compatibility
run-db:
	make d-run-db

d-run-db:
	${DOCKER_COMPOSE} up -d reearth-mongo
	@echo "==== Waiting for MongoDB primary to be ready ===="
	@MAX_WAIT=60; WAITED=0; \
	until ${DOCKER_MONGO_EXEC} mongosh --quiet --eval "db.adminCommand({ ping: 1 }).ok" >/dev/null 2>&1; do \
		if [ $$WAITED -ge $$MAX_WAIT ]; then \
			echo "MongoDB did not become ready within $$MAX_WAIT seconds"; \
			exit 1; \
		fi; \
		echo "Waiting for MongoDB (elapsed: $$WAITED s)..."; \
		sleep 1; \
		WAITED=$$((WAITED + 1)); \
	done
	@echo "==== Initializing replica set if needed ===="
	@${DOCKER_MONGO_EXEC} mongosh --quiet --eval '\
	try { \
		rs.status(); \
		print("Replica set already initialized"); \
	} catch (e) { \
		print("Replica set not initialized, running rs.initiate()"); \
		rs.initiate({ _id: "rs0", members: [{ _id: 0, host: "reearth-mongo:27017" }] }); \
	}'
	@echo "==== Waiting for MongoDB primary election ===="
	@MAX_WAIT=30; WAITED=0; \
	until ${DOCKER_MONGO_EXEC} mongosh --quiet --eval 'if (!db.hello().isWritablePrimary) { quit(1); }' >/dev/null 2>&1; do \
		if [ $$WAITED -ge $$MAX_WAIT ]; then \
			echo "MongoDB did not become writable primary within $$MAX_WAIT seconds"; \
			exit 1; \
		fi; \
		echo "Waiting for MongoDB primary (elapsed: $$WAITED s)..."; \
		sleep 1; \
		WAITED=$$((WAITED + 1)); \
	done
	@echo "MongoDB primary is ready"
	make d-set-mongo-fcv-8

d-run-internal:
	${DOCKER_COMPOSE} up --build reearth-visualizer-internal-api

d-run-reset:
	docker stop reearth-visualizer-reearth-mongo-1
	rm -rf ../mongo data
	make d-run-db
	make mockuser-accounts

d-run-standalone:
	@if [ ! -f .env.docker ]; then \
		echo "Creating .env.docker from .env.docker.example..."; \
		cp .env.docker.example .env.docker; \
	fi
	${DOCKER_COMPOSE} up reearth-visualizer-dev

d-set-mongo-fcv-8:
	@echo "==== Setting featureCompatibilityVersion to 8.0 ===="
	@${DOCKER_MONGO_EXEC} mongosh --quiet --eval '\
db.adminCommand({ setFeatureCompatibilityVersion: "8.0", confirm: true })'
	@echo "==== Verifying featureCompatibilityVersion ===="
	@${DOCKER_MONGO_EXEC} mongosh --quiet --eval '\
printjson(db.adminCommand({ getParameter: 1, featureCompatibilityVersion: 1 }))'
	@echo "FCV set to 8.0"

d-test:
	@echo "Running tests in Docker container..."
	@if ${DOCKER_COMPOSE} ps --format '{{.Names}}' | grep -q 'reearth-visualizer-dev'; then \
		${DOCKER_VIS_EXEC} go test ${TEST_DIR} -run ${TARGET_TEST}; \
	else \
		echo "Error: reearth-visualizer-dev container is not running."; \
		echo "Please start the container with 'make d-run' first."; \
		exit 1; \
	fi

d-up-gcs:
	${DOCKER_COMPOSE} up -d reearth-gcs

.PHONY: d-destroy d-down d-down-gcs d-down-internal d-lint d-logs-accounts d-migrate d-migrate-with-key d-reset-data d-run d-run-accounts run-db d-run-db d-run-internal d-run-reset d-run-standalone d-set-mongo-fcv-8 d-test d-up-gcs
