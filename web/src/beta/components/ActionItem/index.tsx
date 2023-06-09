import styled from "@emotion/styled";
import { FC } from "react";

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
      <Icon icon={icon} style={{ width: "8px", height: "8px" }} />
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

  background: #232226;
  :hover {
    background: #2b2a2f;
  }
`;

export default ActionItem;
