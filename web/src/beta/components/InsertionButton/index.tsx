import { FC } from "react";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";

type Props = {
  onClick?: () => void;
};

const InsertionButton: FC<Props> = ({ onClick }) => {
  const theme = useTheme();

  return (
    <Box onClick={onClick}>
      <Icon
        icon={"plus"}
        style={{
          width: "9.75px",
          height: "9.75px",
          background: theme.general.select,
          borderRadius: "50%",
          padding: "2px",
          color: theme.general.bg.transparent,
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
  cursor: pointer;
`;

const Border = styled.object`
  height: 1px;
  width: 100%;

  background: ${props => props.theme.general.select};
  border-radius: 1px;
`;
export default InsertionButton;
