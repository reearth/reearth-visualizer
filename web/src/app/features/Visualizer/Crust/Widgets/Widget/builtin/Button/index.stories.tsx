import { Meta, StoryFn } from "@storybook/react-vite";
import { Math as CesiumMath } from "cesium";

import { contextEvents } from "../../storybook";

import Button, { Props } from ".";

export default {
  component: Button,
  parameters: { actions: { argTypesRegex: "^on.*" } }
} as Meta;

export const Default: StoryFn<Props> = (args) => <Button {...args} />;

Default.args = {
  widget: {
    id: "",
    property: {
      default: {
        id: "default",
        buttonType: "menu",
        buttonStyle: "text",
        buttonTitle: "Menu Button"
      },
      menu: [
        {
          id: "hoge",
          menuTitle: "Hoge",
          menuType: "camera",
          menuCamera: {
            lat: 0,
            lng: 0,
            height: 1000,
            fov: CesiumMath.toRadians(60),
            heading: 0,
            pitch: 0,
            roll: 0
          }
        },
        {
          id: "separator",
          menuType: "border"
        },
        {
          id: "GitHub",
          menuType: "link",
          menuTitle: "GitHub",
          menuLink: "https://github.com"
        }
      ]
    }
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false
};

export const TextButton: StoryFn<Props> = (args) => <Button {...args} />;

TextButton.args = {
  widget: {
    id: "",
    property: {
      default: {
        id: "text-btn",
        buttonType: "link",
        buttonStyle: "text",
        buttonTitle: "Text Button",
        buttonLink: "https://github.com",
        buttonColor: "#333",
        buttonBgcolor: "#fff"
      }
    }
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false
};

export const IconButton: StoryFn<Props> = (args) => <Button {...args} />;

IconButton.args = {
  widget: {
    id: "",
    property: {
      default: {
        id: "icon-btn",
        buttonType: "link",
        buttonStyle: "icon",
        buttonIcon:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='16'/%3E%3Cline x1='8' y1='12' x2='16' y2='12'/%3E%3C/svg%3E",
        buttonLink: "https://github.com",
        buttonColor: "#333",
        buttonBgcolor: "#fff"
      }
    }
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false
};

export const TextIconButton: StoryFn<Props> = (args) => <Button {...args} />;

TextIconButton.args = {
  widget: {
    id: "",
    property: {
      default: {
        id: "texticon-btn",
        buttonType: "camera",
        buttonStyle: "texticon",
        buttonTitle: "Fly To Tokyo",
        buttonIcon:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E",
        buttonCamera: {
          lat: 35.6762,
          lng: 139.6503,
          height: 5000,
          fov: CesiumMath.toRadians(60),
          heading: 0,
          pitch: -1.5,
          roll: 0
        },
        buttonColor: "#fff",
        buttonBgcolor: "#4770FF"
      }
    }
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false
};

export const CustomColorButton: StoryFn<Props> = (args) => (
  <Button {...args} />
);

CustomColorButton.args = {
  widget: {
    id: "",
    property: {
      default: {
        id: "custom-color-btn",
        buttonType: "link",
        buttonStyle: "text",
        buttonTitle: "Custom Colors",
        buttonLink: "https://github.com",
        buttonColor: "#ffffff",
        buttonBgcolor: "#e63946"
      }
    }
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false
};

export const MenuWithIcons: StoryFn<Props> = (args) => <Button {...args} />;

MenuWithIcons.args = {
  widget: {
    id: "",
    property: {
      default: {
        id: "menu-with-icons",
        buttonType: "menu",
        buttonStyle: "texticon",
        buttonTitle: "Actions",
        buttonIcon:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='currentColor'%3E%3Ccircle cx='12' cy='12' r='1'/%3E%3Ccircle cx='12' cy='5' r='1'/%3E%3Ccircle cx='12' cy='19' r='1'/%3E%3C/svg%3E",
        buttonColor: "#333",
        buttonBgcolor: "#f0f0f0"
      },
      menu: [
        {
          id: "home",
          menuTitle: "Home",
          menuIcon: "home",
          menuType: "link",
          menuLink: "https://github.com"
        },
        {
          id: "separator1",
          menuType: "border"
        },
        {
          id: "settings",
          menuTitle: "Settings",
          menuIcon: "setting",
          menuType: "link",
          menuLink: "https://github.com/settings"
        }
      ]
    }
  },
  context: { ...contextEvents },
  isBuilt: false,
  isEditable: false
};
