import React, { useEffect } from "react";
import { withAuthenticationRequired } from "@auth0/auth0-react";

import { PublishedAppProvider as ThemeProvider } from "../../../theme";
import AuthenticationRequiredPage from "@reearth/components/pages/Common/AuthenticationRequiredPage";
import CanvasArea from "@reearth/components/organisms/EarthEditor/CanvasArea";
import { useLocalState } from "@reearth/state";

export type Props = {
  path?: string;
  sceneId?: string;
};

const PreviewPage: React.FC<Props> = ({ sceneId }) => {
  const [sceneId2, setLocalState] = useLocalState(s => ({ sceneId: s.sceneId }));
  useEffect(() => {
    setLocalState({ sceneId });
  }, [sceneId, setLocalState]);

  return sceneId2 ? (
    <ThemeProvider>
      <AuthenticationRequiredPage>
        <CanvasArea isBuilt />
      </AuthenticationRequiredPage>
    </ThemeProvider>
  ) : null;
};

export default withAuthenticationRequired(PreviewPage);
