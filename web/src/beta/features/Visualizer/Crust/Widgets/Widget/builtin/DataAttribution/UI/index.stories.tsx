import { Meta, StoryFn } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import { DataAttributionUI, DataAttributionProps } from ".";

export default {
  component: DataAttributionUI,
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;

export const Normal: StoryFn<DataAttributionProps> = (args) => (
  <MemoryRouter>
    <div style={{ width: "100%", maxWidth: "416px" }}>
      <DataAttributionUI
        {...args}
        credits={[
          {
            description: "Test description",
            logo: "",
            creditUrl: "https://www.sample.com/"
          }
        ]}
      />
    </div>
  </MemoryRouter>
);
