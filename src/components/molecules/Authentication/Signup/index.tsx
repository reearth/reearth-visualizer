import { Link } from "@reach/router";
import React, { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import AuthPage from "..";
import { PasswordPolicy as PasswordPolicyType } from "../common";

export type PasswordPolicy = PasswordPolicyType;

export type Props = {
  onSignup: (email?: string, username?: string, password?: string) => any;
  passwordPolicy?: PasswordPolicy;
};

const Signup: React.FC<Props> = ({ onSignup, passwordPolicy }) => {
  const intl = useIntl();
  const theme = useTheme();
  const [regexMessage, setRegexMessage] = useState("");
  const [username, setUsername] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const [disabled, setDisabled] = useState(true);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !email ||
      !username ||
      !password ||
      (passwordPolicy?.highSecurity && !passwordPolicy.highSecurity.test(password)) ||
      passwordPolicy?.tooShort?.test(password) ||
      passwordPolicy?.tooLong?.test(password)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [email, username, password, passwordPolicy]);

  const handleUsernameInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setUsername(newValue);
    },
    [],
  );
  const handleEmailInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setEmail(newValue);
    },
    [],
  );
  const handlePasswordInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const password = e.currentTarget.value;
      setPassword(password);
      switch (true) {
        case passwordPolicy?.whitespace?.test(password):
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "No whitespace is allowed.",
            }),
          );
          break;
        case passwordPolicy?.tooShort?.test(password):
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "Too short.",
            }),
          );
          break;
        case passwordPolicy?.tooLong?.test(password):
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "That is terribly long.",
            }),
          );
          break;
        case passwordPolicy?.highSecurity?.test(password):
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is great!" }));
          break;
        case passwordPolicy?.medSecurity?.test(password):
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is better." }));
          break;
        case passwordPolicy?.lowSecurity?.test(password):
          setRegexMessage(intl.formatMessage({ defaultMessage: "That password is okay." }));
          break;
        default:
          setRegexMessage(
            intl.formatMessage({
              defaultMessage: "That password confuses me, but might be okay.",
            }),
          );
          break;
      }
    },
    [password], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleSignup = useCallback(async () => {
    setLoading(true);
    const res = await onSignup(email, username, password);
    if (res.status === 200) {
      setSent(true);
    }
    setLoading(false);
  }, [email, username, password, onSignup]);

  return (
    <AuthPage>
      {!loading && sent ? (
        <SentFormWrapper direction="column" align="center" justify="center">
          <SentForm direction="column" align="center" justify="space-between">
            <Icon icon="mailCircle" color={theme.colors.brand.blue.strongest} />
            <Text size="l" customColor>
              {intl.formatMessage({ defaultMessage: "Check Your Email" })}
            </Text>
            <Text size="m" customColor>
              {intl.formatMessage({
                defaultMessage:
                  "Please check your inbox for instructions on how to verify your account.",
              })}
            </Text>
            <StyledButton
              className="form-item"
              large
              onClick={handleSignup}
              border
              color={theme.main.weak}
              background={theme.other.white}
              text={intl.formatMessage({ defaultMessage: "Resend email" })}
            />
          </SentForm>
          <StyledLink to={"/login"}>
            <Text
              size="xs"
              color={theme.main.link}
              weight="bold"
              otherProperties={{ marginLeft: "6px" }}>
              {intl.formatMessage({ defaultMessage: "Go to log in page." })}
            </Text>
          </StyledLink>
        </SentFormWrapper>
      ) : (
        <>
          {loading && <Loading overlay />}

          <Icon className="form-item" icon="logoColorful" size={60} />
          <Text className="form-item" size="l" customColor>
            {intl.formatMessage({ defaultMessage: "Create your Account" })}
          </Text>
          <StyledInput
            className="form-item"
            placeholder={intl.formatMessage({ defaultMessage: "Email address" })}
            color={theme.main.weak}
            value={email}
            autoFocus
            onChange={handleEmailInput}
          />
          <StyledInput
            className="form-item"
            placeholder={intl.formatMessage({ defaultMessage: "Username" })}
            color={theme.main.weak}
            value={username}
            autoFocus
            onChange={handleUsernameInput}
          />
          <PasswordWrapper direction="column">
            <StyledInput
              className="form-item"
              placeholder={intl.formatMessage({ defaultMessage: "Password" })}
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={handlePasswordInput}
              color={
                password
                  ? passwordPolicy?.tooLong?.test(password)
                    ? theme.main.danger
                    : passwordPolicy?.highSecurity?.test(password)
                    ? theme.main.accent
                    : theme.main.weak
                  : theme.main.weak
              }
            />
            <PasswordMessage size="xs" customColor>
              {password ? regexMessage : undefined}
            </PasswordMessage>
          </PasswordWrapper>
          <StyledButton
            className="form-item"
            large
            onClick={handleSignup}
            disabled={disabled}
            color={disabled ? theme.main.text : theme.other.white}
            background={disabled ? theme.main.weak : theme.main.link}
            text={intl.formatMessage({ defaultMessage: "Continue" })}
          />
          <Footer className="form-item">
            <Text size="xs" color={theme.main.weak}>
              {intl.formatMessage({ defaultMessage: "Already have an account?" })}
            </Text>
            <StyledLink to={"/login"}>
              <Text
                size="xs"
                color={theme.main.link}
                weight="bold"
                otherProperties={{ marginLeft: "6px" }}>
                {intl.formatMessage({ defaultMessage: "Log in" })}
              </Text>
            </StyledLink>
          </Footer>
        </>
      )}
    </AuthPage>
  );
};

const StyledButton = styled(Button)<{ color?: string; background?: string; border?: boolean }>`
  width: 100%;
  background: ${({ background }) => background};
  border: ${({ border, theme }) => (border ? `1px solid ${theme.main.borderStrong}` : "none")};
  border-radius: 2px;
  color: ${({ color }) => color};
  margin-top: 30px;

  :hover {
    color: ${({ color }) => color};
    background: ${({ background }) => background};
  }
`;

const StyledInput = styled.input<{ color?: string }>`
  width: 100%;
  box-sizing: border-box;
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  background: inherit;
  border: 1px solid ${({ theme }) => theme.main.border};
  border-radius: 3px;
  padding: ${metricsSizes.s}px;
  outline: none;
  ${({ color }) => color && `color: ${color};`}

  :focus {
    border: 1px solid ${({ theme }) => theme.main.link};
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
`;

const PasswordWrapper = styled(Flex)`
  width: 100%;
  color: ${({ theme }) => theme.text.pale};
`;

const PasswordMessage = styled(Text)`
  margin-left: ${metricsSizes.m}px;
  margin-top: ${metricsSizes["2xs"]}px;
  font-style: italic;
`;

const SentFormWrapper = styled(Flex)`
  width: 100%;
  height: 400px;
`;

const SentForm = styled(Flex)`
  height: 250px;
`;

const Footer = styled(Flex)`
  width: 100%;
`;

export default Signup;
