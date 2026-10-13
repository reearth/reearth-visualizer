import { Area, Window } from "@reearth/app/ui/layout";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import LayerList from "../LayerList";
import Viewer from "../Viewer";

import useHooks from "./hooks";
import {
  ConnectCard,
  LoadErrorCard,
  MapLoading,
  ProblemBanner
} from "./MapStates";
import { ExtensionPanels, InspectorPanel } from "./Sidebar";
import TopBar, { LanguageSetting } from "./TopBar";

/**
 * Visualizer workbench: runs a plugin served by a local dev server
 * (`?dev-plugin=<url>`) on the Visualizer map, without the online
 * playground's code editor. Built on its own as playground.html
 * (`yarn build:playground`), with no auth or GraphQL.
 *
 * A top bar for the plugin and the map's layers and settings, the map, and a
 * sidebar with the plugin's extensions and the selected one's properties.
 */
const PluginPlaygroundDevViewer: FC = () => {
  const {
    visualizerRef,
    devPluginUrl,
    plugin,
    manifest,
    error,
    extensionErrors,
    live,
    loading,
    loadedAt,
    reload,
    extensions,
    hiddenIds,
    toggleHidden,
    selectedExtension,
    selectedFile,
    setSelectedId,
    fieldValues,
    setFieldValues,
    resetFieldValues,
    hasFieldValues,
    enabledVisualizer,
    mapLoading,
    handleMapMount,
    layers,
    toggleLayer,
    flyToLayer,
    story,
    widgets,
    showStoryPanel,
    infoboxOpen,
    openInfobox,
    handleLayerSelect,
    lang,
    changeLanguage,
    sidebarOpen,
    toggleSidebar
  } = useHooks();

  return (
    <Window>
      <Area direction="column" extend asWrapper>
        <Area initialHeight={42}>
          <TopBar
            url={devPluginUrl}
            name={manifest?.name ?? plugin?.id}
            version={manifest?.version}
            loaded={!!plugin}
            live={live}
            loading={loading}
            loadedAt={loadedAt}
            error={error}
            sidebarOpen={sidebarOpen}
            onReload={reload}
            onSidebarToggle={toggleSidebar}
            layers={
              <LayerList
                layers={layers}
                selectedLayerId=""
                setSelectedLayerId={flyToLayer}
                handleLayerVisibilityUpdate={toggleLayer}
                visualizerRef={visualizerRef}
              />
            }
            settings={<LanguageSetting lang={lang} onChange={changeLanguage} />}
          />
        </Area>
        <Area extend asWrapper>
          <Area extend>
            <MapArea>
              <Viewer
                enabledVisualizer={enabledVisualizer}
                keepCamera
                layers={layers}
                story={story}
                showStoryPanel={showStoryPanel}
                visualizerRef={visualizerRef}
                widgets={widgets}
                onMount={handleMapMount}
                onLayerSelect={handleLayerSelect}
              />
              {!devPluginUrl ? (
                <ConnectCard />
              ) : !plugin && error ? (
                <LoadErrorCard
                  url={devPluginUrl}
                  error={error}
                  loading={loading}
                  onRetry={reload}
                />
              ) : (
                <ProblemBanner
                  error={error}
                  extensionErrors={extensionErrors}
                />
              )}
              {mapLoading && <MapLoading />}
            </MapArea>
          </Area>
          <Area
            direction="column"
            resizableEdge="left"
            initialWidth={300}
            storageId="plugin-playground-dev-sidebar"
            hidden={!plugin || !sidebarOpen}
          >
            <ExtensionPanels
              extensions={extensions}
              selectedId={selectedExtension?.id}
              hiddenIds={hiddenIds}
              extensionErrors={extensionErrors}
              onSelect={setSelectedId}
              onToggleHidden={toggleHidden}
            />
            <InspectorPanel
              plugin={plugin}
              extension={selectedExtension}
              file={selectedFile}
              fieldValues={fieldValues}
              hasStoredValues={
                !!selectedExtension && hasFieldValues(selectedExtension)
              }
              hidden={
                !!selectedExtension && hiddenIds.includes(selectedExtension.id)
              }
              infoboxOpen={infoboxOpen}
              setFieldValues={setFieldValues}
              onReset={() =>
                selectedExtension && resetFieldValues(selectedExtension)
              }
              onShow={() =>
                selectedExtension && toggleHidden(selectedExtension.id)
              }
              onOpenInfobox={openInfobox}
            />
          </Area>
        </Area>
      </Area>
    </Window>
  );
};

const MapArea = styled("div")({
  position: "relative",
  flex: 1,
  minWidth: 0,
  overflow: "hidden",
  // The viewer's minimum width would cut off the map's right edge, and the
  // widgets there, next to the sidebar on a narrow window.
  ["& > div:first-of-type"]: {
    minWidth: 0
  }
});

export default PluginPlaygroundDevViewer;
