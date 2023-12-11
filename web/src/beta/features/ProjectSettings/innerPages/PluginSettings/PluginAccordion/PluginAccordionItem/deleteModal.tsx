import React from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";
import { useTheme } from "@reearth/services/theme";

export type Props = {
  isOpen: boolean;
  onProceed: () => void;
  onCancel: () => void;
};

const DeleteModal: React.FC<Props> = ({ isOpen, onProceed, onCancel }) => {
  const t = useT();
  const theme = useTheme();
  return (
    <Modal
      size="sm"
      isVisible={isOpen}
      onClose={onCancel}
      button1={
        <Button
          text={t("Cancel")}
          buttonType="secondary"
          onClick={e => {
            onCancel();
            e.stopPropagation();
          }}
        />
      }
      button2={
        <Button
          text={t("Uninstall")}
          buttonType="danger"
          onClick={e => {
            onProceed();
            e.stopPropagation();
          }}
        />
      }>
      <Icon icon="alert" size={24} color={theme.dangerous.main} />
      <Text size="body">
        {t(
          "You are uninstalling the selected plugin. The data used by this plugin may also be deleted.",
        )}
      </Text>
      <Text size="body">{t("Please be sure before uninstalling.")}</Text>
    </Modal>
  );
};

export default DeleteModal;
