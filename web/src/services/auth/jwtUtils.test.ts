import { describe, expect, test } from "vitest";

import { base64UrlDecode, getJwtIat } from "./jwtUtils";

describe("base64UrlDecode", () => {
  test("decodes standard base64", () => {
    const encoded = btoa("hello");
    expect(base64UrlDecode(encoded)).toBe("hello");
  });

  test("decodes base64url with - and _", () => {
    const base64url = btoa("?")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    expect(base64UrlDecode(base64url)).toBe("?");
  });

  test("handles missing padding", () => {
    expect(base64UrlDecode("YWI")).toBe("ab");
  });
});

describe("getJwtIat", () => {
  const createJwt = (payload: Record<string, unknown>): string => {
    const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
    const body = btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `${header}.${body}.signature`;
  };

  test("extracts iat from valid JWT", () => {
    const token = createJwt({ iat: 1700000000, sub: "user123" });
    expect(getJwtIat(token)).toBe(1700000000);
  });

  test("returns null when iat is missing", () => {
    const token = createJwt({ sub: "user123" });
    expect(getJwtIat(token)).toBeNull();
  });

  test("returns null when iat is not a number", () => {
    const token = createJwt({ iat: "not-a-number" });
    expect(getJwtIat(token)).toBeNull();
  });

  test("returns null for invalid token", () => {
    expect(getJwtIat("invalid")).toBeNull();
    expect(getJwtIat("a.b.c")).toBeNull();
  });
});
