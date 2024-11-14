import { Button, PopupPanel } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC, useCallback } from "react";

import TripletInputField from "../TripletInputField";

import { radiansToDegrees } from "./hooks";

import { PanelProps } from ".";

const CapturePanel: FC<PanelProps> = ({ camera, onSave, onClose }) => {
  const t = useT();

  const handleSave = useCallback(() => {
    onSave?.(camera);
  }, [camera, onSave]);

  return (
    <PopupPanel
      title={t("Position Capture")}
      onCancel={onClose}
      actions={
        <ButtonWrapper>
          <Button
            extendWidth
            size="small"
            title={t("Cancel")}
            onClick={onClose}
          />
          <Button
            extendWidth
            size="small"
            title={t("Apply")}
            appearance="primary"
            onClick={handleSave}
          />
        </ButtonWrapper>
      }
    >
      <GroupWrapper>
        <TripletInputField
          values={[camera?.lat ?? 0, camera?.lng ?? 0, camera?.height ?? 0]}
          content={[t("Latitude"), t("Longitude"), t("Height")]}
          title={t("Current Position")}
          appearance="readonly"
          disabled
        />
        <TripletInputField
          title={t("Current Rotation")}
          values={[
            radiansToDegrees(camera?.heading ?? 0),
            radiansToDegrees(camera?.pitch ?? 0),
            radiansToDegrees(camera?.roll ?? 0)
          ]}
          appearance="readonly"
          disabled
          content={[t("Heading"), t("Pitch"), t("Roll")]}
        />
      </GroupWrapper>
    </PopupPanel>
  );
};

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: theme.spacing.small
}));

const GroupWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  flexDirection: "column",
  gap: theme.spacing.normal
}));

export default CapturePanel;
