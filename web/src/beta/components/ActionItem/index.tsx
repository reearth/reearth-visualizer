import { FC } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";
import Text from "../Text";

type Props = {
  icon: string;
  title: string;
  onClick?: () => void;
};

const ActionItem: FC<Props> = ({ icon, title, onClick }) => {
  const theme = useTheme();

  return (
    <Box onClick={onClick}>
      <Icon icon={icon} size={8} />
      <Text
        size={"footnote"}
        color={theme.general.content.main}
        otherProperties={{ wordBreak: "break-all" }}>
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

  min-height: 28px;

  background: ${props => props.theme.general.bg.main};
  :hover {
    background: ${props => props.theme.general.bg.weak};
  }
  user-select: none;
  cursor: pointer;
`;

export default ActionItem;
