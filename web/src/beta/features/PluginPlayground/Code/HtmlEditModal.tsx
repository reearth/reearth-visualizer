import {
  Button,
  CodeInput,
  Modal,
  ModalPanel
} from "@reearth/beta/lib/reearth-ui";
import { styled } from "@reearth/services/theme";
import { FC, useState } from "react";

type Props = {
  isOpened: boolean;
  sourceCode: string;
  onClose: () => void;
  onSubmit: (value: string) => void;
};

const HtmlEditModal: FC<Props> = ({
  isOpened,
  onClose,
  sourceCode,
  onSubmit
}) => {
  const [value, setValue] = useState(sourceCode);
  return (
    <Modal size="large" visible={isOpened}>
      <ModalPanel
        title="HTML Editor"
        onCancel={onClose}
        actions={
          <>
            <Button title="Cancel" onClick={onClose} />
            <Button
              title="Submit"
              appearance="primary"
              onClick={() => {
                onSubmit(value);
                onClose();
              }}
            />
          </>
        }
      >
        <CodeInputWrapper>
          <CodeInput
            language="html"
            value={value}
            onChange={(value) => setValue(value ?? "")}
          />
        </CodeInputWrapper>
      </ModalPanel>
    </Modal>
  );
};

const CodeInputWrapper = styled("div")(({ theme }) => ({
  height: "100%",
  minHeight: "554px",
  padding: theme.spacing.small
}));

export default HtmlEditModal;
