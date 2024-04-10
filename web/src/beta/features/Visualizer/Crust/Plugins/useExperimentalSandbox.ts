import { usePluginContext } from "./context";

export default (): boolean => {
  const ctx = usePluginContext();
  return !!ctx.useExperimentalSandbox;
};
