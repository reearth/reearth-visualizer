function Invoke-Tools {
  param([string]$cmd)

  switch ($cmd) {
    "init" {
      & "$PSScriptRoot\..\dev.ps1" gcs-bucket
      & "$PSScriptRoot\..\dev.ps1" mockuser-accounts
    }

    "auth0-accounts" {
      $body = @{
        query = 'mutation($input:SignupOIDCInput!){signupOIDC(input:$input){user{id name email}}}'
        variables = @{
          input = @{
            email  = 'user@example.com'
            name   = 'Example User'
            sub    = 'auth0|example-sub-id'
            secret = ''
          }
        }
      } | ConvertTo-Json -Depth 5
      Invoke-RestMethod -Method Post -Uri 'http://localhost:8090/api/graphql' -ContentType 'application/json' -Body $body
    }

    "gcs-bucket" {
      try {
        Invoke-RestMethod -Method Post -Uri 'http://localhost:4443/storage/v1/b' -ContentType 'application/json' -Body '{"name": "test-bucket"}' | Out-Null
        Write-Host "GCS bucket created: test-bucket"
      } catch {
        if ($_.Exception.Response.StatusCode.value__ -eq 409) {
          Write-Host "GCS bucket already exists: test-bucket"
        } else {
          throw
        }
      }
    }

    "mockuser" {
      & "$PSScriptRoot\..\dev.ps1" mockuser-accounts
    }

    "mockuser-accounts" {
      $body = @{
        query = 'mutation($input:SignupInput!){signup(input:$input){user{id name email}}}'
        variables = @{
          input = @{
            email    = 'demo@example.com'
            name     = 'Demo User'
            password = 'Passw0rd!'
          }
        }
      } | ConvertTo-Json -Depth 5
      try {
        $res = Invoke-RestMethod -Method Post -Uri 'http://localhost:8090/api/graphql' -ContentType 'application/json' -Body $body
        Write-Host "Mock user created: demo@example.com"
      } catch {
        Write-Host "Warning: mock user creation failed - $_"
      }
    }

    default { return $false }
  }
  return $true
}
