import { useArgs } from "@storybook/preview-api";
import { Meta, StoryObj } from "@storybook/react";
import { useCallback } from "react";

import { Camera } from "@reearth/beta/utils/value";
import { styled } from "@reearth/services/theme";

import CameraField, { type Props } from ".";

const meta: Meta<typeof CameraField> = {
  component: CameraField,
};

export default meta;

type Story = StoryObj<typeof CameraField>;

export const Default: Story = (args: Props) => {
  const [_, updateArgs] = useArgs();

  const handleSave = useCallback((value?: Camera) => updateArgs({ value: value }), [updateArgs]);

  const handleFlyTo = useCallback(() => updateArgs({ value: undefined }), [updateArgs]);

  return (
    <Wrapper>
      <div>
        <CameraField {...args} onSave={handleSave} onFlyTo={handleFlyTo} />
      </div>
      <div>
        <CameraField {...args} disabled={true} />
      </div>
      <div>
        <CameraField
          {...args}
          name="Camera field without controls"
          onSave={handleSave}
          onFlyTo={undefined}
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
  onSave: (value?: Camera) => console.log("saved camera value: ", value),
  onFlyTo: target => console.log("Fly to", target),
};

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10%;
  margin-left: 2rem;
  margin-top: 2rem;
  height: 300px;
`;
