@echo off
setlocal enabledelayedexpansion

REM ==========================
REM Config
REM ==========================
set TEST_DIR=./...
set TARGET_TEST=./...
set REEARTH_DB=mongodb://localhost
set REEARTH_DB_VIS=reearth
set REEARTH_DB_DOCKER=mongodb://reearth-mongo:27017/?directConnection=true
set MIGRATION_KEY=
set SCHEMATYPER=github.com/idubinskiy/schematyper
set MANIFEST_DIR=pkg/plugin/manifest
set DOCKER_COMPOSE=docker compose -f ../docker-compose.yml
set DOCKER_EXEC=docker exec reearth-visualizer-reearth-visualizer-dev-1

REM ==========================
REM Dispatch by argument
REM ==========================
if "%1"=="" goto help
if "%1"=="help" goto help

REM Local commands
if "%1"=="build" goto build
if "%1"=="clean" goto clean
if "%1"=="deep-copy" goto deepcopy
if "%1"=="dev" goto dev
if "%1"=="dev-install" goto devinstall
if "%1"=="e2e" goto e2e
if "%1"=="error-msg" goto errormsg
if "%1"=="generate" goto generate
if "%1"=="gql" goto gql
if "%1"=="lint" goto lint
if "%1"=="migrate" goto migrate
if "%1"=="migrate-with-key" goto migratewithkey
if "%1"=="run-app" goto runapp
if "%1"=="run-standalone" goto runstandalone
if "%1"=="schematyper" goto schematyper
if "%1"=="test" goto test
if "%1"=="test-debug" goto testdebug

REM Docker commands
if "%1"=="d-destroy" goto ddestroy
if "%1"=="d-down" goto ddown
if "%1"=="d-down-gcs" goto ddowngcs
if "%1"=="d-lint" goto dlint
if "%1"=="d-migrate" goto dmigrate
if "%1"=="d-migrate-with-key" goto dmigratewithkey
if "%1"=="d-reset-data" goto dresetdata
if "%1"=="d-run" goto drun
if "%1"=="d-run-accounts" goto drunaccounts
if "%1"=="d-run-db" goto drundb
if "%1"=="d-run-internal" goto druninternal
if "%1"=="d-test" goto dtest
if "%1"=="d-up-gcs" goto dupgcs

REM Setup commands
if "%1"=="auth0-accounts" goto auth0accounts
if "%1"=="gcs-bucket" goto gcsbucket
if "%1"=="mockuser" goto mockuser
if "%1"=="mockuser-accounts" goto mockuseraccounts

goto help

:help
echo Usage:
echo   dev.bat ^<target^>
echo.
echo Local:
echo   build             Build the project
echo   clean             Clean Go cache
echo   deep-copy         Generate deep-copy code for Initializer
echo   dev               Run the application with hot reload
echo   dev-install       Install dev tools
echo   e2e               Run end-to-end tests
echo   error-msg         Generate error messages
echo   generate          Run go generate
echo   gql               Generate GraphQL code
echo   lint              Run golangci-lint with auto-fix
echo   migrate           Run database migration
echo   migrate-with-key  Run database migration with MIGRATION_KEY
echo   run-app           Run the application with accounts API
echo   run-standalone    Run the visualizer standalone
echo   schematyper       Generate schema using schematyper
echo   test              Run unit tests
echo   test-debug        Run unit tests with verbose output
echo.
echo Docker:
echo   d-destroy         Remove ALL Docker resources and data (destructive)
echo   d-down            Stop Docker Compose services
echo   d-down-gcs        Stop fake GCS server
echo   d-lint            Run golangci-lint in Docker container
echo   d-migrate         Run database migration in Docker container
echo   d-migrate-with-key Run database migration with MIGRATION_KEY in Docker
echo   d-reset-data      Reset database and GCS, reinitialize with mock data
echo   d-run             Start dev server with Docker Compose
echo   d-run-accounts    Start accounts API with Docker Compose
echo   d-run-db          Start MongoDB with Docker Compose
echo   d-run-internal    Start internal gRPC API server with Docker Compose
echo   d-test            Run unit tests in Docker container
echo   d-up-gcs          Start fake GCS server
echo.
echo Setup:
echo   auth0-accounts    Create a user via Auth0 OIDC
echo   gcs-bucket        Initialize GCS bucket
echo   mockuser-accounts Create a mock user via accounts API
goto :eof

REM ==========================
REM Local commands
REM ==========================

:build
go build -ldflags="-X main.version=0.0.1" ./cmd/reearth
goto :eof

