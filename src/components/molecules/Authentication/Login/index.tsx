import { Link } from "@reach/router";
import React, { useState, useCallback } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import AuthPage from "..";

export type Props = {
  onLogin: (username: string, password: string) => void;
};

const Login: React.FC<Props> = ({ onLogin }) => {
  const intl = useIntl();
  const theme = useTheme();
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleUsernameInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setUsername(newValue);
    },
    [],
  );

  const handlePasswordInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setPassword(newValue);
    },
    [],
  );

  const handleLogin = useCallback(() => {
    onLogin(username, password);
  }, [username, password, onLogin]);

  return (
    <AuthPage>
      <Icon className="form-item" icon="logoColorful" size={60} />
      <Text className="form-item" size="l" customColor>
        {intl.formatMessage({ defaultMessage: "Welcome" })}
      </Text>
      <Text className="form-item" size="s" customColor>
        {intl.formatMessage({ defaultMessage: "Log in to Re:Earth to continue." })}
      </Text>
      <StyledInput
        className="form-item"
        placeholder={intl.formatMessage({ defaultMessage: "Username or email" })}
        color={theme.main.weak}
        value={username}
        onChange={handleUsernameInput}
      />
      <StyledInput
        className="form-item"
        placeholder={intl.formatMessage({ defaultMessage: "Password" })}
        type="password"
        autoComplete="new-password"
        color={theme.main.weak}
        value={password}
        onChange={handlePasswordInput}
      />
      <StyledLink to={"/reset-password"} style={{ width: "100%", alignSelf: "left" }}>
        <Text className="form-item" size="xs" color={theme.main.link}>
          {intl.formatMessage({ defaultMessage: "Forgot password?" })}
        </Text>
      </StyledLink>
      <StyledButton
        className="form-item"
        large
        disabled // ************ disabled until backend is setup ************
        onClick={handleLogin}
        text={intl.formatMessage({ defaultMessage: "Continue" })}
      />
      <Footer className="form-item">
        <Text size="xs" color={theme.main.weak}>
          {intl.formatMessage({ defaultMessage: "Don't have an account?" })}
        </Text>
        <StyledLink to={"/signup"}>
          <Text
            size="xs"
            color={theme.main.link}
            weight="bold"
            otherProperties={{ marginLeft: "6px" }}>
            {intl.formatMessage({ defaultMessage: "Sign up" })}
          </Text>
        </StyledLink>
      </Footer>
    </AuthPage>
  );
};

const StyledButton = styled(Button)`
  width: 100%;
  background: ${({ theme }) => theme.main.link};
  border: none;
  border-radius: 2px;
  color: ${({ theme }) => theme.other.white};
`;

const StyledInput = styled.input`
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  background: inherit;
  border: 1px solid ${({ theme }) => theme.main.border};
  border-radius: 3px;
  padding: ${metricsSizes.s}px;
  outline: none;

  :focus {
    border: 2px solid ${({ theme }) => theme.main.brandBlue};
    margin: -1px -1px 23px -1px;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const Footer = styled(Flex)`
  width: 100%;
`;

export default Login;
