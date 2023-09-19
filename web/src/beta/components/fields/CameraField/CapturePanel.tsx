import Button from "@reearth/beta/components/Button";
import NumberInput from "@reearth/beta/components/fields/common/NumberInput";
import Text from "@reearth/beta/components/Text";
import { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import PanelCommon from "./PanelCommon";

type Props = {
  camera?: Camera;
  onSave: (value?: Camera) => void;
  onClose: () => void;
};

const CapturePanel: React.FC<Props> = ({ camera, onSave, onClose }) => {
  const t = useT();

  return (
    <PanelCommon title={t("Camera Position Editor")} onClose={onClose}>
      <FieldGroup>
        <Text size="footnote">{t("Current Position")}</Text>
        <InputWrapper>
          <StyledNumberInput inputDescription={t("Latitude")} value={camera?.lat} disabled />
          <StyledNumberInput inputDescription={t("Longitude")} value={camera?.lng} disabled />
          <StyledNumberInput inputDescription={t("Height")} value={camera?.height} disabled />
        </InputWrapper>
      </FieldGroup>
      <FieldGroup>
        <Text size="footnote">{t("Current Rotation")}</Text>
        <InputWrapper>
          <StyledNumberInput inputDescription={t("Heading")} value={camera?.heading} disabled />
          <StyledNumberInput inputDescription={t("Pitch")} value={camera?.pitch} disabled />
          <StyledNumberInput inputDescription={t("Roll")} value={camera?.roll} disabled />
        </InputWrapper>
      </FieldGroup>
      <Divider />
      <ButtonWrapper>
        <StyledButton text={t("Cancel")} size="small" onClick={onClose} />
        <StyledButton
          text={t("Capture")}
          size="small"
          buttonType="primary"
          onClick={() => onSave(camera)}
        />
      </ButtonWrapper>
    </PanelCommon>
  );
};

export default CapturePanel;

const FieldGroup = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 4px;
  padding: 4px;
`;

const InputWrapper = styled.div`
  display: flex;
  gap: 4px;
`;

const Divider = styled.div`
  border-top: 1px solid ${({ theme }) => theme.outline.weak};
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 8px;
  padding: 8px;
`;

const StyledButton = styled(Button)`
  flex: 1;
`;

const StyledNumberInput = styled(NumberInput)`
  flex: 1;
`;
