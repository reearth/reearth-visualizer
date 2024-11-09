import { CodeInput, Modal, ModalPanel } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

type Props = {
  opened: boolean;
  sourceCode: string;
};

const HtmlEditor: FC<Props> = ({ opened, sourceCode }) => {
  return (
    <div
      style={{
        maxHeight: "50vh"
      }}
    >
      <Modal size="medium" visible={opened}>
        <CodeInput language="html" value={sourceCode} />
      </Modal>
    </div>
  );
};



export default HtmlEditor;
