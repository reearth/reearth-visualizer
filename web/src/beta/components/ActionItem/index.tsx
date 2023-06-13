import { FC } from "react";

import { styled } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

type Props = {
  icon: string;
  title: string;
  onClick?: () => void;
};

const ActionItem: FC<Props> = ({ icon, title, onClick }) => {
  return (
    <Box onClick={onClick}>
      <Icon icon={icon} size={8} />
      <Text size={"s"} color={"#c7c5c5"}>
        {title}
      </Text>
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 12px;
  gap: 8px;

  height: 28px;

  background: ${props => props.theme.main.paleBg};
  :hover {
    background: ${props => props.theme.main.bg};
  }
`;

export default ActionItem;
