import React from "react";
import { styled } from "@reearth/theme";
import Icon from "@reearth/components/atoms/Icon";

export type Props = {
  className?: string;
  title?: string;
  onBack?: () => void;
};

const Header: React.FC<Props> = ({ className, title, onBack }) => {
  return (
    <Wrapper className={className}>
      <StyledIcon icon="arrowLeft" size={16} onClick={onBack} />
      <Title>{title}</Title>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  overflow: hidden;
  height: 32px;
`;

const Title = styled.div`
  padding: 0 0.5em;
  flex: auto;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`;

const StyledIcon = styled(Icon)`
  cursor: pointer;
  user-select: none;
  margin-left: 5px;
`;

export default Header;