:clean
go clean -modcache
go clean -cache
go clean -testcache
goto :eof

:deepcopy
pushd pkg\property
deep-copy --type Initializer --pointer-receiver -o initializer_gen.go .
popd
goto :eof

:dev
call dev.bat dev-install
air
goto :eof

:devinstall
call :install air github.com/air-verse/air@v1.61.5
call :install stringer golang.org/x/tools/cmd/stringer@v0.39.0
call :install schematyper github.com/idubinskiy/schematyper
call :install deep-copy github.com/globusdigital/deep-copy@v0.5.5-0.20251122193020-7cda106f7b4b
goto :eof

:e2e
go test -v ./e2e/...
goto :eof

:errormsg
go generate ./pkg/i18n/...
goto :eof

:generate
call dev.bat dev-install
go generate ./...
goto :eof

:gql
go generate ./internal/adapter/gql/gqldataloader
go generate ./internal/adapter/gql
goto :eof

:lint
golangci-lint run --fix
goto :eof

:migrate
echo ==== Running database migration ====
set RUN_MIGRATION=true
set REEARTH_DB=%REEARTH_DB%
set REEARTH_DB_VIS=%REEARTH_DB_VIS%
go run ./cmd/reearth
echo Done!
goto :eof

:migratewithkey
if "%2"=="" (
  echo Error: MIGRATION_KEY is not set.
  echo Usage: dev.bat migrate-with-key ^<key^>
  exit /b 1
)
echo ==== Running database migration with MIGRATION_KEY=%2 ====
set RUN_MIGRATION=true
set MIGRATION_KEY=%2
set REEARTH_DB=%REEARTH_DB%
set REEARTH_DB_VIS=%REEARTH_DB_VIS%
go run ./cmd/reearth
echo Done!
goto :eof

:runapp
call dev.bat d-run-accounts
call dev.bat mockuser
go run -ldflags="-X main.version=0.0.1" ./cmd/reearth
goto :eof

:runstandalone
go run -ldflags="-X main.version=0.0.1" ./cmd/reearth
goto :eof

:schematyper
go run %SCHEMATYPER% -o %MANIFEST_DIR%/schema_translation.go --package manifest --prefix Translation ./schemas/plugin_manifest_translation.json
go run %SCHEMATYPER% -o %MANIFEST_DIR%/schema_gen.go --package manifest ./schemas/plugin_manifest.json
goto :eof

:test
set REEARTH_DB=%REEARTH_DB%
go test %TEST_DIR% -run %TARGET_TEST%
goto :eof

:testdebug
go test -v -timeout 10s %TEST_DIR%
goto :eof

REM ==========================
REM Docker commands
REM ==========================

:ddestroy
echo WARNING: This will remove ALL Docker resources!
echo This includes containers, images, volumes, and networks.
echo.
set /p REPLY="Are you sure you want to continue? [y/N] "
if /i "%REPLY%"=="y" (
  for /f "tokens=*" %%i in ('docker ps -q') do docker stop %%i
  docker system prune -a --volumes -f
  docker network prune -f
  echo All Docker resources have been removed
  echo ==== Removing data directory ====
  rmdir /s /q ..\tmp\gcs 2>nul
  rmdir /s /q ..\tmp\mongo 2>nul
  echo All data resources have been cleared
) else (
  echo Operation cancelled
)
goto :eof

:ddown
%DOCKER_COMPOSE% --profile accounts down
goto :eof

:ddowngcs
%DOCKER_COMPOSE% down gcs
goto :eof

:dlint
echo Running golangci-lint in Docker container...
docker ps --format "{{.Names}}" | findstr /R "^reearth-visualizer-reearth-visualizer-dev-1$" >nul 2>nul
if %errorlevel% equ 0 (
  %DOCKER_EXEC% golangci-lint run --fix --timeout=10m
) else (
  echo Error: reearth-visualizer-dev container is not running.
  echo Please start the container with 'dev.bat d-run' first.
  exit /b 1
)
goto :eof

:dmigrate
echo ==== Running database migration in Docker container ====
docker ps --format "{{.Names}}" | findstr /R "^reearth-visualizer-reearth-visualizer-dev-1$" >nul 2>nul
if %errorlevel% equ 0 (
  %DOCKER_EXEC% sh -c "RUN_MIGRATION=true REEARTH_DB='%REEARTH_DB_DOCKER%' REEARTH_DB_VIS='%REEARTH_DB_VIS%' go run ./cmd/reearth"
  echo Migration complete!
) else (
  echo Error: reearth-visualizer-dev container is not running.
  echo Please start the container with 'dev.bat d-run' first.
  exit /b 1
)
goto :eof

