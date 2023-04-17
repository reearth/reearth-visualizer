import React from "react";

import Button from "@reearth/components/atoms/Button";
import Icon from "@reearth/components/atoms/Icon";
import Modal from "@reearth/components/atoms/Modal";
import Text from "@reearth/components/atoms/Text";
import { useT } from "@reearth/i18n";
import { styled, useTheme, metricsSizes } from "@reearth/theme";

export type Props = {
  onRemove?: (schemaId?: string) => void;
  setModal?: (show: boolean) => void;
  openModal?: boolean;
};

const DatasetDeleteModal: React.FC<Props> = ({ onRemove, setModal, openModal }) => {
  const t = useT();
  const theme = useTheme();
  return (
    <Modal
      button1={<Button large buttonType="danger" text={t("OK")} onClick={() => onRemove?.()} />}
      button2={
        <Button large buttonType="secondary" text={t("Cancel")} onClick={() => setModal?.(false)} />
      }
      size="sm"
      isVisible={openModal}
      onClose={() => setModal?.(false)}>
      <StyledIcon icon="alert" size={24} />
      <Text
        size="m"
        color={theme.main.text}
        otherProperties={{ marginTop: `${metricsSizes["s"]}px` }}>
        {t("You are deleting a dataset. Layers that are linked to this dataset might show errors.")}
      </Text>
      <Text
        size="m"
        color={theme.main.text}
        otherProperties={{ marginTop: `${metricsSizes["s"]}px` }}>
        {t("Please make sure your project doesn't rely on this dataset before proceeding.")}
      </Text>
    </Modal>
  );
};

export default DatasetDeleteModal;

const StyledIcon = styled(Icon)`
  color: ${props => props.theme.main.alert};
`;
