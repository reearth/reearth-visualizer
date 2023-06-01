import { addons } from "@storybook/manager-api";
import { create } from "@storybook/theming/create";

addons.setConfig({
  theme: create({
    base: "dark",
    fontBase: '"Open Sans", sans-serif',
    fontCode: "monospace",
    brandTitle: "Re:Earth",
    brandUrl: "https://github.com/reearth/reearth",
    brandImage: "/logo.svg",
    brandTarget: "_self",
    colorPrimary: "#E95518",
    colorSecondary: "#4770FF",
  }),
});
