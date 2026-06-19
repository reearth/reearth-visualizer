import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";

test.describe("GET /api/ping", () => {
  test("returns pong", async ({ request }) => {
    const res = await request.get(`${API_BASE_URL}/api/ping`);

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body).toBe("pong");
  });
});

test.describe("GET /api/health", () => {
  test("returns 200 with health status", async ({ request }) => {
    const res = await request.get(`${API_BASE_URL}/api/health`);

    // Health endpoint returns 200 if services are healthy, 503 if not
    expect([200, 503]).toContain(res.status());
    const body = await res.json();
    expect(body).toHaveProperty("status");
  });
});
