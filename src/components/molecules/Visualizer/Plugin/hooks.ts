import { cloneDeep } from "lodash-es";
import { useCallback, useEffect, useMemo } from "react";

import type { IFrameAPI } from "@reearth/components/atoms/Plugin";
import type { GlobalThis, Primitive, Widget, Block } from "@reearth/plugin";
import events from "@reearth/util/event";

import { useVisualizerContext } from "../context";

export default function ({
  pluginId,
  extensionId,
  sourceCode,
  pluginBaseUrl,
  extensionType,
  block,
}: // primitive,
// widget,
// property,
// sceneProperty,
{
  pluginId?: string;
  extensionId?: string;
  sourceCode?: string;
  pluginBaseUrl?: string;
  extensionType?: string;
  primitive?: Primitive;
  widget?: Widget;
  block?: Block;
  property?: any;
  sceneProperty?: any;
}) {
  const ctx = useVisualizerContext();

  const [reearthEvents, emitReearthEvent] = useMemo(() => {
    const [ev, emit] = events();
    return [ev, emit] as const;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pluginId, extensionId, sourceCode, pluginBaseUrl]);

  const handleError = useCallback(
    (err: any) => {
      console.error(`plugin error from ${pluginId}/${extensionId}: `, err);
    },
    [pluginId, extensionId],
  );

  const handleMessage = useCallback(
    (msg: any) => {
      emitReearthEvent("message", msg);
    },
    [emitReearthEvent],
  );

  const src =
    pluginId && extensionId
      ? `${pluginBaseUrl}/${`${pluginId}/${extensionId}`.replace(/\.\./g, "")}.js`
      : undefined;

  const staticExposed = useCallback(
    ({ render, postMessage }: IFrameAPI): GlobalThis | undefined => {
      const pluginAPI = ctx?.pluginAPI;
      if (!pluginAPI) return;

      // TODO: quickjs-emscripten throws "Lifetime not alive" error when iFrameApi funcs are wrapped with another function
      const ui = {
        show: (
          html: string,
          options?:
            | {
                visible?: boolean | undefined;
              }
            | undefined,
        ) => {
          render(html, options);
        },
        postMessage,
      };

      return {
        ...pluginAPI,
        // ...((extensionType === "primitive" && ctx?.engine?.pluginApi) || {}), // TODO: fix "Lifetime not alive" error
        reearth: {
          ...pluginAPI.reearth,
          ui,
          plugin: {
            get id() {
              return pluginId || "";
            },
            get extensionType() {
              return extensionType || "";
            },
            get extensionId() {
              return extensionId || "";
            },
          },
          ...(reearthEvents as any),
        },
      };
    },
    [ctx?.pluginAPI, extensionId, extensionType, pluginId, reearthEvents],
  );

  const exposed = useMemo(
    // TODO: object must be cloned to prevent "already registered" error from qes
    () => {
      return {
        // TODO: called several times, very heavy
        // "reearth.primitives.primitives": cloneDeep(ctx?.primitives),
        // "reearth.primitives.selected": cloneDeep(ctx?.selectedPrimitive),
        // "reearth.primitives.selectionReason": cloneDeep(ctx?.primitiveSelectionReason),
        // "reearth.primitives.overriddenInfobox": cloneDeep(ctx?.primitiveOverriddenInfobox),
        // "reearth.plugin.property": cloneDeep(property),
        // "reearth.visualizer.camera": cloneDeep(ctx?.camera),
        // "reearth.visualizer.property": cloneDeep(sceneProperty),
        // "reearth.primitive": cloneDeep(primitive),
        // "reearth.widget": cloneDeep(widget),
        "reearth.block": cloneDeep(block),
      };
    },
    [
      // ctx?.selectedPrimitive,
      // ctx?.primitiveSelectionReason,
      // ctx?.primitiveOverriddenInfobox,
      // ctx?.camera,
      // property,
      // sceneProperty,
      // primitive,
      // widget,
      block,
    ],
  );

  useEffect(() => {
    return () => {
      emitReearthEvent("close");
    };
  }, [emitReearthEvent]);

  useEffect(() => {
    emitReearthEvent("update");
  }, [exposed, emitReearthEvent]);

  useEffect(() => {
    emitReearthEvent("select", cloneDeep(ctx?.selectedPrimitive));
  }, [ctx?.selectedPrimitive, emitReearthEvent]);

  useEffect(() => {
    if (ctx?.camera) {
      emitReearthEvent("cameramove", cloneDeep(ctx.camera));
    }
  }, [ctx?.camera, emitReearthEvent]);

  return {
    skip: !ctx,
    src,
    exposed,
    isMarshalable: ctx?.engine?.isMarshalable,
    staticExposed,
    handleError,
    handleMessage,
  };
}
