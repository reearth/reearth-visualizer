import { FC, ReactNode, createContext, memo, useCallback } from "react";

import { Collapse } from "@reearth/beta/lib/reearth-ui";
import PropertyItem from "@reearth/beta/ui/fields/Properties";
import { stopClickPropagation } from "@reearth/beta/utils/events";
import { FlyTo, useVisualizer } from "@reearth/core";
import { Item } from "@reearth/services/api/propertyApi/utils";
import { styled } from "@reearth/services/theme";

import Template from "../../../Crust/StoryPanel/Block/Template";
import { FieldComponent } from "../../hooks/useFieldComponent";
import SelectableArea from "../SelectableArea";

import useHooks from "./hooks";

export const BlockContext = createContext<{ editMode?: boolean } | undefined>(undefined);

type Spacing = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

type Props = {
  name?: string | null;
  icon?: string;
  isSelected?: boolean;
  isEditable?: boolean;
  children?: ReactNode;
  propertyId?: string;
  property?: any;
  dragHandleClassName?: string;
  pluginBlockPropertyItems?: Item[];
  dndEnabled?: boolean;
  settingsEnabled?: boolean;
  minHeight?: number;
  isPluginBlock?: boolean;
  onClick?: () => void;
  onClickAway?: () => void;
  onRemove?: () => void;
  onBlockDoubleClick?: () => void;
  onPropertyUpdate?: (
    propertyId?: string,
    schemaItemId?: string,
    fieldId?: string,
    itemId?: string,
    vt?: any,
    v?: any,
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
};

const BlockWrapper: FC<Props> = ({
  name,
  icon,
  isSelected,
  isEditable,
  children,
  propertyId,
  property,
  pluginBlockPropertyItems,
  dndEnabled = true,
  settingsEnabled = true,
  minHeight,
  isPluginBlock,
  dragHandleClassName,
  onClick,
  onBlockDoubleClick,
  onClickAway,
  onRemove,
  onPropertyUpdate,
  onPropertyItemAdd,
  onPropertyItemMove,
  onPropertyItemDelete,
}) => {
  const {
    title,
    groupId,
    editMode,
    showSettings,
    defaultSettings,
    generalBlockSettings,
    pluginBlockSettings,
    disableSelection,
    handleEditModeToggle,
    handleSettingsToggle,
    handleBlockClick,
    handleDoubleClick,
  } = useHooks({
    name,
    isSelected,
    property,
    isEditable,
    onClick,
    onBlockDoubleClick,
  });

  const visualizerRef = useVisualizer();
  const handleFlyTo: FlyTo = useCallback(
    (target, options) => {
      visualizerRef.current?.engine.flyTo(target, options);
    },
    [visualizerRef],
  );

  return (
    <BlockContext.Provider value={{ editMode }}>
      <SelectableArea
        title={title}
        icon={icon}
        position="right-bottom"
        isSelected={isSelected}
        propertyId={propertyId}
        dndEnabled={dndEnabled}
        dragHandleClassName={dragHandleClassName}
        showSettings={showSettings}
        contentSettings={isPluginBlock ? pluginBlockSettings : generalBlockSettings}
        isPluginBlock={isPluginBlock}
        editMode={editMode}
        isEditable={isEditable}
        hideHoverUI={disableSelection}
        overrideGroupId={groupId === "title" ? groupId : undefined}
        onClick={e => {
          handleBlockClick(e);
        }}
        onDoubleClick={handleDoubleClick}
        onClickAway={onClickAway}
        onEditModeToggle={handleEditModeToggle}
        onSettingsToggle={handleSettingsToggle}
        onRemove={onRemove}
        onPropertyUpdate={onPropertyUpdate}
        onPropertyItemAdd={onPropertyItemAdd}
        onPropertyItemMove={onPropertyItemMove}
        onPropertyItemDelete={onPropertyItemDelete}>
        <Block
          padding={generalBlockSettings?.padding?.value}
          isEditable={isEditable}
          disableSelection={disableSelection}>
          {children ?? (isEditable && <Template icon={icon} height={minHeight} />)}
          {!editMode && isEditable && <Overlay disableSelection={disableSelection} />}
        </Block>
        {editMode && groupId && propertyId && settingsEnabled && !isPluginBlock && (
          <EditorPanel onClick={stopClickPropagation}>
            <FieldsWrapper>
              {Object.keys(defaultSettings).map((fieldId, idx) => {
                const field = defaultSettings[fieldId];
                return (
                  <FieldComponent
                    key={groupId + propertyId + idx}
                    propertyId={propertyId}
                    groupId={groupId}
                    fieldId={fieldId}
                    field={field}
                    onPropertyUpdate={onPropertyUpdate}
                    onPropertyItemAdd={onPropertyItemAdd}
                    onPropertyItemMove={onPropertyItemMove}
                    onPropertyItemDelete={onPropertyItemDelete}
                  />
                );
              })}
            </FieldsWrapper>
          </EditorPanel>
        )}
        {editMode && propertyId && settingsEnabled && isPluginBlock && (
          <EditorPanel onClick={stopClickPropagation}>
            {pluginBlockPropertyItems?.map((i, idx) => (
              <Collapse title={i.title} key={idx}>
                <PropertyItem key={i.id} propertyId={propertyId} item={i} onFlyTo={handleFlyTo} />
              </Collapse>
            ))}
          </EditorPanel>
        )}
      </SelectableArea>
    </BlockContext.Provider>
  );
};

export default memo(BlockWrapper);

const Block = styled("div")<{
  padding?: Spacing;
  isEditable?: boolean;
  disableSelection?: boolean;
}>(({ padding, isEditable, disableSelection }) => ({
  display: "flex",
  paddingTop: padding?.top ? `${padding.top}px` : 0,
  paddingBottom: padding?.bottom ? `${padding.bottom}px` : 0,
  paddingLeft: padding?.left ? `${padding.left}px` : 0,
  paddingRight: padding?.right ? `${padding.right}px` : 0,
  cursor: isEditable && !disableSelection ? "pointer" : "default",
  color: "black",
  position: "relative",
}));

const EditorPanel = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  color: theme.content.main,
  background: theme.bg[1],
}));

const Overlay = styled("div")<{ disableSelection?: boolean }>(({ disableSelection }) => ({
  position: "absolute",
  height: "100%",
  width: "100%",
  cursor: !disableSelection ? "pointer" : "none",
}));

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  userSelect: "none",
}));
