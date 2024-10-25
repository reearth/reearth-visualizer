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
          logo: "http://localhost:8080/assets/01jb0cxyw452dxn3p7gf2f3g1h.jpg",
          creditUrl: "https://www.sample.com/",
          id: "01jb0csj957b7sxdycch7byvc4"
        }
      ]
    }
  },
  context: {
    credits: [
      {
        html: `<a href="https://cesium.com/" target="_blank"> <img src="http://localhost:3000/cesium-1.118.0/Assets/Images/ion-credit.png" title="Cesium ion" /></a>`
      }
    ]
  }
};
