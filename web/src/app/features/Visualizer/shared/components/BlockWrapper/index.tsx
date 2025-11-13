import { Collapse } from "@reearth/app/lib/reearth-ui";
import PropertyItem from "@reearth/app/ui/fields/Properties";
import { stopClickPropagation } from "@reearth/app/utils/events";
import type { ValueType, ValueTypes } from "@reearth/app/utils/value";
import { FlyTo } from "@reearth/core";
import type { Item } from "@reearth/services/api/property";
import { styled } from "@reearth/services/theme";
import { FC, ReactNode, createContext, memo } from "react";

import Template from "../../../Crust/StoryPanel/Block/Template";
import { FieldComponent } from "../../hooks/useFieldComponent";
import type { BlockWrapperProperty } from "../../types";
import SelectableArea from "../SelectableArea";

import useHooks from "./hooks";

export const BlockContext = createContext<{ editMode?: boolean } | undefined>(
  undefined
);

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
  property?: BlockWrapperProperty;
  dragHandleClassName?: string;
  propertyItemsForPluginBlock?: Item[];
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
    vt?: ValueType,
    v?: ValueTypes[ValueType]
  ) => Promise<void>;
  onPropertyItemAdd?: (
    propertyId?: string,
    schemaGroupId?: string
  ) => Promise<void>;
  onPropertyItemMove?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string,
    index?: number
  ) => Promise<void>;
  onPropertyItemDelete?: (
    propertyId?: string,
    schemaGroupId?: string,
    itemId?: string
  ) => Promise<void>;
  onFlyTo?: FlyTo;
  propertyNames?: string[];
};

const BlockWrapper: FC<Props> = ({
  name,
  icon,
  isSelected,
  isEditable,
  children,
  propertyId,
  property,
  propertyItemsForPluginBlock,
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
  onFlyTo,
  propertyNames
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
    handleDoubleClick
  } = useHooks({
    name,
    isSelected,
    property,
    isEditable,
    onClick,
    onBlockDoubleClick
  });
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
        contentSettings={
          isPluginBlock ? pluginBlockSettings : generalBlockSettings
        }
        isPluginBlock={isPluginBlock}
        editMode={editMode}
        isEditable={isEditable}
        hideHoverUI={disableSelection}
        overrideGroupId={groupId === "title" ? groupId : undefined}
        onClick={(e) => {
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
        onPropertyItemDelete={onPropertyItemDelete}
      >
        <Block
          padding={generalBlockSettings?.padding?.value as Spacing | undefined}
          isEditable={isEditable}
          disableSelection={disableSelection}
        >
          {children ??
            (isEditable && <Template icon={icon} height={minHeight} />)}
          {!editMode && isEditable && (
            <Overlay disableSelection={disableSelection} />
          )}
        </Block>
        {editMode &&
          groupId &&
          propertyId &&
          settingsEnabled &&
          !isPluginBlock && (
            <EditorPanel onClick={stopClickPropagation}>
              <FieldsWrapper>
                {defaultSettings &&
                  Object.keys(defaultSettings).map((fieldId, idx) => {
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
                        propertyNames={propertyNames}
                      />
                    );
                  })}
              </FieldsWrapper>
            </EditorPanel>
          )}
        {editMode && propertyId && settingsEnabled && isPluginBlock && (
          <EditorPanel onClick={stopClickPropagation}>
            {propertyItemsForPluginBlock?.map((i, idx) => (
              <Collapse title={i.title} key={idx}>
                <PropertyItem
                  key={i.id}
                  propertyId={propertyId}
                  item={i}
                  onFlyTo={onFlyTo}
                />
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
  minHeight: isEditable ? "28px" : 0
}));

const EditorPanel = styled("div")(({ theme }) => ({
  padding: theme.spacing.normal,
  color: theme.content.main,
  background: theme.bg[1]
}));

const Overlay = styled("div")<{ disableSelection?: boolean }>(
  ({ disableSelection }) => ({
    position: "absolute",
    height: "100%",
    width: "100%",
    cursor: !disableSelection ? "pointer" : undefined
  })
);

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  userSelect: "none"
}));
