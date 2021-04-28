import React from "react";
import { Meta } from "@storybook/react";
import Image from "./image";

export default {
  title: "molecules/Common/plugin/builtin/blocks/Image",
  component: Image,
} as Meta;

export const Default = () => <Image property={{ default: { image: "/sample.svg" } }} />;
export const NoImage = () => <Image property={{ default: {} }} />;
export const Title = () => (
  <Image property={{ default: { image: "/sample.svg", title: "Title" } }} />
);
export const FullSize = () => (
  <Image property={{ default: { image: "/sample.svg", fullSize: true } }} />
);
export const Cover = () => (
  <Image property={{ default: { image: "/sample.svg", imageSize: "cover", title: "Title" } }} />
);
export const Position = () => (
  <Image
    property={{
      default: {
        image: "/sample.svg",
        imageSize: "cover",
        title: "Title",
        imagePositionX: "left",
        imagePositionY: "top",
      },
    }}
  />
);
export const Selected = () => <Image isSelected property={{ default: {} }} />;
export const Editable = () => <Image isSelected isEditable property={{ default: {} }} />;
export const Built = () => <Image isBuilt property={{ default: {} }} />;
