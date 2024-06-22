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
  isInEditor?: boolean;
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
  // Story
  showStoryPanel?: boolean;
  storyPanelRef?: RefObject<StoryPanelRef>;
  storyWrapperRef?: RefObject<HTMLDivElement>;
  selectedStory?: Story;
  installableStoryBlocks?: InstallableStoryBlock[];
  onStoryPageChange?: (id?: string, disableScrollIntoView?: boolean) => void;
  onStoryBlockCreate?: (
    pageId?: string | undefined,
    extensionId?: string | undefined,
    pluginId?: string | undefined,
    index?: number | undefined,
  ) => Promise<void>;
  onStoryBlockMove?: (id: string, targetId: number, blockId: string) => void;
  onStoryBlockDelete?: (pageId?: string | undefined, blockId?: string | undefined) => Promise<void>;
  onPropertyValueUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: ValueType,
    v?: ValueTypes[ValueType],
  ) => Promise<void>;
};

export default function Crust({
  engineName,
  isBuilt,
  isEditable,
  isInEditor,
  mapRef,
  sceneProperty,
  selectedFeatureInfo,
  externalPlugin,
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
  onStoryPageChange,
  onStoryBlockCreate,
  onStoryBlockMove,
  onStoryBlockDelete,
  onPropertyValueUpdate,
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
      isBuilt={isBuilt}
      isInEditor={isInEditor}
      selectedLayer={selectedLayer?.layer}
      selectedFeature={selectedComputedFeature}
      selectedFeatureInfo={selectedFeatureInfo}
      selectedStory={selectedStory}
      layerSelectionReason={selectedLayer?.reason}
      viewport={viewport}
      alignSystem={widgetAlignSystem}
      floatingWidgets={floatingWidgets}
      interactionMode={interactionMode ?? "default"}
      timelineManagerRef={mapRef?.current?.timeline}
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
        isInEditor={isInEditor}
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
        isEditable={!!isInEditor}
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
          onStoryPageChange={onStoryPageChange}
          onStoryBlockCreate={onStoryBlockCreate}
          onStoryBlockDelete={onStoryBlockDelete}
          onStoryBlockMove={onStoryBlockMove}
          onPropertyValueUpdate={onPropertyValueUpdate}
          onPropertyItemAdd={onPropertyItemAdd}
          onPropertyItemMove={onPropertyItemMove}
          onPropertyItemDelete={onPropertyItemDelete}
          renderBlock={renderBlock}
        />
      )}
    </Plugins>
  );
}
