export type CommonColors = {
  general: {
    transparent: string;
    transparentLight: string;
    transparentBlack: string;
  };
  brand: {
    blue: {
      weak: string;
      main: string;
      strong: string;
      strongest: string;
      strongest50: string;
    };
    orange: {
      weak: string;
      main: string;
      main50: string;
      strong: string;
    };
    bg: {
      1: string;
      2: string;
    };
  };
};

export type Colors = {
  bg: {
    1: string;
    2: string;
    3: string;
    4: string;
    5: string;
    6?: string;
  };
  text: {
    strong: string;
    main: string;
    weak: string;
  };
  outline: {
    strong: string;
    main: string;
    weak: string;
    weakest: string;
  };
  primary: {
    strong: string;
    main: string;
    weak: string;
    weakest: string;
  };
  secondary: {
    main: string;
    weak: string;
    weakest: string;
  };
  danger: {
    main: string;
    weak: string;
    weakest: string;
  };
  functional: {
    link: string;
    success: string;
    attention: string;
    error: string;
    select: string;
    notice: string;
  };
  other: {
    black: string;
    white: string;
  };
};
