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
  SliderField,
  TimePointField,
  TimePeriodField,
  ListField,
  MultiSelectInputField,
  TimeField,
} from "./index";

const meta: Meta<typeof InputField> = {
  component: InputField,
};

export default meta;

type Story = StoryObj<typeof InputField>;

const optionsMenu = [
  {
    id: "0",
    title: "delete 1",
    onClick: () => console.log("Option 1 deleted"),
  },
];

export const Components: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <CommonField
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <InputField
        placeholder="Text"
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TwinInputField
        values={["3.14159265", "4.14159265"]}
        content={["Latitude", "Longitude"]}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TripletInputField
        values={["3.14159265", "4.14159265", "3.14159265"]}
        content={["Heading", "Pitch", "Roll"]}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <QuartetInputField
        values={["3.14159265", "4.14159265", "3.14159265", "4.14159265"]}
        content={["x", "y", "z", "w"]}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <AssetField
        fileType="asset"
        placeholder="Asset"
        commonTitle="Field Name"
        extendWidth={true}
        maxWidth={330}
        minWidth={172}
        size="small"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SelectField
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TextareaField
        placeholder="Text"
        commonTitle="Field Name"
        value="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SwitchField
        value={true}
        onChange={() => {}}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <CodeField
        value="const a = 1; const a = 1; const a = 1;"
        height={200}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <ColorField
        value="#000000"
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SpacingField
        values={[10, 10, 12, 12]}
        unit="px"
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <CameraField
        onSave={() => {}}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <SliderField
        value={50}
        onChange={() => {}}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TimePointField
        value="2021-10-10"
        onChange={() => {}}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TimePeriodField
        value={{ currentTime: "2021-10-10", startTime: "2021-10-10", endTime: "2021-10-10" }}
        onChange={() => {}}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <ListField
        title="List Field"
        items={[
          { id: "0", value: "item a" },
          { id: "1", value: "item b" },
          { id: "2", value: "item c" },
        ]}
        addItem={() => {}}
        onSelect={() => {}}
        onItemDrop={() => {}}
        optionsMenu={optionsMenu}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <MultiSelectInputField
        options={[
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "option2" },
          { label: "Option 3", value: "option3" },
        ]}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TimeField
        value="12:00"
        onChange={() => {}}
        commonTitle="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
    </div>
  ),
};
