import { Placement } from "@floating-ui/react";
import { FC, MouseEvent, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type Clamp = "left" | "right";

type Props = {
  children: ReactNode;
  border?: boolean;
  isSelected?: boolean;
  actionContent?: ReactNode;
  isOpenAction?: boolean;
  actionPlacement?: Placement;
  clamp?: Clamp;
  onItemClick: (e?: MouseEvent<Element>) => void;
  onActionClick?: () => void;
  onOpenChange?: (isOpen: boolean) => void;
};

const ListItem: FC<Props> = ({
  children,
  border,
  isSelected,
  actionContent,
  isOpenAction,
  actionPlacement,
  clamp,
  onItemClick,
  onActionClick,
  onOpenChange,
}) => {
  return (
    <Wrapper>
      <Inner border={border} isSelected={isSelected} clamp={clamp} onClick={onItemClick}>
        {typeof children === "string" ? (
          <StyledText size="footnote">{children}</StyledText>
        ) : (
          children
        )}
      </Inner>

      {actionContent && (
        <Popover.Provider
          open={isOpenAction}
          placement={actionPlacement}
          onOpenChange={onOpenChange}>
          <Popover.Trigger asChild>
            <Button clamp={clamp} onClick={onActionClick}>
              <Icon icon="actionbutton" size={12} />
            </Button>
          </Popover.Trigger>
          <Popover.Content>{actionContent}</Popover.Content>
        </Popover.Provider>
      )}
    </Wrapper>
  );
};

export default ListItem;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Inner = styled.button<{
  border?: boolean;
  isSelected?: boolean;
  clamp?: Clamp;
}>`
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  color: #e0e0e0;
  border: 1px solid ${({ border, theme }) => (border ? theme.outline.weakest : "transparent")};
  border-radius: ${({ clamp }) =>
    clamp === "left" ? "0 6px 6px 0" : clamp === "right" ? "6px 0 0 6px" : "6px"};
  box-sizing: border-box;
  padding: 8px 20px 8px 4px;
  background: ${({ theme, isSelected }) => (isSelected ? theme.select.main : "inherit")};
  transition: all 0.3s;

  :hover {
    ${({ isSelected, theme }) => !isSelected && `background-color:` + theme.bg[3]}
  }
`;

const StyledText = styled(Text)`
  flex-grow: 1;
  width: 0;
  word-break: break-all;
  text-align: left;
`;

const Button = styled.button<{ clamp?: Clamp }>`
  height: 100%;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  margin-left: -1px;
  color: ${({ theme }) => theme.content.weak};
  border-radius: ${({ clamp }) =>
    clamp === "left" ? "0 6px 6px 0" : clamp === "right" ? "6px 0 0 6px" : "6px"};

  :hover {
    background: ${({ theme }) => theme.bg[2]};
  }
`;
