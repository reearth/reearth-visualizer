import React from "react";

import Modal from "@reearth/beta/components/Modal";
import { useT } from "@reearth/services/i18n";

export type DataProps = {
  onClose: () => void;
};

const SketchLayerManager: React.FC<DataProps> = ({ onClose }) => {
  const t = useT();
  return <Modal size="md" isVisible={true} title={t("New Sketch Layer")} onClose={onClose} />;
};

export default SketchLayerManager;
