@echo off
setlocal enabledelayedexpansion

REM ==========================
REM Config
REM ==========================
set TEST_DIR=./...
set TARGET_TEST=./...
set REEARTH_DB=mongodb://localhost
set SCHEMATYPER=github.com/idubinskiy/schematyper
set MANIFEST_DIR=pkg/plugin/manifest
set DOCKER_COMPOSE_DEV=docker compose -f ../docker-compose.dev.yml
set DOCKER_EXEC=docker exec reearth-visualizer-reearth-visualizer-dev-1

REM ==========================
REM Dispatch by argument
REM ==========================
if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="lint" goto lint
if "%1"=="lint-docker" goto lintdocker
if "%1"=="test" goto test
if "%1"=="test-docker" goto testdocker
if "%1"=="e2e" goto e2e
if "%1"=="e2e-docker" goto e2edocker
if "%1"=="e2e-test" goto e2etest
if "%1"=="build" goto build
if "%1"=="dev-install" goto devinstall
if "%1"=="run" goto run
if "%1"=="down" goto down
if "%1"=="restart" goto restart
if "%1"=="reset" goto reset
if "%1"=="init-gcs" goto initgcs
if "%1"=="up-gcs" goto upgcs
if "%1"=="down-gcs" goto downgcs
if "%1"=="gql" goto gql
if "%1"=="generate" goto generate
if "%1"=="schematyper" goto schematyper
if "%1"=="deep-copy" goto deepcopy
if "%1"=="error-msg" goto errormsg
if "%1"=="grpc" goto grpc
if "%1"=="grpc-doc" goto grpcdoc
if "%1"=="mockuser" goto mockuser
if "%1"=="clean" goto clean
if "%1"=="destroy" goto destroy
goto help

:help
echo Usage:
echo   dev.bat ^<target^>
echo.
echo Targets:
echo.
echo Testing:
echo   lint              Run golangci-lint with auto-fix (local)
echo   lint-docker       Run golangci-lint in Docker container
echo   test              Run unit tests (local)
echo   test-docker       Run unit tests in Docker container
echo   e2e               Run end-to-end tests
echo   e2e-docker        Run all e2e tests in Docker
echo   e2e-test          Run specific e2e test (TEST_NAME=TestName)
echo.
echo Build ^& Run:
echo   build             Build the reearth binary
echo   run               Start dev server with Docker Compose
echo   down              Stop Docker Compose services
echo   restart           Restart dev server (down + run)
echo.
echo Code Generation:
echo   generate          Run all code generation
echo   gql               Generate GraphQL code
echo   grpc              Generate gRPC code
echo   grpc-doc          Generate gRPC documentation
echo   schematyper       Generate plugin manifest schema
echo   deep-copy         Generate deep-copy code
echo   error-msg         Generate i18n error messages
echo.
echo Development Tools:
echo   dev-install       Install dev tools (air, stringer, etc.)
echo   init-gcs          Initialize GCS bucket
echo   mockuser          Create a mock user
echo   up-gcs            Start fake GCS server
echo   down-gcs          Stop fake GCS server
echo.
echo Utility:
echo   clean             Clean Go cache
echo   reset             Reset database and GCS, reinitialize with mock data
echo   destroy           Remove all Docker resources and data
goto :eof

:lint
golangci-lint run --fix
goto :eof

:lintdocker
echo Running golangci-lint in Docker container...
docker ps --format "{{.Names}}" | findstr /R "^reearth-visualizer-reearth-visualizer-dev-1$" >nul 2>nul
if %errorlevel% equ 0 (
  %DOCKER_EXEC% golangci-lint run --fix --timeout=10m
) else (
  echo Error: reearth-visualizer-dev container is not running.
  echo Please start the container with 'dev.bat run' first.
  exit /b 1
)
goto :eof

:test
set REEARTH_DB=%REEARTH_DB%
go test %TEST_DIR% -run %TARGET_TEST%
goto :eof

:testdocker
echo Running tests in Docker container...
docker ps --format "{{.Names}}" | findstr /R "^reearth-visualizer-reearth-visualizer-dev-1$" >nul 2>nul
if %errorlevel% equ 0 (
  %DOCKER_EXEC% go test %TEST_DIR% -run %TARGET_TEST%
) else (
  echo Error: reearth-visualizer-dev container is not running.
  echo Please start the container with 'dev.bat run' first.
  exit /b 1
)
goto :eof

:e2e
go test -v ./e2e/...
goto :eof

:e2edocker
docker exec reearth-visualizer-reearth-visualizer-dev-1 sh -c "make e2e-docker"
goto :eof

