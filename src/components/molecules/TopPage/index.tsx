import React from "react";
import { useIntl } from "react-intl";

import Icon from "@reearth/components/atoms/Icon";
import Button from "@reearth/components/atoms/Button";
import { styled } from "@reearth/theme";

export type Props = {
  path?: string;
  login: () => void;
};

const TopPage: React.FC<Props> = ({ children, login }) => {
  const intl = useIntl();

  return (
    <Wrapper>
      {children}
      <LeftWrapper>
        <Icon icon="logo" />
        <Button
          large
          buttonType="secondary"
          onClick={login}
          text={intl.formatMessage({ defaultMessage: "Sign in" })}
          margin="40px"
        />
      </LeftWrapper>
      <CenterWrapper>
        <StyledIcon icon="topPage" />
      </CenterWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  background: ${props => props.theme.main.deepBg};
  height: 100%;
  margin: 0;
  padding: 0;
  display: flex;
`;

const LeftWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${props => props.theme.main.lighterBg};
  width: 25vh;
`;

const CenterWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0 auto;
  color: ${props => props.theme.main.weak};
`;

const StyledIcon = styled(Icon)`
  float: right;
`;

export default TopPage;
