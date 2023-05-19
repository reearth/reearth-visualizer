import React from "react";
import { useParams } from "react-router-dom";

import {
  withAuthenticationRequired,
  AuthenticationRequiredPage,
} from "@reearth/beta/services/auth";
import BrowserWidthWarning from "@reearth/classic/components/molecules/Common/BrowserWidthWarning";
import EarthEditorPage from "@reearth/classic/components/molecules/EarthEditor/EarthEditorPage";
import CanvasArea from "@reearth/classic/components/organisms/EarthEditor/CanvasArea";
import CoreCanvasArea from "@reearth/classic/components/organisms/EarthEditor/core/CanvasArea";
import Header from "@reearth/classic/components/organisms/EarthEditor/Header";
import LeftMenu from "@reearth/classic/components/organisms/EarthEditor/LeftMenu";
import PrimitiveHeader from "@reearth/classic/components/organisms/EarthEditor/PrimitiveHeader";
import RightMenu from "@reearth/classic/components/organisms/EarthEditor/RightMenu";
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
