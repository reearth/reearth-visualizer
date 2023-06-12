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

export type PublishTheme = {
  strongText: string;
  mainText: string;
  weakText: string;
  strongIcon: string;
  mainIcon: string;
  weakIcon: string;
  select: string;
  mask: string;
  background: string;
};

export type SceneThemeOptions = {
  themeType?: "light" | "dark" | "forest" | "custom";
  themeTextColor?: string;
  themeSelectColor?: string;
  themeBackgroundColor?: string;
};
