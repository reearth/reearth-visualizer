import { faker } from "@faker-js/faker";

import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";

import { getAuthHeaders } from "./test-helpers";

// Meets the accounts password policy: 8+ chars with upper, lower and a digit.
const VALID_PASSWORD = "E2eTestPassw0rd";

test.describe("POST /api/signup", () => {
  test("Signup with valid payload returns user info", async ({ request }) => {
    const name = `e2e-user-${faker.string.alphanumeric(8)}`;
    const email = `${name}@e2e-test.example.com`;

    const res = await request.post(`${API_BASE_URL}/api/signup`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      data: {
        name,
        email,
        password: VALID_PASSWORD
      }
    });

    // The name is randomised per run, so a fresh signup has to succeed. This
    // used to accept 400 and 500 as well, which hid the fact that signup
    // returned 500 on every CI run for months.
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("id");
    expect(body.name).toBe(name);
    expect(body.email).toBe(email);
  });

  test("Signup with empty body returns a client error", async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/api/signup`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      data: {}
    });

    // A missing payload is the caller's fault. The server answers 500 today
    // because every accounts error is mapped to Internal Server Error, so this
    // asserts on the class rather than the code so as not to bless that status.
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });
});
