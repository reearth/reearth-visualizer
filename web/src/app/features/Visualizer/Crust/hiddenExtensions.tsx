import { createContext, useContext, type FC, type ReactNode } from "react";

import { hiddenExtensionKey } from "./hiddenExtensionKey";

/**
 * Extensions (widgets and blocks) a host wants hidden without unmounting them.
 *
 * Unmounting a plugin disposes its runtime, which is costly and can fail, so
 * the Workbench hides by styling instead. Without a provider nothing changes:
 * no wrapper element is rendered and nothing is hidden.
 */
const HiddenExtensionsContext = createContext<string[] | undefined>(undefined);

export const HiddenExtensionsProvider = HiddenExtensionsContext.Provider;

/** Hides its children (kept mounted) when the extension is in the hidden list. */
export const HideableExtension: FC<{
  pluginId?: string;
  extensionId?: string;
  children?: ReactNode;
}> = ({ pluginId, extensionId, children }) => {
  const hidden = useContext(HiddenExtensionsContext);
  if (!hidden) return <>{children}</>;
  const isHidden = hidden.includes(hiddenExtensionKey(pluginId, extensionId));
  return (
    <div
      data-hidden-extension={isHidden || undefined}
      style={{ display: isHidden ? "none" : "contents" }}
    >
      {children}
    </div>
  );
};
