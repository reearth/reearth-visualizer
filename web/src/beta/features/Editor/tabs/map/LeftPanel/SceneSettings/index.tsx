import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled } from "@reearth/services/theme";

import { SelectableItem } from "../../../types";

import SceneSectionItem, { SceneSettingsItemProps } from "./item";

export type SceneSectionFieldProps = {
  groups: SwitchField<SceneSettingsItemProps>[];
  onItemSelect?: (item: SelectableItem) => void;
  onClickAction?: (id: string) => void;
};

const Outline: React.FC<SceneSectionFieldProps> = ({ groups, onItemSelect, onClickAction }) => {
  console.log("GG", groups);
  return (
    <>
      <StyledSidePanelSectionField title="Scene">
        <List>
          {groups.map((item, index) => (
            <SceneSectionItem
              key={index}
              scene={item}
              onActive={() => onItemSelect?.({ type: "scene", id: item.id })}
              onClickAction={onClickAction}
            />
          ))}
        </List>
      </StyledSidePanelSectionField>
      <StyledSidePanelSectionField title="Layers">
        <List>
          {groups.map((item, index) => (
            <SceneSectionItem
              key={index}
              scene={item}
              // onActive={onActive}
              // onClickAction={onClickAction}
            />
          ))}
        </List>
      </StyledSidePanelSectionField>
    </>
  );
};

const StyledSidePanelSectionField = styled(SidePanelSectionField)`
  background: inherit;
  border-bottom: 1px solid ${({ theme }) => theme.outline.weak};
  border-radius: 0;
`;

const List = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export default Outline;
