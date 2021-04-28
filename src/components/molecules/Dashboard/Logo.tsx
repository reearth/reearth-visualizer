import React from "react";
import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";

export interface Props {
  className?: string;
}

const Logo: React.FC<Props> = ({ className }) => {
  return (
    <Wrapper className={className}>
      <Icon icon="logo" />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  min-width: 155px;
  flex-grow: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.main.text};
  margin: 14px;

  @media only screen and (max-width: 1024px) {
    order: 1;
    flex-grow: 2;
    height: 180px;
    min-width: 180px;
  }
`;

export default Logo;
