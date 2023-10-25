import Button from "@reearth/beta/components/Button";
import Modal from "@reearth/beta/components/Modal";
import { useT } from "@reearth/services/i18n";

type EditPanelProps = {
  isVisible?: boolean;
  onClose?: () => void;
};

const EditPanel = ({ isVisible, onClose }: EditPanelProps) => {
  const t = useT();
  return (
    <Modal
      isVisible={isVisible}
      size="sm"
      title={t("Timeline Settings")}
      button1={<Button text={t("Cancel")} buttonType="secondary" onClick={onClose} />}
      button2={<Button text={t("Apply")} buttonType="primary" disabled={true} onClick={() => {}} />}
      onClose={onClose}>
      {/* to be addimg datetime  field*/}
      <p>Timeline fields to be added </p>
    </Modal>
  );
};

export default EditPanel;
