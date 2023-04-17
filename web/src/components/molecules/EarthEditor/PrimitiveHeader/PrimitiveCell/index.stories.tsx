import { Meta } from "@storybook/react";

import PrimitiveCell from ".";

export default {
  title: "molecules/EarthEditor/PrimitiveHeader/PrimitiveCell",
  component: PrimitiveCell,
} as Meta;

export const Default = () => (
  <PrimitiveCell
    name="Point"
    description="This is a description. Hoge Hoge..."
    icon={`<svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="css-1t9xarj" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>`}
  />
);
