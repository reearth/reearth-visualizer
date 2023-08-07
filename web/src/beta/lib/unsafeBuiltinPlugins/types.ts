import type { FC } from "react";

export type UnsafeBuiltinPlugin = {
  id: string;
  name: string;
  widgets?: UnsafeBuiltinWidget[];
  blocks?: UnsafeBuiltinBlock[];
};

type UnsafeBuiltinWidget = UnsafeBuiltinPluginExtension<"widget">;

type UnsafeBuiltinBlock = UnsafeBuiltinPluginExtension<"block">;

type UnsafeBuiltinPluginExtension<T extends "widget" | "block"> = {
  type: T;
  extensionId: string;
  name: string;
  component: FC;
};

export type UnsafeBuiltinWidgets<T = unknown> = Record<string, T>;
