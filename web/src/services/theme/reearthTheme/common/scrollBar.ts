import { rgba } from "@carbon/colors";

export const scrollBar = {
  "* ::-webkit-scrollbar, ::-webkit-scrollbar": {
    width: 8,
    height: 8
  },
  "* ::-webkit-scrollbar-track, ::-webkit-scrollbar-track": {
    background: rgba("#000000", 0.15),
    borderRadius: 10
  },
  "* ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb": {
    background: rgba("#ffffff", 0.1),
    borderRadius: 4
  },
  "* ::-webkit-scrollbar-thumb:hover, ::-webkit-scrollbar-thumb:hover": {
    background: rgba("#ffffff", 0.15)
  }
};

export type ScrollBar = typeof scrollBar;
