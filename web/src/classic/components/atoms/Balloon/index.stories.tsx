import { storiesOf } from "@storybook/react";

import Balloon from ".";

const descriptionTitle = "Title";
const descriptionText = "Description";
const img = {
  imagePath: "/sample.svg",
  alt: "sample image",
};

storiesOf("atoms/Balloon", module).add("default", () => (
  <Balloon title={descriptionTitle} description={descriptionText} img={img} />
));
