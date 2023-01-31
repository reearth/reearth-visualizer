import PluginEditorMolecule from "@reearth/components/molecules/PluginEditor";
import CorePluginEditorMolecule from "@reearth/components/molecules/PluginEditor/core";
import { useCore } from "@reearth/util/use-core";

const PluginEditorOrganism = () => {
  const core = useCore();
  return core ? <CorePluginEditorMolecule /> : <PluginEditorMolecule />;
};

export default PluginEditorOrganism;
