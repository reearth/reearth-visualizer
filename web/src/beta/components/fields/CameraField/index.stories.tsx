import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { styled } from "@reearth/services/theme";

import CameraField, { Props, CameraValue } from ".";

const meta: Meta<typeof CameraField> = {
  component: CameraField,
};

export default meta;

type Story = StoryObj<typeof CameraField>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleChange = useCallback(
    (value: CameraValue) => updateArgs({ value: value }),
    [updateArgs],
  );

  const handleClean = useCallback(() => updateArgs({ value: undefined }), [updateArgs]);

  const handleJump = useCallback(
    (value: CameraValue) => console.log("Jumping to camera value", value),
    [],
  );

  const handleCapture = useCallback(() => {
    console.log("on capture updates a random value");
    updateArgs({
      value: {
        lat: (Math.random() * 180).toFixed(2),
        lng: (Math.random() * 180).toFixed(2),
        altitude: (Math.random() * 100).toFixed(2),
        heading: (Math.random() * 10).toFixed(2),
        pitch: (Math.random() * 10).toFixed(2),
        roll: (Math.random() * 10).toFixed(2),
        fov: (Math.random() * 180).toFixed(2),
      },
    });
  }, [updateArgs]);

  return (
    <Wrapper>
      <div>
        <CameraField
          {...args}
          onChange={handleChange}
          onClean={handleClean}
          onJump={handleJump}
          onCapture={handleCapture}
        />
      </div>
      <div>
        <CameraField {...args} disabled={true} />
      </div>
      <div>
        <CameraField
          {...args}
          name="Camera field without controls"
          onChange={handleChange}
          onClean={undefined}
          onJump={undefined}
          onCapture={undefined}
        />
      </div>
    </Wrapper>
  );
};

Default.args = {
  name: "Camera field",
  description: "Camera field description",
  value: undefined,
  disabled: false,
  onCapture: () => console.log("captured"),
  onJump: (input: CameraValue) => console.log("Jump to", input),
  onClean: () => console.log("clean camera value"),
  onChange: (value: CameraValue) => console.log("updated camera value", value),
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10%;
  margin-left: 2rem;
  margin-top: 2rem;
  height: 300px;
`;
