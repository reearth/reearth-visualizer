import Visualizer from "@reearth/app/features/Visualizer";
import { HiddenExtensionsProvider } from "@reearth/app/features/Visualizer/Crust/hiddenExtensions";
import { Area, Window } from "@reearth/app/ui/layout";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";
import LayersPopover from "./LayersPopover";
import {
  ConnectCard,
  LoadErrorCard,
  MapLoading,
  ProblemBanner
} from "./MapStates";
import { ExtensionPanels, InspectorPanel } from "./Sidebar";
import TopBar, { LanguageSetting } from "./TopBar";

/**
 * Standalone workbench for local plugin development: runs a plugin served by a
 * local dev server (`?dev-plugin=<url>`) on the Visualizer map, with no auth,
 * GraphQL or editor.
 *
 * A top bar for the plugin and the map's layers and settings, the map, and a
 * sidebar with the plugin's extensions and the selected one's properties.
 */
const Workbench: FC = () => {
  const {
    changeLanguage,
    currentCamera,
    devPluginUrl,
    engineMeta,
    error,
    extensionErrors,
    extensions,
    fieldValues,
    flyToLayer,
    handleLayerSelect,
    handleMapMount,
    hasFieldValues,
    hiddenIds,
    hiddenKeys,
    infoboxOpen,
    lang,
    layers,
    live,
    loadedAt,
    loading,
    manifest,
    mapLoading,
    openInfobox,
    reload,
    resetFieldValues,
    selectedExtension,
    setCurrentCamera,
    setFieldValues,
    setSelectedId,
    showStoryPanel,
    sidebarOpen,
    story,
    toggleHidden,
    toggleLayer,
    toggleSidebar,
    updateFieldValue,
    viewerProperty,
    visualizerRef,
    widgets
  } = useHooks();

  return (
    <Window>
      <Area direction="column" extend asWrapper>
        <Area initialHeight={42}>
          <TopBar
            url={devPluginUrl}
            name={manifest?.name ?? manifest?.id}
            version={manifest?.version}
            loaded={!!manifest}
            live={live}
            loading={loading}
            loadedAt={loadedAt}
            error={error}
            sidebarOpen={sidebarOpen}
            onReload={reload}
            onSidebarToggle={toggleSidebar}
            layers={
              <LayersPopover
                layers={layers}
                onToggle={toggleLayer}
                onFlyTo={flyToLayer}
              />
            }
            settings={<LanguageSetting lang={lang} onChange={changeLanguage} />}
          />
        </Area>
        <Area extend asWrapper>
          <Area extend>
            <MapArea>
              <HiddenExtensionsProvider value={hiddenKeys}>
                <Visualizer
                  visualizerRef={visualizerRef}
                  engine="cesium"
                  engineMeta={engineMeta}
                  isBuilt
                  ready
                  layers={layers}
                  widgets={widgets}
                  story={story}
                  showStoryPanel={showStoryPanel}
                  viewerProperty={viewerProperty}
                  currentCamera={currentCamera}
                  onCameraChange={setCurrentCamera}
                  onCoreLayerSelect={handleLayerSelect}
                  handleMount={handleMapMount}
                />
              </HiddenExtensionsProvider>
              {!devPluginUrl ? (
                <ConnectCard />
              ) : !manifest && error ? (
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
            storageId="workbench-sidebar"
            hidden={!manifest || !sidebarOpen}
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
              pluginId={manifest?.id}
              extension={selectedExtension}
              fieldValues={fieldValues}
              hasStoredValues={
                !!selectedExtension && hasFieldValues(selectedExtension)
              }
              hidden={
                !!selectedExtension && hiddenIds.includes(selectedExtension.id)
              }
              infoboxOpen={infoboxOpen}
              onFieldChange={updateFieldValue}
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

export default Workbench;
