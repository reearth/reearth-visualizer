module.exports = {
  stories: ["../src/**/*.stories.@(js|ts|tsx|mdx)"],
  addons: [
    {
      name: "@storybook/addon-essentials",
    },
  ],
  core: {
    builder: "webpack5",
    disableTelemetry: true,
  },
};
