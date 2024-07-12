const zIndex = {
  base: 1,
  hidden: -1,
  form: 100,
  infoBox: 300,
  propertyFieldPopup: 500,
  descriptionBalloon: 550,
  pluginPopup: 560,
  pluginModal: 570,
  dropDown: 600,
  fullScreenModal: 700,
  loading: 800,
  notificationBar: 1000,
  splashScreen: 700,
  settingHeader: 300,
  menuForDevice: 200,
};

export default zIndex;

export type ZIndex = typeof zIndex;
