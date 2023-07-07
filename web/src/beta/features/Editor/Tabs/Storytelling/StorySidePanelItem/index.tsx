import { FC, ReactNode } from "react";

import Icon from "@reearth/beta/components/Icon";
import Text from "@reearth/beta/components/Text";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  children: ReactNode;
};

const StorySidePanelItem: FC<Props> = ({ children }) => {
  const theme = useTheme();

  return (
    <SWrapper>
      <SText>
        <Text size={"footnote"}>{children}</Text>
      </SText>
      <SButton>
        <Icon icon={"actionbutton"} size={16} color={theme.general.content.main} />
      </SButton>
    </SWrapper>
  );
};

export default StorySidePanelItem;

const SWrapper = styled.button`
  display: flex;
  border: 1px solid #383838;
  border-radius: 6px;
  box-sizing: border-box;
  padding: 8px 4px;
`;

const SText = styled.div`
  flex-grow: 1;
  width: 0;
  word-break: break-all;
  text-align: left;
`;

const SButton = styled.button``;
