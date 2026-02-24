[![ci-server](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml/badge.svg)](https://github.com/reearth/reearth-visualizer/actions/workflows/ci_server.yml) [![codecov](https://codecov.io/gh/reearth/reearth/branch/main/graph/badge.svg?flag=server)](https://codecov.io/gh/reearth/reearth)

# Re:Earth Visualizer Server

A back-end API server application for Re:Earth Visualizer.

## Table of Contents

- [Overview](#overview)
- [Configuration Guide](#configuration-guide)
  - [Authentication Setup](#authentication-setup)
  - [User Synchronization](#user-synchronization)
  - [Web Application Configuration](#web-application-configuration)
- [Development Commands](#development-commands)
- [Glossary](#glossary)

## Overview

The Re:Earth Visualizer server provides the backend API for the Re:Earth platform, handling data management, authentication, and business logic.

## Configuration Guide

### Authentication Setup

The application supports multiple authentication providers including **Auth0** and **Cognito**. Authentication is configured through the `reearth-accounts` service.

> **Important**: Authentication configuration is automatically fetched from the reearth-accounts API. You only need to configure Auth0 in reearth-accounts, not in reearth-visualizer.

#### 1. Configure Authentication Provider

Edit the configuration file for the reearth-accounts service:

```bash
# reearth-accounts/server/.env.docker
REEARTH_MOCK_AUTH=false

# Required settings
REEARTH_AUTH0_DOMAIN=your-domain.auth0.com
REEARTH_AUTH0_CLIENTID=your-client-id

# Optional settings (depending on your Auth0 setup)
REEARTH_AUTH0_AUDIENCE=your-audience           # Required if calling Auth0 Management API
REEARTH_AUTH0_CLIENTSECRET=your-client-secret  # Required for M2M (Machine-to-Machine) applications
```

**Configuration Notes:**

- **REEARTH_AUTH0_DOMAIN**: Your Auth0 tenant domain (required)
- **REEARTH_AUTH0_CLIENTID**: Your Auth0 application's Client ID (required)
- **REEARTH_AUTH0_AUDIENCE**: API identifier (optional)
  - Required if you need to call Auth0 Management API
  - Not needed for simple authentication flows
- **REEARTH_AUTH0_CLIENTSECRET**: Application's Client Secret (optional)
  - Required for **M2M (Machine-to-Machine)** applications
  - Required for server-side confidential clients
  - Not needed for public clients (SPAs) using PKCE flow

#### 2. Restart the Accounts Service

After modifying the configuration, restart the reearth-accounts service:

```bash
cd reearth-accounts/server
make restart
```

### User Synchronization

Users must be synchronized between the authentication provider's database and the Re:Earth database. Use the signup API to add users to the Re:Earth database. The `sub` field must match the user identifier from your authentication provider.

#### Register a User (Unix/Linux/macOS)

```bash
curl -H 'Content-Type: application/json' http://localhost:8080/api/signup -d @- << EOF
{
  "sub": "auth0|xxxxxxxx1234567890xxxxxx",
  "email": "user@example.com",
  "username": "Your Name",
  "secret": "@Hoge123@Hoge123"
}
EOF
```

#### Register a User (Windows Command Prompt)

```cmd
curl -H "Content-Type: application/json" http://localhost:8080/api/signup ^
  -d "{\"sub\": \"auth0|xxxxxxxx1234567890xxxxxx\", \"email\": \"user@example.com\", \"username\": \"Your Name\", \"secret\": \"@Hoge123@Hoge123\"}"
```

**Field Descriptions:**
- `sub`: User identifier from your authentication provider (e.g., Auth0, Cognito)
- `email`: User's email address
- `username`: Display name for the user
- `secret`: Registration secret (must meet security requirements)

### Web Application Configuration

Configure the web application to use your chosen authentication provider:

```bash
# reearth-visualizer/web/.env
REEARTH_WEB_AUTH_PROVIDER=auth0
```

Supported providers:
- `auth0` - Auth0 authentication
- `cognito` - AWS Cognito authentication
- `mock` - Mock authentication (development only)

### Storage Configuration

Configure storage by setting environment variables:

- **`REEARTH_GCS_BUCKETNAME`**: Use Google Cloud Storage
- **`REEARTH_S3_BUCKET_NAME`**: Use Amazon S3

Additionally, **`REEARTH_ASSETBASEURL`** is required for all storage types. Set this to the base URL for accessing stored assets.

## Development Commands

For a complete list of available development commands, run:

```bash
make help
```

Common commands:
- `make run` - Start the development server
- `make down` - Stop the development server
- `make restart` - Restart the development server
- `make test` - Run unit tests
- `make lint` - Run code linting

## Glossary

### M2M (Machine-to-Machine) Authentication

**M2M** is an authentication flow designed for server-to-server communication where no user interaction is involved.

**Key Characteristics:**
- Uses the OAuth 2.0 Client Credentials flow
- Requires both Client ID and Client Secret
- Authenticates applications rather than users
- Ideal for backend services, daemons, and CLI tools

**Use Cases in Re:Earth:**
- Communication between reearth-visualizer and reearth-accounts services
- Automated data synchronization
- Scheduled background jobs
- Third-party service integrations

**Security Note:** Client Secrets must be kept confidential and never exposed in client-side code (browsers, mobile apps).

### PKCE (Proof Key for Code Exchange)

An extension to the OAuth 2.0 Authorization Code flow that provides additional security for public clients (SPAs, mobile apps) that cannot securely store client secrets.

For more information, refer to the [main documentation](../README.md).

