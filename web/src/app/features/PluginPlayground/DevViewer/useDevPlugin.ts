import { useCallback, useEffect, useRef, useState } from "react";

import { FileType, PluginType } from "../Plugins/constants";
import { getYmlJson } from "../utils";

export const DEV_PLUGIN_PARAM = "dev-plugin";

/** Reads `?dev-plugin=<url>` from the page URL. */
export const getDevPluginUrl = (): string | undefined => {
  const url = new URLSearchParams(window.location.search).get(DEV_PLUGIN_PARAM);
  return url ? url.replace(/\/+$/, "") : undefined;
};

export type DevPluginState = {
  plugin?: PluginType;
  /** Problems found while loading, e.g. a missing `<extension>.js`. */
  errors: string[];
  /** Whether the change stream (`<url>/events`) is connected. */
  live: boolean;
  loading: boolean;
  reload: () => void;
};

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
  const [errors, setErrors] = useState<string[]>([]);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(!!url);
  const generation = useRef(0);

  const load = useCallback(async () => {
    if (!url) return;
    const current = ++generation.current;
    setLoading(true);

    const fetchText = async (name: string) => {
      const res = await fetch(`${url}/${name}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`${name}: ${res.status} ${res.statusText}`);
      return res.text();
    };

    const problems: string[] = [];
    let next: PluginType | undefined;
    try {
      const manifest: FileType = {
        id: "reearth.yml",
        title: "reearth.yml",
        sourceCode: await fetchText("reearth.yml")
      };
      const yml = getYmlJson(manifest);
      if (!yml.success) throw new Error(`reearth.yml: ${yml.message}`);

      const files = await Promise.all(
        (yml.data.extensions ?? []).map(async (ext) => {
          const title = `${ext.id}.js`;
          try {
            return { id: title, title, sourceCode: await fetchText(title) };
          } catch (err) {
            problems.push(err instanceof Error ? err.message : String(err));
            return undefined;
          }
        })
      );
      next = {
        id: yml.data.id,
        files: [manifest, ...files.filter((f): f is FileType => !!f)]
      };
    } catch (err) {
      problems.push(err instanceof Error ? err.message : String(err));
    }

    // A newer load started meanwhile; drop this result.
    if (current !== generation.current) return;
    if (next) setPlugin(next);
    setErrors(problems);
    setLoading(false);
  }, [url]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!url) return;
    const events = new EventSource(`${url}/events`);
    events.addEventListener("open", () => setLive(true));
    events.addEventListener("error", () => setLive(false));
    events.addEventListener("change", () => load());
    return () => events.close();
  }, [url, load]);

  return { plugin, errors, live, loading, reload: load };
};
