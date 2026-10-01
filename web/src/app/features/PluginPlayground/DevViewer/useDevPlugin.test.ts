import { act, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useDevPlugin, { getDevPluginUrl } from "./useDevPlugin";

const BASE = "http://127.0.0.1:5180/plugin";

class FakeEventSource {
  static last?: FakeEventSource;
  listeners: Record<string, (() => void)[]> = {};
  closed = false;
  constructor(public url: string) {
    FakeEventSource.last = this;
  }
  addEventListener(type: string, fn: () => void) {
    (this.listeners[type] ??= []).push(fn);
  }
  emit(type: string) {
    this.listeners[type]?.forEach((fn) => fn());
  }
  close() {
    this.closed = true;
  }
}

let served: Record<string, string>;

beforeEach(() => {
  served = {
    "reearth.yml":
      "id: demo\nextensions:\n  - id: a\n    type: widget\n  - id: b\n    type: storyBlock\n",
    "a.js": "reearth.ui.show('a')",
    "b.js": "reearth.ui.show('b')"
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const name = url.slice(BASE.length + 1);
      const body = served[name];
      return body !== undefined
        ? { ok: true, status: 200, statusText: "OK", text: async () => body }
        : {
            ok: false,
            status: 404,
            statusText: "Not Found",
            text: async () => ""
          };
    })
  );
  vi.stubGlobal("EventSource", FakeEventSource);
});

afterEach(() => {
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/");
});

describe("getDevPluginUrl", () => {
  it("reads ?dev-plugin= without a trailing slash", () => {
    window.history.replaceState(
      null,
      "",
      `/playground.html?dev-plugin=${encodeURIComponent(BASE + "/")}`
    );
    expect(getDevPluginUrl()).toBe(BASE);
  });

  it("is undefined without the parameter", () => {
    expect(getDevPluginUrl()).toBeUndefined();
  });
});

describe("useDevPlugin", () => {
  it("loads reearth.yml and each extension's .js", async () => {
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.plugin?.id).toBe("demo");
    expect(result.current.plugin?.files.map((f) => f.title)).toEqual([
      "reearth.yml",
      "a.js",
      "b.js"
    ]);
    expect(result.current.errors).toEqual([]);
    expect(FakeEventSource.last?.url).toBe(`${BASE}/events`);
  });

  it("reports a missing .js and keeps the rest", async () => {
    delete served["b.js"];
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.plugin?.files.map((f) => f.title)).toEqual([
      "reearth.yml",
      "a.js"
    ]);
    expect(result.current.errors).toEqual(["b.js: 404 Not Found"]);
  });

  it("reloads on a change event and tracks the connection", async () => {
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => FakeEventSource.last?.emit("open"));
    expect(result.current.live).toBe(true);

    served["a.js"] = "reearth.ui.show('a2')";
    act(() => FakeEventSource.last?.emit("change"));
    await waitFor(() =>
      expect(
        result.current.plugin?.files.find((f) => f.title === "a.js")?.sourceCode
      ).toBe("reearth.ui.show('a2')")
    );

    act(() => FakeEventSource.last?.emit("error"));
    expect(result.current.live).toBe(false);
  });

  it("does nothing without a URL", () => {
    const { result } = renderHook(() => useDevPlugin(undefined));
    expect(result.current.loading).toBe(false);
    expect(result.current.plugin).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });
});
