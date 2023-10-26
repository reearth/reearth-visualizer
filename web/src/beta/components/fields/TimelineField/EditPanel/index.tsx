import Button from "@reearth/beta/components/Button";
import Icon from "@reearth/beta/components/Icon";
import Modal from "@reearth/beta/components/Modal";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";

import DateTimeField from "../../DateTimeField";

import useHooks from "./hooks";

type EditPanelProps = {
  isVisible?: boolean;
  value?: string;
  onClose?: () => void;
  onChange?: (value?: string | undefined) => void;
};

const EditPanel = ({ isVisible, value, onClose, onChange }: EditPanelProps) => {
  const t = useT();
  const { data, warning, isDisabled, handleOnChange, onAppyChange } = useHooks({
    value,
    onChange,
    onClose,
  });

  return (
    <Wrapper>
      <Modal
        isVisible={isVisible}
        size="sm"
        title={t("Timeline Settings")}
        button1={<Button text={t("Cancel")} buttonType="secondary" onClick={onClose} />}
        button2={
          <Button
            text={t("Apply")}
            buttonType="primary"
            disabled={!isDisabled || warning}
            onClick={onAppyChange}
          />
        }>
        <FieldsWrapper>
          <CustomDateTimeField
            name={t("* Start Time")}
            description={t("Start time for the timeline")}
            onChange={newValue => handleOnChange(newValue || "", "startTime")}
            value={data?.startTime}
          />
          <CustomDateTimeField
            name={t("* End Time ")}
            onChange={newValue => handleOnChange(newValue || "", "stopTime")}
            description={t("End time for the timeline")}
            value={data?.stopTime}
          />
          <CustomDateTimeField
            name={t("* Current Time ")}
            description={t("Current time should be between start and end time")}
            onChange={newValue => handleOnChange(newValue || "", "currentTime")}
            value={data?.currentTime}
          />
          {warning && (
            <DangerItem>
              <Icon icon="alert" size={30} />
              {t("Please make sure the Current time must between the Start time and End Time.")}
            </DangerItem>
          )}
        </FieldsWrapper>
      </Modal>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;
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
