import { Meta, Story } from "@storybook/react";

import PrimitiveHeader, { Props } from ".";

const primitives = [
  {
    id: "hoge",
    name: "Elipsoid",
    description: "This is an Elipsoid. This is an Elipsoid.",
    icon: "ellipsoid",
  },
  {
    id: "hoge",
    name: "marker",
    description: "This is a marker Elipsoid. This is a marker.",
    icon: "marker",
  },
  {
    id: "hoge",
    name: "resource",
    description: "This is an resource. This is an resource.",
    icon: "resource",
  },
  {
    id: "hoge",
    name: "polyline",
    description: "This is an polyline. This is an polyline.",
    icon: "polyline",
  },
];
const defaultProps = {
  primitives: primitives,
};

export default {
  title: "molecules/EarthEditor/PrimitiveHeader",
  component: PrimitiveHeader,
} as Meta;

export const Default: Story<Props> = args => <PrimitiveHeader {...args} />;

Default.args = defaultProps;
