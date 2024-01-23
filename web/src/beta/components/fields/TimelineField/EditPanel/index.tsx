import { useMemo } from "react";

import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import Modal from "@reearth/beta/components/Modal";
import { getTimeZone } from "@reearth/beta/lib/core/StoryPanel/utils";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import { TimelineFieldProp } from "..";
import DateTimeField from "../../DateTimeField";

import useHooks from "./hooks";

type EditPanelProps = {
  isVisible?: boolean;
  timelineValues?: TimelineFieldProp;
  onClose?: () => void;
  onChange?: (value?: TimelineFieldProp) => void;
  setTimelineValues?: (value?: TimelineFieldProp) => void;
};

const EditPanel = ({
  isVisible,
  timelineValues,
  setTimelineValues,
  onClose,
  onChange,
}: EditPanelProps) => {
  const t = useT();
  const {
    isDisabled,
    warning,
    disabledFields,
    setDisabledFields,
    handleOnChange,
    onAppyChange,
    handlePopoverOpen,
  } = useHooks({
    timelineValues,
    onChange,
    onClose,
    setTimelineValues,
  });

  const timezoneMatches = useMemo(() => {
    if (!timelineValues) return false;

    const startTimezone = getTimeZone(timelineValues?.startTime);
    const currentTimezone = getTimeZone(timelineValues?.currentTime);
    const endTimezone = getTimeZone(timelineValues?.endTime);

    const areTimezonesEqual = startTimezone === currentTimezone && currentTimezone === endTimezone;

    return areTimezonesEqual;
  }, [timelineValues]);

  return (
    <Modal
      isVisible={isVisible}
      size="sm"
      title={t("Timeline Settings")}
      button1={<Button text={t("Cancel")} buttonType="secondary" onClick={onClose} />}
      button2={
        <Button
          text={t("Apply")}
          buttonType="primary"
          disabled={!isDisabled || warning || !timezoneMatches}
          onClick={onAppyChange}
        />
      }>
      <FieldsWrapper>
        <CustomDateTimeField
          name={t("* Start Time")}
          description={t("Start time for the timeline")}
          onChange={newValue => handleOnChange(newValue || "", "startTime")}
          value={timelineValues?.startTime}
          fieldName={"startTime"}
          disableField={disabledFields.includes("startTime")}
          setDisabledFields={setDisabledFields}
          onPopoverOpen={handlePopoverOpen}
        />
        <CustomDateTimeField
          name={t("* Current Time")}
          description={t("Current time should be between start and end time")}
          onChange={newValue => handleOnChange(newValue || "", "currentTime")}
          value={timelineValues?.currentTime}
          disableField={disabledFields.includes("currentTime")}
          fieldName={"currentTime"}
          setDisabledFields={setDisabledFields}
          onPopoverOpen={handlePopoverOpen}
        />
        <CustomDateTimeField
          name={t("* End Time")}
          onChange={newValue => handleOnChange(newValue || "", "endTime")}
          description={t("End time for the timeline")}
          value={timelineValues?.endTime}
          fieldName={"endTime"}
          disableField={disabledFields.includes("endTime")}
          setDisabledFields={setDisabledFields}
          onPopoverOpen={handlePopoverOpen}
        />
        {warning && (
          <DangerItem>
            <Icon icon="alert" size={30} />
            {t("Please make sure the Current time must between the Start time and End Time.")}
          </DangerItem>
        )}
      </FieldsWrapper>
    </Modal>
  );
};

const FieldsWrapper = styled.div`
  position: relative;
`;

const CustomDateTimeField = styled(DateTimeField)`
  position: absolute;
  background: blue;
`;

const DangerItem = styled.div`
  padding-top: 8px;
  color: ${({ theme }) => theme.dangerous.main};
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export default EditPanel;
