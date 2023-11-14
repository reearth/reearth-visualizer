/* eslint-disable @typescript-eslint/no-namespace */
import { type EmotionMatchers, matchers as emotionMatchers } from "@emotion/jest";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

// Vitest on GitHub Actions requires TransformStream to run tests with Cesium
import "web-streams-polyfill/es2018";

declare global {
  namespace Vi {
    interface JestAssertion<T = any> extends jest.Matchers<void, T>, EmotionMatchers {
      toHaveStyleRule: EmotionMatchers["toHaveStyleRule"];
    }
  }
}

expect.extend(domMatchers);
expect.extend(emotionMatchers as any);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

Object.defineProperty(window, "requestIdleCallback", {
  writable: true,
  value: vi.fn(),
});

afterEach(cleanup);
