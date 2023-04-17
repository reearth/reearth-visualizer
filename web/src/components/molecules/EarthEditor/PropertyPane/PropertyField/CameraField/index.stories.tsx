import { Meta, Story } from "@storybook/react";

import CameraField, { Props } from ".";

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/CameraField",
  component: CameraField,
} as Meta;

export const HasNoCamera: Story<Props> = args => <CameraField {...args} />;

export const HasCamera: Story<Props> = args => (
  <CameraField
    {...args}
    value={{
      lat: 0,
      lng: 0,
      height: 10 ** 8,
      heading: 0,
      pitch: 0,
      roll: 0,
      fov: 1,
    }}
  />
);

export const OnlyPose: Story<Props> = args => (
  <CameraField
    {...args}
    onlyPose
    value={{
      lat: 0,
      lng: 0,
      height: 10 ** 8,
      heading: 0,
      pitch: 0,
      roll: 0,
      fov: 1,
    }}
  />
);
