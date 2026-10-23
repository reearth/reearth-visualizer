import { useCallback, useEffect, useRef, useState } from "react";

import { FileType, PluginType } from "../Plugins/constants";
import { getYmlJson } from "../utils";

export const DEV_PLUGIN_PARAM = "dev-plugin";

/** Reads `?dev-plugin=<url>` from the page URL. */
export const getDevPluginUrl = (): string | undefined => {
  const url = new URLSearchParams(window.location.search).get(DEV_PLUGIN_PARAM);
  return url ? url.replace(/\/+$/, "") : undefined;
};

/** Why the plugin couldn't be loaded. */
export type DevPluginError = {
  /** `unreachable`: no response from the server; `manifest`: a bad reearth.yml. */
  kind: "unreachable" | "manifest";
  message: string;
};

export type DevPluginState = {
  /** The last plugin that loaded. It stays when a later load fails. */
  plugin?: PluginType;
  error?: DevPluginError;
  /** Problems with single extensions, e.g. a missing `<extension>.js`. */
  extensionErrors: Record<string, string>;
  /** Whether the change stream (`<url>/events`) is connected. */
  live: boolean;
  loading: boolean;
  /** When the plugin last loaded. */
  loadedAt?: Date;
  reload: () => Promise<void>;
};

class HttpError extends Error {}

/**
 * Loads a plugin from a local dev server such as `reearth visualizer plugin dev`:
 *
 * - `GET <url>/reearth.yml` — the manifest
 * - `GET <url>/<extensionId>.js` — one per extension
 * - `GET <url>/events` — optional server-sent events; a `change` event reloads
 *
 * Any static server works (e.g. `vite preview` of a built plugin); without the
 * event stream, use `reload` instead.
 */
export default (url: string | undefined): DevPluginState => {
  const [plugin, setPlugin] = useState<PluginType>();
  const [error, setError] = useState<DevPluginError>();
  const [extensionErrors, setExtensionErrors] = useState<
    Record<string, string>
  >({});
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(!!url);
  const [loadedAt, setLoadedAt] = useState<Date>();
  const generation = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
    const current = ++generation.current;
    setLoading(true);

    const fetchText = async (name: string) => {
      const res = await fetch(`${url}/${name}`, { cache: "no-store" });
      if (!res.ok)
        throw new HttpError(`${name}: ${res.status} ${res.statusText}`);
      return res.text();
    };

    let next: PluginType | undefined;
    let nextError: DevPluginError | undefined;
    const nextExtensionErrors: Record<string, string> = {};
    try {
      const manifest: FileType = {
        id: "reearth.yml",
        title: "reearth.yml",
        sourceCode: await fetchText("reearth.yml")
      };
      const yml = getYmlJson(manifest);
      if (!yml.success) throw new HttpError(`reearth.yml: ${yml.message}`);

      const files = await Promise.all(
        (yml.data.extensions ?? []).map(async (ext) => {
          const title = `${ext.id}.js`;
          try {
            return { id: title, title, sourceCode: await fetchText(title) };
          } catch (err) {
            nextExtensionErrors[ext.id] =
              err instanceof Error ? err.message : String(err);
            return undefined;
          }
        })
      );
      next = {
        id: yml.data.id,
        files: [manifest, ...files.filter((f): f is FileType => !!f)]
      };
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
    if (next) {
      setPlugin(next);
      setExtensionErrors(nextExtensionErrors);
      setLoadedAt(new Date());
    }
    setError(nextError);
    setLoading(false);
  }, [url]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!url) return;
    const events = new EventSource(`${url}/events`);
    // EventSource reconnects by itself; a reconnect means the server is back,
    // possibly with changes made while it was down.
    let opened = false;
    events.addEventListener("open", () => {
      setLive(true);
      if (opened) load();
      opened = true;
    });
    events.addEventListener("error", () => setLive(false));
    events.addEventListener("change", () => load());
    return () => events.close();
  }, [url, load]);

  return {
    plugin,
    error,
    extensionErrors,
    live,
    loading,
    loadedAt,
    reload: load
  };
};
