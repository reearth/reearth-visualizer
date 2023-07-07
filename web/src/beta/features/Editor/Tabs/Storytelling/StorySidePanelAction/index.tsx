import { FC } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../../../../../components/Icon";
import Text from "../../../../../components/Text";

type Props = {
  icon: string;
  title: string;
  onClick?: () => void;
};

const StorySidePanelAction: FC<Props> = ({ icon, title, onClick }) => {
  const theme = useTheme();

  return (
    <Wrapper onClick={onClick} type="button">
      <Icon icon={icon} size={8} />
      <Text
        size={"footnote"}
        color={theme.general.content.main}
        otherProperties={{ wordBreak: "break-all" }}>
        {title}
      </Text>
    </Wrapper>
  );
};

const Wrapper = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
  padding: 8px 12px;
  gap: 8px;
  border-radius: 6px;

  min-height: 28px;
  transition: all 0.15s;

  border: 1px solid #383838;

  :hover {
    background: ${props => props.theme.general.bg.weak};
  }
  user-select: none;
  cursor: pointer;
`;

export default StorySidePanelAction;
