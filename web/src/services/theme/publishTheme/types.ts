export type PublishThemeType = "dark" | "light" | "forest" | "custom";

export type PremadeThemeType = Exclude<PublishThemeType, "custom">;

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
  themeType?: PublishThemeType;
  themeTextColor?: string;
  themeSelectColor?: string;
  themeBackgroundColor?: string;
};
