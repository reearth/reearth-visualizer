import {
  Button,
  DatePicker,
  PopupPanel,
  Selector,
  TimePicker
} from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";

type Props = {
  value?: string;
  onChange?: (value?: string | undefined) => void;
  onClose: () => void;
  setDateTime?: (value?: string | undefined) => void;
};

const EditPanel: FC<Props> = ({ onChange, onClose, value, setDateTime }) => {
  const t = useT();
  const {
    date,
    time,
    selectedTimezone,
    offsetFromUTC,
    handleDateChange,
    handleTimezoneSelect,
    handleApply,
    handleTimeChange
  } = useHooks({ value, onChange, onClose, setDateTime });

  return (
    <PopupPanel
      width={247}
      title={t("Set Time")}
      onCancel={onClose}
      actions={
        <ButtonWrapper>
          <Button
            extendWidth
            size="small"
            title={t("Cancel")}
            onClick={onClose}
          />
          <Button
            extendWidth
            size="small"
            title={t("Apply")}
            appearance="primary"
            onClick={handleApply}
          />
        </ButtonWrapper>
      }
    >
      <EditorWrapper>
        <Wrapper>
          <Label>{t("Date")}</Label>
          <InputWrapper>
            <DatePicker value={date} onChange={handleDateChange} />
          </InputWrapper>
        </Wrapper>
        <Wrapper>
          <Label>{t("Time")}</Label>
          <InputWrapper>
            <TimePicker value={time} onChange={handleTimeChange} />
          </InputWrapper>
        </Wrapper>
        <Wrapper>
          <Label>{t("Time Zone")}</Label>
          <InputWrapper>
            <Selector
              value={selectedTimezone.timezone}
              options={offsetFromUTC.map((timezone) => ({
                label: timezone.offset,
                value: timezone?.timezone
              }))}
              maxHeight={200}
              onChange={handleTimezoneSelect}
            />
          </InputWrapper>
        </Wrapper>
      </EditorWrapper>
    </PopupPanel>
  );
};

const EditorWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  gap: theme.spacing.normal
}));

const Wrapper = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing.small
}));

const Label = styled("div")(({ theme }) => ({
  color: theme.content.main,
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

const InputWrapper = styled("div")(() => ({
  width: "100%"
}));
const ButtonWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  gap: theme.spacing.small
}));

export default EditPanel;
