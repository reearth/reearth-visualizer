import { BlockComponent } from "../../PluginBlock";

import TextBlock from "./text";
import ImageBlock from "./image";
import VideoBlock from "./video";
import LocationBlock from "./location";
import DataListBlock from "./datalist";

export default {
  textblock: TextBlock,
  imageblock: ImageBlock,
  videoblock: VideoBlock,
  locationblock: LocationBlock,
  dlblock: DataListBlock,
} as { [key: string]: BlockComponent };
