import React from "react";

import { withAuthenticationRequired, AuthenticationRequiredPage } from "@reearth/auth";
import EarthEditorPage from "@reearth/components/molecules/EarthEditor/EarthEditorPage";
import CanvasArea from "@reearth/components/organisms/EarthEditor/CanvasArea";
import Header from "@reearth/components/organisms/EarthEditor/Header";
import LeftMenu from "@reearth/components/organisms/EarthEditor/LeftMenu";
import PrimitiveHeader from "@reearth/components/organisms/EarthEditor/PrimitiveHeader";
import RightMenu from "@reearth/components/organisms/EarthEditor/RightMenu";

import useHooks from "./hooks";

export type Props = {
  path?: string;
  sceneId?: string;
};

const EarthEditor: React.FC<Props> = ({ sceneId }) => {
  const { loading, loaded } = useHooks(sceneId);

  return (
    <AuthenticationRequiredPage>
      <EarthEditorPage
        loading={loading}
        loaded={loaded}
        header={<Header />}
        left={<LeftMenu />}
        centerTop={<PrimitiveHeader />}
        center={<CanvasArea />}
        right={<RightMenu />}
      />
    </AuthenticationRequiredPage>
  );
};

export default withAuthenticationRequired(EarthEditor);
