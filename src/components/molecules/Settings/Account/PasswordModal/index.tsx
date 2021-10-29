import React, { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import TextBox from "@reearth/components/atoms/TextBox";
import { styled, useTheme, metricsSizes } from "@reearth/theme";

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
  team?: {
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
  const intl = useIntl();
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [regexMessage, setRegexMessage] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [disabled, setDisabled] = useState(true);

  const handlePasswordChange = useCallback(
    (password: string) => {
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
    [intl, password], // eslint-disable-line react-hooks/exhaustive-deps
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
    if (password === passwordConfirmation && passwordPolicy?.highSecurity?.test(password)) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password, passwordConfirmation, passwordPolicy?.highSecurity]);

  return (
    <Modal
      size="sm"
      title={intl.formatMessage({ defaultMessage: "Change Password" })}
      isVisible={isVisible}
      onClose={handleClose}
      button1={
        <Button
          large
          disabled={disabled}
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Change password" })}
          onClick={handleSave}
        />
      }>
      {hasPassword ? (
        <div>
          <SubText>
            <Text size="m">
              {intl.formatMessage({
                defaultMessage: `In order to protect your account, make sure your password is unique and strong.`,
              })}
            </Text>
          </SubText>
          <PasswordField direction="column">
            <Text size="m">{intl.formatMessage({ defaultMessage: "New password" })}</Text>
            <TextBox
              type="password"
              borderColor={theme.main.border}
              value={password}
              onChange={handlePasswordChange}
              doesChangeEveryTime
              autofocus
              color={
                passwordPolicy?.whitespace?.test(password) ||
                passwordPolicy?.tooLong?.test(password)
                  ? theme.main.danger
                  : undefined
              }
            />
            <PasswordMessage size="xs">{password ? regexMessage : undefined}</PasswordMessage>
          </PasswordField>
          <PasswordField direction="column">
            <Text size="m">
              {intl.formatMessage({ defaultMessage: "New password (for confirmation)" })}
            </Text>
            <TextBox
              type="password"
              borderColor={theme.main.border}
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              doesChangeEveryTime
            />
          </PasswordField>
        </div>
      ) : (
        <div>
          <Text size="s">{intl.formatMessage({ defaultMessage: "New password" })}</Text>
          <TextBox
            type="password"
            borderColor={theme.main.border}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
          <Button
            large
            disabled={disabled}
            buttonType="primary"
            text={intl.formatMessage({ defaultMessage: "Set your password now" })}
            onClick={handleSave}
          />
        </div>
      )}
    </Modal>
  );
};

const SubText = styled.div`
  margin: ${({ theme }) => `${theme.metrics["xl"]}px auto`};
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
