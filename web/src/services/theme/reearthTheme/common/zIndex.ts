export const zIndex = {
  visualizer: {
    widget: 200,
    storyPanel: 200,
    storyBlock: 205,
    storyBlockAddBar: 210,
    storyPage: {
      indicator: {
        unselected: 210,
        selected: 215,
      },
    },
    pluginPopup: 300,
    pluginModal: 305,
    infobox: 400,
    overlay: 600,
  },
  editor: {
    navbar: 500,
    panel: 500,
    popover: 600,
    modal: {
      bg: 700,
      self: 705,
    },
    loading: 900,
    notificationBar: 1000,
  },
  hidden: -1,
};

export default zIndex;

export type ZIndex = typeof zIndex;
