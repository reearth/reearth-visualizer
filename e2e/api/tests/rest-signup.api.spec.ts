import { faker } from "@faker-js/faker";

import { API_BASE_URL } from "../config/env";
import { test, expect } from "../fixtures/api-test-fixtures";

import { getAuthHeaders } from "./test-helpers";

// Meets the accounts password policy: 8+ chars with upper, lower and a digit.
const VALID_PASSWORD = "E2eTestPassw0rd";

// A syntactically valid ULID, used to send one id without the other.
const SAMPLE_ULID = "01jpagdy2t9srnkz60waes48jd";

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

  test("Signup with empty body returns an error", async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/api/signup`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      data: {}
    });

    // A missing payload is the caller's fault. The server answers 500 today
    // because every accounts error is mapped to Internal Server Error, so this
    // asserts on the class rather than the code so as not to bless that status.
    expect(res.status()).toBeGreaterThanOrEqual(400);
  });

  // The accounts Signup document is only well formed when both ids are
  // supplied, so a payload carrying just one of them has to take the id-free
  // mutation too. Without these cases, narrowing the handler's condition to
  // require both ids to be absent would still pass the tests above while
  // sending the malformed document again.
  for (const [shape, extra] of [
    ["only a user id", { userId: SAMPLE_ULID }],
    ["only a workspace id", { workspaceId: SAMPLE_ULID }]
  ] as const) {
    test(`Signup with ${shape} still succeeds`, async ({ request }) => {
      const name = `e2e-user-${faker.string.alphanumeric(8)}`;
      const email = `${name}@e2e-test.example.com`;

      const res = await request.post(`${API_BASE_URL}/api/signup`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        data: { name, email, password: VALID_PASSWORD, ...extra }
      });

      expect(res.status()).toBe(200);

      const body = await res.json();
      expect(body).toHaveProperty("id");
      expect(body.email).toBe(email);
    });
  }
});
