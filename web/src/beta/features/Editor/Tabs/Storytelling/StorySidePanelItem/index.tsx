import { FC, ReactNode, useCallback } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled } from "@reearth/services/theme";

type Props = {
  children: ReactNode;
  onItemClick(): void;
};

const StorySidePanelItem: FC<Props> = ({ children, onItemClick }) => {
  const onActionClick = useCallback(() => {
    console.log("open popover");
  }, []);

  return (
    <SWrapper>
      <SInner onClick={onItemClick}>
        <SText>
          <Text size={"footnote"}>{children}</Text>
        </SText>
      </SInner>
      <SButton onClick={onActionClick}>
        <Icon icon={"actionbutton"} size={12} />
      </SButton>
    </SWrapper>
  );
};

export default StorySidePanelItem;

const SWrapper = styled.div`
  position: relative;
  width: 100%;
`;

const SInner = styled.button`
  display: flex;
  width: 100%;
  min-height: 38px;
  align-items: center;
  border: 1px solid #383838;
  border-radius: 6px;
  box-sizing: border-box;
  padding: 8px 20px 8px 4px;

  transition: all 0.15s;
  :hover {
    background-color: #232226;
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

  color: #4a4a4a;
`;
