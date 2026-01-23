import { Meta, StoryObj } from "@storybook/react-vite";

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
  CheckboxField,
  SliderField
} from "./index";

const meta: Meta<typeof InputField> = {
  component: InputField
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
        margin: "0 auto"
      }}
    >
      <CommonField
        title="CommonField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />

      <InputField
        placeholder="Text"
        title="InputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <NumberField
        placeholder="Value"
        value={2}
        title="NumberField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TwinInputField
        values={[3.1415926, 3.1415926]}
        content={["Latitude", "Longitude"]}
        title="TwinInputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TripletInputField
        values={[3.1415926, 3.1415926, 3.1415926]}
        content={["Heading", "Pitch", "Roll"]}
        title="TripletInputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <QuartetInputField
        values={[3.1415926, 3.1415926, 3.1415926, 3.1415926]}
        content={["x", "y", "z", "w"]}
        title="QuartetInputField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TextareaField
        placeholder="Text"
        title="TextareaField"
        value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SelectField
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" }
        ]}
        multiple={true}
        title="SelectField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />

      <SwitchField
        value={true}
        onChange={() => {}}
        title="SwitchField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <CodeField
        value="const a = 1; const a = 1; const a = 1;"
        height={200}
        title="CodeField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <ColorField
        value="#000000"
        title="ColorField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <AssetField
        inputMethod="asset"
        placeholder="Asset"
        title="AssetField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <CameraField
        onSave={() => {}}
        title="CameraField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SpacingField
        title="SpacingField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TimePointField
        value="2023-10-24T00:00:00+09:00"
        title="TimePointField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TimePeriodField
        value={{
          currentTime: "2024-07-19T11:03:56+00:00",
          startTime: "2024-07-20T11:03:56+00:00",
          endTime: "2024-07-24T11:03:56+00:00"
        }}
        onChange={() => {}}
        title="TimePeriodField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <RangeField
        values={[3, 15]}
        content={["min", "max"]}
        title="RangeField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <CheckboxField
        onChange={() => {}}
        value={true}
        title="CheckboxField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SliderField
        value={10}
        min={0}
        max={5}
        title="SliderField"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
    </div>
  )
};
