import { useMemo, FC } from "react";

import type { RowType } from "@reearth/beta/components/fields/CameraField/types";
import { radiansToDegrees } from "@reearth/beta/components/fields/CameraField/utils";
import PanelCommon from "@reearth/beta/components/fields/common/PanelCommon";
import { Button, Typography, NumberInput } from "@reearth/beta/lib/reearth-ui";
import { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

type Props = {
  camera?: Camera;
  onSave: (value?: Camera) => void;
  onClose: () => void;
};

const CapturePanel: FC<Props> = ({ camera, onSave, onClose }) => {
  const t = useT();
  const theme = useTheme();

  const panelContent: { [key: string]: RowType } = useMemo(() => {
    return {
      [t("Current Position")]: [
        { id: "lat", description: t("Latitude"), value: camera?.lat },
        { id: "lng", description: t("Longitude"), value: camera?.lng },
      ],
      [t("Current Height")]: [
        { id: "height", description: t("Height"), value: camera?.height, unit: "km" },
      ],
      [t("Current Rotation")]: [
        { id: "heading", description: t("Heading"), value: radiansToDegrees(camera?.heading ?? 0) },
        { id: "pitch", description: t("Pitch"), value: radiansToDegrees(camera?.pitch ?? 0) },
        { id: "roll", description: t("Roll"), value: radiansToDegrees(camera?.roll ?? 0) },
      ],
    };
  }, [t, camera]);

  return (
    <PanelCommon title={t("Camera Position Editor")} onClose={onClose}>
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
      <Divider />
      <ButtonWrapper>
        <StyledButton title={t("Cancel")} size="small" onClick={onClose} extendWidth={true} />
        <StyledButton
          title={t("Capture")}
          size="small"
          appearance="primary"
          extendWidth={true}
          onClick={() => onSave(camera)}
        />
      </ButtonWrapper>
    </PanelCommon>
  );
};

export default CapturePanel;

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

const Divider = styled("div")(({ theme }) => ({
  borderTop: `1px solid ${theme.outline.weak}`,
}));

const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: `${theme.spacing.small}px`,
  padding: `${theme.spacing.small}px`,
}));

const StyledButton = styled(Button)({});

const StyledNumberInput = styled(NumberInput)({
  width: "100%",
});

const DescriptionWrapper = styled("div")({
  display: "flex",
  justifyContent: "center",
});

const Description = styled(Typography)({});
