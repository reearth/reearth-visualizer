import { Button, PopupPanel } from "@reearth/app/lib/reearth-ui";
import AssetField from "@reearth/app/ui/fields/AssetField";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC, useCallback, useState } from "react";

type EditPanelProps = {
  onSubmit: (url: string) => void;
  onClose: () => void;
};

const EditPanel: FC<EditPanelProps> = ({ onClose, onSubmit }) => {
  const t = useT();

  const [localValue, setLocalValue] = useState<string | undefined>("");

  const handleApply = useCallback(() => {
    if (!localValue) return;
    onSubmit?.(localValue);
    onClose?.();
  }, [localValue, onClose, onSubmit]);

  return (
    <PopupPanel
      title={t("Update data resource URL")}
      onCancel={onClose}
      width={340}
      actions={
        <ButtonWrapper>
          <Button size="small" title={t("Cancel")} onClick={onClose} />
          <Button
            size="small"
            title={t("Apply")}
            appearance="primary"
            onClick={handleApply}
            disabled={!localValue}
          />
        </ButtonWrapper>
      }
    >
      <AssetField
        title={t("New data resource URL")}
        inputMethod={"URL"}
        value={localValue}
        placeholder="http://"
        onInputChange={setLocalValue}
      />
    </PopupPanel>
  );
};

export default EditPanel;

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  alignItems: "flex-start",
  gap: theme.spacing.small
}));
