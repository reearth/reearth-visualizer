import { styled } from "@reearth/theme";
import React from "react";
import {
  AccordionItem as AccordionItemComponent,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";
import Box from "../Box";
import Flex from "../Flex";
import Icon from "../Icon";

export type Props = {
  className?: string;
  id: string;
  heading?: React.ReactNode;
  content?: React.ReactNode;
  bg?: string;
};

const AccordionItem: React.FC<Props> = ({ className, id, heading, content, bg }) => {
  return (
    <Box m="2xl" key={id} className={className} bg={bg} data-testid="atoms-accordion-item">
      <AccordionItemComponent>
        <AccordionItemHeading>
          <StyledAccordionItemButton data-testid="atoms-accordion-item-header">
            <Box ph="2xl">
              <Flex align="center">
                <AccordionItemState>
                  {({ expanded }) => (
                    <>
                      <StyledIcon icon="arrowToggle" size={16} open={!!expanded} />
                      {heading}
                    </>
                  )}
                </AccordionItemState>
              </Flex>
            </Box>
          </StyledAccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel data-testid="atoms-accordion-item-content">
          {content}
        </AccordionItemPanel>
      </AccordionItemComponent>
    </Box>
  );
};

const StyledIcon = styled(Icon)<{ open: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) => open && "translateY(10%) rotate(90deg)"};
`;

const StyledAccordionItemButton = styled(AccordionItemButton)`
  outline: none;
  cursor: pointer;
`;
export default AccordionItem;
