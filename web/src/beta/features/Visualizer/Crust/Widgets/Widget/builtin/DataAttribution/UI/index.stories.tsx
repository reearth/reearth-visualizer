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
        widget={{
          id: "",
          extended: {
            horizontally: false,
            vertically: false
          },
          property: {
            default: [
              {
                description: "Testing",
                creditUrl: "https://www.sample.com/",
                id: "01"
              }
            ]
          }
        }}
        credits={[
          {
            html: `<a href="https://example.com" target="_blank">Example Credit</a>`
          }
        ]}
      />
    </div>
  </MemoryRouter>
);
