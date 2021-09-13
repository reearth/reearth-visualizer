import { storiesOf } from "@storybook/react";
import React from "react";

import Balloon from ".";

const descriptionTitle = "Title";
const descriptionText = "Description";
const img = {
  imagePath: `${process.env.PUBLIC_URL}/sample.svg`,
  alt: "sample image",
};

storiesOf("atoms/Balloon", module).add("default", () => (
  <Balloon title={descriptionTitle} description={descriptionText} img={img} />
));
