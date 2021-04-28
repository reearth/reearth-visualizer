import React from "react";
import { render } from "@reearth/test/utils";

import PluginSection from "./index";

const samplePlugins = [
  {
    id: "hogehoge",
    thumbnail: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
    title: "Storytelling",
    isInstalled: true,
    bodyMarkdown: "# Hoge",
  },
  {
    id: "fugafuga",
    thumbnail: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
    title: "Splashscreen",
    isInstalled: true,
    bodyMarkdown: "# Fuga",
  },
];

test("plugin section should display plugins", () => {
  render(<PluginSection plugins={samplePlugins} />);
  // TODO: after plug-ins have been developed uncomment here
  // expect(screen.getByText(/Storytelling/)).toBeInTheDocument();
  // expect(screen.getByText(/Hoge/)).toBeInTheDocument();
});
