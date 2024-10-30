import { rgba } from "@carbon/colors";

const scrollBar = {
  width: 8,
  scrollbarTrack: {
    background: rgba("#000000", 0.15),
    radius: 10
  },
  scrollbarThumb: {
    background: rgba("#ffffff", 0.1),
    radius: 4
  },
  scrollbarThumbHover: {
    background: rgba("#ffffff", 0.15)
  }
};

export default scrollBar;

export type ScrollBar = typeof scrollBar;
