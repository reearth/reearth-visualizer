import { type ReactNode, type RefObject, useCallback, useMemo, useRef, useState } from "react";

import type { BlockProps } from "./Infobox";
import {
  Plugin,
  type PluginModalInfo,
  type PluginPopupInfo,
  type ExternalPluginProps,
} from "./Plugins";
import type { MapRef } from "./types";
import type { WidgetProps } from "./Widgets";

export default function useHook({
  mapRef,
  pluginBaseUrl,
  pluginProperty,
}: { mapRef?: RefObject<MapRef> } & ExternalPluginProps) {
  const [shownPluginModalInfo, onPluginModalShow] = useState<PluginModalInfo>();
  const pluginModalContainerRef = useRef<HTMLDivElement>();

  const [shownPluginPopupInfo, onPluginPopupShow] = useState<PluginPopupInfo>();
  const pluginPopupContainerRef = useRef<HTMLDivElement>();

  const commonPluginProps = useMemo(
    () => ({
      pluginModalContainer: pluginModalContainerRef.current,
      shownPluginModalInfo: shownPluginModalInfo,
      onPluginModalShow: onPluginModalShow,
      pluginPopupContainer: pluginPopupContainerRef.current,
      shownPluginPopupInfo: shownPluginPopupInfo,
      onPluginPopupShow: onPluginPopupShow,
      pluginBaseUrl,
      pluginProperty,
      property: pluginProperty,
    }),
    [
      shownPluginModalInfo,
      onPluginModalShow,
      shownPluginPopupInfo,
      onPluginPopupShow,
      pluginBaseUrl,
      pluginProperty,
    ],
  );

  const renderWidget = useCallback(
    (widgetProps: WidgetProps): ReactNode => {
      const widget = widgetProps.widget;
      const autoResize = widget?.extended?.vertically
        ? "width-only"
        : widget?.extended?.horizontally
        ? "height-only"
        : "both";
      return (
        <Plugin
          mapRef={mapRef}
          autoResize={autoResize}
          pluginId={widget.pluginId}
          extensionId={widget.extensionId}
          sourceCode={(widget as any)?.__REEARTH_SOURCECODE} // for debugging
          extensionType="widget"
          visible
          iFrameProps={{
            style: { pointerEvents: widgetProps.editing ? "none" : "auto" },
          }}
          onRender={options => {
            widgetProps.onExtend?.(widget.id, options?.extended);
          }}
          onResize={(_width, _height, extended) => {
            widgetProps.onExtend?.(widget.id, extended);
          }}
          {...commonPluginProps}
          {...widgetProps}
        />
      );
    },
    [mapRef, commonPluginProps],
  );
  const renderBlock = useCallback(
    (blockProps: BlockProps): ReactNode => {
      return (
        <Plugin
          autoResize="height-only"
          pluginId={blockProps.block?.pluginId}
          extensionId={blockProps.block?.extensionId}
          sourceCode={(blockProps.block as any)?.__REEARTH_SOURCECODE} // for debugging
          extensionType="block"
          visible
          layer={blockProps.layer}
          block={blockProps.block}
          onClick={blockProps.onClick}
          {...commonPluginProps}
        />
      );
    },
    [commonPluginProps],
  );

  return {
    renderWidget,
    renderBlock,

    // For Modal
    shownPluginModalInfo,
    onPluginModalShow,
    pluginModalContainerRef,

    // For Popup
    shownPluginPopupInfo,
    onPluginPopupShow,
    pluginPopupContainerRef,
  };
}
