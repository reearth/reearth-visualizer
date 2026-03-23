function Invoke-Docker {
  param([string]$cmd, [string]$extra)

  function Test-DevContainer {
    return docker ps --format "{{.Names}}" | Select-String "^reearth-visualizer-reearth-visualizer-dev-1$"
  }

  switch ($cmd) {
    "d-destroy" {
      Write-Host "WARNING: This will remove ALL Docker resources!"
      $reply = Read-Host "Are you sure you want to continue? [y/N]"
      if ($reply -match "^[Yy]$") {
        docker ps -q | ForEach-Object { docker stop $_ }
        docker system prune -a --volumes -f
        docker network prune -f
        Write-Host "All Docker resources have been removed"
        Remove-Item -Recurse -Force tmp\gcs -ErrorAction SilentlyContinue
        Remove-Item -Recurse -Force tmp\mongo -ErrorAction SilentlyContinue
        Write-Host "All data resources have been cleared"
      } else {
        Write-Host "Operation cancelled"
      }
    }

    "d-down" {
      cmd /c "$script:DOCKER_COMPOSE --profile accounts down"
    }

    "d-down-gcs" {
      cmd /c "$script:DOCKER_COMPOSE stop reearth-gcs"
      cmd /c "$script:DOCKER_COMPOSE rm -f reearth-gcs"
    }

    "d-lint" {
      Write-Host "Running golangci-lint in Docker container..."
      if (Test-DevContainer) {
        cmd /c "$script:DOCKER_EXEC golangci-lint run --fix --timeout=10m"
      } else {
        Write-Host "Error: reearth-visualizer-dev container is not running."
        Write-Host "Please start the container with 'dev.ps1 d-run' first."
        exit 1
      }
    }

    "d-migrate" {
      Write-Host "==== Running database migration in Docker container ===="
      if (Test-DevContainer) {
        cmd /c "$script:DOCKER_EXEC sh -c `"RUN_MIGRATION=true REEARTH_DB=$script:REEARTH_DB_DOCKER REEARTH_DB_VIS=$script:REEARTH_DB_VIS go run ./cmd/reearth`""
        Write-Host "Migration complete!"
      } else {
        Write-Host "Error: reearth-visualizer-dev container is not running."
        Write-Host "Please start the container with 'dev.ps1 d-run' first."
        exit 1
      }
    }

    "d-migrate-with-key" {
      if (-not $extra) {
        Write-Host "Error: MIGRATION_KEY is not set."
        Write-Host "Usage: dev.ps1 d-migrate-with-key <key>"
        exit 1
      }
      Write-Host "==== Running database migration with MIGRATION_KEY=$extra in Docker container ===="
      if (Test-DevContainer) {
        cmd /c "$script:DOCKER_EXEC sh -c `"RUN_MIGRATION=true MIGRATION_KEY=$extra REEARTH_DB=$script:REEARTH_DB_DOCKER REEARTH_DB_VIS=$script:REEARTH_DB_VIS go run ./cmd/reearth`""
        Write-Host "Migration complete!"
      } else {
        Write-Host "Error: reearth-visualizer-dev container is not running."
        Write-Host "Please start the container with 'dev.ps1 d-run' first."
        exit 1
      }
    }

    "d-reset-data" {
      Write-Host "==== Stopping all services ===="
      cmd /c "$script:DOCKER_COMPOSE --profile accounts down"
      Write-Host ""
      Write-Host "==== Removing data directory ===="
      foreach ($dir in @("tmp\gcs", "tmp\mongo")) {
        if (Test-Path $dir) {
          Remove-Item -Recurse -Force $dir
          Write-Host "Removed: $dir"
        } else {
          Write-Host "Not found (skipped): $dir"
        }
      }
      Write-Host ""
      Write-Host "==== Starting all services ===="
      cmd /c "$script:DOCKER_COMPOSE --profile accounts up -d reearth-mongo reearth-gcs reearth-accounts-api"
      Write-Host ""
      Write-Host "==== Waiting for services to be ready (3 seconds) ===="
      3..1 | ForEach-Object { Write-Host "$_..."; Start-Sleep 1 }
      Write-Host "==== Initializing GCS bucket and mock user ===="
      & "$PSScriptRoot\..\dev.ps1" init
      Write-Host ""
      Write-Host "Reset complete!"
    }

    "d-run-accounts" {
      if (-not (Test-Path .env.accounts.docker)) {
        Write-Host "Creating .env.accounts.docker from .env.accounts.docker.example..."
        Copy-Item .env.accounts.docker.example .env.accounts.docker
      }
      cmd /c "$script:DOCKER_COMPOSE --profile accounts up -d reearth-accounts-api"
    }

    "d-run-db" {
      cmd /c "$script:DOCKER_COMPOSE up -d reearth-mongo"
    }

    "d-test" {
      Write-Host "Running tests in Docker container..."
      if (Test-DevContainer) {
        cmd /c "$script:DOCKER_EXEC go test $script:TEST_DIR -run $script:TARGET_TEST"
      } else {
        Write-Host "Error: reearth-visualizer-dev container is not running."
        Write-Host "Please start the container with 'dev.ps1 d-run' first."
        exit 1
      }
    }

    "d-up-gcs" {
      cmd /c "$script:DOCKER_COMPOSE up -d reearth-gcs"
    }

    default { return $false }
  }
  return $true
}
