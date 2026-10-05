/**
 * WorkbenchPage - Page wrapper for the Workbench feature
 *
 * The Workbench is a standalone viewer for local plugin development.
 * It accepts plugins via ?dev-plugin= query parameter.
 */

import Workbench from "@reearth/app/features/Workbench";

const WorkbenchPage: React.FC = () => {
  return <Workbench />;
};

export default WorkbenchPage;
