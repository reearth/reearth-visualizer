import { Flex } from "@aws-amplify/ui-react";
import {
  Modal,
  Button,
  ModalPanel,
  Typography,
  TextInput,
  Icon
} from "@reearth/beta/lib/reearth-ui";
import { metricsSizes } from "@reearth/beta/utils/metrics";
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
  onPasswordUpdate?: ({
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
  onPasswordUpdate
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
    [t, passwordPolicy]
  );

  const handleClose = useCallback(() => {
    setPassword("");
    setPasswordConfirmation("");
    onClose?.();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (password === passwordConfirmation) {
      onPasswordUpdate?.({ password, passwordConfirmation });
      handleClose();
    }
  }, [onPasswordUpdate, handleClose, password, passwordConfirmation]);

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
          <div>
            <SubText>
              <Typography size="body" weight="bold">
                {t(
                  `In order to protect your account, make sure your password is unique and strong.`
                )}
              </Typography>
            </SubText>
            <PasswordField direction="column">
              <Typography size="body" weight="bold">
                {t("New password")}
              </Typography>
              <TextInput
                value={password}
                onChange={handlePasswordChange}
                type="password"
              />
              {password ? (
                <PasswordMessage size="body" weight="bold">
                  {regexMessage}
                </PasswordMessage>
              ) : undefined}
            </PasswordField>
            <PasswordField direction="column">
              <Typography size="body" weight="bold">
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
                  <span>
                    <Icon
                      icon="warning"
                      size="large"
                      color={theme.dangerous.main}
                    />
                  </span>
                  {t('"repeatPassword" Passwords need to match')}
                </PasswordMessage>
              ) : undefined}
            </PasswordField>
          </div>
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

const SubText = styled.div`
  margin: ${({ theme }) => `${theme.spacing.large}px auto`};
`;

const PasswordField = styled(Flex)`
  height: 50px;
  transition: all 0.2s;
  &:has(p ~ p) {
    height: 68px;
  }
`;

const PasswordMessage = styled(Typography)`
  margin-top: ${metricsSizes["s"]}px;
  font-style: italic;
  display: flex;
`;

export default PasswordModal;
