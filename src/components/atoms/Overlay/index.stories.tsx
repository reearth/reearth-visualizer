import { Meta } from "@storybook/react";
import React from "react";

import Overlay from ".";

const Container: React.FC = ({ children }) => (
  <div style={{ position: "relative", width: 200, height: 200, background: "#ffffff" }}>
    {children}
  </div>
);

export default {
  title: "atoms/Overlay",
  component: Overlay,
} as Meta;

export const Show = () => (
  <Container>
    <Overlay show />
  </Container>
);
export const Hide = () => (
  <Container>
    <Overlay />
  </Container>
);
