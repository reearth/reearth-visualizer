import { FC } from "react";

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

export const loadUnsafeBuiltinPlugins = async (urls: string[]) => {
  try {
    return (
      await Promise.all(
        urls.map(async url => {
          try {
            const plugin: UnsafeBuiltinPlugin = (await import(/* @vite-ignore */ url)).default;
            return plugin;
          } catch (e) {
            throw new Error(`Specified unsafe built-in module could not find: ${url} ${e}`);
          }
        }),
      )
    ).filter(Boolean);
  } catch (e) {
    console.warn(e);
    return;
  }
};
