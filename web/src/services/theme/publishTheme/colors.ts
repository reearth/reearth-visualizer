const publishColors = {
  dark: {
    text: {
      strong: "#EDEDED",
      main: "#C7C5C5",
      weak: "#767676",
    },
    icon: {
      strong: "#C6C6C6",
      main: "#7A7777",
      weak: "#353535",
    },
    other: {
      select: "#3B3CD0",
      mask: "#FFFFFF0D",
      background: "#171618",
    },
  },
  light: {
    text: {
      strong: "#FFFFFF",
      main: "#373737",
      weak: "#878282",
    },
    icon: {
      strong: "#E9E9E9",
      main: "#939393",
      weak: "#C7C7C7",
    },
    other: {
      select: "#F57C4B",
      mask: "#0000001A",
      background: "#ECECEC",
    },
  },
  forest: {
    text: {
      strong: "#FFFFFF",
      main: "#F9FEFA",
      weak: "#66AFA2",
    },
    icon: {
      strong: "#3DDCC0",
      main: "#38B09B",
      weak: "#1F8842",
    },
    other: {
      select: "#3F886A",
      mask: "#1F7461",
      background: "#1B5F50",
    },
  },
};

export default publishColors;

export type PublishColors = typeof publishColors;
