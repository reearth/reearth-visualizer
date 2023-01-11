import { ReactNode, RefObject } from "react";

import { useWidgetContext } from "./context";
import useHooks from "./hooks";
import Infobox, { Block, InfoboxProperty } from "./Infobox";
import { usePublishTheme } from "./theme";
import { ValueTypes, ValueType, MapRef, SceneProperty, Camera, Clock } from "./types";
import Widgets, {
  WidgetAlignSystem as WidgetAlignSystemType,
  Alignment,
  Location,
  WidgetLayoutConstraint,
} from "./Widgets";

export type { ValueTypes, ValueType } from "./types";

export type { Block } from "./Infobox";

export type {
  Context,
  WidgetLayoutConstraint,
  WidgetAlignSystem,
  Alignment,
  Location,
} from "./Widgets";

export type Props = {
  // common
  isEditable?: boolean;
  isBuilt?: boolean;
  isMobile?: boolean;
  mapRef?: RefObject<MapRef>;
  sceneProperty?: SceneProperty;
  camera?: Camera;
  clock?: Clock;
  selectedLayerId?: string;
  // widgets
  widgetAlignSystem?: WidgetAlignSystemType;
  widgetAlignSystemEditing?: boolean;
  widgetLayoutConstraint?: { [w: string]: WidgetLayoutConstraint };
  // infobox
  infoboxProperty?: InfoboxProperty;
  blocks?: Block[];
  infoboxTitle?: string;
  selectedBlockId?: string;
  showInfoboxTitle?: boolean;
  infoboxVisible?: boolean;
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
};

export default function Crust({
  isBuilt,
  isEditable,
  isMobile,
  mapRef,
  sceneProperty,
  camera,
  clock,
  selectedLayerId,
  widgetAlignSystem,
  widgetAlignSystemEditing,
  widgetLayoutConstraint,
  blocks,
  infoboxProperty,
  infoboxTitle,
  infoboxVisible,
  selectedBlockId,
  onWidgetLayoutUpdate,
  onWidgetAlignmentUpdate,
  onInfoboxMaskClick,
  onBlockSelect,
  onBlockChange,
  onBlockMove,
  onBlockDelete,
  onBlockInsert,
  renderInfoboxInsertionPopup,
}: Props): JSX.Element | null {
  const { renderBlock, renderWidget } = useHooks({ mapRef });
  const theme = usePublishTheme(sceneProperty?.theme);
  const widgetContext = useWidgetContext({ mapRef, camera, clock, sceneProperty, selectedLayerId });

  return (
    <>
      <Widgets
        isMobile={isMobile}
        isBuilt={isBuilt}
        isEditable={isEditable}
        alignSystem={widgetAlignSystem}
        editing={widgetAlignSystemEditing}
        layoutConstraint={widgetLayoutConstraint}
        theme={theme}
        context={widgetContext}
        onWidgetLayoutUpdate={onWidgetLayoutUpdate}
        onAlignmentUpdate={onWidgetAlignmentUpdate}
        renderWidget={renderWidget}
      />
      <Infobox
        isBuilt={isBuilt}
        isEditable={isEditable}
        blocks={blocks}
        infoboxKey={selectedLayerId}
        property={infoboxProperty}
        title={infoboxTitle}
        visible={infoboxVisible}
        selectedBlockId={selectedBlockId}
        theme={theme}
        onMaskClick={onInfoboxMaskClick}
        onBlockSelect={onBlockSelect}
        onBlockChange={onBlockChange}
        onBlockDelete={onBlockDelete}
        onBlockMove={onBlockMove}
        onBlockInsert={onBlockInsert}
        renderBlock={renderBlock}
        renderInsertionPopup={renderInfoboxInsertionPopup}
      />
    </>
  );
}
