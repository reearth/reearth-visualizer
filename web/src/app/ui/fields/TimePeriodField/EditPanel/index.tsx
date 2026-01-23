import { Button, Icon, Modal, ModalPanel } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n/hooks";
import { styled } from "@reearth/services/theme";
import { FC } from "react";

import { TimePeriodFieldProp } from "..";
import TimePointField from "../../TimePointField";

import useHooks from "./hooks";

type EditPanelProps = {
  visible: boolean;
  timePeriodValues?: TimePeriodFieldProp;
  onClose?: () => void;
  onChange?: (value?: TimePeriodFieldProp) => void;
};

const EditModal: FC<EditPanelProps> = ({
  visible,
  timePeriodValues,
  onClose,
  onChange
}) => {
  const t = useT();
  const {
    submitDisabled,
    timeRangeInvalid,
    localValue,
    handleChange,
    handleSubmit
  } = useHooks({
    timePeriodValues,
    onChange,
    onClose
  });

  return (
    <Modal
      visible={visible}
      size="small"
      data-testid="timeperiodfield-editpanel-modal"
    >
      <ModalPanel
        title={t("Time Period Settings")}
        onCancel={onClose}
        data-testid="timeperiodfield-editpanel-modalpanel"
        actions={
          <>
            <Button
              onClick={onClose}
              size="normal"
              title={t("Cancel")}
              data-testid="timeperiodfield-editpanel-cancel-btn"
            />
            <Button
              size="normal"
              title={t("Apply")}
              appearance="primary"
              disabled={submitDisabled}
              onClick={handleSubmit}
              data-testid="timeperiodfield-editpanel-apply-btn"
            />
          </>
        }
      >
        <FieldsWrapper data-testid="timeperiodfield-editpanel-fieldswrapper">
          <TimePointField
            title={t("* Start Time")}
            description={t("Start time for the timeline")}
            onChange={(newValue) => handleChange(newValue || "", "startTime")}
            value={localValue?.startTime}
            data-testid="timeperiodfield-editpanel-starttime-field"
          />
          <TimePointField
            title={t("* Current Time")}
            description={t("Current time should be between start and end time")}
            onChange={(newValue) => handleChange(newValue || "", "currentTime")}
            value={localValue?.currentTime}
            data-testid="timeperiodfield-editpanel-currenttime-field"
          />
          <TimePointField
            title={t("* End Time")}
            onChange={(newValue) => handleChange(newValue || "", "endTime")}
            description={t("End time for the timeline")}
            value={localValue?.endTime}
            data-testid="timeperiodfield-editpanel-endtime-field"
          />
          {timeRangeInvalid && (
            <Warning data-testid="timeperiodfield-editpanel-warning">
              <Icon
                icon="warning"
                size="large"
                data-testid="timeperiodfield-editpanel-warning-icon"
              />
              {t(
                "Please make sure the Current time must between the Start time and End Time."
              )}
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
  background: theme.bg[0]
}));

const Warning = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing.small,
  paddingTop: theme.spacing.small,
  color: theme.dangerous.main,
  alignItems: "center",
  fontSize: theme.fonts.sizes.body,
  fontWeight: theme.fonts.weight.regular
}));

export default EditModal;
