import Button from "@reearth/beta/components/Button";
import NumberInput from "@reearth/beta/components/fields/common/NumberInput";
import Text from "@reearth/beta/components/Text";
import type { Camera } from "@reearth/beta/utils/value";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import PanelCommon from "../../common/PanelCommon";

import useHooks from "./hooks";

type Props = {
  camera?: Camera;
  onSave: (value?: Camera) => void;
  onChange?: (key: keyof Camera, update?: number) => void;
  onClose: () => void;
};

const EditPanel: React.FC<Props> = ({ camera, onSave, onChange, onClose }) => {
  const t = useT();

  const { panelContent, handleChange } = useHooks({ camera, onChange });

  return (
    <PanelCommon title={t("Camera Position Editor")} onClose={onClose}>
      {Object.keys(panelContent).map(group => (
        <FieldGroup key={group}>
          <Text size="footnote">{group}</Text>
          <InputWrapper>
            {panelContent[group].map(field => (
              <StyledNumberInput
                key={field.id}
                inputDescription={field.description}
                value={camera?.[field.id]}
                suffix={field.suffix}
                onChange={handleChange(field.id)}
              />
            ))}
          </InputWrapper>
        </FieldGroup>
      ))}
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
