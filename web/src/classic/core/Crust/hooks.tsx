import type CSS from "csstype";
import {
  type FC,
  type ReactNode,
  type RefObject,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

import type { BlockProps } from "./Infobox";
import {
  Plugin,
  type CommonPluginProps,
  type PluginProps,
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
    (widgetProps: WidgetProps): ReactNode => (
      <Widget widgetProps={widgetProps} commonPluginProps={commonPluginProps} mapRef={mapRef} />
    ),
    [mapRef, commonPluginProps],
  );
  const renderBlock = useCallback(
    (blockProps: BlockProps): ReactNode => (
      <Block blockProps={blockProps} commonPluginProps={commonPluginProps} />
    ),
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

const Widget: FC<{
  mapRef?: RefObject<MapRef>;
  commonPluginProps: CommonPluginProps;
  widgetProps: WidgetProps;
}> = ({ mapRef, commonPluginProps, widgetProps }) => {
  const widget = widgetProps.widget;
  const autoResize = widget?.extended?.vertically
    ? "width-only"
    : widget?.extended?.horizontally
    ? "height-only"
    : "both";

  const onExtend = widgetProps.onExtend;
  const handleOnRender = useCallback<NonNullable<PluginProps["onRender"]>>(
    options => {
      onExtend?.(widget.id, options?.extended);
    },
    [onExtend, widget.id],
  );
  const handleOnResize = useCallback<NonNullable<PluginProps["onResize"]>>(
    (_width, _height, extended) => {
      onExtend?.(widget.id, extended);
    },
    [onExtend, widget.id],
  );
  const iframeProps = useMemo<{ style: CSS.Properties }>(
    () => ({
      style: { pointerEvents: widgetProps.editing ? "none" : "auto" },
    }),
    [widgetProps.editing],
  );
  return (
    <Plugin
      mapRef={mapRef}
      autoResize={autoResize}
      pluginId={widget.pluginId}
      extensionId={widget.extensionId}
      sourceCode={(widget as any)?.__REEARTH_SOURCECODE} // for debugging
      extensionType="widget"
      visible
      iFrameProps={iframeProps}
      onRender={handleOnRender}
      onResize={handleOnResize}
      {...commonPluginProps}
      {...widgetProps}
    />
  );
};

const Block: FC<{
  commonPluginProps: CommonPluginProps;
  blockProps: BlockProps;
}> = ({ commonPluginProps, blockProps }) => {
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
};
