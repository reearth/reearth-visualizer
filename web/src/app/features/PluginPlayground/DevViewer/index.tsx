import { Tabs } from "@reearth/app/lib/reearth-ui";
import { Area, AreaRef, Panel, Window } from "@reearth/app/ui/layout";
import { useT } from "@reearth/services/i18n/hooks";
import { FC, useRef } from "react";

import useHooks from "./hooks";
import {
  BlocksPanel,
  InspectorPanel,
  PluginUrlPanel,
  WidgetManagerPanel
} from "./PluginPanel";

/**
 * The Plugin Playground viewer without the code editor or file list: it runs a
 * plugin served by a local dev server (`?dev-plugin=<url>`). Built on its own
 * as playground.html (`yarn build:playground`), with no auth or GraphQL. The
 * right-hand side is laid out like the editor's Widgets tab.
 */
const PluginPlaygroundDevViewer: FC = () => {
  const {
    LayersPanel,
    MainAreaTabs,
    SettingsPanel,
    devPluginUrl,
    plugin,
    errors,
    live,
    loading,
    reload,
    widgetExtensions,
    blockExtensions,
    installedWidgetIds,
    selectedExtension,
    selectedFile,
    fieldValues,
    setFieldValues,
    setSelectedId,
    handleWidgetAdd,
    handleWidgetRemove
  } = useHooks();
  const t = useT();
  const rightAreaRef = useRef<AreaRef>(null);

  return (
    <Window>
      <Area extend asWrapper>
        <Area direction="column" extend asWrapper>
          <Area extend>
            <Tabs position="top" tabs={MainAreaTabs} />
          </Area>
          <Area
            resizableEdge="top"
            initialHeight={100}
            storageId="plugin-playground-dev-bottom-area"
          >
            <Panel noPadding alwaysOpen extend title={t("Layers")}>
              <LayersPanel />
            </Panel>
            <Panel noPadding alwaysOpen extend title={t("Settings")}>
              <SettingsPanel />
            </Panel>
          </Area>
        </Area>
        <Area
          direction="column"
          resizableEdge="left"
          initialWidth={320}
          storageId="plugin-playground-dev-right-area"
          ref={rightAreaRef}
        >
          {!devPluginUrl ? (
            <PluginUrlPanel showCollapseArea areaRef={rightAreaRef} />
          ) : (
            <>
              <WidgetManagerPanel
                showCollapseArea
                areaRef={rightAreaRef}
                url={devPluginUrl}
                plugin={plugin}
                widgets={widgetExtensions}
                installedWidgetIds={installedWidgetIds}
                selectedId={selectedExtension?.id}
                errors={errors}
                live={live}
                loading={loading}
                onReload={reload}
                onWidgetAdd={handleWidgetAdd}
                onWidgetRemove={handleWidgetRemove}
                onSelect={setSelectedId}
              />
              {blockExtensions.length > 0 && (
                <BlocksPanel
                  blocks={blockExtensions}
                  selectedId={selectedExtension?.id}
                  onSelect={setSelectedId}
                />
              )}
              {plugin && selectedExtension && (
                <InspectorPanel
                  plugin={plugin}
                  selectedFile={selectedFile}
                  fieldValues={fieldValues}
                  setFieldValues={setFieldValues}
                />
              )}
            </>
          )}
        </Area>
      </Area>
    </Window>
  );
};

export default PluginPlaygroundDevViewer;
