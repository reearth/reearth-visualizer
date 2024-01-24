import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import PanelCommon from "@reearth/beta/components/fields/common/PanelCommon";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import TextInput from "../../common/TextInput";
import SelectField from "../../SelectField";

import useHooks from "./hooks";

type Props = {
  onChange?: (value?: string | undefined) => void;
  onClose: () => void;
  value?: string;
  setDateTime?: (value?: string | undefined) => void;
};

const EditPanel: React.FC<Props> = ({ onChange, onClose, value, setDateTime }) => {
  const t = useT();

  const {
    date,
    time,
    selectedTimezone,
    offsetFromUTC,
    onDateChange,
    onTimezoneSelect,
    onDateTimeApply,
    handleTimeChange,
  } = useHooks({ value, onChange, setDateTime });

  const isButtonDisabled = useMemo(() => {
    return date.trim() === "" || time.trim() === "";
  }, [date, time]);

  return (
    <PanelCommon title={t("Set Time")} onClose={onClose}>
      <FieldGroup>
        <TextWrapper>
          <Label>{t("Date")}</Label>
          <Input type="date" value={date} onChange={onDateChange} />
        </TextWrapper>
        <TextWrapper>
          <Label>{t("Time")}</Label>

          <Input type="time" value={time} onChange={handleTimeChange} step={1} />
        </TextWrapper>
        <SelectWrapper>
          <Label>{t("Time Zone")}</Label>
          <CustomSelect
            value={selectedTimezone.timezone}
            options={offsetFromUTC.map(timezone => ({
              key: timezone.timezone,
              label: timezone?.offset,
            }))}
            onChange={onTimezoneSelect}
          />
        </SelectWrapper>
      </FieldGroup>
      <Divider />
      <ButtonWrapper>
        <StyledButton text={t("Cancel")} size="small" onClick={onClose} />
        <StyledButton
          text={t("Apply")}
          size="small"
          buttonType="primary"
          onClick={() => {
            onDateTimeApply(), onClose();
          }}
          disabled={isButtonDisabled}
        />
      </ButtonWrapper>
    </PanelCommon>
  );
};

const TextWrapper = styled.div`
  margin-left: 8px;
  width: 88%;
`;

const Input = styled(TextInput)`
  width: 100%;
`;

const FieldGroup = styled.div`
  padding-bottom: 8px;
`;

const Label = styled.div`
  font-size: 12px;
  padding: 10px 0;
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

const SelectWrapper = styled.div`
  margin-left: 8px;
  width: 95%;
`;
const CustomSelect = styled(SelectField)`
  width: 100%;
`;
export default EditPanel;
