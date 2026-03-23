# ==========================
# Config
# ==========================
$script:TEST_DIR        = "./..."
$script:TARGET_TEST     = "./..."
$script:REEARTH_DB      = "mongodb://localhost"
$script:REEARTH_DB_VIS  = "reearth"
$script:REEARTH_DB_DOCKER = "mongodb://reearth-mongo:27017/?directConnection=true"
$script:MANIFEST_DIR    = "pkg/plugin/manifest"
$script:SCHEMATYPER     = "github.com/idubinskiy/schematyper"
$script:DOCKER_COMPOSE  = "docker compose -f ../docker-compose.yml"
$script:DOCKER_EXEC     = "docker exec reearth-visualizer-reearth-visualizer-dev-1"

# ==========================
# Include fragments
# ==========================
. "$PSScriptRoot\ps1\local.ps1"
. "$PSScriptRoot\ps1\docker.ps1"
. "$PSScriptRoot\ps1\tools.ps1"

# ==========================
# Dispatch
# ==========================
$cmd   = $args[0]
$extra = $args[1]

if (-not $cmd) {
  $cmd = "help"
}

# Streaming commands must run at the top level (not inside functions)
if ($cmd -eq "d-logs-accounts") {
  cmd /c "docker logs -f reearth-visualizer-reearth-accounts-api-1"
  exit 0
}
if ($cmd -eq "d-run") {
  cmd /c "$script:DOCKER_COMPOSE --profile accounts up reearth-visualizer-dev"
  exit 0
}
if ($cmd -eq "d-run-internal") {
  cmd /c "$script:DOCKER_COMPOSE up --build reearth-visualizer-internal-api"
  exit 0
}

if (Invoke-Local $cmd $extra) { exit 0 }
if (Invoke-Docker $cmd $extra) { exit 0 }
if (Invoke-Tools $cmd) { exit 0 }

# ==========================
# Help
# ==========================
Write-Host "Usage:"
Write-Host "  .\dev.ps1 <target>"
Write-Host ""
Write-Host "Local:"
Write-Host "  build             Build the project"
Write-Host "  clean             Clean Go cache"
Write-Host "  deep-copy         Generate deep-copy code for Initializer"
Write-Host "  dev               Run the application with hot reload"
Write-Host "  dev-install       Install dev tools"
Write-Host "  e2e               Run end-to-end tests"
Write-Host "  error-msg         Generate error messages"
Write-Host "  generate          Run go generate"
Write-Host "  gql               Generate GraphQL code"
Write-Host "  lint              Run golangci-lint with auto-fix"
Write-Host "  migrate           Run database migration"
Write-Host "  migrate-with-key  Run database migration with MIGRATION_KEY"
Write-Host "  run-app           Run the application with accounts API"
Write-Host "  run-standalone    Run the application in standalone mode"
Write-Host "  schematyper       Generate schema using schematyper"
Write-Host "  test              Run unit tests"
Write-Host "  test-debug        Run unit tests with verbose output"
Write-Host ""
Write-Host "Docker:"
Write-Host "  d-destroy         Remove ALL Docker resources and data (destructive)"
Write-Host "  d-down            Stop Docker Compose services"
Write-Host "  d-down-gcs        Stop fake GCS server"
Write-Host "  d-logs-accounts   Follow accounts API logs"
Write-Host "  d-lint            Run golangci-lint in Docker container"
Write-Host "  d-migrate         Run database migration in Docker container"
Write-Host "  d-migrate-with-key Run database migration with MIGRATION_KEY in Docker"
Write-Host "  d-reset-data      Reset database and GCS, reinitialize with mock data"
Write-Host "  d-run             Start dev server with Docker Compose"
Write-Host "  d-run-accounts    Start accounts API with Docker Compose"
Write-Host "  d-run-db          Start MongoDB with Docker Compose"
Write-Host "  d-run-internal    Start internal gRPC API server with Docker Compose"
Write-Host "  d-test            Run unit tests in Docker container"
Write-Host "  d-up-gcs          Start fake GCS server"
Write-Host ""
Write-Host "Setup:"
Write-Host "  init              Initialize GCS bucket and create mock user"
Write-Host "  auth0-accounts    Create a user via Auth0 OIDC"
Write-Host "  gcs-bucket        Initialize GCS bucket"
Write-Host "  mockuser-accounts Create a mock user via accounts API"
