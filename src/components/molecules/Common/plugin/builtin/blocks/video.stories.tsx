import React from "react";
import { Meta } from "@storybook/react";
import Video from "./video";

export default {
  title: "molecules/Common/plugin/builtin/blocks/Video",
  component: Video,
} as Meta;

export const Default = () => (
  <Video property={{ default: { url: "https://www.youtube.com/watch?v=oUFJJNQGwhk" } }} />
);
export const Title = () => (
  <Video
    property={{
      default: { url: "https://www.youtube.com/watch?v=oUFJJNQGwhk", title: "Video" },
    }}
  />
);
export const NoVideo = () => <Video property={{ default: {} }} />;
export const Selected = () => <Video isSelected property={{ default: {} }} />;
export const Editable = () => <Video isEditable property={{ default: {} }} />;
export const Built = () => <Video isBuilt property={{ default: {} }} />;