:e2etest
if "%TEST_NAME%"=="" (
  echo Error: TEST_NAME is required
  echo Usage: dev.bat e2e-test TEST_NAME=TestMockAuth
  exit /b 1
)
echo Running e2e test: %TEST_NAME%
docker ps --format "{{.Names}}" | findstr /R "^reearth-visualizer-reearth-visualizer-dev-1$" >nul 2>nul
if %errorlevel% equ 0 (
  %DOCKER_EXEC% sh -c "set -a && . ./.env.docker && set +a && go test -v -tags=e2e -run %TEST_NAME% ./e2e"
) else (
  echo Error: reearth-visualizer-dev container is not running.
  echo Please start the container with 'dev.bat run' first.
  exit /b 1
)
goto :eof

:build
go build ./cmd/reearth
goto :eof

:run
%DOCKER_COMPOSE_DEV% up reearth-visualizer-dev
goto :eof

:down
%DOCKER_COMPOSE_DEV% down
goto :eof

:restart
call dev.bat down
call dev.bat run
goto :eof

:reset
echo ==== Stopping database and GCS services ====
%DOCKER_COMPOSE_DEV% down reearth-mongo reearth-gcs
echo.
echo ==== Removing data directory ====
rmdir /s /q ..\tmp\gcs
rmdir /s /q ..\tmp\mongo
echo.
echo ==== Starting database and GCS services ====
%DOCKER_COMPOSE_DEV% up -d reearth-mongo reearth-gcs
echo.
echo ==== Waiting for services to be ready (3 seconds) ====
echo 3...
timeout /t 1 /nobreak >nul
echo 2...
timeout /t 1 /nobreak >nul
echo 1...
timeout /t 1 /nobreak >nul
echo.
echo ==== Initializing GCS bucket ====
call dev.bat init-gcs
echo.
echo ==== Creating mock user ====
call dev.bat mockuser
echo.
echo ✓ Reset complete!
goto :eof

:initgcs
curl -s -D - -o nul -H "Content-Type: application/json" -d "{\"name\": \"test-bucket\"}" http://localhost:4443/storage/v1/b
goto :eof

:upgcs
docker compose -f ../docker-compose.yml up -d gcs
goto :eof

:downgcs
docker compose -f ../docker-compose.yml down gcs
goto :eof

:gql
go generate ./internal/adapter/gql/gqldataloader
go generate ./internal/adapter/gql
goto :eof

:grpc
protoc --go_out=./internal/adapter/internalapi/ --go_opt=paths=source_relative ^
  --go-grpc_out=./internal/adapter/internalapi/ --go-grpc_opt=paths=source_relative ^
  ./schemas/internalapi/v1/schema.proto
goto :eof

:grpcdoc
protoc -I . ^
  --doc_out=schemas/internalapi/docs ^
  --doc_opt=markdown,schema.md ^
  schemas/internalapi/v1/schema.proto
goto :eof

:schematyper
go run %SCHEMATYPER% -o %MANIFEST_DIR%/schema_translation.go --package manifest --prefix Translation ./schemas/plugin_manifest_translation.json
go run %SCHEMATYPER% -o %MANIFEST_DIR%/schema_gen.go --package manifest ./schemas/plugin_manifest.json
goto :eof

:deepcopy
pushd pkg\property
deep-copy --type Initializer --pointer-receiver -o initializer_gen.go .
popd
goto :eof

:errormsg
go generate ./pkg/i18n/...
goto :eof

:generate
go generate ./...
goto :eof

:mockuser
curl -H "Content-Type: application/json" ^
     -d "{\"email\":\"demo@example.com\",\"username\":\"Demo User\"}" ^
     http://localhost:8080/api/signup
goto :eof

:clean
go clean -modcache
go clean -cache
go clean -testcache
goto :eof

:destroy
echo ⚠️  WARNING: This will remove ALL Docker resources!
echo This includes containers, images, volumes, and networks.
echo.
set /p REPLY="Are you sure you want to continue? [y/N] "
if /i "%REPLY%"=="y" (
  for /f "tokens=*" %%i in ('docker ps -q') do docker stop %%i
  docker system prune -a --volumes -f
  docker network prune -f
  echo ✓ All Docker resources have been removed
  echo ==== Removing data directory ====
  rmdir /s /q ..\tmp\gcs
  rmdir /s /q ..\tmp\mongo
  echo ✓ All data resources have been cleared
) else (
  echo ✗ Operation cancelled
)
goto :eof

:devinstall
call :install air github.com/air-verse/air@v1.61.5
call :install stringer golang.org/x/tools/cmd/stringer@v0.39.0
call :install schematyper github.com/idubinskiy/schematyper
call :install deep-copy github.com/globusdigital/deep-copy@v0.5.5-0.20251122193020-7cda106f7b4b
goto :eof

:install
where %1 >nul 2>nul
if %errorlevel% neq 0 (
  echo Installing %1 ...
  go install %2
) else (
  echo %1 is already installed.
)
goto :eof
