const commonColors = {
  general: {
    transparent: "transparent",
    transparentLight: "rgba(0,0,0,0.4)",
    transparentBlack: "rgba(0,0,0,0.7)",
  },
  brand: {
    blue: {
      weak: "#161650",
      main: "#212288",
      strong: "#3B3CD0",
      strongest: "#4770FF",
      strongest50: "#4770FF80",
    },
    orange: {
      weak: "#812702",
      main: "#E95518",
      main50: "#E9551880",
      strong: "#F57C4B",
    },
    bg: {
      1: "#1e2086",
      2: "#df3013",
    },
  },
  publish: {
    published: "#00A0E8",
    building: "#A0A0A0",
    unpublished: "#3B383F",
  },
};

export default commonColors;

export type CommonColors = typeof commonColors;
