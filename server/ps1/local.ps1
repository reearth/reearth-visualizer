function Invoke-Local {
  param([string]$cmd, [string]$extra)

  switch ($cmd) {
    "build" {
      go build -ldflags="-X main.version=0.0.1" ./cmd/reearth
    }

    "clean" {
      go clean -modcache
      go clean -cache
      go clean -testcache
    }

    "deep-copy" {
      Push-Location pkg\property
      deep-copy --type Initializer --pointer-receiver -o initializer_gen.go .
      Pop-Location
    }

    "dev" {
      & "$PSScriptRoot\..\dev.ps1" dev-install
      air
    }

    "dev-install" {
      function Install-Tool($name, $pkg) {
        if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
          Write-Host "Installing $name ..."
          go install $pkg
        } else {
          Write-Host "$name is already installed."
        }
      }
      Install-Tool "air"         "github.com/air-verse/air@v1.61.5"
      Install-Tool "stringer"    "golang.org/x/tools/cmd/stringer@v0.39.0"
      Install-Tool "schematyper" "github.com/idubinskiy/schematyper"
      Install-Tool "deep-copy"   "github.com/globusdigital/deep-copy@v0.5.5-0.20251122193020-7cda106f7b4b"
    }

    "e2e" {
      go test -v ./e2e/...
    }

    "error-msg" {
      go generate ./pkg/i18n/...
    }

    "generate" {
      & "$PSScriptRoot\..\dev.ps1" dev-install
      go generate ./...
    }

    "gql" {
      go generate ./internal/adapter/gql/gqldataloader
      go generate ./internal/adapter/gql
    }

    "lint" {
      golangci-lint run --fix
    }

    "migrate" {
      Write-Host "==== Running database migration ===="
      $env:RUN_MIGRATION = "true"
      $env:REEARTH_DB = $script:REEARTH_DB
      $env:REEARTH_DB_VIS = $script:REEARTH_DB_VIS
      go run ./cmd/reearth
      Write-Host "Done!"
    }

    "migrate-with-key" {
      if (-not $extra) {
        Write-Host "Error: MIGRATION_KEY is not set."
        Write-Host "Usage: dev.ps1 migrate-with-key <key>"
        exit 1
      }
      Write-Host "==== Running database migration with MIGRATION_KEY=$extra ===="
      $env:RUN_MIGRATION = "true"
      $env:MIGRATION_KEY = $extra
      $env:REEARTH_DB = $script:REEARTH_DB
      $env:REEARTH_DB_VIS = $script:REEARTH_DB_VIS
      go run ./cmd/reearth
      Write-Host "Done!"
    }

    "run-app" {
      if (-not (Test-Path .env)) {
        Write-Host "Creating .env from .env.example..."
        Copy-Item .env.example .env
      }
      & "$PSScriptRoot\..\dev.ps1" d-run-accounts
      & "$PSScriptRoot\..\dev.ps1" mockuser
      go run -ldflags="-X main.version=0.0.1" ./cmd/reearth
    }

    "run-standalone" {
      go run -ldflags="-X main.version=0.0.1" ./cmd/reearth
    }

    "schematyper" {
      go run $script:SCHEMATYPER -o "$script:MANIFEST_DIR/schema_translation.go" --package manifest --prefix Translation ./schemas/plugin_manifest_translation.json
      go run $script:SCHEMATYPER -o "$script:MANIFEST_DIR/schema_gen.go" --package manifest ./schemas/plugin_manifest.json
    }

    "test" {
      $env:REEARTH_DB = $script:REEARTH_DB
      go test $script:TEST_DIR -run $script:TARGET_TEST
    }

    "test-debug" {
      go test -v -timeout 10s $script:TEST_DIR
    }

    default { return $false }
  }
  return $true
}
