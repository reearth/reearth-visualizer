import { useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type SceneSectionItemProps = {
  id: string;
  label: string;
  active?: boolean;
};
export type Props = {
  scene: SceneSectionItemProps;
  onActive?: (id: string) => void;
  onAction?: (id: string) => void;
};

const SceneSectionItem: React.FC<Props> = ({ scene, onActive, onAction }) => {
  const theme = useTheme();
  const handleActive = useCallback(() => {
    onActive?.(scene.id);
  }, [scene.id, onActive]);
  const handleAction = useCallback(() => {
    onAction?.(scene.id);
  }, [scene.id, onAction]);

  return (
    <Item active={scene.active} onClick={handleActive}>
      <ItemProperty>
        <ItemSpace />
        <Text
          size="footnote"
          color={theme.general.content.main}
          otherProperties={{ height: "16px" }}>
          {scene.label}
        </Text>
      </ItemProperty>
      <Icon
        icon={"actionbutton"}
        size={16}
        color={theme.general.content.main}
        onClick={handleAction}
      />
    </Item>
  );
};

const Item = styled.button<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;

  align-self: stretch;

  ${props => (props.active ? "background: " + props.theme.general.select + ";" : "")}
  ${props => (props.active ? "border-radius: 4px;" : "")}
  &:hover {${props =>
    props.active ? "" : "background: " + props.theme.general.bg.weak + "; border-radius: 0px;"}
`;
const ItemProperty = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;
const ItemSpace = styled.div`
  box-sizing: border-box;

  width: 20px;
  height: 20px;
`;

export default SceneSectionItem;
