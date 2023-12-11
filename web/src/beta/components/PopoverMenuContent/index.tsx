import Icon from "@reearth/beta/components/Icon";
import { css, styled } from "@reearth/services/theme";

export type MenuItem = {
  name: string;
  isSelected?: boolean;
  icon?: string;
  disabled?: boolean;
  onClick?: () => void;
};

export type Props = {
  width?: string;
  size: "sm" | "md";
  items: MenuItem[];
};

const stylesBySize = {
  sm: {
    iconSize: 14,
    row: css`
      height: 28px;
      font-size: 12px;
      padding: 4px 12px;
    `,
  },
  md: {
    iconSize: 16,
    row: css`
      height: 38px;
      font-size: 14px;
      padding: 8px 12px;
    `,
  },
};

const PopoverMenuContent: React.FC<Props> = ({ size, width, items }) => {
  return (
    <SRoot width={width}>
      {items.map((item, i) => {
        return (
          <SRow
            key={i}
            isSelected={!!item.isSelected}
            isFirst={i === 0}
            isLast={i === items.length - 1}
            size={size}
            disabled={!!item.disabled}
            onClick={item.onClick}>
            {item.icon && (
              <SLeftIcon>
                <Icon icon={item.icon} size={stylesBySize[size].iconSize} />
              </SLeftIcon>
            )}

            <SText>{item.name}</SText>
          </SRow>
        );
      })}
    </SRoot>
  );
};
export default PopoverMenuContent;

const SRoot = styled.div<Pick<Props, "width">>`
  ${({ width }) => width && `width: ${width};`}

  border-radius: 2px;
  border: 1px solid ${({ theme }) => theme.bg[3]};
  background: ${({ theme }) => theme.bg[1]};
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.25);
  z-index: ${({ theme }) => theme.zIndexes.editor.popover};
`;

const SRow = styled.button<
  Pick<Props, "size"> & Pick<MenuItem, "isSelected"> & { isFirst: boolean; isLast: boolean }
>`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${({ theme, disabled }) => (disabled ? theme.content.weak : theme.content.main)};
  ${({ disabled }) => disabled && "cursor: default;"}

  ${({ isFirst }) => !isFirst && "border-top: 1px solid transparent;"}
  ${({ isLast }) => !isLast && "border-bottom: 1px solid transparent;"}
  ${({ size }) => stylesBySize[size].row ?? ""}
  
  :hover {
    background: ${({ isSelected, theme, disabled }) => !disabled && !isSelected && theme.bg[2]};
  }
`;

const SText = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SLeftIcon = styled.div`
  display: flex;
  align-items: center;
`;
