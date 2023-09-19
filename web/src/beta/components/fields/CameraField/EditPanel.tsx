import Button from "@reearth/beta/components/Button";
import NumberInput from "@reearth/beta/components/fields/common/NumberInput";
import Text from "@reearth/beta/components/Text";
import type { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import PanelCommon from "./PanelCommon";

type Props = {
  camera?: Camera;
  onSave: (value?: Camera) => void;
  onChange?: (key: keyof Camera, update?: number) => void;
  onClose: () => void;
};

const EditPanel: React.FC<Props> = ({ camera, onSave, onChange, onClose }) => {
  const t = useT();

  return (
    <PanelCommon title={t("Camera Position Editor")} onClose={onClose}>
      <FieldGroup>
        <Text size="footnote">{t("Location")}</Text>
        <InputWrapper>
          <StyledNumberInput
            inputDescription={t("Latitude")}
            value={camera?.lat}
            onChange={value => onChange?.("lat", value)}
          />
          <StyledNumberInput
            inputDescription={t("Longitude")}
            value={camera?.lng}
            onChange={value => onChange?.("lng", value)}
          />
        </InputWrapper>
      </FieldGroup>
      <FieldGroup>
        <Text size="footnote">{t("Height")}</Text>
        <InputWrapper>
          <StyledNumberInput
            suffix="km"
            value={camera?.height}
            onChange={value => onChange?.("height", value)}
          />
        </InputWrapper>
      </FieldGroup>
      <FieldGroup>
        <Text size="footnote">{t("Rotation")}</Text>
        <InputWrapper>
          <StyledNumberInput
            inputDescription={t("Heading")}
            value={camera?.heading}
            onChange={value => onChange?.("heading", value)}
          />
          <StyledNumberInput
            inputDescription={t("Pitch")}
            value={camera?.pitch}
            onChange={value => onChange?.("pitch", value)}
          />
          <StyledNumberInput
            inputDescription={t("Roll")}
            value={camera?.roll}
            onChange={value => onChange?.("roll", value)}
          />
        </InputWrapper>
      </FieldGroup>
      <Divider />
      <ButtonWrapper>
        <StyledButton text={t("Cancel")} size="small" onClick={onClose} />
        <StyledButton
          text={t("Apply")}
          size="small"
          buttonType="primary"
          onClick={() => onSave(camera)}
        />
      </ButtonWrapper>
    </PanelCommon>
  );
};

export default EditPanel;

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
