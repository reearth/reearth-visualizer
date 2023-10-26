import Button from "@reearth/beta/components/Button";
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
  const { data, handleOnChange, onAppyChange } = useHooks({ value, onChange });

  console.log(value);
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
            // disabled={true}
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

export default EditPanel;
