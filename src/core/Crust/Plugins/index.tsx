import { PluginProvider } from "./context";
import useHooks from "./hooks";
import type { Props } from "./types";

export {
  default as Plugin,
  ModalContainer,
  PopupContainer,
  type PluginModalInfo,
  type PluginPopupInfo,
  type ExternalPluginProps,
} from "./Plugin";

export default function Plugins(props: Props) {
  const value = useHooks(props);
  return <PluginProvider value={value}>{props.children}</PluginProvider>;
}
