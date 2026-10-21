import { useCallback, useEffect, useRef, useState } from "react";

import { parseManifestText } from "./manifest";
import type { ReearthYML } from "./types";

export const DEV_PLUGIN_PARAM = "dev-plugin";

const isLocalhost = (hostname: string) =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname === "[::1]";

/** Reads `?dev-plugin=<url>` from the page URL. Only local servers are used. */
export const getDevPluginUrl = (): string | undefined => {
  const value = new URLSearchParams(window.location.search).get(
    DEV_PLUGIN_PARAM
  );
  if (!value) return;
  try {
    if (!isLocalhost(new URL(value).hostname)) return;
  } catch {
    return;
  }
  return value.replace(/\/+$/, "");
};

/** Why the plugin couldn't be loaded. */
export type DevPluginError = {
  /** `unreachable`: no response from the server; `manifest`: a bad reearth.yml. */
  kind: "unreachable" | "manifest";
  message: string;
};

export type DevPluginState = {
  /** The last manifest that loaded. It stays when a later load fails. */
  manifest?: ReearthYML;
  error?: DevPluginError;
  /** Problems with single extensions, e.g. a missing `<extension>.js`. */
  extensionErrors: Record<string, string>;
  /** Whether the change stream (`<url>/events`) is connected. */
  live: boolean;
  loading: boolean;
  /** When the plugin last loaded; changes with every successful load. */
  loadedAt?: Date;
  /** Increases on every successful load, including two loads in one millisecond. */
  loadRevision: number;
  reload: () => Promise<void>;
};

class HttpError extends Error {}

/**
 * Checks a plugin served by a local dev server such as
 * `reearth vis plugin dev`:
 *
 * - `GET <url>/reearth.yml`: the manifest
 * - `GET <url>/<extensionId>.js`: one per extension, checked here and run by
 *   Visualizer
 * - `GET <url>/events`: optional server-sent events; `change` reloads
 *
 * Any static server works; without the event stream, use `reload`.
 */
export default (url: string | undefined): DevPluginState => {
  const [manifest, setManifest] = useState<ReearthYML>();
  const [error, setError] = useState<DevPluginError>();
  const [extensionErrors, setExtensionErrors] = useState<
    Record<string, string>
  >({});
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(!!url);
  const [loadedAt, setLoadedAt] = useState<Date>();
  const [loadRevision, setLoadRevision] = useState(0);
  const generation = useRef(0);
  const lastLoadFailed = useRef(false);

  const load = useCallback(async () => {
    if (!url) return;
    const current = ++generation.current;
    setLoading(true);

    const fetchText = async (name: string) => {
      const res = await fetch(`${url}/${name}`, { cache: "no-store" });
      if (!res.ok) {
        throw new HttpError(`${name}: ${res.status} ${res.statusText}`);
      }
      return res.text();
    };

    let next: ReearthYML | undefined;
    let nextError: DevPluginError | undefined;
    const nextExtensionErrors: Record<string, string> = {};
    try {
      const result = parseManifestText(await fetchText("reearth.yml"));
      if (!result.success) {
        throw new HttpError(`reearth.yml: ${result.message}`);
      }
      await Promise.all(
        (result.data.extensions ?? []).map(async (ext) => {
          try {
            await fetchText(`${ext.id}.js`);
          } catch (err) {
            nextExtensionErrors[ext.id] =
              err instanceof Error ? err.message : String(err);
          }
        })
      );
      next = result.data;
    } catch (err) {
      // fetch rejects (rather than returning a response) when nothing answers.
      nextError =
        err instanceof HttpError
          ? { kind: "manifest", message: err.message }
          : {
              kind: "unreachable",
              message: err instanceof Error ? err.message : String(err)
            };
    }

    // A newer load started meanwhile; drop this result.
    if (current !== generation.current) return;
    lastLoadFailed.current = !!nextError;
    if (next) {
      setManifest(next);
      setExtensionErrors(nextExtensionErrors);
      setLoadedAt(new Date());
      setLoadRevision((previous) => previous + 1);
    }
    setError(nextError);
    setLoading(false);
  }, [url]);

  useEffect(() => {
    if (!url) return;
    let active = true;
    let connected = false;
    let initialLoadSettled = false;
    lastLoadFailed.current = false;
    void load().then(() => {
      initialLoadSettled = true;
      // The stream may have opened while the first manifest request failed.
      if (active && connected && lastLoadFailed.current) void load();
    });

    const events = new EventSource(`${url}/events`);
    // EventSource reconnects by itself; a reconnect means the server is back,
    // possibly with changes made while it was down.
    let opened = false;
    events.addEventListener("open", () => {
      connected = true;
      setLive(true);
      if (opened || (initialLoadSettled && lastLoadFailed.current)) {
        void load();
      }
      opened = true;
    });
    events.addEventListener("error", () => {
      connected = false;
      setLive(false);
    });
    events.addEventListener("change", () => void load());
    return () => {
      active = false;
      events.close();
    };
  }, [url, load]);

  return {
    manifest,
    error,
    extensionErrors,
    live,
    loading,
    loadedAt,
    loadRevision,
    reload: load
  };
};
