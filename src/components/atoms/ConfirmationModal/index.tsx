import React from "react";
import { useIntl } from "react-intl";

import Button from "../Button";
import Modal from "../Modal";

export type Props = {
  title?: string;
  buttonAction?: string;
  body: React.ReactNode;
  onCancel: () => void;
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
  const intl = useIntl();
  return (
    <Modal
      title={title}
      isVisible={isOpen}
      size="sm"
      onClose={onClose}
      button1={
        <Button
          text={buttonAction || intl.formatMessage({ defaultMessage: "Continue" })}
          onClick={onProceed}
          buttonType="danger"
        />
      }
      button2={
        <Button
          text={intl.formatMessage({ defaultMessage: "Cancel" })}
          onClick={onCancel}
          buttonType="secondary"
        />
      }>
      {body}
    </Modal>
  );
};

export default ConfirmationModal;
