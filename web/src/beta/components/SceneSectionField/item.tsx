import { useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled, useTheme } from "@reearth/services/theme";

export type SceneSectionItemProps = {
  label: string;
};
export type Props = {
  scene: SwitchField<SceneSectionItemProps>;
  onActive?: (id: string) => void;
  onClickAction?: (id: string) => void;
};

const SceneSectionItem: React.FC<Props> = ({ scene, onActive, onClickAction }) => {
  const theme = useTheme();
  const handleActive = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onActive?.(scene.id);
    },
    [scene.id, onActive],
  );
  const handleAction = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onClickAction?.(scene.id);
    },
    [scene.id, onClickAction],
  );

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
      <ActionButton onClick={handleAction}>
        <Icon icon={"actionbutton"} size={16} color={theme.general.content.main} />
      </ActionButton>
    </Item>
  );
};

const Item = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 4px;

  align-self: stretch;

  ${props => (props.active ? `background: ${props.theme.general.select};` : "")}
  ${props => (props.active ? "border-radius: 4px;" : "")}
  &:hover {
    ${props => (props.active ? "" : `background: ${props.theme.general.bg.weak};`)}
    ${props => (props.active ? "" : "border-radius: 0px;")}
  }

  cursor: pointer;
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
const ActionButton = styled.div`
  display: flex;
  align-items: center;
`;

export default SceneSectionItem;
