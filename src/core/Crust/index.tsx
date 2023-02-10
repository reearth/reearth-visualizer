import type { ReactNode, RefObject } from "react";

import type { Tag } from "@reearth/core/mantle";

import type { ComputedFeature, ComputedLayer, Feature } from "../mantle";
import type { LayerEditEvent, LayerSelectionReason } from "../Map";
import type { Viewport } from "../Visualizer";

import { useWidgetContext } from "./context";
import useHooks from "./hooks";
import Infobox, { Block, InfoboxProperty } from "./Infobox";
import Plugins, { type ExternalPluginProps, ModalContainer, PopupContainer } from "./Plugins";
import { usePublishTheme } from "./theme";
import type { ValueTypes, ValueType, MapRef, SceneProperty, Camera } from "./types";
import Widgets, {
  type WidgetAlignSystem as WidgetAlignSystemType,
  type Alignment,
  type Location,
  type WidgetLayoutConstraint,
  type InternalWidget,
  type WidgetAreaType,
} from "./Widgets";

export type { ValueTypes, ValueType } from "./types";

export type { Block } from "./Infobox";

export type { ExternalPluginProps } from "./Plugins";

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
  isMobile?: boolean;
  mapRef?: RefObject<MapRef>;
  sceneProperty?: SceneProperty;
  viewport?: Viewport;
  camera?: Camera;
  selectedComputedLayer?: ComputedLayer;
  selectedComputedFeature?: ComputedFeature;
  selectedFeature?: Feature;
  selectedReason?: LayerSelectionReason;
  selectedLayerId?: {
    layerId?: string;
    featureId?: string;
  };
  tags?: Tag[];
  // widgets
  widgetAlignSystem?: WidgetAlignSystemType;
  widgetAlignSystemEditing?: boolean;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  floatingWidgets?: InternalWidget[];
  // infobox
  infoboxProperty?: InfoboxProperty;
  blocks?: Block[];
  infoboxTitle?: string;
  selectedBlockId?: string;
  showInfoboxTitle?: boolean;
  selectedWidgetArea?: WidgetAreaType;
  infoboxVisible?: boolean;
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
  onInfoboxMaskClick?: () => void;
  onBlockSelect?: (id?: string) => void;
  onBlockChange?: <T extends ValueType>(
    blockId: string,
    schemaItemId: string,
    fieldId: string,
    value: ValueTypes[T],
    type: T,
  ) => void;
  onBlockMove?: (id: string, fromIndex: number, toIndex: number) => void;
  onBlockDelete?: (id: string) => void;
  onBlockInsert?: (bi: number, i: number, pos?: "top" | "bottom") => void;
  renderInfoboxInsertionPopup?: (onSelect: (bi: number) => void, onClose: () => void) => ReactNode;
  overrideSceneProperty: (pluginId: string, property: SceneProperty) => void;
  onLayerEdit: (cb: (e: LayerEditEvent) => void) => void;
};

export default function Crust({
  engineName,
  isBuilt,
  isEditable,
  inEditor,
  isMobile,
  mapRef,
  sceneProperty,
  viewport,
  camera,
  tags,
  selectedLayerId,
  selectedReason,
  selectedComputedLayer,
  selectedComputedFeature,
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  floatingWidgets,
  blocks,
  infoboxProperty,
  infoboxTitle,
  infoboxVisible,
  selectedBlockId,
  selectedWidgetArea,
  externalPlugin,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onWidgetAreaSelect,
  onInfoboxMaskClick,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  onBlockDelete,
  onBlockInsert,
  renderInfoboxInsertionPopup,
  overrideSceneProperty,
  onLayerEdit,
}: Props): JSX.Element | null {
  const {
    renderBlock,
    renderWidget,
    shownPluginModalInfo,
    shownPluginPopupInfo,
    onPluginModalShow,
    pluginModalContainerRef,
    pluginPopupContainerRef,
  } = useHooks({ mapRef, ...externalPlugin });
  const theme = usePublishTheme(sceneProperty?.theme);
  const widgetContext = useWidgetContext({ mapRef, camera, sceneProperty, selectedLayerId });

  return (
    <Plugins
      engineName={engineName}
      mapRef={mapRef}
      sceneProperty={sceneProperty}
      inEditor={inEditor}
      tags={tags}
      selectedLayer={selectedComputedLayer}
      selectedFeature={selectedComputedFeature}
      layerSelectionReason={selectedReason}
      viewport={viewport}
      alignSystem={widgetAlignSystem}
      floatingWidgets={floatingWidgets}
      camera={camera}
      overrideSceneProperty={overrideSceneProperty}
      onLayerEdit={onLayerEdit}>
      <ModalContainer
        shownPluginModalInfo={shownPluginModalInfo}
        onPluginModalShow={onPluginModalShow}
        ref={pluginModalContainerRef}
      />
      <PopupContainer shownPluginPopupInfo={shownPluginPopupInfo} ref={pluginPopupContainerRef} />
      <Widgets
        isMobile={isMobile}
        isBuilt={isBuilt}
        isEditable={isEditable}
        alignSystem={widgetAlignSystem}
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
      <Infobox
        isBuilt={isBuilt}
        isEditable={isEditable}
        blocks={blocks}
        infoboxKey={selectedLayerId?.layerId}
        property={infoboxProperty}
        title={infoboxTitle}
        visible={infoboxVisible}
        selectedBlockId={selectedBlockId}
        theme={theme}
        layer={selectedComputedLayer?.layer}
        onMaskClick={onInfoboxMaskClick}
        onBlockSelect={onBlockSelect}
        onBlockChange={onBlockChange}
        onBlockDelete={onBlockDelete}
        onBlockMove={onBlockMove}
        onBlockInsert={onBlockInsert}
        renderBlock={renderBlock}
        renderInsertionPopup={renderInfoboxInsertionPopup}
      />
    </Plugins>
  );
}
