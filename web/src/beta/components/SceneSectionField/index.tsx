import SidePanelSectionField from "@reearth/beta/components/SidePanelSectionField";
import { styled } from "@reearth/services/theme";

import SceneSectionItem, { SceneSectionItemProps } from "./item";

export type SceneSectionFieldProps = {
  scenes: SceneSectionItemProps[];
  onActive?: (id: string) => void;
  onAction?: (id: string) => void;
};

const SceneSectionField: React.FC<SceneSectionFieldProps> = ({ scenes, onActive, onAction }) => {
  return (
    <SidePanelSectionField title="scene">
      <List>
        {scenes.map((item, index) => (
          <SceneSectionItem key={index} scene={item} onActive={onActive} onAction={onAction} />
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
