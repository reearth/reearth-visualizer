import { Meta, StoryFn } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import Component, { Props } from ".";

export default {
  component: Component,
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;

const Template: StoryFn<Props> = (args) => (
  <MemoryRouter>
    <Component {...args} />
  </MemoryRouter>
);

export const Default = Template.bind({});
Default.args = {
  widget: {
    id: "",
    extended: {
      horizontally: false,
      vertically: false
    },

    property: {
      default: [
        {
          description: "Testing",
          logo: "./mock-logo.png",
          creditUrl: "https://www.sample.com/",
          id: "01"
        }
      ]
    }
  },
  context: {
    getCredits: () => [
      { html: '<a href="#">Credit 1</a>' },
      { html: '<a href="#">Credit 2</a>' }
    ]
  }
};
