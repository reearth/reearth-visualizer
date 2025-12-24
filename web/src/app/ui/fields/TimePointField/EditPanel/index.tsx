import {
  Button,
  DatePicker,
  PopupPanel,
  Selector,
  TimePicker
} from "@reearth/app/lib/reearth-ui";
import { TIMEZONE_OFFSETS } from "@reearth/app/utils/time";
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
      data-testid="time-edit-panel"
      actions={
        <ButtonWrapper>
          <Button
            extendWidth
            size="small"
            title={t("Cancel")}
            onClick={onClose}
            data-testid="time-edit-cancel-button"
          />
          <Button
            extendWidth
            size="small"
            title={t("Apply")}
            appearance="primary"
            disabled={applyDisabled}
            onClick={handleApply}
            data-testid="time-edit-apply-button"
          />
        </ButtonWrapper>
      }
    >
      <EditorWrapper data-testid="time-edit-wrapper">
        <Wrapper>
          <Label data-testid="time-edit-date-label">{t("Date")}</Label>
          <InputWrapper>
            <DatePicker
              value={date}
              onChange={handleDateChange}
              data-testid="time-edit-date-picker"
            />
          </InputWrapper>
        </Wrapper>
        <Wrapper>
          <Label data-testid="time-edit-time-label">{t("Time")}</Label>
          <InputWrapper>
            <TimePicker
              value={time}
              onChange={handleTimeChange}
              data-testid="time-edit-time-picker"
            />
          </InputWrapper>
        </Wrapper>
        <Wrapper>
          <Label data-testid="time-edit-timezone-label">{t("Time Zone")}</Label>
          <InputWrapper
            onMouseDown={(e: React.MouseEvent) => {
              e.stopPropagation();
            }}
          >
            <Selector
              value={timezone}
              options={TIMEZONE_OFFSETS.map((offset) => ({
                label: offset,
                value: offset
              }))}
              maxHeight={200}
              onChange={handleTimezoneSelect}
              data-testid="time-edit-timezone-selector"
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
