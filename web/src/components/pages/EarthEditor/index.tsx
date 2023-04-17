import React from "react";
import { useParams } from "react-router-dom";

import { withAuthenticationRequired, AuthenticationRequiredPage } from "@reearth/auth";
import BrowserWidthWarning from "@reearth/components/molecules/Common/BrowserWidthWarning";
import EarthEditorPage from "@reearth/components/molecules/EarthEditor/EarthEditorPage";
import CanvasArea from "@reearth/components/organisms/EarthEditor/CanvasArea";
import CoreCanvasArea from "@reearth/components/organisms/EarthEditor/core/CanvasArea";
import Header from "@reearth/components/organisms/EarthEditor/Header";
import LeftMenu from "@reearth/components/organisms/EarthEditor/LeftMenu";
import PrimitiveHeader from "@reearth/components/organisms/EarthEditor/PrimitiveHeader";
import RightMenu from "@reearth/components/organisms/EarthEditor/RightMenu";
import { useCore } from "@reearth/util/use-core";
import { Provider as DndProvider } from "@reearth/util/use-dnd";

import useHooks from "./hooks";

export type Props = {
  path?: string;
};

const EarthEditor: React.FC<Props> = () => {
  const { sceneId } = useParams();
  const { loading, loaded } = useHooks(sceneId);
  const core = useCore("earth_editor");

  return (
    <AuthenticationRequiredPage>
      <BrowserWidthWarning />
      <DndProvider>
        <EarthEditorPage
          loading={loading}
          loaded={loaded}
          header={<Header />}
          left={<LeftMenu />}
          centerTop={<PrimitiveHeader />}
          center={
            typeof core == "boolean" &&
            (core ? <CoreCanvasArea inEditor /> : <CanvasArea inEditor />)
          }
          right={<RightMenu />}
        />
      </DndProvider>
    </AuthenticationRequiredPage>
  );
};

export default withAuthenticationRequired(EarthEditor);
