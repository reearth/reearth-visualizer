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

REM ==========================
REM Dispatch by argument
REM ==========================
if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="lint" goto lint
if "%1"=="test" goto test
if "%1"=="test-debug" goto testdebug
if "%1"=="e2e" goto e2e
if "%1"=="build" goto build
if "%1"=="dev-install" goto devinstall
if "%1"=="dev" goto dev
if "%1"=="run-app" goto runapp
if "%1"=="run-db" goto rundb
if "%1"=="run-reset" goto runreset
if "%1"=="run-clean-start" goto runclean
if "%1"=="up-gcs" goto upgcs
if "%1"=="down-gcs" goto downgcs
if "%1"=="gql" goto gql
if "%1"=="generate" goto generate
if "%1"=="schematyper" goto schematyper
if "%1"=="deep-copy" goto deepcopy
if "%1"=="mockuser" goto mockuser
if "%1"=="clean" goto clean
goto help

:help
echo Usage:
echo   dev.bat ^<target^>
echo.
echo Targets:
echo   lint              Run golangci-lint with auto-fix
echo   test              Run unit tests
echo   test-debug        Run unit tests with verbose output
echo   e2e               Run end-to-end tests
echo   build             Build the project
echo   dev-install       Install dev tools
echo   dev               Run the application with hot reload
echo   run-app           Run the application
echo   run-db            Start MongoDB with Docker Compose
echo   run-reset         Reset MongoDB data and add mock user
echo   run-clean-start   Clean Go cache and run app
echo   gql               Generate GraphQL code
echo   schematyper       Generate schema using schematyper
echo   deep-copy         Generate deep-copy code for Initializer
echo   mockuser          Create a mock user
echo   up-gcs            Start fake GCS server
echo   down-gcs          Stop fake GCS server
echo   clean             Clean Go cache
goto :eof

:lint
golangci-lint run --fix
goto :eof

:test
set REEARTH_DB=%REEARTH_DB%
go test %TEST_DIR% -run %TARGET_TEST%
goto :eof

:testdebug
go test -v -timeout 10s %TEST_DIR%
goto :eof

:e2e
go test -v ./e2e/...
goto :eof

:build
go build ./cmd/reearth
goto :eof

:dev
call dev.bat dev-install
air
goto :eof

:runapp
go run ./cmd/reearth
goto :eof

:runclean
call dev.bat clean
call dev.bat run-app
goto :eof

:rundb
docker compose -f ../docker-compose.yml up -d reearth-mongo
goto :eof

:runreset
docker stop reearth-visualizer-reearth-mongo-1
rmdir /s /q ..\mongo
rmdir /s /q data
call dev.bat run-db
call dev.bat mockuser
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

:schematyper
go run %SCHEMATYPER% -o %MANIFEST_DIR%/schema_translation.go --package manifest --prefix Translation ./schemas/plugin_manifest_translation.json
go run %SCHEMATYPER% -o %MANIFEST_DIR%/schema_gen.go --package manifest ./schemas/plugin_manifest.json
goto :eof

:deepcopy
pushd pkg\property
deep-copy --type Initializer --pointer-receiver -o initializer_gen.go .
popd
goto :eof

:generate
go generate ./...
goto :eof

:mockuser
curl -H "Content-Type: application/json" ^
     -d "{\"email\":\"mock@example.com\",\"username\":\"Mock User\"}" ^
     http://localhost:8080/api/signup
goto :eof

:clean
go clean -modcache
go clean -cache
go clean -testcache
goto :eof

:devinstall
call :install air github.com/air-verse/air@v1.61.5
call :install stringer golang.org/x/tools/cmd/stringer@v0.29.0
call :install schematyper github.com/idubinskiy/schematyper
call :install deep-copy github.com/globusdigital/deep-copy@dc4a8d91ed65656858cd53e6e83bbf7b83d5b7cb
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
