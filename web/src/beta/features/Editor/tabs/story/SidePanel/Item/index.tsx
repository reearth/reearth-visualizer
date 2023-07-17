import { FC, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import * as Popover from "@reearth/beta/components/Popover";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type Props = {
  children: ReactNode;
  onItemClick(id: string): void;
  onActionClick?: () => void;
  actionContent?: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  isOpenAction?: boolean;
  isActive: boolean;
};

const StorySidePanelItem: FC<Props> = ({
  children,
  onItemClick,
  onActionClick,
  actionContent,
  onOpenChange,
  isOpenAction,
  isActive,
}) => {
  return (
    <Wrapper>
      <Inner onClick={() => onItemClick("id")} isActive={isActive}>
        <SText>
          <Text size="footnote">{children}</Text>
        </SText>
      </Inner>
      {actionContent && (
        <Popover.Provider open={isOpenAction} onOpenChange={onOpenChange}>
          <Popover.Trigger asChild>
            <SButton onClick={onActionClick}>
              <Icon icon="actionbutton" size={12} />
            </SButton>
          </Popover.Trigger>
          <Popover.Content>{actionContent}</Popover.Content>
        </Popover.Provider>
      )}
    </Wrapper>
  );
};

export default StorySidePanelItem;

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const Inner = styled.button<{ isActive: boolean }>`
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  border: 1px solid #383838;
  border-radius: 6px;
  box-sizing: border-box;
  padding: 8px 20px 8px 4px;

  transition: all 0.15s;

  ${({ isActive }) => isActive && `background-color: #3B3CD0;`}
  :hover {
    ${({ isActive }) => !isActive && `background-color: #232226;`}
  }
`;

const SText = styled.div`
  flex-grow: 1;
  width: 0;
  word-break: break-all;
  text-align: left;
`;

const SButton = styled.button`
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  padding: 4px;
  margin-left: -1px;

  color: #4a4a4a;
`;
