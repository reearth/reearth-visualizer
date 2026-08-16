import {
  type FC,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import type {
  BlockProps,
  DebuggableWidget,
  DebuggableBlock
} from "../shared/types";

import {
  Plugin,
  type CommonPluginProps,
  type PluginProps,
  type PluginModalInfo,
  type PluginPopupInfo,
  type ExternalPluginProps
} from "./Plugins";
import type { MapRef } from "./types";
import type { WidgetProps } from "./Widgets";

export default function useHook({
  mapRef,
  pluginBaseUrl,
  pluginProperty
}: { mapRef?: RefObject<MapRef | null> } & ExternalPluginProps) {
  const [shownPluginModalInfo, setShownPluginModalInfo] = useState<PluginModalInfo>();
  const pluginModalContainerRef = useRef<HTMLDivElement | null>(null);

  const [shownPluginPopupInfo, setShownPluginPopupInfo] = useState<PluginPopupInfo>();
  const pluginPopupContainerRef = useRef<HTMLDivElement | null>(null);

  // Registry of close callbacks for each plugin instance
  // Used by the close-before-show pattern to close previous modal/popup
  // when a new plugin shows its modal/popup
  const pluginModalCloseCallbacks = useRef<Map<string, () => void>>(new Map());
  const pluginPopupCloseCallbacks = useRef<Map<string, () => void>>(new Map());

  // Ref to track current modal info for use in callback (avoids stale closure)
  const shownPluginModalInfoRef = useRef<PluginModalInfo | undefined>(undefined);
  const shownPluginPopupInfoRef = useRef<PluginPopupInfo | undefined>(undefined);

  // Keep refs in sync with state
  useEffect(() => {
    shownPluginModalInfoRef.current = shownPluginModalInfo;
  }, [shownPluginModalInfo]);

  useEffect(() => {
    shownPluginPopupInfoRef.current = shownPluginPopupInfo;
  }, [shownPluginPopupInfo]);

  // Register/unregister close callbacks for modal
  const registerPluginModalClose = useCallback(
    (id: string, closeFn: () => void) => {
      pluginModalCloseCallbacks.current.set(id, closeFn);
    },
    []
  );

  const unregisterPluginModalClose = useCallback((id: string) => {
    pluginModalCloseCallbacks.current.delete(id);
  }, []);

  // Register/unregister close callbacks for popup
  const registerPluginPopupClose = useCallback(
    (id: string, closeFn: () => void) => {
      pluginPopupCloseCallbacks.current.set(id, closeFn);
    },
    []
  );

  const unregisterPluginPopupClose = useCallback((id: string) => {
    pluginPopupCloseCallbacks.current.delete(id);
  }, []);

  /**
   * Show a plugin's modal.
   * Implements close-before-show pattern: if another plugin's modal is showing,
   * close it first (triggering its close events) before showing the new one.
   */
  const onPluginModalShow = useCallback((modalInfo?: PluginModalInfo) => {
    const prevId = shownPluginModalInfoRef.current?.id;
    const newId = modalInfo?.id;

    // Close previous modal if exists and different from new one
    if (prevId && prevId !== newId) {
      const closeCallback = pluginModalCloseCallbacks.current.get(prevId);
      closeCallback?.(); // Fires close events, hides surface
    }

    setShownPluginModalInfo(modalInfo);
  }, []);

  /**
   * Show a plugin's popup.
   * Implements close-before-show pattern: if another plugin's popup is showing,
   * close it first (triggering its close events) before showing the new one.
   */
  const onPluginPopupShow = useCallback((popupInfo?: PluginPopupInfo) => {
    const prevId = shownPluginPopupInfoRef.current?.id;
    const newId = popupInfo?.id;

    // Close previous popup if exists and different from new one
    if (prevId && prevId !== newId) {
      const closeCallback = pluginPopupCloseCallbacks.current.get(prevId);
      closeCallback?.(); // Fires close events, hides surface
    }

    setShownPluginPopupInfo(popupInfo);
  }, []);

  const commonPluginProps = useMemo(
    () => ({
      pluginModalContainer: pluginModalContainerRef.current,
      shownPluginModalInfo,
      onPluginModalShow,
      pluginPopupContainer: pluginPopupContainerRef.current,
      shownPluginPopupInfo,
      onPluginPopupShow,
      registerPluginModalClose,
      unregisterPluginModalClose,
      registerPluginPopupClose,
      unregisterPluginPopupClose,
      pluginBaseUrl,
      pluginProperty,
      property: pluginProperty
    }),
    [
      shownPluginModalInfo,
      onPluginModalShow,
      shownPluginPopupInfo,
      onPluginPopupShow,
      registerPluginModalClose,
      unregisterPluginModalClose,
      registerPluginPopupClose,
      unregisterPluginPopupClose,
      pluginBaseUrl,
      pluginProperty
    ]
  );

  const renderWidget = useCallback(
    (widgetProps: WidgetProps): ReactNode => (
      <Widget
        widgetProps={widgetProps}
        commonPluginProps={commonPluginProps}
        mapRef={mapRef}
      />
    ),
    [mapRef, commonPluginProps]
  );
  const renderBlock = useCallback(
    (blockProps: BlockProps): ReactNode => (
      <Block blockProps={blockProps} commonPluginProps={commonPluginProps} />
    ),
    [commonPluginProps]
  );

  return {
    shownPluginModalInfo,
    shownPluginPopupInfo,
    pluginModalContainerRef,
    pluginPopupContainerRef,
    renderWidget,
    renderBlock,
    onPluginModalShow,
    onPluginPopupShow
  };
}

const Widget: FC<{
  mapRef?: RefObject<MapRef | null>;
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
    (options) => {
      onExtend?.(widget.id, options?.extended);
    },
    [onExtend, widget.id]
  );
  const handleOnResize = useCallback<NonNullable<PluginProps["onResize"]>>(
    (_width, _height, extended) => {
      onExtend?.(widget.id, extended);
    },
    [onExtend, widget.id]
  );
  const iframeProps = useMemo<{ style: React.CSSProperties }>(
    () => ({
      style: { pointerEvents: widgetProps.editing ? "none" : "auto" }
    }),
    [widgetProps.editing]
  );
  return (
    <Plugin
      mapRef={mapRef}
      autoResize={autoResize}
      pluginId={widget.pluginId}
      extensionId={widget.extensionId}
      sourceCode={(widget as DebuggableWidget)?.__REEARTH_SOURCECODE} // for debugging
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
      sourceCode={(blockProps.block as DebuggableBlock)?.__REEARTH_SOURCECODE} // for debugging
      extensionType={blockProps.block?.extensionType}
      visible
      layer={blockProps.layer}
      block={blockProps.block}
      onClick={blockProps.onClick}
      {...commonPluginProps}
    />
  );
};
