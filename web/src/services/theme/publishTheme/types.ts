export type PublishThemeType = "dark" | "light" | "forest";

export type PublishColors = { [key in PublishThemeType]: Colors };

export type Colors = {
  text: {
    strong: string;
    main: string;
    weak: string;
  };
  icon: {
    strong: string;
    main: string;
    weak: string;
  };
  other: {
    select: string;
    mask: string;
    background: string;
  };
};
