import { Meta, StoryObj } from "@storybook/react";

import {
  InputField,
  TwinInputField,
  TripletInputField,
  QuartetInputField,
  AssetField,
} from "./index";

const meta: Meta<typeof InputField> = {
  component: InputField,
};

export default meta;

type Story = StoryObj<typeof InputField>;

export const Components: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <InputField
        placeholder="Text"
        title="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TwinInputField
        values={["3.14159265", "4.14159265"]}
        content={["Latitude", "Longitude"]}
        title="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <TripletInputField
        values={["3.14159265", "4.14159265", "3.14159265"]}
        content={["Heading", "Pitch", "Roll"]}
        title="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <QuartetInputField
        values={["3.14159265", "4.14159265", "3.14159265", "4.14159265"]}
        content={["x", "y", "z", "w"]}
        title="Field Name"
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
      <AssetField
        fileType="asset"
        placeholder="Asset"
        title="Field Name"
        extendWidth={true}
        maxWidth={330}
        minWidth={172}
        size={"small"}
        description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla.Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. Duis cursus, mi quis viverra ornare, eros dolor interdum nulla."
      />
    </div>
  ),
};
