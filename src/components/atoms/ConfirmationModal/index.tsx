import React from "react";

import { useT } from "@reearth/i18n";

import Button from "../Button";
import Modal from "../Modal";

export type Props = {
  title?: string;
  buttonAction?: string;
  body: React.ReactNode;
  onCancel?: () => void;
  onProceed: () => void;
  onClose: () => void;
  isOpen: boolean;
};

const ConfirmationModal: React.FC<Props> = ({
  title,
  buttonAction,
  body,
  onCancel,
  onProceed,
  isOpen,
  onClose,
}) => {
  const t = useT();

  const handleProceed = () => {
    onProceed();
    onCancel?.() ?? onClose();
  };

  return (
    <Modal
      title={title}
      isVisible={isOpen}
      size="sm"
      onClose={onClose}
      button1={
        <Button text={buttonAction || t("Continue")} onClick={handleProceed} buttonType="danger" />
      }
      button2={<Button text={t("Cancel")} onClick={onCancel ?? onClose} buttonType="secondary" />}>
      {body}
    </Modal>
  );
};

export default ConfirmationModal;
