import { Meta } from "@storybook/react";
import { ReactNode, CSSProperties } from "react";

import Resizable from ".";

const Container: React.FC<{ children?: ReactNode; style?: CSSProperties }> = ({
  children,
  style,
}) => <div style={{ display: "flex", height: 400, ...style }}>{children}</div>;
const Pane = <div style={{ flex: 1, background: "#ffffff" }} />;
const Content = <div style={{ width: "100%", height: "100%", background: "#ffffff" }} />;

export default {
  title: "atoms/Resizable",
  component: Resizable,
} as Meta;

export const Vertical = () => (
  <Container style={{ flexDirection: "row" }}>
    <Resizable direction="vertical" gutter="end" size={400} minSize={300} maxSize={500}>
      {Content}
    </Resizable>
    {Pane}
  </Container>
);
export const Horizontal = () => (
  <Container style={{ flexDirection: "column" }}>
    <Resizable direction="horizontal" gutter="end" size={200} minSize={100} maxSize={300}>
      {Content}
    </Resizable>
    {Pane}
  </Container>
);
