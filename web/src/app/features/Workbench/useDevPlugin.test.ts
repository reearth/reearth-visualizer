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
    "a.js": "a",
    "b.js": "b"
  };
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      const body = served[url.slice(BASE.length + 1)];
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
      `/workbench.html?dev-plugin=${encodeURIComponent(BASE + "/")}`
    );
    expect(getDevPluginUrl()).toBe(BASE);
  });

  it("ignores servers that are not local, and a missing parameter", () => {
    expect(getDevPluginUrl()).toBeUndefined();
    window.history.replaceState(
      null,
      "",
      `/workbench.html?dev-plugin=${encodeURIComponent("https://example.com/p")}`
    );
    expect(getDevPluginUrl()).toBeUndefined();
  });
});

describe("useDevPlugin", () => {
  it("loads reearth.yml and checks each extension's .js", async () => {
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.manifest?.id).toBe("demo");
    expect(result.current.error).toBeUndefined();
    expect(result.current.extensionErrors).toEqual({});
    expect(result.current.loadedAt).toBeInstanceOf(Date);
    expect(result.current.loadRevision).toBe(1);
    expect(FakeEventSource.last?.url).toBe(`${BASE}/events`);
  });

  it("assigns a new revision to every successful manual reload", async () => {
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loadRevision).toBe(1));

    await act(async () => {
      await result.current.reload();
      await result.current.reload();
    });

    expect(result.current.loadRevision).toBe(3);
  });

  it("reports a missing .js and keeps the rest", async () => {
    delete served["b.js"];
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.extensionErrors).toEqual({
      b: "b.js: 404 Not Found"
    });
    expect(result.current.error).toBeUndefined();
    expect(result.current.manifest?.extensions).toHaveLength(2);
  });

  it("reports an unreachable server", async () => {
    vi.mocked(fetch).mockRejectedValue(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.manifest).toBeUndefined();
    expect(result.current.error).toEqual({
      kind: "unreachable",
      message: "Failed to fetch"
    });
  });

  it("retries when the stream first connects after the initial load failed", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.error?.kind).toBe("unreachable"));

    act(() => FakeEventSource.last?.emit("open"));
    await waitFor(() => expect(result.current.manifest?.id).toBe("demo"));
    expect(result.current.error).toBeUndefined();
  });

  it("retries when the stream opens before the initial load fails", async () => {
    let rejectFirst: (reason?: unknown) => void = () => {};
    vi.mocked(fetch).mockImplementationOnce(
      () =>
        new Promise<Response>((_, reject) => {
          rejectFirst = reject;
        })
    );
    const { result } = renderHook(() => useDevPlugin(BASE));

    act(() => FakeEventSource.last?.emit("open"));
    await act(async () => rejectFirst(new TypeError("Failed to fetch")));
    await waitFor(() => expect(result.current.manifest?.id).toBe("demo"));
    expect(result.current.error).toBeUndefined();
  });

  it("keeps the last manifest when reearth.yml breaks", async () => {
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.manifest?.id).toBe("demo"));

    served["reearth.yml"] = "id: demo\nextensions: [";
    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.error?.kind).toBe("manifest");
    expect(result.current.error?.message).toMatch(/^reearth\.yml: /);
    expect(result.current.manifest?.id).toBe("demo");
  });

  it("reloads on a change event and when the server comes back", async () => {
    const { result } = renderHook(() => useDevPlugin(BASE));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const initialRequests = vi.mocked(fetch).mock.calls.length;
    act(() => FakeEventSource.last?.emit("open"));
    expect(result.current.live).toBe(true);
    expect(fetch).toHaveBeenCalledTimes(initialRequests);

    const first = result.current.loadedAt;
    await new Promise((r) => setTimeout(r, 5));
    act(() => FakeEventSource.last?.emit("change"));
    await waitFor(() => expect(result.current.loadedAt).not.toBe(first));

    act(() => FakeEventSource.last?.emit("error"));
    expect(result.current.live).toBe(false);

    const second = result.current.loadedAt;
    await new Promise((r) => setTimeout(r, 5));
    act(() => FakeEventSource.last?.emit("open"));
    await waitFor(() => expect(result.current.loadedAt).not.toBe(second));
  });

  it("does nothing without a URL", () => {
    const { result } = renderHook(() => useDevPlugin(undefined));
    expect(result.current.loading).toBe(false);
    expect(result.current.manifest).toBeUndefined();
    expect(fetch).not.toHaveBeenCalled();
  });
});
