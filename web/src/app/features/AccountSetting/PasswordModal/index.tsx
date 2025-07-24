import { Flex } from "@aws-amplify/ui-react";
import {
  Modal,
  Button,
  ModalPanel,
  Typography,
  TextInput,
  Icon
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import React, { useState, useCallback, useEffect } from "react";

export type PasswordPolicy = {
  tooShort?: RegExp;
  tooLong?: RegExp;
  whitespace?: RegExp;
  lowSecurity?: RegExp;
  medSecurity?: RegExp;
  highSecurity?: RegExp;
};

type Props = {
  isVisible: boolean;
  onClose?: () => void;
  passwordPolicy?: PasswordPolicy;
  handleUpdateUserPassword?: ({
    password,
    passwordConfirmation
  }: {
    password: string;
    passwordConfirmation: string;
  }) => void;
};

const PasswordModal: React.FC<Props> = ({
  isVisible,
  onClose,
  passwordPolicy,
  handleUpdateUserPassword
}) => {
  const t = useT();
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [regexMessage, setRegexMessage] = useState<string | undefined | null>();
  const [regexMessageColor, setRegexMessageColor] = useState<
    string | undefined
  >();
  const [passwordConfirmation, setPasswordConfirmation] = useState<string>();
  const [disabled, setDisabled] = useState(true);

  const handlePasswordChange = useCallback(
    (password: string | undefined) => {
      setPassword(password ?? "");
      switch (true) {
        case passwordPolicy?.whitespace?.test(password ?? ""):
          setRegexMessage(t("No whitespace is allowed."));
          setRegexMessageColor(theme.warning.main);
          break;
        case passwordPolicy?.tooShort?.test(password ?? ""):
          setRegexMessage(t("Too short."));
          setRegexMessageColor(theme.warning.main);
          break;
        case passwordPolicy?.tooLong?.test(password ?? ""):
          setRegexMessage(t("That is terribly long."));
          setRegexMessageColor(theme.warning.main);
          break;
        case passwordPolicy?.highSecurity?.test(password ?? ""):
          setRegexMessage(t("That password is great!"));
          setRegexMessageColor(theme.primary.main);
          break;
        case passwordPolicy?.medSecurity?.test(password ?? ""):
          setRegexMessage(t("That password need more security."));
          setRegexMessageColor(theme.warning.main);
          break;
        case passwordPolicy?.lowSecurity?.test(password ?? ""):
          setRegexMessage(t("That password is low security."));
          setRegexMessageColor(theme.dangerous.main);
          break;
        default:
          setRegexMessage(t("That password confuses me, but might be okay."));
          break;
      }
    },
    [t, passwordPolicy, theme]
  );

  const handleClose = useCallback(() => {
    setPassword("");
    setPasswordConfirmation("");
    onClose?.();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (password === passwordConfirmation) {
      handleUpdateUserPassword?.({ password, passwordConfirmation });
      handleClose();
    }
  }, [handleUpdateUserPassword, handleClose, password, passwordConfirmation]);

  useEffect(() => {
    if (
      password !== passwordConfirmation ||
      (passwordPolicy?.highSecurity &&
        !passwordPolicy.highSecurity.test(password)) ||
      passwordPolicy?.tooShort?.test(password) ||
      passwordPolicy?.tooLong?.test(password)
    ) {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [password, passwordConfirmation, passwordPolicy]);

  const isMatchPassword =
    password !== passwordConfirmation && passwordConfirmation;

  return (
    <Modal size="small" visible={isVisible}>
      <ModalPanel
        title={t("Change password")}
        onCancel={handleClose}
        actions={[
          <Button
            key="Change password"
            title={t("Change password")}
            appearance="dangerous"
            disabled={disabled}
            onClick={handleSave}
          />
        ]}
      >
        <ModalContentWrapper>
          <Typography size="body">
            {t(
              `In order to protect your account, make sure your password is unique and strong.`
            )}
          </Typography>
          <PasswordField direction="column">
            <Typography size="body">{t("New password")}</Typography>
            <TextInput
              value={password}
              onChange={handlePasswordChange}
              type="password"
            />
            {password ? (
              <PasswordMessage size="body" color={regexMessageColor}>
                {regexMessage}
              </PasswordMessage>
            ) : undefined}
          </PasswordField>
          <PasswordField direction="column">
            <Typography size="body">
              {t("New password (for confirmation)")}
            </Typography>
            <TextInput
              value={passwordConfirmation}
              onChange={setPasswordConfirmation}
              type="password"
            />
            {isMatchPassword ? (
              <PasswordMessage
                size="body"
                weight="regular"
                color={theme.dangerous.main}
              >
                <Icon
                  icon="warning"
                  size="large"
                  color={theme.dangerous.main}
                />
                {t('"repeatPassword" Passwords need to match')}
              </PasswordMessage>
            ) : undefined}
          </PasswordField>
        </ModalContentWrapper>
      </ModalPanel>
    </Modal>
  );
};

const ModalContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.large,
  padding: theme.spacing.large,
  background: theme.bg[1]
}));

const PasswordField = styled(Flex)(({ theme }) => ({
  height: "50px",
  transition: "all 0.2s",
  "& > *:first-child": {
    marginBottom: theme.spacing.small
  },
  "&:has(p ~ p)": {
    height: "68px"
  }
}));

const PasswordMessage = styled(Typography)(({ theme }) => ({
  marginTop: theme.spacing.small,
  display: "flex",
  gap: theme.spacing.small
}));

export default PasswordModal;