:dmigratewithkey
if "%2"=="" (
  echo Error: MIGRATION_KEY is not set.
  echo Usage: dev.bat d-migrate-with-key ^<key^>
  exit /b 1
)
echo ==== Running database migration with MIGRATION_KEY=%2 in Docker container ====
docker ps --format "{{.Names}}" | findstr /R "^reearth-visualizer-reearth-visualizer-dev-1$" >nul 2>nul
if %errorlevel% equ 0 (
  %DOCKER_EXEC% sh -c "RUN_MIGRATION=true MIGRATION_KEY='%2' REEARTH_DB='%REEARTH_DB_DOCKER%' REEARTH_DB_VIS='%REEARTH_DB_VIS%' go run ./cmd/reearth"
  echo Migration complete!
) else (
  echo Error: reearth-visualizer-dev container is not running.
  echo Please start the container with 'dev.bat d-run' first.
  exit /b 1
)
goto :eof

:dresetdata
echo ==== Stopping database and GCS services ====
%DOCKER_COMPOSE% down reearth-mongo reearth-gcs
echo.
echo ==== Removing data directory ====
rmdir /s /q ..\tmp\gcs 2>nul
rmdir /s /q ..\tmp\mongo 2>nul
echo.
echo ==== Starting database and GCS services ====
%DOCKER_COMPOSE% up -d reearth-mongo reearth-gcs
echo.
echo ==== Waiting for services to be ready (3 seconds) ====
echo 3...
timeout /t 1 /nobreak >nul
echo 2...
timeout /t 1 /nobreak >nul
echo 1...
timeout /t 1 /nobreak >nul
echo ==== Initializing GCS bucket ====
call dev.bat gcs-bucket
echo.
echo ==== Creating mock user ====
call dev.bat mockuser-accounts
echo.
echo Reset complete!
goto :eof

:drun
%DOCKER_COMPOSE% --profile accounts up reearth-visualizer-dev
goto :eof

:drunaccounts
if not exist .env.accounts.docker (
  echo Creating .env.accounts.docker from .env.accounts.docker.example...
  copy .env.accounts.docker.example .env.accounts.docker
)
%DOCKER_COMPOSE% up -d reearth-accounts-api
goto :eof

:drundb
%DOCKER_COMPOSE% up -d reearth-mongo
goto :eof

:druninternal
%DOCKER_COMPOSE% up --build reearth-visualizer-internal-api
goto :eof

:dtest
echo Running tests in Docker container...
echo Note: Some e2e tests may fail due to MongoDB permission issues in Docker.
docker ps --format "{{.Names}}" | findstr /R "^reearth-visualizer-reearth-visualizer-dev-1$" >nul 2>nul
if %errorlevel% equ 0 (
  %DOCKER_EXEC% go test %TEST_DIR% -run %TARGET_TEST%
) else (
  echo Error: reearth-visualizer-dev container is not running.
  echo Please start the container with 'dev.bat d-run' first.
  exit /b 1
)
goto :eof

:dupgcs
%DOCKER_COMPOSE% up -d gcs
goto :eof

REM ==========================
REM Setup commands
REM ==========================

:auth0accounts
curl -s -D - -o nul ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"mutation($input:SignupOIDCInput!){signupOIDC(input:$input){user{id name email}}}\",\"variables\":{\"input\":{\"email\":\"y.soneda@eukarya.io\",\"name\":\"y.soneda\",\"sub\":\"677b86d8274ea6264bce1c1e\",\"secret\":\"\"}}}" ^
  http://localhost:8090/api/graphql
goto :eof

:gcsbucket
curl -s -D - -o nul ^
  -H "Content-Type: application/json" ^
  -d "{\"name\": \"test-bucket\"}" ^
  http://localhost:4443/storage/v1/b
goto :eof

:mockuser
call dev.bat mockuser-accounts
goto :eof

:mockuseraccounts
curl -s -D - -o nul ^
  -H "Content-Type: application/json" ^
  -d "{\"query\":\"mutation($input:SignupInput!){signup(input:$input){user{id name email}}}\",\"variables\":{\"input\":{\"email\":\"demo@example.com\",\"name\":\"Demo User\",\"password\":\"Passw0rd!\"}}}" ^
  http://localhost:8090/api/graphql
goto :eof

REM ==========================
REM Helper functions
REM ==========================

:install
where %1 >nul 2>nul
if %errorlevel% neq 0 (
  echo Installing %1 ...
  go install %2
) else (
  echo %1 is already installed.
)
goto :eof
