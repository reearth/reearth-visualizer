import moment from "moment-timezone";
import { useCallback, useState } from "react";

import Button from "@reearth/beta/components/Button";
import PanelCommon from "@reearth/beta/components/fields/CameraField/PanelCommon";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import TextInput from "../../common/TextInput";
import SelectField from "../../SelectField";

type Props = {
  onChange?: (value?: string | undefined) => void;
  onClose: () => void;
};

const EditPanel: React.FC<Props> = ({ onChange, onClose }) => {
  const t = useT();
  const [time, setTime] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [timezones] = useState(moment.tz.names());
  const [selectedTimezone, setSelectedTimezone] = useState("0: 00");

  const handleTimeChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined) return;

      setTime(newValue);
      onChange?.(date + " " + newValue);
    },
    [date, onChange],
  );

  const handleDateChange = useCallback(
    (newValue: string | undefined) => {
      if (newValue === undefined) return;

      setDate(newValue);
      onChange?.(newValue + " " + time);
    },
    [time, onChange],
  );

  const offsetFromUTC = useCallback((timezone: string) => {
    const offset = moment.tz(timezone).utcOffset() / 60;
    const offsetString = offset >= 0 ? `+${offset}` : `${offset}`;
    const tzName = moment.tz(timezone).zoneAbbr();

    return `${offsetString}:00 - ${tzName}`;
  }, []);

  return (
    <PanelCommon title={t("Set Time")} onClose={onClose}>
      <FieldGroup>
        <TextWrapper>
          <Label>{t("Date")}</Label>
          <TextInput
            className="customTextInput"
            type="date"
            value={date}
            onChange={handleDateChange}
          />
        </TextWrapper>
        <TextWrapper>
          <Label>{t("Time")}</Label>

          <TextInput
            className="customTextInput"
            type="time"
            value={time}
            onChange={handleTimeChange}
          />
        </TextWrapper>
        <SelectWrapper>
          <Label>{t("Time Zone")}</Label>
          <SelectField
            value={selectedTimezone}
            className="timezone"
            options={timezones.map(timezone => ({
              key: timezone,
              label: `${offsetFromUTC(timezone)}`,
            }))}
            onChange={setSelectedTimezone}
          />
        </SelectWrapper>
      </FieldGroup>
      <Divider />
      <ButtonWrapper>
        <StyledButton text={t("Cancel")} size="small" onClick={onClose} />
        <StyledButton text={t("Apply")} size="small" buttonType="primary" onClick={() => {}} />
      </ButtonWrapper>
    </PanelCommon>
  );
};

const TextWrapper = styled.div`
  margin-left: 8px;
  width: 88%;
  .customTextInput {
    width: 100%;
  }
`;

const FieldGroup = styled.div`
  padding-bottom: 8px;
`;

const Label = styled.div`
  font-size: 14px;
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
  .timezone {
    height: 120px;
    overflow-y: auto;
    width: 100%;
  }
`;
export default EditPanel;
