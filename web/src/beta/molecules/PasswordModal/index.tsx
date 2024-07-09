import React, { useState, useCallback, useEffect } from "react";

import Button from "@reearth/beta/components/Button";
import Flex from "@reearth/beta/components/Flex";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import TextBox from "@reearth/beta/components/TextBox";
import { metricsSizes } from "@reearth/beta/utils/metrics";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

export type PasswordPolicy = {
  tooShort?: RegExp;
  tooLong?: RegExp;
  whitespace?: RegExp;
  lowSecurity?: RegExp;
  medSecurity?: RegExp;
  highSecurity?: RegExp;
};

type Props = {
  className?: string;
  project?: {
    id: string;
    name: string;
    isArchived: boolean;
  };
  workspace?: {
    id: string;
    name: string;
  };
  isVisible: boolean;
  archiveProject?: (archived: boolean) => void;
  onClose?: () => void;
  hasPassword: boolean;
  passwordPolicy?: PasswordPolicy;
  updatePassword?: (password: string, passwordConfirmation: string) => void;
};

const PasswordModal: React.FC<Props> = ({
  isVisible,
  onClose,
  hasPassword,
  passwordPolicy,
  updatePassword,
}) => {
  const t = useT();
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [regexMessage, setRegexMessage] = useState<string | undefined | null>();
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>();
  const [disabled, setDisabled] = useState(true);

  const handlePasswordChange = useCallback(
    (password: string | undefined) => {
      setPassword(password ?? "");
      switch (true) {
        case passwordPolicy?.whitespace?.test(password ?? ""):
          setRegexMessage(t("No whitespace is allowed."));
          break;
        case passwordPolicy?.tooShort?.test(password ?? ""):
          setRegexMessage(t("Too short."));
          break;
        case passwordPolicy?.tooLong?.test(password ?? ""):
          setRegexMessage(t("That is terribly long."));
          break;
        case passwordPolicy?.highSecurity?.test(password ?? ""):
          setRegexMessage(t("That password is great!"));
          break;
        case passwordPolicy?.medSecurity?.test(password ?? ""):
          setRegexMessage(t("That password is better."));
          break;
        case passwordPolicy?.lowSecurity?.test(password ?? ""):
          setRegexMessage(t("That password is okay."));
          break;
        default:
          setRegexMessage(t("That password confuses me, but might be okay."));
          break;
      }
    },
    [t, password], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const handleClose = useCallback(() => {
    setPassword("");
    setPasswordConfirmation("");
    onClose?.();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (password === passwordConfirmation) {
      updatePassword?.(password, passwordConfirmation);
      handleClose();
    }
  }, [updatePassword, handleClose, password, passwordConfirmation]);

  useEffect(() => {
    if (
      password !== passwordConfirmation ||
      (passwordPolicy?.highSecurity && !passwordPolicy.highSecurity.test(password)) ||
      passwordPolicy?.tooShort?.test(password) ||
      passwordPolicy?.tooLong?.test(password)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [password, passwordConfirmation, passwordPolicy]);

  return (
    <Modal
      size="sm"
      title={t("Change Password")}
      isVisible={isVisible}
      onClose={handleClose}
      button1={
        <Button
          disabled={disabled}
          buttonType="primary"
          text={t("Change password")}
          onClick={handleSave}
        />
      }>
      {hasPassword ? (
        <div>
          <SubText>
            <Text size="body">
              {t(`In order to protect your account, make sure your password is unique and strong.`)}
            </Text>
          </SubText>
          <PasswordField direction="column">
            <Text size="body">{t("New password")}</Text>
            <TextBox
              type="password"
              borderColor={theme.classic.main.border}
              value={password}
              onChange={handlePasswordChange}
              doesChangeEveryTime
              autofocus
              color={
                passwordPolicy?.tooLong?.test(password)
                  ? theme.classic.main.danger
                  : passwordPolicy?.highSecurity?.test(password)
                    ? theme.classic.main.accent
                    : undefined
              }
            />
            <PasswordMessage size="body">{password ? regexMessage : undefined}</PasswordMessage>
          </PasswordField>
          <PasswordField direction="column">
            <Text size="body">{t("New password (for confirmation)")}</Text>
            <TextBox
              type="password"
              borderColor={theme.classic.main.border}
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              doesChangeEveryTime
              color={password === passwordConfirmation ? theme.classic.main.accent : undefined}
            />
          </PasswordField>
        </div>
      ) : (
        <div>
          <Text size="footnote">{t("New password")}</Text>
          <TextBox
            type="password"
            borderColor={theme.classic.main.border}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
          <Button
            disabled={disabled}
            buttonType="primary"
            text={t("Set your password now")}
            onClick={handleSave}
          />
        </div>
      )}
    </Modal>
  );
};

const SubText = styled.div`
  margin: ${({ theme }) => `${theme.classic.metrics["xl"]}px auto`};
`;

const PasswordField = styled(Flex)`
  height: 75px;
`;

const PasswordMessage = styled(Text)`
  margin-left: ${metricsSizes.m}px;
  margin-top: ${metricsSizes["2xs"]}px;
  font-style: italic;
`;

export default PasswordModal;
