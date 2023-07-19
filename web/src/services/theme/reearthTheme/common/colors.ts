const colors = {
  general: {
    black: "#000000",
    white: "#FFFFFF",
    transparentBlack: "rgba(0,0,0,0.7)",
    transparentLight: "rgba(0,0,0,0.4)",
    mainSelect: "#3B3CD0",
    weakOutline: "#525252",
    bg: {
      1: "#1e2086",
      2: "#df3013",
      3: "#161616",
      4: "#393939",
    },
    text: {
      main: "#E0E0E0",
      weak: "#6F6F6F",
      weaker: "#525252",
    },
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
  },
};

export default colors;

export type Colors = typeof colors;
