import { ReactNode, createContext } from "react";

import { stopClickPropagation } from "@reearth/beta/utils/events";
import { styled } from "@reearth/services/theme";

import { FieldComponent } from "../../../hooks/useFieldComponent";
import SelectableArea from "../../../SelectableArea";
import Template from "../../Template";

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
  dndEnabled?: boolean;
  settingsEnabled?: boolean;
  onClick?: () => void;
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
  dndEnabled = true,
  settingsEnabled = true,
  onClick,
  onBlockDoubleClick,
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
    panelSettings,
    setEditMode,
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

  return (
    <BlockContext.Provider value={{ editMode }}>
      <SelectableArea
        title={title}
        icon={icon}
        isSelected={isSelected}
        propertyId={propertyId}
        dndEnabled={dndEnabled}
        showSettings={showSettings}
        panelSettings={panelSettings}
        editMode={editMode}
        isEditable={isEditable}
        overrideGroupId={groupId === "title" ? groupId : undefined}
        setEditMode={setEditMode}
        onEditModeToggle={handleEditModeToggle}
        onSettingsToggle={handleSettingsToggle}
        onRemove={onRemove}
        onPropertyUpdate={onPropertyUpdate}
        onPropertyItemAdd={onPropertyItemAdd}
        onPropertyItemMove={onPropertyItemMove}
        onPropertyItemDelete={onPropertyItemDelete}>
        <Block
          padding={panelSettings?.padding?.value}
          isEditable={isEditable}
          onClick={e => {
            handleBlockClick(e);
          }}
          onDoubleClick={handleDoubleClick}>
          {children ?? (isEditable && <Template icon={icon} />)}
        </Block>
        {editMode && groupId && propertyId && settingsEnabled && (
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
      </SelectableArea>
    </BlockContext.Provider>
  );
};

export default BlockWrapper;

const Block = styled.div<{ padding?: Spacing; isEditable?: boolean }>`
  display: flex;
  padding-top: ${({ padding }) => padding?.top + "px" ?? 0};
  padding-bottom: ${({ padding }) => padding?.bottom + "px" ?? 0};
  padding-left: ${({ padding }) => padding?.left + "px" ?? 0};
  padding-right: ${({ padding }) => padding?.right + "px" ?? 0};
  cursor: ${({ isEditable }) => (isEditable ? "pointer" : "default")};
  color: black;
`;

const EditorPanel = styled.div`
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  padding: 12px;
`;
