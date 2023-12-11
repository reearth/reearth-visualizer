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
    <Wrapper border={border} isSelected={isSelected} isOpenAction={isOpenAction} clamp={clamp}>
      <Inner onClick={onItemClick}>
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
              <Icon icon="actionbutton" size={16} />
            </Button>
          </Popover.Trigger>
          <Popover.Content>{actionContent}</Popover.Content>
        </Popover.Provider>
      )}
    </Wrapper>
  );
};

export default ListItem;

const Wrapper = styled.div<{
  border?: boolean;
  isSelected?: boolean;
  isOpenAction?: boolean;
  clamp?: Clamp;
}>`
  display: flex;
  width: 100%;
  min-height: 36px;
  align-items: center;
  color: ${({ theme }) => theme.content.main};
  border: 1px solid ${({ border, theme }) => (border ? theme.outline.weakest : "transparent")};
  border-radius: ${({ clamp }) =>
    clamp === "left" ? "0 4px 4px 0" : clamp === "right" ? "4px 0 0 4px" : "4px"};
  background: ${({ theme, isSelected, isOpenAction }) =>
    isSelected ? theme.select.main : isOpenAction ? theme.bg[3] : "inherit"};
  transition: all 0.2s;
  cursor: pointer;

  :hover {
    ${({ isSelected, theme }) => !isSelected && `background-color:` + theme.bg[3]}
  }
`;

const Inner = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 4px 8px 4px;
  border-radius: 4px;
`;

const StyledText = styled(Text)`
  flex-grow: 1;
  word-break: break-all;
  text-align: left;
`;

const Button = styled.div<{ clamp?: Clamp }>`
  display: flex;
  align-items: center;
  height: 36px;
  color: ${({ theme }) => theme.content.weak};
  border-radius: ${({ clamp }) =>
    clamp === "left" ? "0 4px 4px 0" : clamp === "right" ? "4px 0 0 4px" : "4px"};
`;
