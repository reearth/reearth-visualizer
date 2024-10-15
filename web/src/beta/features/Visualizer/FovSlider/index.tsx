import FloatedPanel from "@reearth/beta/components/FloatedPanel";
import Slider from "@reearth/beta/components/Slider";
import { Typography } from "@reearth/beta/lib/reearth-ui";
import { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";
import React from "react";

import useHooks from "./hooks";

type Props = {
  visible?: boolean;
  onIsCapturingChange?: (isCapturing: boolean) => void;
  camera?: Camera;
  onFovChange?: (fov: number) => void;
};

const FovSlider: React.FC<Props> = ({
  visible,
  onIsCapturingChange,
  camera,
  onFovChange
}) => {
  const t = useT();

  const { updateFov, handleClickAway } = useHooks({
    onIsCapturingChange,
    camera,
    onFovChange
  });

  const fov = camera?.fov && Math.round(camera?.fov * 1000) / 1000;
  const theme = useTheme();
  return (
    <StyledFloatedPanel visible={visible} onClickAway={handleClickAway}>
      <Wrapper data-camera-popup>
        <FovField>
          <Typography
            size="footnote"
            color={theme.content.withBackground}
            otherProperties={{ marginRight: "16px" }}
          >
            {t("Angle")}
          </Typography>
          <FieldForm>
            <FieldSlider>
              <Slider
                min={0.01}
                max={Math.PI - 10 ** -10}
                value={fov}
                onChange={updateFov}
                step={0.01}
              />
            </FieldSlider>
            <FieldDescriptions>
              <Typography size="footnote">{t("Narrow")}</Typography>
              <Typography size="footnote">{t("Wide")}</Typography>
            </FieldDescriptions>
          </FieldForm>
        </FovField>
      </Wrapper>
    </StyledFloatedPanel>
  );
};

const StyledFloatedPanel = styled(FloatedPanel)(() => ({
  top: 10,
  right: 10
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: 220,
  background: theme.bg[1],
  boxShadow: "0px 0px 4px rgba(0, 0, 0, 0.25)",
  borderRadius: theme.radius.small + 1,
  padding: theme.spacing.small + 2
}));

const FovField = styled("div")(() => ({
  display: "flex"
}));

const FieldForm = styled("div")(() => ({
  display: "flex",
  flexDirection: "column",
  flex: 1
}));

const FieldSlider = styled("div")(({ theme }) => ({
  display: "flex",
  padding: `0 ${theme.spacing.small}px`,
  flex: 1
}));

const FieldDescriptions = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between"
}));

export default FovSlider;
