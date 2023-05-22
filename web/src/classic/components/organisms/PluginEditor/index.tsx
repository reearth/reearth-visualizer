import PluginEditorMolecule from "@reearth/classic/components/molecules/PluginEditor";
import CorePluginEditorMolecule from "@reearth/classic/components/molecules/PluginEditor/core";
import { useCore } from "@reearth/classic/util/use-core";

const PluginEditorOrganism = () => {
  const core = useCore();
  return core ? <CorePluginEditorMolecule /> : <PluginEditorMolecule />;
};

export default PluginEditorOrganism;
