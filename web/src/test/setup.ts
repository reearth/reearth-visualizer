/* eslint-disable @typescript-eslint/no-namespace */
import {
  type EmotionMatchers,
  matchers as emotionMatchers
} from "@emotion/jest";
import * as domMatchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect, vi } from "vitest";

// Vitest on GitHub Actions requires TransformStream to run tests with Cesium
import "web-streams-polyfill/polyfill";

declare global {
  // The JSDOM instance Vitest's jsdom environment exposes.
  var jsdom: { window: Window };

  namespace Vi {
    interface JestAssertion<T> extends jest.Matchers<void, T>, EmotionMatchers {
      toHaveStyleRule: EmotionMatchers["toHaveStyleRule"];
    }
  }
}

// Node 25+ ships a built-in localStorage that is undefined unless Node runs
// with --localstorage-file, and it shadows jsdom's. Restore jsdom's storage.
for (const key of ["localStorage", "sessionStorage"] as const) {
  if (!globalThis[key]) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: jsdom.window[key]
    });
  }
}

expect.extend(domMatchers);
// eslint-disable-next-line @typescript-eslint/no-explicit-any
expect.extend(emotionMatchers as any);

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
});

Object.defineProperty(window, "requestIdleCallback", {
  writable: true,
  value: vi.fn()
});

const MockResizeObserver = vi.fn(function () {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  };
});

Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver
});

Object.defineProperty(global, "ResizeObserver", {
  writable: true,
  value: MockResizeObserver
});

afterEach(cleanup);
