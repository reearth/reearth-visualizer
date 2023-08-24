import { useCallback } from "react";

// import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled, useTheme } from "@reearth/services/theme";

export type SceneSettingsItemProps = {
  label: string;
};
export type Props = {
  scene: SwitchField<SceneSettingsItemProps>;
  onActive?: (id: string) => void;
  onClickAction?: (id: string) => void;
};

const SceneSectionItem: React.FC<Props> = ({ scene, onActive }) => {
  const theme = useTheme();

  const handleActive = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onActive?.(scene.id);
    },
    [scene.id, onActive],
  );

  // const handleAction = useCallback(
  //   (e: React.MouseEvent<HTMLDivElement>) => {
  //     e.stopPropagation();
  //     onClickAction?.(scene.id);
  //   },
  //   [scene.id, onClickAction],
  // );

  return (
    <Item active={scene.active} onClick={handleActive}>
      <ItemProperty>
        <Text size="footnote" color={theme.content.main} otherProperties={{ height: "16px" }}>
          {scene.label}
        </Text>
      </ItemProperty>
      {/* <ActionButton onClick={handleAction}>
        <Icon icon={"actionbutton"} size={16} color={theme.content.main} />
      </ActionButton> */}
    </Item>
  );
};

const Item = styled.div<{ active?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;

  ${({ theme, active }) => active && `background: ${theme.select.main};`}

  :hover {
    ${({ theme, active }) => !active && `background: ${theme.bg[2]};`}
  }
  cursor: pointer;
`;

const ItemProperty = styled.div`
  display: flex;
  align-items: center;
`;

// const ActionButton = styled.div`
//   display: flex;
//   align-items: center;
// `;

export default SceneSectionItem;
