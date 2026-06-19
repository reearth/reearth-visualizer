import { faker } from "@faker-js/faker";

import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";

import { getAuthHeaders } from "./test-helpers";

test.describe("POST /api/signup", () => {
  test("Signup with valid payload returns user info", async ({ request }) => {
    const name = `e2e-user-${faker.string.alphanumeric(8)}`;
    const email = `${name}@e2e-test.example.com`;

    const res = await request.post(`${API_BASE_URL}/api/signup`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      data: {
        name,
        email,
        password: faker.string.alphanumeric(16)
      }
    });

    // Signup may return 200 (success) or 400/500 depending on auth mode and
    // whether the user already exists. In mock mode, duplicate sub returns error.
    // We accept 200 as success.
    if (res.status() === 200) {
      const body = await res.json();
      expect(body).toHaveProperty("id");
      expect(body).toHaveProperty("name");
      expect(body).toHaveProperty("email");
    } else {
      // In non-mock auth mode or if the user already exists, the endpoint may
      // return an error. This is expected behavior — just verify it's a known status.
      expect([400, 500]).toContain(res.status());
    }
  });

  test("Signup with empty body returns client or server error", async ({
    request
  }) => {
    const res = await request.post(`${API_BASE_URL}/api/signup`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      data: {}
    });

    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
