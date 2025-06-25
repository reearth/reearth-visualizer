import {
  Button,
  CodeInput,
  Modal,
  ModalPanel
} from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
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
  const t = useT();
  return (
    <Modal size="large" visible={isOpened}>
      <ModalPanel
        title={t("HTML Editor")}
        onCancel={onClose}
        actions={
          <>
            <Button title={t("Cancel")} onClick={onClose} />
            <Button
              title={t("Submit")}
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
