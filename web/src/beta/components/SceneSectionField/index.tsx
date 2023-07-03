import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled } from "@reearth/services/theme";

import SceneSectionItem, { SceneSectionItemProps } from "./item";

export type SceneSectionFieldProps = {
  scenes: SwitchField<SceneSectionItemProps>[];
  onActive?: (id: string) => void;
  onClickAction?: (id: string) => void;
};

const SceneSectionField: React.FC<SceneSectionFieldProps> = ({
  scenes,
  onActive,
  onClickAction,
}) => {
  return (
    <SidePanelSectionField title="scene">
      <List>
        {scenes.map((item, index) => (
          <SceneSectionItem
            key={index}
            scene={item}
            onActive={onActive}
            onClickAction={onClickAction}
          />
        ))}
      </List>
    </SidePanelSectionField>
  );
};

const List = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 8px;
  gap: 8px;

  width: 100%;
`;

export default SceneSectionField;
