import { Meta } from "@storybook/react";
import { MemoryRouter } from "react-router-dom";

import NotFound from ".";

export default {
  component: NotFound
} as Meta;

export const Default = () => (
  <MemoryRouter>
    <NotFound />
  </MemoryRouter>
);
