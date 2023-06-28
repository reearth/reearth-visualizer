import { useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

export type LayerSectionItemProps = {
  id: string;
  label: string;
  visible?: boolean;
  active?: boolean;
};

type Props = {
  layer: LayerSectionItemProps;
  onActive?: (id: string) => void;
  onAction?: (id: string) => void;
  onVisible?: (id: string) => void;
};

const LayerSectionItem: React.FC<Props> = ({ layer, onActive, onAction, onVisible }) => {
  const theme = useTheme();
  const handleActive = useCallback(() => {
    onActive?.(layer.id);
  }, [layer.id, onActive]);
  const handleVisible = useCallback(() => {
    onVisible?.(layer.id);
  }, [layer.id, onVisible]);
  const handleAction = useCallback(() => {
    onAction?.(layer.id);
  }, [layer.id, onAction]);

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
const ItemVisibility = styled.div<{ active?: boolean; onClick?: () => void }>`
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

export default LayerSectionItem;
