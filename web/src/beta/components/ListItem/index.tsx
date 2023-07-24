import { FC, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type Props = {
  children: ReactNode;
  border?: boolean;
  isSelected?: boolean;
  onItemClick: (id: string) => void;
  onActionClick?: () => void;
  actionContent?: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  isOpenAction?: boolean;
};

const ListItem: FC<Props> = ({
  children,
  border,
  isSelected,
  onItemClick,
  onActionClick,
  actionContent,
  onOpenChange,
  isOpenAction,
}) => {
  return (
    <Wrapper>
      <Inner border={border} isSelected={isSelected} onClick={() => onItemClick("id")}>
        <StyledText size="footnote">{children}</StyledText>
      </Inner>
      {actionContent && (
        <Popover.Provider open={isOpenAction} onOpenChange={onOpenChange}>
          <Popover.Trigger asChild>
            <Button onClick={onActionClick}>
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

const Inner = styled.button<{ border?: boolean; isSelected?: boolean }>`
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  border: 1px solid ${({ border }) => (border ? "#383838" : "transparent")};
  border-radius: 6px;
  box-sizing: border-box;
  padding: 8px 20px 8px 4px;
  background: ${({ theme, isSelected }) => (isSelected ? theme.general.select : "inherit")};
  transition: all 0.15s;

  ${({ isSelected }) => isSelected && `background-color: #3B3CD0;`}
  :hover {
    ${({ isSelected }) => !isSelected && `background-color: #232226;`}
  }
`;

const StyledText = styled(Text)`
  flex-grow: 1;
  width: 0;
  word-break: break-all;
  text-align: left;
`;

const Button = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  margin-left: -1px;

  color: #4a4a4a;
`;
