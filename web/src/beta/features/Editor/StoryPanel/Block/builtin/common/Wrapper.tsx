import { ReactNode, createContext } from "react";

import FieldComponents from "@reearth/beta/components/fields/PropertyFields";
import { stopClickPropagation } from "@reearth/beta/utils/events";
import { type Item } from "@reearth/services/api/propertyApi/utils";
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
  title?: string;
  icon?: string;
  isSelected?: boolean;
  children?: ReactNode;
  propertyId?: string;
  propertyItems?: Item[];
  dndEnabled?: boolean;
  settingsEnabled?: boolean;
  onClick?: () => void;
  onClickAway?: () => void;
  onRemove?: () => void;
};

const BlockWrapper: React.FC<Props> = ({
  title,
  icon,
  isSelected,
  children,
  propertyId,
  propertyItems,
  dndEnabled = true,
  settingsEnabled = true,
  onClick,
  onClickAway,
  onRemove,
}) => {
  const {
    editMode,
    showSettings,
    defaultSettings,
    padding,
    setEditMode,
    handleEditModeToggle,
    handleSettingsToggle,
    handleBlockClick,
  } = useHooks({
    isSelected,
    propertyItems,
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
        propertyItems={propertyItems}
        editMode={editMode}
        setEditMode={setEditMode}
        onEditModeToggle={handleEditModeToggle}
        onSettingsToggle={handleSettingsToggle}
        onRemove={onRemove}
        onClickAway={onClickAway}>
        <Block padding={padding} onClick={handleBlockClick}>
          {children ?? <Template icon={icon} />}
        </Block>
        {editMode && propertyId && defaultSettings && settingsEnabled && (
          <EditorPanel onClick={stopClickPropagation}>
            <FieldComponents propertyId={propertyId} item={defaultSettings} />
          </EditorPanel>
        )}
      </SelectableArea>
    </BlockContext.Provider>
  );
};

export default BlockWrapper;

const Block = styled.div<{ padding?: Spacing; editMode?: boolean }>`
  display: flex;
  padding-top: ${({ padding }) => padding?.top + "px" ?? 0};
  padding-bottom: ${({ padding }) => padding?.bottom + "px" ?? 0};
  padding-left: ${({ padding }) => padding?.left + "px" ?? 0};
  padding-right: ${({ padding }) => padding?.right + "px" ?? 0};
  cursor: ${({ editMode }) => (editMode ? "default" : "pointer")};
  color: black;
`;

const EditorPanel = styled.div`
  background: ${({ theme }) => theme.bg[1]};
  color: ${({ theme }) => theme.content.main};
  padding: 12px;
`;
