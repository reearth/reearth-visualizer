import React from "react";
import {
  AccordionItem as AccordionItemComponent,
  AccordionItemButton,
  AccordionItemHeading,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";

import { styled, useTheme } from "@reearth/services/theme";

import Icon from "../Icon";

export type Props = {
  className?: string;
  id: string;
  heading?: React.ReactNode;
  content?: React.ReactNode;
  bg?: string;
};

const AccordionItem: React.FC<Props> = ({ className, id, heading, content, bg }) => {
  const theme = useTheme();
  return (
    <Wrapper key={id} className={className} bg={bg} data-testid="atoms-accordion-item">
      <AccordionItemComponent>
        <AccordionItemHeading>
          <StyledAccordionItemButton data-testid="atoms-accordion-item-header">
            <AccordionItemStateWrapper>
              <AccordionItemState>
                {({ expanded }) => (
                  <>
                    <StyledIcon
                      color={theme.content.main}
                      icon="arrowToggle"
                      size={16}
                      open={!!expanded}
                    />
                    {heading}
                  </>
                )}
              </AccordionItemState>
            </AccordionItemStateWrapper>
          </StyledAccordionItemButton>
        </AccordionItemHeading>
        <AccordionItemPanel data-testid="atoms-accordion-item-content">
          {content}
        </AccordionItemPanel>
      </AccordionItemComponent>
    </Wrapper>
  );
};

const Wrapper = styled.div<{ bg?: string }>`
  margin: ${({ theme }) => theme.metrics["2xl"]}px 0;
  background-color: ${({ bg }) => bg};
  border-radius: ${({ theme }) => theme.metrics["l"]}px;
`;

const AccordionItemStateWrapper = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.metrics["xl"]}px;
`;

const StyledIcon = styled(Icon)<{ open: boolean }>`
  transition: transform 0.15s ease;
  transform: ${({ open }) => open && "translateY(10%) rotate(90deg)"};
  margin-right: 24px;
`;

const StyledAccordionItemButton = styled(AccordionItemButton)`
  outline: none;
  cursor: pointer;
`;
export default AccordionItem;
