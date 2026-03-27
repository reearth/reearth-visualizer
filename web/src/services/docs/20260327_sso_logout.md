# Auth0 SPA Multi-Application Logout Behavior & Handling

## Document Signature

|           |             |
| --------- | ----------- |
| Creator   | Yuya Soneda |
| Leader    | -           |
| Task Link | -           |
| Developer | Yuya Soneda |

## Background / Problem Statement

In the current architecture using Auth0 with multiple SPA applications, logout state is not synchronized across services (different Applications within the same tenant).

**Current Situation**

- Multiple SPAs (3 services) under the same Auth0 tenant
- Each SPA uses Auth0Provider
- Authentication state is managed on the frontend
- Backend only validates Access Tokens (no session management)

**Problem**

- Logging out from Service A does not immediately log out users from Service B/C
- `getAccessTokenSilently()` may still return a token after logout
- UI state remains inconsistent across services

**Root Causes (Facts)**

1. `isAuthenticated` is a local SPA state, not shared across applications
2. Auth0 manages SSO session at tenant level, not per application UI state
3. `getAccessTokenSilently()` may return cached tokens, even after logout

**Validation Result**

```typescript
await getAccessTokenSilently({ cacheMode: "off" });
```

- Correctly detects logout (fails when Auth0 session is gone)

**Key Insight**

Tokens retrieved after logout were not newly issued — they were cached tokens

**Why This Matters**

- Security concern: appears that API can still be accessed after logout
- UX inconsistency across services
- Becomes more critical as system scales

## Goals

1. Detect logout state across services reliably
2. Avoid unnecessary token refresh or network overhead
3. Maintain a balance between UX and performance

**Expected Outcome**

- Logout from another service is detected promptly
- Cached tokens are used during normal operations
- Logout inconsistency is minimized

## Non-Goals

**Premise: Session management is delegated to Auth0, and all SPAs within the same tenant share a single session**

In the current architecture, session management is fully delegated to Auth0. All SPAs within the same tenant already share Auth0's SSO session, and each application does not maintain its own session. Therefore, the following approaches that assume application-side session invalidation are not adopted.

Reference: <https://auth0.com/blog/the-not-so-easy-art-of-logging-out/>

### 1. OIDC Front-Channel Logout

A mechanism where the IdP notifies each application of logout via iframes.

**Why not adopted:**

- Each application does not manage its own session, so there is nothing to invalidate when receiving the notification
- Additionally, browser third-party cookie restrictions (ITP, ETP) are increasingly causing iframe-based notifications to fail

### 2. OIDC Back-Channel Logout

A mechanism where the IdP notifies each application's backend of logout via server-to-server communication.

**Why not adopted:**

- Each application does not manage its own session, so there is nothing to invalidate when receiving the notification
- Utilizing this mechanism would require implementing a new session management system on the application side, which contradicts the current design principle of delegating session management to Auth0

### 3. Migration to BFF (Backend for Frontend) Architecture

A configuration where the backend manages sessions and the frontend always communicates through the backend.

**Why not adopted:**

- Requires significant changes from the current architecture that delegates session management to Auth0
- High cost of adding session management and BFF layer to all three existing services
- Excessive response to the current issue (delayed detection of Auth0 session termination)

### 4. Real-time Synchronization via BroadcastChannel / localStorage

A mechanism that uses the browser's BroadcastChannel API or localStorage events to synchronize logout across tabs.

**Why not adopted:**

- Only works within the same origin, so it cannot be used across multiple services on different domains

## Functional Requirements

1. Logout from another service must be detectable
2. API calls should continue using cached tokens by default
3. Must avoid logout loops
4. Must not cause unnecessary Auth0 requests that could hit rate limits

## Solution Options

### Option 1 (Recommended): Server-side Logout Tracking with Response Header

**Overview**

Track logout timestamps on the server and return it in response headers. The frontend compares this with the token's `iat` claim to detect logout from other services.

**Why Recommended:**

- No additional Auth0 requests on page load
- Avoids Auth0 rate limit issues (observed: ~100 requests/minute)
- Logout is detected on the first API call after logout
- More immediate detection than page-load-based approach
- Does not rely on 401 status code, avoiding unexpected logouts

**Why not use 401?**

Using 401 to indicate "logged out from another service" has a problem: 401 can occur for various reasons (token expiration, invalid signature, etc.). If we always trigger logout on 401, users might be logged out unexpectedly in situations where they shouldn't be.

**Implementation Flow**

```
[Service A: User logs out]
         │
         ├─→ Frontend: Call Auth0 SDK logout()
         │        → Auth0 SSO session terminated
         │
         └─→ Backend: Update latest_logout_at in user collection
                  → Stored in database (UTC Unix timestamp)

[Service B: API request]
         │
         ├─→ Backend: Include latest_logout_at in response header
         │        → X-Latest-Logout-At: <unix_timestamp>
         │
         └─→ Frontend: Compare header value with token.iat
                  │
                  ├─ latest_logout_at > iat → Redirect to login
                  │
                  └─ latest_logout_at <= iat → Continue normally
```

**Backend Implementation**

1. Add `latest_logout_at` field to user collection
2. On logout API call, update `latest_logout_at` to current UTC Unix timestamp
3. On each authenticated request, include `latest_logout_at` in response header

```
Response Header: X-Latest-Logout-At: 1774595556
```

**Frontend Implementation**

