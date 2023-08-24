import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled } from "@reearth/services/theme";

import { SelectableItem } from "../../../types";

import SceneSectionItem, { SceneSettingsItemProps } from "./item";

export type SceneSectionFieldProps = {
  sceneSettings: SwitchField<SceneSettingsItemProps>[];
  onItemSelect?: (item: SelectableItem) => void;
  onClickAction?: (id: string) => void;
};

const Outline: React.FC<SceneSectionFieldProps> = ({
  sceneSettings,
  onItemSelect,
  onClickAction,
}) => {
  return (
    <>
      <StyledSidePanelSectionField title="Scene">
        <List>
          {sceneSettings.map((item, index) => (
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
        <SceneSectionItem
          scene={{ id: "layer1", label: "Layer 1", active: false }}
          onActive={() => onItemSelect?.({ type: "layer", id: "layer1" })}
        />
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
