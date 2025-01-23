import {
  Button,
  NumberInput,
  PopupPanel,
  Typography
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import TripletInputField from "../TripletInputField";
import TwinInputField from "../TwinInputField";

import useHooks from "./hooks";

import { PanelProps } from ".";

const EditPanel: FC<PanelProps> = ({ camera, onSave, onFlyTo, onClose }) => {
  const t = useT();

  const {
    newCamera,
    handleTrippleFieldBlur,
    handleTwinFieldBlur,
    handleTwinFieldChange,
    handleTrippleFieldChange,
    handleFieldBlur,
    handleFieldChange,
    handleSave
  } = useHooks({
    camera,
    onFlyTo,
    onSave,
    onClose
  });

  return (
    <PopupPanel
      title={t("Camera Position Editor")}
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
        <TwinInputField
          values={[newCamera?.lat, newCamera?.lng]}
          content={[t("Latitude"), t("Longitude")]}
          title={t("Location")}
          placeholders={[t("value"), t("value")]}
          onChange={handleTwinFieldChange}
          onBlur={handleTwinFieldBlur}
        />
        <InputWrapper>
          <Typography size="body">{t("Height")}</Typography>
          <NumberInput
            unit={"km"}
            value={newCamera?.height}
            onChange={(value) => handleFieldChange("height", value)}
            onBlur={(value) => handleFieldBlur("height", value)}
          />
        </InputWrapper>
        <TripletInputField
          title={t("Rotation")}
          values={[newCamera?.heading, newCamera?.pitch, newCamera?.roll]}
          content={[t("Heading"), t("Pitch"), t("Roll")]}
          placeholders={[t("value"), t("value"), t("value")]}
          onChange={handleTrippleFieldChange}
          onBlur={handleTrippleFieldBlur}
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

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing.small
}));

export default EditPanel;
