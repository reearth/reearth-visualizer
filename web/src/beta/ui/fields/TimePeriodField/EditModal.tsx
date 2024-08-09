import { FC, useMemo } from "react";

import { getTimeZone } from "@reearth/beta/features/Visualizer/Crust/StoryPanel/utils";
import { Button, Icon, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import TimePointField from "../TimePointField";

import useHooks from "./hooks";

import { TimePeriodFieldProp } from ".";

type EditPanelProps = {
  visible: boolean;
  timePeriodValues?: TimePeriodFieldProp;
  onClose?: () => void;
  onChange?: (value?: TimePeriodFieldProp) => void;
  setTimePeriodValues?: (value?: TimePeriodFieldProp) => void;
};

const EditModal: FC<EditPanelProps> = ({
  visible,
  timePeriodValues,
  setTimePeriodValues,
  onClose,
  onChange,
}) => {
  const t = useT();
  const {
    isDisabled,
    warning,
    disabledFields,
    setDisabledFields,
    handleChange,
    handleSubmit,
    handleTimePointPopup,
  } = useHooks({
    timePeriodValues,
    onChange,
    onClose,
    setTimePeriodValues,
  });

  const timezoneMatches = useMemo(() => {
    if (!timePeriodValues) return false;

    const startTimezone = getTimeZone(timePeriodValues?.startTime);
    const currentTimezone = getTimeZone(timePeriodValues?.currentTime);
    const endTimezone = getTimeZone(timePeriodValues?.endTime);

    const checkTimezones = startTimezone === currentTimezone && currentTimezone === endTimezone;
    return checkTimezones;
  }, [timePeriodValues]);

  return (
    <Modal visible={visible} size="small">
      <ModalPanel
        title={t("Time Period Settings")}
        onCancel={onClose}
        actions={
          <>
            <Button onClick={onClose} size="normal" title="Cancel" />
            <Button
              size="normal"
              title="Apply"
              appearance="primary"
              disabled={!isDisabled || warning || !timezoneMatches}
              onClick={handleSubmit}
            />
          </>
        }>
        <FieldsWrapper>
          <TimePointField
            commonTitle={t("* Start Time")}
            description={t("Start time for the timeline")}
            onChange={newValue => handleChange(newValue || "", "startTime")}
            value={timePeriodValues?.startTime}
            fieldName={"startTime"}
            disabledField={disabledFields.includes("startTime")}
            setDisabledFields={setDisabledFields}
            onTimePointPopupOpen={handleTimePointPopup}
          />
          <TimePointField
            commonTitle={t("* Current Time")}
            description={t("Current time should be between start and end time")}
            onChange={newValue => handleChange(newValue || "", "currentTime")}
            value={timePeriodValues?.currentTime}
            disabledField={disabledFields.includes("currentTime")}
            fieldName={"currentTime"}
            setDisabledFields={setDisabledFields}
            onTimePointPopupOpen={handleTimePointPopup}
          />
          <TimePointField
            commonTitle={t("* End Time")}
            onChange={newValue => handleChange(newValue || "", "endTime")}
            description={t("End time for the timeline")}
            value={timePeriodValues?.endTime}
            fieldName={"endTime"}
            disabledField={disabledFields.includes("endTime")}
            setDisabledFields={setDisabledFields}
            onTimePointPopupOpen={handleTimePointPopup}
          />
          {warning && (
            <Warning>
              <Icon icon="warning" size="large" />
              {t("Please make sure the Current time must between the Start time and End Time.")}
            </Warning>
          )}
        </FieldsWrapper>
      </ModalPanel>
    </Modal>
  );
};

const FieldsWrapper = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.largest,
  padding: theme.spacing.super,
  flexDirection: "column",
  background: theme.bg[0],
}));

const Warning = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  paddingTop: theme.spacing.small,
  color: theme.dangerous.main,
  alignItems: "center",
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular,
}));

export default EditModal;
