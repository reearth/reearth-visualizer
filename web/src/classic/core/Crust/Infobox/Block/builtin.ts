import DataList from "./DataList";
import HTML from "./HTML";
import Image from "./Image";
import Location from "./Location";
import Text from "./Text";
import Video from "./Video";

import type { Component } from ".";

const builtin: Record<string, Component> = {
  "reearth/dlblock": DataList,
  "reearth/imageblock": Image,
  "reearth/locationblock": Location,
  "reearth/textblock": Text,
  "reearth/videoblock": Video,
  "reearth/htmlblock": HTML,
};

export default builtin;
