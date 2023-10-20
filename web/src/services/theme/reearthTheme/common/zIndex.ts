const zIndex = {
  base: 1,
  hidden: -1,
  form: 100,
  menuForDevice: 200,
  settingHeader: 300,
  infoBox: 300,
  propertyFieldPopup: 500,
  descriptionBalloon: 550,
  pluginPopup: 560,
  pluginModal: 570,
  dropDown: 600,
  fullScreenModal: 700,
  splashScreen: 700,
  loading: 800,
  notificationBar: 1000,
};

export const newZIndex = {
  visualizer: {
    widget: 200,
    storyPanel: 200,
    storyBlock: 205,
    storyPage: {
      indicator: {
        unselected: 210,
        selected: 215,
      },
    },
    pluginPopup: 300,
    pluginModal: 305,
    infobox: 400,
  },
  editor: {
    navbar: 500,
    panel: 500,
    popover: 600,
    modal: {
      bg: 700,
      self: 705,
    },
  },
};

export default zIndex;

export type ZIndex = typeof zIndex;
