import commonColors from "../common/colors";

const colors = {
  bg: {
    1: "#8C8A8A",
    2: "#B6B6B6",
    3: "#D0D0D0",
    4: "#E0E0E0",
    5: "#FFFCFC",
  },
  text: {
    strong: "#272727",
    main: "#434343",
    weak: "#727070",
    weakest: "#BABABA",
  },
  outline: {
    strong: "#0D0D0D",
    main: "#727272",
    weak: "#8B8B8B",
    weakest: "#AAAAAA",
  },
  primary: {
    strong: "#005F94",
    main: "#007CC1",
    weak: "#008AC8",
    weakest: "#74A8BE",
  },
  secondary: {
    main: "#4D4D4D",
    weak: "#8E8E8E",
    weakest: "#A3A3A3",
  },
  danger: {
    main: "#FF3C53",
    weak: "#B02838",
    weakest: "#E0A0A7",
  },
  functional: {
    link: "#0063D8",
    notice: "#6E9CD2",
    select: commonColors.brand.orange.strong,
    success: "#00B68D",
    attention: "#E17A00",
    override: "#D58000",
    error: "#FF3C53",
  },
};

export default colors;

export type Colors = typeof colors;
