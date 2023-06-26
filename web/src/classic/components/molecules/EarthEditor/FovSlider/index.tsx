import React from "react";

import FloatedPanel from "@reearth/classic/components/atoms/FloatedPanel";
import Slider from "@reearth/classic/components/atoms/Slider";
import Text from "@reearth/classic/components/atoms/Text";
import { Camera } from "@reearth/classic/util/value";
import { useT } from "@reearth/services/i18n";
import { styled, useTheme } from "@reearth/services/theme";

import useHooks from "./hooks";

type Props = {
  visible?: boolean;
  onIsCapturingChange?: (isCapturing: boolean) => void;
  camera?: Camera;
  onFovChange?: (fov: number) => void;
};

const FovSlider: React.FC<Props> = ({ visible, onIsCapturingChange, camera, onFovChange }) => {
  const t = useT();

  const { updateFov, handleClickAway } = useHooks({
    onIsCapturingChange,
    camera,
    onFovChange,
  });

  const fov = camera?.fov && Math.round(camera?.fov * 1000) / 1000;
  const theme = useTheme();
  return (
    <StyledFloatedPanel visible={visible} onClickAway={handleClickAway}>
      <Wrapper data-camera-popup>
        <FovField>
          <Text
            size="xs"
            color={theme.classic.main.strongText}
            otherProperties={{ marginRight: "16px" }}>
            {t("Angle")}
          </Text>
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
              <Text size="xs">{t("Narrow")}</Text>
              <Text size="xs">{t("Wide")}</Text>
            </FieldDescriptions>
          </FieldForm>
        </FovField>
      </Wrapper>
    </StyledFloatedPanel>
  );
};

const StyledFloatedPanel = styled(FloatedPanel)`
  top: 10px;
  right: 10px;
  z-index: ${props => props.theme.classic.zIndexes.propertyFieldPopup};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 220px;
  background: ${({ theme }) => theme.classic.slider.background};
  box-shadow: 0px 0px 4px rgba(0, 0, 0, 0.25);
  border-radius: 5px;
  padding: 10px;
`;

const FovField = styled.div`
  display: flex;
`;

const FieldForm = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const FieldSlider = styled.div`
  display: flex;
  flex: 1;
  padding: 0 8px;
`;

const FieldDescriptions = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default FovSlider;
