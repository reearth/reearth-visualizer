import { useLocalState } from "@reearth/state";

export default () => {
  const [{ currentProject }] = useLocalState(s => ({
    currentProject: s.currentProject,
  }));

  //DELETE_ME: When plugin API is ready
  const samplePlugins = [
    {
      id: "hogehoge",
      thumbnail: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
      title: "Storytelling",
      isInstalled: true,
      bodyMarkdown: "# Hoge\n## Fuag",
    },
    {
      id: "fugafuga",
      thumbnail: "https://static.dev.reearth.io/assets/01ep431qsvnjndxhan3gwqd1rj.png",
      title: "Storytelling",
      isInstalled: false,
      bodyMarkdown: "# Hoge\n## Fuag",
    },
  ];

  return { currentProject, plugins: samplePlugins };
};
