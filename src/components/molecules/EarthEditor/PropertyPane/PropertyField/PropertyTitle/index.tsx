import React, { useState, useCallback, useRef } from "react";
import { usePopper } from "react-popper";
import { useClickAway } from "react-use";

import { styled, colors, css } from "@reearth/theme";
import PropertyLinkPanel, { Props as PropertyLinkPanelProps } from "./PropertyLinkPanel";
import HelpButton from "@reearth/components/atoms/HelpButton";
import fonts from "@reearth/theme/fonts";

export { Dataset, DatasetField, DatasetSchema, Type } from "./PropertyLinkPanel";

export type Props = {
  className?: string;
  disabled?: boolean;
  isLinked?: boolean;
  title?: string;
  description?: string;
} & Pick<
  PropertyLinkPanelProps,
  | "onClear"
  | "onUnlink"
  | "onLink"
  | "onDatasetPickerOpen"
  | "isDatasetLinkable"
  | "isOverridden"
  | "linkedDataset"
  | "linkDisabled"
  | "linkableType"
  | "datasetSchemas"
  | "fixedDatasetSchemaId"
  | "fixedDatasetId"
>;

const titleColor = (params: Pick<Props, "isLinked" | "isOverridden">): string => {
  const { isLinked, isOverridden } = params;

  if (isOverridden) {
    return colors.danger.main;
  } else if (isLinked) {
    return colors.primary.main;
  } else {
    return colors.text.main;
  }
};

// eslint-disable-next-line react/display-name
const PropertyTitle: React.FC<Props> = ({
  className,
  isLinked,
  disabled,
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
    if (disabled) return;
    setVisible(!visible);
  }, [disabled, visible]);
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
          disabled={disabled}
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
        <PropertyLinkPanel isOverridden={isOverridden} {...props} />
      </PropertyLinkPanelWrapper>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
`;

const Title = styled.div<{ disabled?: boolean; isLinked?: boolean; isOverridden?: boolean }>`
  display: flex;
  height: 100%;
  font-size: ${fonts.sizes.xs}px;
  color: ${props => titleColor(props)};
  align-items: center;
  cursor: ${props => (props.disabled ? "default" : "pointer")};
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
