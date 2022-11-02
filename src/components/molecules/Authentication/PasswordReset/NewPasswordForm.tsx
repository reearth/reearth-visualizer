import React, { useState, useCallback, useEffect } from "react";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { metricsSizes, styled, useTheme } from "@reearth/theme";

import { PasswordPolicy as PasswordPolicyType } from "../common";

export type PasswordPolicy = PasswordPolicyType;

export type Props = {
  onNewPasswordSubmit?: (newPassword?: string, email?: string, token?: string) => Promise<void>;
  passwordPolicy?: PasswordPolicy;
  newPasswordToken?: string;
};

const NewPasswordForm: React.FC<Props> = ({
  onNewPasswordSubmit,
  passwordPolicy,
  newPasswordToken,
}) => {
  const t = useT();
  const theme = useTheme();
  const [newPassword, setNewPassword] = useState<string>("");
  const [email, setEmail] = useState<string>();
  const [disabled, setDisabled] = useState(true);
  const [regexMessage, setRegexMessage] = useState<string | undefined | null>();

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
      setNewPassword(password);
      switch (true) {
        case passwordPolicy?.whitespace?.test(password):
          setRegexMessage(t("No whitespace is allowed."));
          break;
        case passwordPolicy?.tooShort?.test(password):
          setRegexMessage(t("Too short."));
          break;
        case passwordPolicy?.tooLong?.test(password):
          setRegexMessage(t("That is terribly long."));
          break;
        case passwordPolicy?.highSecurity?.test(password):
          setRegexMessage(t("That password is great!"));
          break;
        case passwordPolicy?.medSecurity?.test(password):
          setRegexMessage(t("That password is better."));
          break;
        case passwordPolicy?.lowSecurity?.test(password):
          setRegexMessage(t("That password is okay."));
          break;
        default:
          setRegexMessage(t("That password confuses me, but might be okay."));
          break;
      }
    },
    [newPassword], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handlePasswordSubmit = useCallback(() => {
    onNewPasswordSubmit?.(newPassword, email, newPasswordToken);
  }, [newPassword, email, newPasswordToken, onNewPasswordSubmit]);

  useEffect(() => {
    if (
      (passwordPolicy?.highSecurity && !passwordPolicy.highSecurity.test(newPassword)) ||
      passwordPolicy?.tooShort?.test(newPassword) ||
      passwordPolicy?.tooLong?.test(newPassword)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [newPassword, passwordPolicy]);

  return (
    <>
      <Text className="form-item" size="l" customColor>
        {t("Change Your Password")}
      </Text>
      <Text className="form-item" size="s" customColor>
        {t("Enter a new password below to change your password.")}
      </Text>
      <StyledInput
        className="form-item"
        placeholder={t("Email address")}
        color={theme.main.weak}
        value={email}
        autoFocus
        onChange={handleEmailInput}
      />
      <PasswordWrapper direction="column">
        <StyledInput
          className="form-item"
          name="password"
          placeholder={t("New password")}
          type="password"
          autoComplete="new-password"
          color={theme.main.weak}
          value={newPassword}
          onChange={handlePasswordInput}
        />
        <PasswordMessage size="xs" customColor>
          {newPassword ? regexMessage : undefined}
        </PasswordMessage>
      </PasswordWrapper>
      <StyledButton
        className="form-item"
        large
        onClick={handlePasswordSubmit}
        disabled={disabled}
        color={disabled ? theme.main.text : theme.other.white}
        background={disabled ? theme.main.weak : theme.main.link}
        text={t("Reset password")}
      />
    </>
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

const PasswordWrapper = styled(Flex)`
  width: 100%;
  color: ${({ theme }) => theme.text.pale};
`;

const PasswordMessage = styled(Text)`
  margin-left: ${metricsSizes.m}px;
  margin-top: ${metricsSizes["2xs"]}px;
  font-style: italic;
`;

export default NewPasswordForm;
