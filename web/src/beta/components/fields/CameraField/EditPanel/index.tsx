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
  onFlyTo?: (camera?: Camera) => void;
  onClose: () => void;
};

const EditPanel: React.FC<Props> = ({ camera, onSave, onFlyTo, onClose }) => {
  const t = useT();

  const { newCamera, panelContent, handleChange, handleSave } = useHooks({
    camera,
    onFlyTo,
    onSave,
  });

  return (
    <PanelCommon title={t("Camera Position Editor")} onClose={onClose}>
      {Object.keys(panelContent).map(group => (
        <FieldGroup key={group}>
          <Text size="footnote">{group}</Text>
          <InputWrapper>
            {panelContent[group].map(field => (
              <StyledNumberInput
                key={field.id}
                value={newCamera?.[field.id] ?? 0}
                inputDescription={field.description}
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
        <StyledButton text={t("Apply")} size="small" buttonType="primary" onClick={handleSave} />
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
