import { Meta } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";

import NotFound from ".";

export default {
  component: NotFound
} as Meta;

export const Default = () => (
  <MemoryRouter>
    <NotFound />
  </MemoryRouter>
);
