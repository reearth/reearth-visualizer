import styled from "@emotion/styled";
import { FC } from "react";

import Icon from "../Icon";

type Props = {
  onClick?: () => void;
};

const InsertionButton: FC<Props> = ({ onClick }) => {
  return (
    <Box onClick={onClick}>
      <Icon
        icon={"plus"}
        style={{
          width: "9.75px",
          height: "9.75px",
          background: "#3b3cd0",
          borderRadius: "50%",
          padding: "2px",
          color: "black",
        }}
      />
      <Border />
    </Box>
  );
};

const Box = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 2px 0px;
  gap: 4px;

  border-radius: 6px;
  opacity: 0;

  &:hover {
    opacity: 1;
    transition: all 0.5s ease;
  }
`;

const Border = styled.object`
  height: 1px;
  width: 100%;

  background: #3b3cd0;
  border-radius: 1px;
`;
export default InsertionButton;
