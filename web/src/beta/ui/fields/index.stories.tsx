import { Meta, StoryObj } from "@storybook/react";

import {
  CommonField,
  InputField,
  TwinInputField,
  TripletInputField,
  QuartetInputField,
  AssetField,
  SelectField,
  TextareaField,
  SwitchField,
  CodeField,
  ColorField,
  SpacingField,
  CameraField,
  TimePeriodField,
  TimePointField,
  NumberField,
  RangeField,
} from "./index";

const meta: Meta<typeof InputField> = {
  component: InputField,
};

export default meta;

type Story = StoryObj<typeof InputField>;
export const Components: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        maxWidth: "500px",
        padding: "24px",
        margin: "0 auto",
      }}>
      <CommonField
        commonTitle="CommonField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />

      <InputField
        placeholder="Text"
        commonTitle="InputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <NumberField
        placeholder="Value"
        value={2}
        commonTitle="NumberField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TwinInputField
        values={[3.1415926, 3.1415926]}
        content={["Latitude", "Longitude"]}
        commonTitle="TwinInputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TripletInputField
        values={[3.1415926, 3.1415926, 3.1415926]}
        content={["Heading", "Pitch", "Roll"]}
        commonTitle="TripletInputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <QuartetInputField
        values={[3.1415926, 3.1415926, 3.1415926, 3.1415926]}
        content={["x", "y", "z", "w"]}
        commonTitle="QuartetInputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TextareaField
        placeholder="Text"
        commonTitle="TextareaField"
        value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SelectField
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]}
        multiple={true}
        commonTitle="SelectField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />

      <SwitchField
        value={true}
        onChange={() => {}}
        commonTitle="SwitchField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <CodeField
        value="const a = 1; const a = 1; const a = 1;"
        height={200}
        commonTitle="CodeField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <ColorField
        value="#000000"
        commonTitle="ColorField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <AssetField
        fileType="asset"
        placeholder="Asset"
        commonTitle="AssetField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <CameraField
        onSave={() => {}}
        commonTitle="CameraField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SpacingField
        commonTitle="SpacingField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TimePointField
        value="2023-10-24T00:00:00+09:00"
        commonTitle="TimePointField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TimePeriodField
        value={{
          currentTime: "2024-07-19T11:03:56+00:00",
          startTime: "2024-07-20T11:03:56+00:00",
          endTime: "2024-07-24T11:03:56+00:00",
        }}
        onChange={() => {}}
        commonTitle="TimePeriodField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <RangeField
        values={[3, 15]}
        content={["min", "max"]}
        commonTitle="RangeField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
    </div>
  ),
};
