import { Link } from "@reach/router";
import React, { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import AuthPage from "..";

const Login: React.FC = () => {
  const intl = useIntl();
  const theme = useTheme();
  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [disabled, setDisabled] = useState(true);

  useEffect(() => {
    setDisabled(!username || !password);
  }, [username, password]);

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

  return (
    <AuthPage>
      <Icon className="form-item" icon="logoColorful" size={60} />
      <Text className="form-item" size="l" customColor>
        {intl.formatMessage({ defaultMessage: "Welcome" })}
      </Text>
      <Text className="form-item" size="s" customColor>
        {intl.formatMessage({ defaultMessage: "Log in to Re:Earth to continue." })}
      </Text>
      <StyledForm
        id="login-form"
        action={`${window.REEARTH_CONFIG?.api || "/api"}/login`}
        method="post">
        <input
          type="hidden"
          name="id"
          value={new URLSearchParams(window.location.search).get("id") ?? undefined}
        />
        <StyledInput
          className="form-item"
          name="username"
          placeholder={intl.formatMessage({ defaultMessage: "Username or email" })}
          color={theme.main.weak}
          value={username}
          autoFocus
          onChange={handleUsernameInput}
        />
        <StyledInput
          className="form-item"
          name="password"
          placeholder={intl.formatMessage({ defaultMessage: "Password" })}
          type="password"
          autoComplete="new-password"
          color={theme.main.weak}
          value={password}
          onChange={handlePasswordInput}
        />
        <div style={{ width: "100%" }}>
          <StyledLink to={"/password-reset"}>
            <Text
              className="form-item"
              size="xs"
              color={theme.main.link}
              otherProperties={{ display: "inline-block" }}>
              {intl.formatMessage({ defaultMessage: "Forgot password?" })}
            </Text>
          </StyledLink>
        </div>
        <StyledButton
          className="form-item"
          large
          type="submit"
          disabled={disabled}
          color={disabled ? theme.main.text : theme.other.white}
          background={disabled ? theme.main.weak : theme.main.link}
          text={intl.formatMessage({ defaultMessage: "Continue" })}
        />
      </StyledForm>
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

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  > .form-item {
    margin-bottom: 24px;
  }
`;

const StyledButton = styled(Button)<{ color?: string; background?: string; border?: boolean }>`
  width: 100%;
  background: ${({ background }) => background};
  border: ${({ border, theme }) => (border ? `1px solid ${theme.main.borderStrong}` : "none")};
  border-radius: 2px;
  color: ${({ color }) => color};

  :hover {
    color: ${({ color }) => color};
    background: ${({ background }) => background};
  }
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
    border: 2px solid ${({ theme }) => theme.main.link};
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
