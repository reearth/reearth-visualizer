import { Meta } from "@storybook/react";
import { ReactNode } from "react";

import PropertyTitle from ".";

const Wrapper: React.FC<{ children?: ReactNode }> = ({ children }) => (
  <div style={{ padding: "32px" }}>{children}</div>
);

export default {
  title: "molecules/EarthEditor/PropertyPane/PropertyField/PropertyTitle",
  component: PropertyTitle,
} as Meta;

export const Default = () => (
  <Wrapper>
    <PropertyTitle title="Title" />
  </Wrapper>
);
export const Linked = () => (
  <Wrapper>
    <PropertyTitle isLinked title="Title" />
  </Wrapper>
);
export const Overridden = () => (
  <Wrapper>
    <PropertyTitle isOverridden title="Title" />
  </Wrapper>
);
