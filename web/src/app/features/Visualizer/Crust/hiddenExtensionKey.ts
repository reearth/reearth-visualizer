/** The id a host uses to hide one extension: see `HiddenExtensionsProvider`. */
export const hiddenExtensionKey = (pluginId?: string, extensionId?: string) =>
  `${pluginId ?? ""}/${extensionId ?? ""}`;
