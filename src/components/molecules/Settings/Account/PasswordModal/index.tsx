import React, { useState, useCallback, useEffect } from "react";
import { useIntl } from "react-intl";

import { styled, useTheme } from "@reearth/theme";
import Modal from "@reearth/components/atoms/Modal";
import Button from "@reearth/components/atoms/Button";
import TextBox from "@reearth/components/atoms/TextBox";
import Text from "@reearth/components/atoms/Text";

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
  updatePassword?: (password: string, passwordConfirmation: string) => void;
};

const PasswordModal: React.FC<Props> = ({ isVisible, onClose, hasPassword, updatePassword }) => {
  const intl = useIntl();
  const theme = useTheme();

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [disabled, setDisabled] = useState(true);

  const handleClose = useCallback(() => {
    setPassword("");
    setPasswordConfirmation("");
    onClose?.();
  }, [onClose]);

  const save = useCallback(() => {
    if (password === passwordConfirmation) {
      updatePassword?.(password, passwordConfirmation);
      handleClose();
    }
  }, [updatePassword, handleClose, password, passwordConfirmation]);

  useEffect(() => {
    if (password !== passwordConfirmation || password === "" || passwordConfirmation === "") {
      setDisabled(true);
    } else {
      setDisabled(false);
    }
  }, [password, passwordConfirmation]);

  return (
    <Modal
      title={intl.formatMessage({ defaultMessage: "Change Password" })}
      isVisible={isVisible}
      onClose={handleClose}
      button1={
        <Button
          large
          disabled={disabled}
          buttonType="primary"
          text={intl.formatMessage({ defaultMessage: "Change your password now" })}
          onClick={save}
        />
      }>
      {hasPassword ? (
        <div>
          <Text size="s" color={theme.main.text} otherProperties={{ margin: "22px auto" }}>
            <p>
              {intl.formatMessage({
                defaultMessage: `In order to protect your account, make sure your password:`,
              })}
            </p>
            <StyledList>
              <li>
                {intl.formatMessage({
                  defaultMessage: `Is Longer than 8 characters`,
                })}
              </li>
              <li>
                {intl.formatMessage({
                  defaultMessage: `At least 2 different numbers`,
                })}
              </li>
              <li>
                {intl.formatMessage({
                  defaultMessage: `Use lowercase and uppercase letters`,
                })}
              </li>
            </StyledList>
          </Text>
          <Label size="s">
            {intl.formatMessage({ defaultMessage: "New password" })}
            {/* {intl.formatMessage({
                defaultMessage:
                  "8 characters or more, 2 types or more from numbers, lowercase letters, uppercase letters",
              })} */}
          </Label>
          <StyledTextBox
            type="password"
            borderColor={"#3f3d45"}
            value={password}
            onChange={setPassword}
          />
          <Label size="s">
            {intl.formatMessage({ defaultMessage: "New password (for confirmation)" })}
          </Label>
          <StyledTextBox
            type="password"
            borderColor={"#3f3d45"}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
        </div>
      ) : (
        <div>
          <Label size="s">{intl.formatMessage({ defaultMessage: "New password" })}</Label>
          <StyledTextBox
            type="password"
            borderColor={"#3f3d45"}
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
          />
          <Button
            large
            disabled={disabled}
            buttonType="primary"
            text={intl.formatMessage({ defaultMessage: "Set your password now" })}
            onClick={save}
          />
        </div>
      )}
    </Modal>
  );
};

const StyledTextBox = styled(TextBox)`
  padding: 0;
  margin: 20px -5px 40px;
`;

const Label = styled(Text)`
  margin: 20px auto;
`;

const StyledList = styled.ul`
  margin: 20px auto;
`;
export default PasswordModal;