```typescript
import { jwtDecode } from "jwt-decode";

const checkLogoutStatus = (response: Response, token: string) => {
  const latestLogoutAt = response.headers.get('X-Latest-Logout-At');
  if (!latestLogoutAt) return;

  const { iat } = jwtDecode(token);

  if (Number(latestLogoutAt) > iat) {
    // User logged out from another service after this token was issued
    // Auth0 session is already gone, redirect to login
    logout();
  }
};
```

**Note:** Both `iat` and `latest_logout_at` are UTC Unix timestamps (seconds since 1970-01-01 00:00:00 UTC). No timezone conversion is needed.

**Advantages**

- No Auth0 requests on page load
- Immune to Auth0 rate limits
- More immediate logout detection
- Server-side validation without full session management
- Can distinguish between logout vs other auth errors
- Avoids unexpected logouts from 401 handling

**Trade-offs**

- Requires database schema change
- Requires backend implementation
- Requires frontend implementation for header checking
- Need to add `jwt-decode` library (or use Auth0's `getIdTokenClaims()`)

### Option 2 (Simple Alternative): Force Refresh on Page Load

**Overview**

Use `getAccessTokenSilently({ cacheMode: "off" })` only on the first token request per page load.

**Note:** This is a simple solution for quick implementation. However, it has rate limit risks in production environments.

**Implementation**

```typescript
export const useAuth0Auth = (): AuthHook => {
  const { getAccessTokenSilently } = useAuth0();
  const firstCheckRef = useRef(true);

  return {
    getAccessToken: async () => {
      const options = firstCheckRef.current
        ? { cacheMode: "off" as const }
        : undefined;

      try {
        return await getAccessTokenSilently(options);
      } finally {
        firstCheckRef.current = false;
      }
    }
    // ...
  };
};
```

**Advantages**

- Simple implementation
- Minimal code changes
- No backend changes required

**Drawbacks**

- **Auth0 Rate Limit Risk**: Each page load consumes Auth0 rate limit (~100 requests/minute observed)
- Peak traffic (e.g., morning login rush, post-deployment) may hit rate limits
- Logout not detected until page load (not real-time)

**Auth0 Rate Limit Behavior** (Reference: [Auth0 Rate Limit Policy](https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy))

- Rate limits vary by: API type, Tenant type (Production/Development), Subscription level
- When 80% of rate limit is consumed: `api_limit_warning` log event
- When rate limit is exceeded: `api_limit` log event and HTTP 429 response
- Response headers for monitoring:
  - `x-ratelimit-limit`: Maximum available requests
  - `x-ratelimit-remaining`: Remaining requests before refill
  - `x-ratelimit-reset`: UNIX timestamp for next bucket replenishment

## Design

### Option 1: Server-side Logout Tracking with Response Header

```
[Service A: Logout]
     │
     ├─→ POST /api/logout
     │        │
     │        └─→ Update user.latest_logout_at = now() (UTC Unix timestamp)
     │
     └─→ Auth0 SDK logout()
              │
              └─→ Auth0 SSO session cleared

[Service B: API Request]
     │
     └─→ GET /api/resource (with token)
              │
              ├─→ Validate token signature
              │
              ├─→ Process request normally
              │
              └─→ Return response with header:
                   X-Latest-Logout-At: <unix_timestamp>

[Service B: Frontend receives response]
     │
     └─→ Compare X-Latest-Logout-At with token.iat
              │
              ├─ latest_logout_at <= iat → Continue normally
              │
              └─ latest_logout_at > iat → Redirect to login
```

### Option 2: Page Load Check

```
[Page Load]
     ↓
[Is First Load?]
├─ No  → getAccessTokenSilently() (use cache)
└─ Yes
     ↓
getAccessTokenSilently(cacheMode: off)
     ↓
isFirstLoad = false
     ↓
Success?
├─ Yes → Continue
└─ No  → Redirect to logged-out state
```

## Potential Impact

**Option 1 (Server-side):**
1. Requires database migration to add `latest_logout_at` field
2. Backend changes for logout tracking and response header
3. Frontend changes for response header checking and JWT decoding
4. No impact on Auth0 rate limits

**Option 2 (Page Load):**
1. One additional Auth0 request per page load
2. Risk of hitting rate limits during peak traffic (~100 requests/minute)
3. Minimal code changes

## Test Plan

### Option 1 (Server-side)
1. Log out from Service A
2. Make API request from Service B (without reloading)
3. Verify `X-Latest-Logout-At` header is present in response
4. Verify frontend detects `latest_logout_at > token.iat` and redirects to login
5. Verify normal API calls (no logout) do not trigger redirect
6. Verify `latest_logout_at` is updated correctly on logout

### Option 2 (Page Load)
1. Log out from Service A
2. Reload Service B
3. Verify user is logged out
4. Confirm normal API calls still use cached tokens
5. Ensure no logout loop occurs

## Deployment Plan

**Option 1 (Server-side):**
1. Backward compatibility: Yes (new field is optional initially)
2. Partial deployment: Yes (backend first, then frontend)
3. Notification: Backend and Frontend teams
4. Config changes: None
5. DDL/DML: Add `latest_logout_at` field to user collection

**Option 2 (Page Load):**
1. Backward compatibility: Yes
2. Partial deployment: Yes
3. Notification: Frontend team
4. Config changes: None
5. DDL/DML: None

## Rollback Plan

1. Notify issue via Slack
2. Roll back to the previous Cloud Run revision
3. Investigate and fix the issue if needed

## Post Deployment

**Checklist**

- [ ] Verify logout behavior across services
- [ ] Verify `X-Latest-Logout-At` header is returned correctly (Option 1)
- [ ] Monitor Auth0 rate limit usage (Option 2)

## Reviewed by

- Pending review
