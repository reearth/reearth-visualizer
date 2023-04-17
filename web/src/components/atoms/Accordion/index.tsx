import React from "react";
import { Accordion as AccordionComponent } from "react-accessible-accordion";

import AccordionItem from "./AccordionItem";

export type Props = {
  className?: string;
  items?: AccordionItemType[];
  allowZeroExpanded?: boolean;
  allowMultipleExpanded?: boolean;
  itemBgColor?: string;
};

export type AccordionItemType = {
  id: string;
  heading?: React.ReactNode;
  content?: React.ReactNode;
};

const Accordion: React.FC<Props> = ({
  className,
  items,
  allowMultipleExpanded,
  allowZeroExpanded = true,
  itemBgColor,
}) => {
  return (
    <AccordionComponent
      className={className}
      allowZeroExpanded={allowZeroExpanded}
      data-testid="atoms-accordion"
      allowMultipleExpanded={allowMultipleExpanded}>
      {items?.map(i => {
        return (
          <AccordionItem
            key={i.id}
            id={i.id}
            heading={i.heading}
            content={i.content}
            bg={itemBgColor}
          />
        );
      })}
    </AccordionComponent>
  );
};

export default Accordion;
