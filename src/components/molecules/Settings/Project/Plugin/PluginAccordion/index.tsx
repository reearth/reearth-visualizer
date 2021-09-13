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
  items?: PluginItem[];
  uninstallPlugin: (pluginId: string) => void;
};

const PluginAccordion: React.FC<PluginAccordionProps> = ({ className, items, uninstallPlugin }) => {
  const theme = useTheme();
  return items ? (
    <Accordion
      className={className}
      allowMultipleExpanded
      itemBgColor={theme.main.lighterBg}
      items={items?.map(item => {
        return {
          id: item.title,
          heading: (
            <PluginAccordionItemHeader
              // thumbnail={item.thumbnailUrl}
              title={item.title}
              isInstalled={item.isInstalled}
              onUninstall={() => uninstallPlugin(item.pluginId)}
            />
          ),
          content: <PluginAccordionItemBody>{item.bodyMarkdown}</PluginAccordionItemBody>,
        };
      })}
    />
  ) : null;
};

export default PluginAccordion;
