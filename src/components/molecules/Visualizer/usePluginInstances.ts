import { useEffect, useRef, useMemo, MutableRefObject } from "react";

import type { Block } from "./Block";
import type { PluginExtensionInstance } from "./Plugin/types";
import type { Widget, WidgetAlignSystem, WidgetSection, WidgetZone } from "./WidgetAlignSystem";

export type Props = {
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: Widget[];
  blocks?: Block[];
};

export type PluginInstances = {
  meta: MutableRefObject<PluginExtensionInstance[]>;
  postMessage: (id: string, msg: any, sender: string) => void;
  addPluginMessageSender: (id: string, msgSender: (msg: string) => void) => void;
  removePluginMessageSender: (id: string) => void;
  runTimesCache: {
    get: (id: string) => number | undefined;
    increment: (id: string) => void;
    decrement: (id: string) => void;
    clear: (id: string) => void;
    clearAll: () => void;
  };
};

export default ({ alignSystem, floatingWidgets, blocks }: Props) => {
  const pluginInstancesMeta = useRef<PluginExtensionInstance[]>([]);

  const runTimesCache = useMemo<Map<string, number>>(() => new Map(), []);
  const runTimesCacheHandler = useMemo(
    () => ({
      get: (id: string) => runTimesCache.get(id),
      increment: (id: string) => runTimesCache.set(id, (runTimesCache.get(id) || 0) + 1),
      decrement: (id: string) => runTimesCache.set(id, (runTimesCache.get(id) || 0) - 1),
      clear: (id: string) => runTimesCache.set(id, 0),
      clearAll: () => runTimesCache.clear(),
    }),
    [runTimesCache],
  );

  useEffect(() => {
    const instances: PluginExtensionInstance[] = [];

    if (alignSystem) {
      Object.keys(alignSystem).forEach(zoneName => {
        const zone = alignSystem[zoneName as keyof WidgetAlignSystem];
        if (zone) {
          Object.keys(zone).forEach(sectionName => {
            const section = zone[sectionName as keyof WidgetZone];
            if (section) {
              Object.keys(section).forEach(areaName => {
                const area = section[areaName as keyof WidgetSection];
                if (area?.widgets) {
                  area?.widgets.forEach(widget => {
                    instances.push({
                      id: widget.id,
                      pluginId: widget.pluginId ?? "",
                      name: getExtensionInstanceName(widget.pluginId ?? ""),
                      extensionId: widget.extensionId ?? "",
                      extensionType: "widget",
                      get runTimes() {
                        return runTimesCache.get(widget.id);
                      },
                    });
                  });
                }
              });
            }
          });
        }
      });
    }

    if (floatingWidgets) {
      floatingWidgets.forEach(widget => {
        instances.push({
          id: widget.id,
          pluginId: widget.pluginId ?? "",
          name: getExtensionInstanceName(widget.pluginId ?? ""),
          extensionId: widget.extensionId ?? "",
          extensionType: "widget",
          get runTimes() {
            return runTimesCache.get(widget.id);
          },
        });
      });
    }

    if (blocks) {
      blocks.forEach(block => {
        instances.push({
          id: block.id,
          pluginId: block.pluginId ?? "",
          name: getExtensionInstanceName(block.pluginId ?? ""),
          extensionId: block.extensionId ?? "",
          extensionType: "block",
          get runTimes() {
            return runTimesCache.get(block.id);
          },
        });
      });
    }

    pluginInstancesMeta.current = instances;
  }, [alignSystem, floatingWidgets, blocks, runTimesCache]);

  const pluginMessageSenders = useRef<Map<string, (msg: any) => void>>(new Map());

  const pluginInstances = useMemo(() => {
    return {
      meta: pluginInstancesMeta,
      postMessage: (id: string, msg: any, sender: string) => {
        const msgSender = pluginMessageSenders.current?.get(id);
        if (!msgSender) return;
        new Promise<void>((resolve, reject) => {
          try {
            msgSender({ data: msg, sender });
            resolve();
          } catch (err) {
            reject(err);
          }
        }).catch(err => {
          console.error(`plugin postMessage error (${sender} -> ${id})`, err);
        });
      },
      addPluginMessageSender: (id: string, msgSender: (msg: string) => void) => {
        pluginMessageSenders.current?.set(id, msgSender);
      },
      removePluginMessageSender: (id: string) => {
        pluginMessageSenders.current?.delete(id);
      },
      runTimesCache: runTimesCacheHandler,
    };
  }, [pluginInstancesMeta, runTimesCacheHandler]);

  return pluginInstances;
};

function getExtensionInstanceName(pluginId: string) {
  const segments = pluginId.split("~");
  if (segments.length === 3) {
    return segments[1];
  } else if (segments.length === 2) {
    return segments[0];
  }
  return pluginId;
}
