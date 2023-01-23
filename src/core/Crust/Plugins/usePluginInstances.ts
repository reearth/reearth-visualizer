import { useEffect, useRef, useMemo, type MutableRefObject } from "react";

import type { Block } from "../Infobox";
import type { WidgetAlignSystem } from "../Widgets";
import type { InternalWidget, WidgetSection, WidgetZone } from "../Widgets/WidgetAlignSystem";

import type { PluginExtensionInstance } from "./plugin_types";

export type Props = {
  alignSystem?: WidgetAlignSystem;
  floatingWidgets?: InternalWidget[];
  blocks?: Block[];
};

export type PluginInstances = {
  meta: MutableRefObject<PluginExtensionInstance[]>;
  postMessage: (id: string, msg: any, sender: string) => void;
  addPluginMessageSender: (id: string, msgSender: (msg: string) => void) => void;
  removePluginMessageSender: (id: string) => void;
};

export default ({ alignSystem, floatingWidgets, blocks }: Props) => {
  const pluginInstancesMeta = useRef<PluginExtensionInstance[]>([]);

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
        });
      });
    }

    pluginInstancesMeta.current = instances;
  }, [alignSystem, floatingWidgets, blocks]);

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
    };
  }, [pluginInstancesMeta]);

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
