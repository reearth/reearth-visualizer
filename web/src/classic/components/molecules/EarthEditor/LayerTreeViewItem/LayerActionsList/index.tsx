import React, { useState, useRef } from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

import Flex from "@reearth/classic/components/atoms/Flex";
import HelpButton from "@reearth/classic/components/atoms/HelpButton";
import Icon from "@reearth/classic/components/atoms/Icon";
import Text from "@reearth/classic/components/atoms/Text";
import { Layer } from "@reearth/classic/components/molecules/EarthEditor/LayerTreeViewItem/Layer";
import { metricsSizes } from "@reearth/classic/theme";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

export type Props = {
  selectedLayerId?: string;
  items?: Layer[];
  onAdd?: (id?: string) => void;
  onRemove?: (selectedLayerId: string) => void;
  onWarning?: (show: boolean) => void;
};

const LayerActionsList: React.FC<Props> = ({
  selectedLayerId,
  items,
  onAdd,
  onRemove,
  onWarning,
}) => {
  const t = useT();

  const [visibleMenu, setVisibleMenu] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const referenceElement = useRef<HTMLDivElement>(null);
  const popperElement = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceElement.current, popperElement.current, {
    placement: "bottom",
    modifiers: [
      {
        name: "eventListeners",
        enabled: visibleMenu,
        options: {
          scroll: false,
          resize: false,
        },
      },
    ],
  });

  useClickAway(wrapperRef, () => setVisibleMenu(false));

  return (
    <ActionWrapper
      ref={wrapperRef}
      onClick={e => {
        e.stopPropagation();
      }}>
      <Action
        disabled={!selectedLayerId}
        onClick={() => onWarning?.(true) ?? (selectedLayerId && onRemove?.(selectedLayerId))}>
        <HelpButton descriptionTitle={t("Delete the selected item.")} balloonDirection="top">
          <StyledIcon icon="bin" size={16} disabled={!selectedLayerId} />
        </HelpButton>
      </Action>
      <Action ref={referenceElement} onClick={() => setVisibleMenu(!visibleMenu)}>
        <StyledIcon icon="plusSquare" size={16} />
      </Action>
      <MenuWrapper ref={popperElement} style={styles.popper} {...attributes.popper}>
        {visibleMenu && (
          <Menu>
            {items?.map(i => (
              <MenuItem
                key={i.id}
                disabled={i.disabled}
                onClick={() => !i.disabled && onAdd?.(i.id)}>
                <MenuItemIcon icon={i.icon} size={16} />
                <Text size="xs" customColor>
                  {i.title}
                </Text>
              </MenuItem>
            ))}
          </Menu>
        )}
      </MenuWrapper>
    </ActionWrapper>
  );
};

const ActionWrapper = styled.div`
  flex: 1;
`;

const Action = styled.span<{ disabled?: boolean }>`
  float: right;
  margin-right: 10px;
  user-select: none;
`;

const StyledIcon = styled(Icon)<{ disabled?: boolean }>`
  padding: 3px;
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};
  color: ${({ disabled, theme }) => (disabled ? theme.classic.main.weak : theme.classic.main.text)};
  border-radius: 5px;
  &:hover {
    background-color: ${({ disabled, theme }) => (disabled ? null : theme.classic.main.bg)};
  }
`;

const MenuWrapper = styled.div`
  z-index: 1;
`;

const Menu = styled.div`
  background: ${({ theme }) => theme.classic.selectList.option.bg};
  border: 1px solid ${({ theme }) => theme.classic.main.border};
  border-radius: 5px;
`;

const MenuItem = styled(Flex)<{ disabled?: boolean }>`
  padding: ${metricsSizes.xs}px ${metricsSizes.m}px;
  color: ${({ disabled, theme }) => (disabled ? theme.classic.layers.disableTextColor : undefined)};
  cursor: ${({ disabled }) => (disabled ? "default" : "pointer")};

  &:hover {
    background: ${({ disabled, theme }) =>
      !disabled ? theme.classic.selectList.option.hoverBg : undefined};
  }
`;

const MenuItemIcon = styled(Icon)`
  margin-right: ${metricsSizes.s}px;
`;

export default LayerActionsList;
