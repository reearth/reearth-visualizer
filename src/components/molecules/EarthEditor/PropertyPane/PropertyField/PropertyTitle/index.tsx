import React, { useState, useCallback, useRef } from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

import HelpButton from "@reearth/components/atoms/HelpButton";
import { styled, css } from "@reearth/theme";
import fonts from "@reearth/theme/fonts";

import PropertyLinkPanel, { Props as PropertyLinkPanelProps } from "./PropertyLinkPanel";

export { Dataset, DatasetField, DatasetSchema, Type } from "./PropertyLinkPanel";

export type Props = {
  className?: string;
  isLinked?: boolean;
  isTemplate?: boolean;
  linkedFieldName?: string;
  title?: string;
  description?: string;
} & Pick<
  PropertyLinkPanelProps,
  | "onClear"
  | "onLink"
  | "onDatasetPickerOpen"
  | "isLinkable"
  | "isOverridden"
  | "linkedDataset"
  | "linkableType"
  | "datasetSchemas"
  | "fixedDatasetSchemaId"
  | "fixedDatasetId"
>;

const PropertyTitle: React.FC<Props> = ({
  className,
  isLinked,
  isTemplate,
  linkedFieldName,
  isOverridden,
  title,
  description,
  ...props
}) => {
  const [visible, setVisible] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const referenceRef = useRef<HTMLDivElement>(null);
  const popperRef = useRef<HTMLDivElement>(null);
  const { styles, attributes } = usePopper(referenceRef.current, popperRef.current, {
    placement: "auto",
    strategy: "fixed",
    modifiers: [
      {
        name: "eventListeners",
        enabled: true,
        options: {
          scroll: visible,
          resize: visible,
        },
      },
    ],
  });

  const handleClick = useCallback(() => {
    setVisible(!visible);
  }, [visible]);
  const handleClose = useCallback(() => {
    if (visible) {
      setVisible(false);
    }
  }, [visible]);

  useClickAway(wrapperRef, handleClose);

  return (
    <Wrapper ref={wrapperRef}>
      <HelpButton
        descriptionTitle={title}
        description={description}
        balloonDirection="left"
        gap={28}>
        <Title
          className={className}
          ref={referenceRef}
          onClick={handleClick}
          isLinked={isLinked}
          isOverridden={isOverridden}>
          {title}
        </Title>
      </HelpButton>
      <PropertyLinkPanelWrapper
        ref={popperRef}
        visible={visible}
        style={styles.popper}
        {...attributes.popper}>
        <PropertyLinkPanel
          isOverridden={isOverridden}
          isLinked={isLinked}
          isTemplate={isTemplate}
          linkedFieldName={linkedFieldName}
          {...props}
        />
      </PropertyLinkPanelWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
`;

const Title = styled.div<{ isLinked?: boolean; isOverridden?: boolean }>`
  display: flex;
  height: 100%;
  font-size: ${fonts.sizes.xs}px;
  color: ${({ isLinked, isOverridden, theme }) =>
    isOverridden ? theme.main.warning : isLinked ? theme.main.link : theme.main.text};
  align-items: center;
  cursor: pointer;
`;

const PropertyLinkPanelWrapper = styled.div<{ visible: boolean }>`
  ${({ visible }) =>
    !visible &&
    css`
      visibility: hidden;
      pointer-events: none;
    `}
  z-index: ${props => props.theme.zIndexes.propertyFieldPopup};
`;

export default PropertyTitle;
