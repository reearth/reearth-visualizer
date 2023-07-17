import Icon, { Icons } from "@reearth/beta/components/Icon";
import { css, styled } from "@reearth/services/theme";

export type PopoverContentItem = {
  name: string;
  isSelected?: boolean;
  icon?: Icons;
  onClick?: () => void;
};

export type Props = {
  width?: string;
  size: "sm" | "md";
  items: PopoverContentItem[];
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

const PopoverContent: React.FC<Props> = ({ size, width, items }) => {
  return (
    <SRoot width={width}>
      {items.map((item, i) => {
        return (
          <SRow key={i} isSelected={!!item.isSelected} size={size} onClick={item.onClick}>
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
export default PopoverContent;

const SRoot = styled.div<Pick<Props, "width">>`
  ${({ width }) => width && `width: ${width};`}

  border-radius: 2px;
  border: 1px solid #525252;
  background: #262626;
  box-shadow: 4px 4px 4px 0px rgba(0, 0, 0, 0.25);
`;

const SRow = styled.button<Pick<Props, "size"> & Pick<PopoverContentItem, "isSelected">>`
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e0e0e0;
  ${({ size }) => stylesBySize[size].row ?? ""}
  ${({ isSelected }) => isSelected && "background: var(--editor-select-main, #3B3CD0);"}
  :hover {
    ${({ isSelected }) => !isSelected && "background-color: #2E2D33;"}
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
