import Button from "@reearth/beta/components/Button";
import Modal from "@reearth/beta/components/Modal";
import Text from "@reearth/beta/components/Text";
import { useT } from "@reearth/services/i18n";

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
      button1={<Button text={t("Cancel")} buttonType="secondary" onClick={onClose} />}
      button2={<Button text={t("Delete")} buttonType="danger" onClick={handleRemove} />}>
      <Text size="body">
        {t("You are about to delete one or more assets from the current workspace.")}
      </Text>
      <Text size="body">
        {t("Please make sure no selected assets are in use. This cannot be undone.")}
      </Text>
    </Modal>
  );
};

export default AssetDeleteModal;
