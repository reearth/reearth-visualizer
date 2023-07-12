import { useCallback, useState } from "react";

import { useWidgetAlignEditorActivated } from "@reearth/services/state";

import { Layout } from "./types";

export default () => {
  const [layout, setLayout] = useState<Layout>("desktop");
  const [showWidgetEditor, setWidgetEditor] = useWidgetAlignEditorActivated();

  const handleLayoutChange = useCallback((newLayout: Layout) => setLayout(newLayout), []);

  const handleWidgetEditorToggle = useCallback(
    () => setWidgetEditor(show => !show),
    [setWidgetEditor],
  );

  return { layout, showWidgetEditor, handleLayoutChange, handleWidgetEditorToggle };
};
