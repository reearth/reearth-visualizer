import Accordion from "@reearth/components/atoms/Accordion";
import { useTheme } from "@reearth/theme";
import React from "react";
import PluginAccordionItemBody from "./PluginAccordionItem/itemBody";
import PluginAccordionItemHeader from "./PluginAccordionItem/itemHeader";

export type PluginItem = {
  id: string;
  thumbnail?: string;
  title?: string;
  isInstalled?: boolean;
  bodyMarkdown?: string;
};

export type PluginAccordionProps = {
  className?: string;
  items?: PluginItem[];
};

const PluginAccordion: React.FC<PluginAccordionProps> = ({ className, items }) => {
  const theme = useTheme();
  return (
    <Accordion
      className={className}
      allowMultipleExpanded
      itemBgColor={theme.colors.bg[3]}
      items={items?.map(i => {
        return {
          id: i.id,
          heading: (
            <PluginAccordionItemHeader
              thumbnail={i.thumbnail}
              title={i.title}
              isInstalled={i.isInstalled}
            />
          ),
          content: <PluginAccordionItemBody>{i.bodyMarkdown}</PluginAccordionItemBody>,
        };
      })}
    />
  );
};

export default PluginAccordion;
