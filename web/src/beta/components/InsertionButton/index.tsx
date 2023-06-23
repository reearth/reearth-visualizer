import { FC } from "react";

import { styled } from "@reearth/services/theme";

import Icon from "../Icon";

type Props = {
  onClick?: () => void;
};

const InsertionButton: FC<Props> = ({ onClick }) => {
  return (
    <Box onClick={onClick}>
      <StyledIcon icon={"plus"} size={9.75} />
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

  :hover {
    opacity: 1;
    transition: all 0.5s ease;
  }
  :not(:hover) {
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

const StyledIcon = styled(Icon)`
  background: ${props => props.theme.general.select};
  border-radius: 50%;
  padding: 2px;
  color: ${props => props.theme.general.bg.transparent};
`;

export default InsertionButton;
