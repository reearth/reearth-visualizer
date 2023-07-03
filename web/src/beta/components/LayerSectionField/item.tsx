import { useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { SwitchField } from "@reearth/beta/hooks/useManageSwitchState/hooks";
import { styled, useTheme } from "@reearth/services/theme";

export type LayerSectionItemProps = {
  label: string;
  visible?: boolean;
};

type Props = {
  layer: SwitchField<LayerSectionItemProps>;
  onActive?: (id: string) => void;
  onAction?: (id: string) => void;
  onVisible?: (id: string) => void;
};

const LayerSectionItem: React.FC<Props> = ({ layer, onActive, onAction, onVisible }) => {
  const theme = useTheme();
  const handleActive = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onActive?.(layer.id);
    },
    [layer.id, onActive],
  );
  const handleVisible = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onVisible?.(layer.id);
    },
    [layer.id, onVisible],
  );
  const handleAction = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onAction?.(layer.id);
    },
    [layer.id, onAction],
  );

  return (
    <Item active={layer.active} onClick={handleActive}>
      <ItemProperty>
        <ItemVisibility
          active={layer.active}
          color={theme.general.content.main}
          onClick={handleVisible}>
          {layer.visible && <ItemVisibilityIcon icon="checkOnVisibility" />}
        </ItemVisibility>
        <Text
          size="footnote"
          color={theme.general.content.main}
          otherProperties={{ height: "16px" }}>
          {layer.label}
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
const ItemVisibility = styled.div<{ active?: boolean }>`
  box-sizing: border-box;

  width: 20px;
  height: 20px;

  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 4px;
`;
const ItemVisibilityIcon = styled(Icon)`
  padding-left: 30%;
  padding-right: 33.44%;
  padding-top: 30%;
  padding-bottom: 27.34%;
`;
const ActionButton = styled.div``;

export default LayerSectionItem;
