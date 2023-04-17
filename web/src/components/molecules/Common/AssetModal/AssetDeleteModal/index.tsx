import React from "react";

import Button from "@reearth/components/atoms/Button";
import Divider from "@reearth/components/atoms/Divider";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Props {
  isVisible: boolean;
  onClose?: () => void;
  handleRemove?: () => void;
}

const AssetDeleteModal: React.FC<Props> = ({ isVisible, onClose, handleRemove }) => {
  const t = useT();
  return (
    <Modal
      title="Delete assets"
      isVisible={isVisible}
      size="sm"
      onClose={onClose}
      button1={<Button text={t("Delete")} buttonType="danger" onClick={handleRemove} />}
      button2={<Button text={t("Cancel")} buttonType="secondary" onClick={onClose} />}>
      <Divider margin="0" />
      <Message size="m">
        {t("You are about to delete one or more assets from the current workspace.")}
      </Message>
      <Message size="m">
        {t("Please make sure no selected assets are in use. This cannot be undone.")}
      </Message>
    </Modal>
  );
};

const Message = styled(Text)`
  margin-top: ${`${metricsSizes["2xl"]}px`};
`;
export default AssetDeleteModal;
