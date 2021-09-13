import React, { useEffect } from "react";

import { withAuthenticationRequired, AuthenticationRequiredPage } from "@reearth/auth";
import CanvasArea from "@reearth/components/organisms/EarthEditor/CanvasArea";
import { useSceneId } from "@reearth/state";

import { PublishedAppProvider as ThemeProvider } from "../../../theme";

export type Props = {
  path?: string;
  sceneId?: string;
};

const PreviewPage: React.FC<Props> = ({ sceneId }) => {
  const [sceneId2, setSceneId] = useSceneId();

  useEffect(() => {
    setSceneId(sceneId);
  }, [sceneId, setSceneId]);

  return sceneId2 ? (
    <ThemeProvider>
      <AuthenticationRequiredPage>
        <CanvasArea isBuilt />
      </AuthenticationRequiredPage>
    </ThemeProvider>
  ) : null;
};

export default withAuthenticationRequired(PreviewPage);
