import React, { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import AuthPage from "..";
import { PasswordPolicy as PasswordPolicyType } from "../common";

import NewPasswordForm from "./NewPasswordForm";

export type PasswordPolicy = PasswordPolicyType;

export type Props = {
  onPasswordResetRequest?: (email?: string) => any;
  onNewPasswordSubmit?: (newPassword?: string, email?: string, token?: string) => Promise<void>;
  passwordPolicy?: PasswordPolicy;
};

const PasswordReset: React.FC<Props> = ({
  onPasswordResetRequest,
  onNewPasswordSubmit,
  passwordPolicy,
}) => {
  const t = useT();
  const theme = useTheme();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const newPasswordToken = new URLSearchParams(window.location.search).toString().split("=")[1];

  useEffect(() => {
    if (!email) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [email]);

  const handleEmailInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = e.currentTarget.value;
      setEmail(newValue);
    },
    [],
  );

  const handlePasswordResetRequest = useCallback(async () => {
    setLoading(true);
    const res = await onPasswordResetRequest?.(email);
    if (res.status === 200) {
      setSent(true);
    }
    setLoading(false);
  }, [email, onPasswordResetRequest]);

  return (
    <AuthPage>
      {newPasswordToken ? (
        <NewPasswordForm
          onNewPasswordSubmit={onNewPasswordSubmit}
          passwordPolicy={passwordPolicy}
          newPasswordToken={newPasswordToken}
        />
      ) : sent ? (
        <SentFormWrapper direction="column" align="center" justify="center">
          <SentForm direction="column" align="center" justify="space-between">
            <Icon icon="mailCircle" color={theme.colors.brand.blue.strongest} />
            <Text size="l" customColor>
              {t("Check Your Email")}
            </Text>
            <Text size="m" customColor>
              {t("Please check your inbox for instructions on how to verify your account.")}
            </Text>
            <StyledButton
              className="form-item"
              large
              onClick={handlePasswordResetRequest}
              border
              color={theme.main.weak}
              background={theme.other.white}
              text={t("Resend email")}
            />
          </SentForm>
          <StyledLink to={"/login"}>
            <Text
              size="xs"
              color={theme.main.link}
              weight="bold"
              otherProperties={{ marginLeft: "6px" }}>
              {t("Go to log in page.")}
            </Text>
          </StyledLink>
        </SentFormWrapper>
      ) : (
        <>
          {loading && <Loading overlay />}
          <Icon className="form-item" icon="logoColorful" size={60} />
          <Text className="form-item" size="l" customColor>
            {t("Forgot Your Password?")}
          </Text>
          <Text className="form-item" size="s" customColor>
            {t(
              "Enter your email address and we will send you instructions to reset your password.",
            )}
          </Text>
          <StyledInput
            className="form-item"
            placeholder={t("Email address")}
            color={theme.main.weak}
            value={email}
            autoFocus
            onChange={handleEmailInput}
          />
          <StyledButton
            className="form-item"
            large
            onClick={handlePasswordResetRequest}
            disabled={disabled}
            color={disabled ? theme.main.text : theme.other.white}
            background={disabled ? theme.main.weak : theme.main.link}
            text={t("Continue")}
          />
          <StyledLink to={"/login"}>
            <Text size="xs" color={theme.main.link} weight="bold">
              {t("Go back to log in page")}
            </Text>
          </StyledLink>
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

const SentFormWrapper = styled(Flex)`
  width: 100%;
  height: 400px;
`;

const SentForm = styled(Flex)`
  height: 250px;
`;

export default PasswordReset;
