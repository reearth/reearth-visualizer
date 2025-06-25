import { useT } from "@reearth/services/i18n";
import { Meta, StoryObj } from "@storybook/react";
import { FC, useCallback, useState } from "react";

import { Button } from "../Button";
import { ModalPanel } from "../ModalPanel";

import { ModalProps, Modal as ModalComponent } from ".";

const meta: Meta<ModalProps> = {
  component: ModalComponent
};

export default meta;
type Story = StoryObj<typeof ModalComponent>;

const Modal: FC<ModalProps> = ({
  size,
  children
}: Omit<ModalProps, "visible">) => {
  const t = useT();
  const [visible, setVisible] = useState(false);

  const handleOpen = useCallback(() => {
    setVisible(true);
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  return (
    <div style={{ height: "50vh" }}>
      <Button title="Open Modal" appearance="primary" onClick={handleOpen} />
      {visible && (
        <ModalComponent size={size} visible={visible}>
          {children ? (
            <div
              style={{
                padding: "24px",
                borderRadius: "4px",
                background: "#262626"
              }}
            >
              {children}
              <div
                style={{
                  justifyContent: "flex-end",
                  display: "flex",
                  paddingTop: "10px"
                }}
              >
                <Button
                  onClick={handleClose}
                  size="normal"
                  title="Okay"
                  appearance="primary"
                />
              </div>
            </div>
          ) : (
            <ModalPanel
              title="Title modal"
              onCancel={handleClose}
              actions={
                <>
                  <Button
                    onClick={handleClose}
                    size="normal"
                    title={t("Cancel")}
                  />
                  <Button size="normal" title="Apply" appearance="primary" />
                </>
              }
            >
              <div style={{ padding: "24px" }}>
                Lorem Ipsum is not simply random text. It has roots in a piece
                of classical Latin literature from 45 BC, making it over 2000
                years old. Richard McClintock, a Latin professor at
                Hampden-Sydney College in Virginia, looked up one of the more
                obscure Latin words, consectetur, from a Lorem Ipsum passage,
                and going through the cites of the word in classical literature,
                discovered the undoubtable source.
              </div>
            </ModalPanel>
          )}
        </ModalComponent>
      )}
    </div>
  );
};

export const SmallSize: Story = {
  render: (args) => {
    return (
      <Modal {...args} size="small">
        <div>
          <h5 style={{ margin: 0, fontSize: "16px", lineHeight: "24px" }}>
            Title
          </h5>
          Lorem Ipsum is not simply random text. It has roots in a piece of
          classical Latin literature from 45 BC, making it over 2000 years old.
          Richard McClintock, a Latin professor at Hampden-Sydney College in
          Virginia, looked up one of the more obscure bvncfyutghjkm,
        </div>
      </Modal>
    );
  },
  args: {
    visible: false
  }
};

export const MediumSize: Story = {
  render: (args) => {
    return <Modal {...args} size="medium" />;
  },
  args: {
    visible: false
  }
};

export const LargeSize: Story = {
  render: (args) => {
    return <Modal {...args} size="large" />;
  },
  args: {
    visible: false
  }
};
