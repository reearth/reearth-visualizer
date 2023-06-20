import { Meta } from "@storybook/react";

import Balloon from ".";

const descriptionTitle = "Title";
const descriptionText = "Description";
const img = {
  imagePath: "/sample.svg",
  alt: "sample image",
};

export default {
  title: "classic/atoms/Balloon",
  component: Balloon,
} as Meta;

export const Default = () => (
  <Balloon title={descriptionTitle} description={descriptionText} img={img} />
);
