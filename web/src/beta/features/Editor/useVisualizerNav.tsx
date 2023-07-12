import { ReactNode, useMemo } from "react";

import WidgetNav from "@reearth/beta/features/Editor/tabs/widgets/Nav";
import VisualizerNav from "@reearth/beta/features/Editor/VisualizerNav";
import { Tab } from "@reearth/beta/features/Navbar";

import { Layout } from "./types";

type Props = {
  tab: Tab;
  layout: Layout;
  showWidgetEditor?: boolean;
  handleLayoutChange: (newLayout: Layout) => void;
  handleWidgetEditorToggle: () => void;
};

export default ({
  tab,
  layout,
  showWidgetEditor,
  handleLayoutChange,
  handleWidgetEditorToggle,
}: Props) => {
  const visualizerNav = useMemo<ReactNode | undefined>(() => {
    switch (tab) {
      case "widgets":
        return (
          <WidgetNav
            showWidgetEditor={showWidgetEditor}
            layout={layout}
            onShowWidgetEditor={handleWidgetEditorToggle}
            onLayoutChange={handleLayoutChange}
          />
        );
      case "publish":
        return <VisualizerNav />;
      case "scene":
      case "story":
      default:
        return undefined;
    }
  }, [tab, layout, showWidgetEditor, handleLayoutChange, handleWidgetEditorToggle]);

  return {
    visualizerNav,
  };
};
