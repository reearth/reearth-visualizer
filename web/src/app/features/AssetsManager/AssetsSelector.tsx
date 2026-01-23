import { Button, Modal, ModalPanel } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

import { Asset } from "./types";

import AssetsManager, { AssetsManagerProps } from ".";

export type AssetsSelectorProps = AssetsManagerProps & {
  opened?: boolean;
  onClose?: () => void;
  onAssetSelect?: (url?: string, name?: string) => void;
};

const AssetsSelector: FC<AssetsSelectorProps> = ({
  opened,
  onClose,
  onAssetSelect,
  ...props
}) => {
  const t = useT();

  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);

  const handleSelectFinish = useCallback(() => {
    if (!selectedAssets || selectedAssets.length === 0) {
      onAssetSelect?.(undefined, undefined);
    } else {
      onAssetSelect?.(selectedAssets[0].url, selectedAssets[0].name);
    }
    onClose?.();
  }, [selectedAssets, onAssetSelect, onClose]);

  return (
    <Modal size="large" visible={!!opened}>
      <ModalPanel
        title={t("Select Asset")}
        onCancel={onClose}
        actions={
          <>
            <Button onClick={onClose} size="normal" title={t("Cancel")} />
            <Button
              size="normal"
              title="Select"
              appearance="primary"
              onClick={handleSelectFinish}
            />
          </>
        }
      >
        <Wrapper>
          <AssetsManager
            {...props}
            enableUpload={false}
            enableDelete={false}
            allowMultipleSelection={false}
            onSelectChange={setSelectedAssets}
          />
        </Wrapper>
      </ModalPanel>
    </Modal>
  );
};

export default AssetsSelector;

const Wrapper = styled("div")(({ theme }) => ({
  height: "60vh",
  maxHeight: 652,
  background: theme.bg[1]
}));
