import { ReactNode, createContext, memo, useCallback } from "react";

import PropertyItem from "@reearth/beta/components/fields/Property/PropertyItem";
import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
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

const BlockWrapper: React.FC<Props> = ({
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
          </EditorPanel>
        )}
        {editMode && propertyId && settingsEnabled && isPluginBlock && (
          <EditorPanel onClick={stopClickPropagation}>
            {pluginBlockPropertyItems?.map((i, idx) => (
              <SidePanelSectionField title={i.title} key={idx}>
                <PropertyItem key={i.id} propertyId={propertyId} item={i} onFlyTo={handleFlyTo} />
              </SidePanelSectionField>
            ))}
          </EditorPanel>
        )}
      </SelectableArea>
    </BlockContext.Provider>
  );
};

export default memo(BlockWrapper);

const Block = styled.div<{ padding?: Spacing; isEditable?: boolean; disableSelection?: boolean }>`
  display: flex;
  padding-top: ${({ padding }) => padding?.top + "px" ?? 0};
  padding-bottom: ${({ padding }) => padding?.bottom + "px" ?? 0};
  padding-left: ${({ padding }) => padding?.left + "px" ?? 0};
  padding-right: ${({ padding }) => padding?.right + "px" ?? 0};
  cursor: ${({ isEditable, disableSelection }) =>
    isEditable && !disableSelection ? "pointer" : "default"};
  color: black;
  position: relative;
`;

const EditorPanel = styled.div`
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  padding: 12px;
`;

const Overlay = styled.div<{ disableSelection?: boolean }>`
  position: absolute;
  height: 100%;
  width: 100%;
  ${({ disableSelection }) => !disableSelection && "cursor: pointer;"}
`;
