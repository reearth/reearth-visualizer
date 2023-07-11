import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

import CanvasArea from "@reearth/classic/components/organisms/EarthEditor/CanvasArea";
import CoreCanvasArea from "@reearth/classic/components/organisms/EarthEditor/core/CanvasArea";
import { useCore } from "@reearth/classic/util/use-core";
import { Provider as DndProvider } from "@reearth/classic/util/use-dnd";
import { AuthenticatedPage } from "@reearth/services/auth";
import { useSceneId } from "@reearth/services/state";
import { PublishedAppProvider as ThemeProvider } from "@reearth/services/theme";

export type Props = {
  path?: string;
};

const PreviewPage: React.FC<Props> = () => {
  const { sceneId } = useParams();
  const [sceneId2, setSceneId] = useSceneId();
  const core = useCore("earth_editor");

  useEffect(() => {
    setSceneId(sceneId);
  }, [sceneId, setSceneId]);

  return sceneId2 ? (
    <ThemeProvider>
      <DndProvider>
        <AuthenticatedPage>
          {typeof core === "boolean" && (core ? <CoreCanvasArea /> : <CanvasArea />)}
        </AuthenticatedPage>
      </DndProvider>
    </ThemeProvider>
  ) : null;
};

export default PreviewPage;
