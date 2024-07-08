import { FC } from "react";

import useHooks from "@reearth/beta/components/fields/CameraField/EditPanel/hooks";
import { Button, Typography, NumberInput, PopupPanel } from "@reearth/beta/lib/reearth-ui";
import type { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  camera?: Camera;
  onSave: (value?: Camera) => void;
  onFlyTo?: (camera?: Camera) => void;
  onClose: () => void;
};

const EditPanel: FC<Props> = ({ camera, onSave, onFlyTo, onClose }) => {
  const t = useT();
  const theme = useTheme();

  const { panelContent, handleSave } = useHooks({
    camera,
    onFlyTo,
    onSave,
  });

  return (
    <PopupPanel
      title={t("Camera Position Editor")}
      onCancel={onClose}
      actions={
        <ButtonWrapper>
          <StyledButton title={t("Cancel")} size="small" onClick={onClose} extendWidth />
          <StyledButton
            title={t("Apply")}
            size="small"
            appearance="primary"
            onClick={handleSave}
            extendWidth
          />
        </ButtonWrapper>
      }>
      {Object.keys(panelContent).map(group => (
        <FieldGroup key={group}>
          <Typography size="footnote">{group}</Typography>
          <InputWrapper>
            {panelContent[group].map(field => (
              <PanelContentWrapper key={field.id}>
                <StyledNumberInput
                  unit={field.unit}
                  value={field.value}
                  placeholder="Value"
                  disabled
                />
                <DescriptionWrapper>
                  <Description size="footnote" color={theme.content.weaker}>
                    {field.description}
                  </Description>
                </DescriptionWrapper>
              </PanelContentWrapper>
            ))}
          </InputWrapper>
        </FieldGroup>
      ))}
    </PopupPanel>
  );
};

export default EditPanel;

const FieldGroup = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: `${theme.spacing.normal}px`,
  padding: `${theme.spacing.small}px`,
}));

const InputWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  gap: `${theme.spacing.small}px`,
}));

const PanelContentWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "stretch",
  flex: 1,
  gap: `${theme.spacing.smallest}px`,
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: `${theme.spacing.small}px`,
  padding: `${theme.spacing.small}px`,
}));

const StyledButton = styled(Button)({
  flex: 1,
});

const StyledNumberInput = styled(NumberInput)({
  width: "100%",
});

const DescriptionWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
});

const Description = styled(Typography)({});
