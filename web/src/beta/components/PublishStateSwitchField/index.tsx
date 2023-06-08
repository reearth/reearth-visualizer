import styled from "@emotion/styled";
import { FC } from "react";

import Icon from "../Icon";

type Props = {
  icon: string;
  title: string;
};

const PublishStateSwitchField: FC<Props> = ({ icon, title }) => {
  return (
    <Box>
      <Icon
        icon={icon}
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "#4C4C4C",
          color: "#4C4C4C",
        }}
      />
      <Title>{title}</Title>
      <Icon
        icon={"arrowDown"}
        style={{
          width: "16px",
          height: "16px",
          color: "#888686",
        }}
      />
    </Box>
  );
};

const Box = styled.div`
  box-sizing: border-box;

  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 4px 20px;
  gap: 8px;

  right: 15px;
  top: calc(50% - 24px / 2 + 2px);

  border: 1px solid rgba(0, 0, 0, 0.25);
  border-radius: 6px;
`;

const Title = styled.text`
  font-family: "Noto Sans";
  font-weight: 500;
  font-size: 12px;

  display: flex;
  align-items: center;
  text-align: center;

  color: #888686;
`;

export default PublishStateSwitchField;
