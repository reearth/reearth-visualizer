import {
  Button,
  DatePicker,
  PopupPanel,
  Selector,
  TimePicker
} from "@reearth/beta/lib/reearth-ui";
import { TIMEZONE_OFFSETS } from "@reearth/beta/utils/time";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import useHooks from "./hooks";

type Props = {
  value?: string;
  onChange?: (value?: string | undefined) => void;
  onClose: () => void;
};

const EditPanel: FC<Props> = ({ onChange, onClose, value }) => {
  const t = useT();
  const {
    date,
    time,
    timezone,
    applyDisabled,
    handleDateChange,
    handleTimezoneSelect,
    handleApply,
    handleTimeChange
  } = useHooks({ value, onChange, onClose });

  return (
    <PopupPanel
      width={247}
      title={t("Set Time")}
      onCancel={onClose}
      actions={
        <ButtonWrapper>
          <Button extendWidth size="small" title="Cancel" onClick={onClose} />
          <Button
            extendWidth
            size="small"
            title="Apply"
            appearance="primary"
            disabled={applyDisabled}
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
              value={timezone}
              options={TIMEZONE_OFFSETS.map((offset) => ({
                label: offset,
                value: offset
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
