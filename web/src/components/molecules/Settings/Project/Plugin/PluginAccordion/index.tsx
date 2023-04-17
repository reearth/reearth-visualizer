import React from "react";

import Accordion from "@reearth/components/atoms/Accordion";
import { useTheme } from "@reearth/theme";

import PluginAccordionItemBody from "./PluginAccordionItem/itemBody";
import PluginAccordionItemHeader from "./PluginAccordionItem/itemHeader";

export type PluginItem = {
  thumbnailUrl?: string;
  title: string;
  isInstalled: boolean;
  bodyMarkdown?: string;
  author: string;
  pluginId: string;
};

export type PluginAccordionProps = {
  className?: string;
  plugins?: PluginItem[];
  uninstallPlugin: (pluginId: string) => void;
};

const PluginAccordion: React.FC<PluginAccordionProps> = ({
  className,
  plugins,
  uninstallPlugin,
}) => {
  const theme = useTheme();
  return plugins ? (
    <Accordion
      className={className}
      allowMultipleExpanded
      itemBgColor={theme.main.lighterBg}
      items={plugins?.map(p => {
        const version = p.pluginId.split("~")[2] ?? "x.x.x";
        return {
          id: p.title,
          heading: (
            <PluginAccordionItemHeader
              // thumbnail={item.thumbnailUrl}
              title={p.title}
              version={version}
              isInstalled={p.isInstalled}
              onUninstall={() => uninstallPlugin(p.pluginId)}
            />
          ),
          content: <PluginAccordionItemBody>{p.bodyMarkdown}</PluginAccordionItemBody>,
        };
      })}
    />
  ) : null;
};

export default PluginAccordion;
