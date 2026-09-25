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

  test("Signup with empty body is rejected", async ({ request }) => {
    const res = await request.post(`${API_BASE_URL}/api/signup`, {
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      data: {}
    });

    // A missing payload is the caller's fault, so it is answered as one
    // rather than as a server error.
    expect(res.status()).toBe(400);
  });

  // The ids are only honoured as a pair: the accounts Signup document is well
  // formed only when both are supplied, and the id-free mutation would discard
  // a lone one and return a user with a different id. Either way a half
  // specified payload cannot be served, so it is rejected. These cases also
  // pin the routing, since sending a partial payload on to Signup brings back
  // the malformed document and a 500.
  for (const [shape, extra] of [
    ["only a user id", { userId: SAMPLE_ULID }],
    ["only a workspace id", { workspaceId: SAMPLE_ULID }]
  ] as const) {
    test(`Signup with ${shape} is rejected`, async ({ request }) => {
      const name = `e2e-user-${faker.string.alphanumeric(8)}`;
      const email = `${name}@e2e-test.example.com`;

      const res = await request.post(`${API_BASE_URL}/api/signup`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        data: { name, email, password: VALID_PASSWORD, ...extra }
      });

      expect(res.status()).toBe(400);
    });
  }
});
