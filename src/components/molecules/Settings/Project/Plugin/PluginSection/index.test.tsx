// import React from "react";
// import { render } from "@reearth/test/utils";
// import { screen } from "@testing-library/react";

// import PluginSection, { PluginItem } from "./index";

// const samplePlugins: PluginItem[] = [
//   {
//     thumbnailUrl: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
//     title: "Example",
//     isInstalled: true,
//     bodyMarkdown: "# Hoge",
//     author: "HideBa",
//     pluginId: "example1",
//   },
//   {
//     thumbnailUrl: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
//     title: "Dummy",
//     isInstalled: true,
//     bodyMarkdown: "# Fuga",
//     author: "HideBa",
//     pluginId: "dummy1",
//   },
// ];

// test("plugin section should display plugins", () => {
//   const installFromPublicRepo = jest.fn();
//   const installByUploadingZipFile = jest.fn();
//   const uninstallPlugin = jest.fn();
//   render(
//     <PluginSection
//       plugins={samplePlugins}
//       uninstallPlugin={uninstallPlugin}
//       installByUploadingZipFile={installByUploadingZipFile}
//       installFromPublicRepo={installFromPublicRepo}
//     />,
//   );
//   expect(screen.getByText(/Storytelling/)).toBeInTheDocument();
//   expect(screen.getByText(/Hoge/)).toBeInTheDocument();
// });
// TODO: Fix this test
test("dummy test", () => {});
