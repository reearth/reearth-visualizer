import { ReactNode, createContext } from "react";

// import FieldComponents from "@reearth/beta/components/fields/PropertyFields";
import { stopClickPropagation } from "@reearth/beta/utils/events";
import { styled } from "@reearth/services/theme";

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
  name?: string;
  icon?: string;
  isSelected?: boolean;
  isEditable?: boolean;
  children?: ReactNode;
  propertyId?: string;
  property?: any;
  dndEnabled?: boolean;
  settingsEnabled?: boolean;
  onClick?: () => void;
  onClickAway?: () => void;
  onRemove?: () => void;
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
  onClickAway,
  onRemove,
}) => {
  const {
    title,
    editMode,
    showSettings,
    defaultSettings,
    padding,
    setEditMode,
    handleEditModeToggle,
    handleSettingsToggle,
    handleBlockClick,
  } = useHooks({
    name,
    isSelected,
    property,
    onClick,
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
        property={property}
        editMode={editMode}
        isEditable={isEditable}
        setEditMode={setEditMode}
        onEditModeToggle={handleEditModeToggle}
        onSettingsToggle={handleSettingsToggle}
        onRemove={onRemove}
        onClickAway={onClickAway}>
        <Block padding={padding} isEditable={isEditable} onClick={handleBlockClick}>
          {children ?? <Template icon={icon} />}
        </Block>
        {editMode && propertyId && defaultSettings && settingsEnabled && (
          <EditorPanel onClick={stopClickPropagation}>
            {/* <FieldComponents propertyId={propertyId} item={defaultSettings} />
            <NewFieldsComponent /> // This will need to be updated when support is needed
            // currently need: camera, color, text, url, spacing
            // will need: Time, toggle, 
            // Should just setup support for ALL (like the FieldCompoennts component) */}
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
