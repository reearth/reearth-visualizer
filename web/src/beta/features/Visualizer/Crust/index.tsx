import { useMemo, type RefObject, useContext } from "react";

import { ValueType, ValueTypes } from "@reearth/beta/utils/value";
import type { Layer, SelectedFeatureInfo } from "@reearth/core";
import { coreContext } from "@reearth/core";

import { useWidgetContext } from "./context";
import useHooks from "./hooks";
import Infobox, { InstallableInfoboxBlock } from "./Infobox";
import { Infobox as InfoboxType } from "./Infobox/types";
import Plugins, { type ExternalPluginProps, ModalContainer, PopupContainer } from "./Plugins";
import StoryPanel, { InstallableStoryBlock, StoryPanelRef } from "./StoryPanel";
import { Story } from "./StoryPanel/types";
import { usePublishTheme } from "./theme";
import type { MapRef, SceneProperty } from "./types";
import Widgets, {
  type WidgetAlignSystem as WidgetAlignSystemType,
  type Alignment,
  type Location,
  type WidgetLayoutConstraint,
  type InternalWidget,
  type WidgetAreaType,
} from "./Widgets";

export type { ValueTypes, ValueType, InteractionModeType } from "./types";

export type { InfoboxBlock as Block } from "./Infobox/types";

export type { ExternalPluginProps } from "./Plugins";
// export { INTERACTION_MODES, FEATURE_FLAGS } from "@reearth/core";

export type {
  Context,
  WidgetLayoutConstraint,
  WidgetAlignSystem,
  Alignment,
  Location,
  InternalWidget,
  WidgetZone,
  WidgetSection,
  BuiltinWidgets,
  WidgetArea,
  WidgetAlignment,
  WidgetAreaType,
} from "./Widgets";
export { isBuiltinWidget } from "./Widgets";

export type Props = {
  // common
  engineName?: string;
  isEditable?: boolean;
  inEditor?: boolean;
  isBuilt?: boolean;
  mapRef?: RefObject<MapRef>;
  layers?: Layer[];
  sceneProperty?: SceneProperty;
  selectedFeatureInfo?: SelectedFeatureInfo;
  // widgets
  widgetAlignSystem?: WidgetAlignSystemType;
  widgetAlignSystemEditing?: boolean;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  floatingWidgets?: InternalWidget[];
  selectedWidgetArea?: WidgetAreaType;
  // infobox
  infobox?: InfoboxType;
  installableInfoboxBlocks?: InstallableInfoboxBlock[];
  // plugin
  externalPlugin: ExternalPluginProps;
  useExperimentalSandbox?: boolean;
  // widget events
  onWidgetLayoutUpdate?: (
    id: string,
    update: {
      location?: Location;
      extended?: boolean;
      index?: number;
    },
  ) => void;
  onWidgetAlignmentUpdate?: (location: Location, align: Alignment) => void;
  onWidgetAreaSelect?: (widgetArea?: WidgetAreaType) => void;
  // infobox events
  onInfoboxBlockCreate?: (
    pluginId: string,
    extensionId: string,
    index?: number | undefined,
  ) => Promise<void>;
  onInfoboxBlockMove?: (id: string, targetIndex: number, layerId?: string) => Promise<void>;
  onInfoboxBlockDelete?: (id?: string) => Promise<void>;
  // Infobox
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  onPropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
  // story
  showStoryPanel?: boolean;
  storyPanelRef?: RefObject<StoryPanelRef | null>;
  storyWrapperRef?: RefObject<HTMLDivElement>;
  selectedStory?: Story;
  installableStoryBlocks?: InstallableStoryBlock[];
  handleStoryPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  handleStoryBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  handleStoryBlockMove?: (id: string, targetId: number, blockId: string) => void;
  handleStoryBlockDelete?: (
    pageId?: string | undefined,
    blockId?: string | undefined,
  ) => Promise<void>;
  handlePropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
  handlePropertyItemAdd?: (propertyId?: string, schemaGroupId?: string) => Promise<void>;
  handlePropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number,
  ) => Promise<void>;
  handlePropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
  ) => Promise<void>;
};

export default function Crust({
  engineName,
  isBuilt,
  isEditable,
  inEditor,
  mapRef,
  sceneProperty,
  selectedFeatureInfo,
  externalPlugin,
  useExperimentalSandbox,
  layers,

  // Widget
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  floatingWidgets,
  selectedWidgetArea,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onWidgetAreaSelect,
  // Infobox
  installableInfoboxBlocks,
  onInfoboxBlockCreate,
  onInfoboxBlockMove,
  onInfoboxBlockDelete,
  // common
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
  // story
  showStoryPanel,
  storyPanelRef,
  storyWrapperRef,
  selectedStory,
  installableStoryBlocks,
  handleStoryPageChange,
  handleStoryBlockCreate,
  handleStoryBlockDelete,
  handleStoryBlockMove,
  handlePropertyValueUpdate,
  handlePropertyItemAdd,
  handlePropertyItemMove,
  handlePropertyItemDelete,
}: Props): JSX.Element | null {
  const {
    interactionMode,
    selectedLayer,
    selectedComputedFeature,
    viewport,
    overriddenSceneProperty,
    overrideSceneProperty,
    handleCameraForceHorizontalRollChange,
    onLayerEdit,
    handleInteractionModeChange,
    onSketchPluginFeatureCreate,
    onSketchTypeChange,
    onLayerVisibility,
    onLayerLoad,
    onLayerSelectWithRectStart,
    onLayerSelectWithRectMove,
    onLayerSelectWithRectEnd,
  } = useContext(coreContext);

  const theme = usePublishTheme(overriddenSceneProperty?.theme);

  const selectedLayerId = useMemo(
    () => ({ layerId: selectedLayer?.layerId, featureId: selectedLayer?.featureId }),
    [selectedLayer?.featureId, selectedLayer?.layerId],
  );

  const {
    shownPluginModalInfo,
    shownPluginPopupInfo,
    pluginModalContainerRef,
    pluginPopupContainerRef,
    renderWidget,
    renderBlock,
    onPluginModalShow,
  } = useHooks({ mapRef, ...externalPlugin });

  const widgetContext = useWidgetContext({
    mapRef,
    sceneProperty,
    selectedLayerId,
    timelineManagerRef: mapRef?.current?.timeline,
  });

  const featuredInfobox = useMemo(() => {
    const selected = layers?.find(l => l.id === selectedLayer?.layerId);
    const infobox = selectedLayer?.layer?.layer.infobox
      ? {
          property: selected?.infobox?.property,
          blocks: [...(selected?.infobox?.blocks ?? [])],
        }
      : undefined;
    return selectedLayerId?.featureId && infobox
      ? {
          ...infobox,
          featureId: selectedLayerId.featureId,
        }
      : undefined;
  }, [layers, selectedLayer, selectedLayerId?.featureId]);

  return (
    <Plugins
      engineName={engineName}
      mapRef={mapRef}
      sceneProperty={sceneProperty}
      built={isBuilt}
      inEditor={inEditor}
      selectedLayer={selectedLayer?.layer}
      selectedFeature={selectedComputedFeature}
      selectedFeatureInfo={selectedFeatureInfo}
      layerSelectionReason={selectedLayer?.reason}
      viewport={viewport}
      alignSystem={widgetAlignSystem}
      floatingWidgets={floatingWidgets}
      interactionMode={interactionMode ?? "default"}
      timelineManagerRef={mapRef?.current?.timeline}
      selectedStory={selectedStory}
      useExperimentalSandbox={useExperimentalSandbox}
      overrideInteractionMode={handleInteractionModeChange}
      overrideSceneProperty={overrideSceneProperty}
      onLayerEdit={onLayerEdit}
      onLayerSelectWithRectStart={onLayerSelectWithRectStart}
      onLayerSelectWithRectMove={onLayerSelectWithRectMove}
      onLayerSelectWithRectEnd={onLayerSelectWithRectEnd}
      onSketchPluginFeatureCreate={onSketchPluginFeatureCreate}
      onLayerVisibility={onLayerVisibility}
      onLayerLoad={onLayerLoad}
      onSketchTypeChange={onSketchTypeChange}
      onCameraForceHorizontalRollChange={handleCameraForceHorizontalRollChange}>
      <Widgets
        isMobile={viewport?.isMobile}
        isBuilt={isBuilt}
        isEditable={isEditable}
        inEditor={inEditor}
        alignSystem={widgetAlignSystem}
        floatingWidgets={floatingWidgets}
        selectedWidgetArea={selectedWidgetArea}
        editing={widgetAlignSystemEditing}
        layoutConstraint={widgetLayoutConstraint}
        theme={theme}
        context={widgetContext}
        onWidgetLayoutUpdate={onWidgetLayoutUpdate}
        onAlignmentUpdate={onWidgetAlignmentUpdate}
        onWidgetAreaSelect={onWidgetAreaSelect}
        renderWidget={renderWidget}
      />
      <ModalContainer
        ref={pluginModalContainerRef}
        shownPluginModalInfo={shownPluginModalInfo}
        onPluginModalShow={onPluginModalShow}
      />
      <PopupContainer shownPluginPopupInfo={shownPluginPopupInfo} ref={pluginPopupContainerRef} />
      <Infobox
        infobox={featuredInfobox}
        installableInfoboxBlocks={installableInfoboxBlocks}
        isEditable={!!inEditor}
        renderBlock={renderBlock}
        onBlockCreate={onInfoboxBlockCreate}
        onBlockDelete={onInfoboxBlockDelete}
        onBlockMove={onInfoboxBlockMove}
        onPropertyUpdate={onPropertyUpdate}
        onPropertyItemAdd={onPropertyItemAdd}
        onPropertyItemDelete={onPropertyItemDelete}
        onPropertyItemMove={onPropertyItemMove}
      />
      {showStoryPanel && (
        <StoryPanel
          ref={storyPanelRef}
          storyWrapperRef={storyWrapperRef}
          selectedStory={selectedStory}
          installableStoryBlocks={installableStoryBlocks}
          isEditable={!!inEditor}
          renderBlock={renderBlock}
          onStoryPageChange={handleStoryPageChange}
          onStoryBlockCreate={handleStoryBlockCreate}
          onStoryBlockDelete={handleStoryBlockDelete}
          onStoryBlockMove={handleStoryBlockMove}
          onPropertyValueUpdate={handlePropertyValueUpdate}
          onPropertyItemAdd={handlePropertyItemAdd}
          onPropertyItemMove={handlePropertyItemMove}
          onPropertyItemDelete={handlePropertyItemDelete}
        />
      )}
    </Plugins>
  );
}
