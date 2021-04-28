import React, { Fragment } from "react";

import Icon from "@reearth/components/atoms/Icon";
import { styled } from "@reearth/theme";
import { Typography, typographyStyles } from "@reearth/util/value";
import { BlockComponent, InfoboxProperty } from "../../PluginBlock";
import fonts from "@reearth/theme/fonts";

export type Item = {
  id: string;
  item_title?: string;
  item_datatype?: "string" | "number";
  item_datastr?: string;
  item_datanum?: number;
};

export type Property = {
  default?: {
    title?: string;
    typography?: Typography;
  };
  items?: Item[];
};

export type PluginProperty = {};

const DataList: BlockComponent<Property, PluginProperty> = ({
  property,
  infoboxProperty,
  onClick,
  isHovered,
  isSelected,
  isEditable,
}) => {
  const items = property?.items;
  const typography = property?.default?.typography;
  const isTemplate = !property?.default?.title && !items;

  return (
    <Wrapper
      onClick={onClick}
      typography={typography}
      isSelected={isSelected}
      isHovered={isHovered}
      isTemplate={isTemplate}
      isEditable={isEditable}>
      {isTemplate && isEditable ? (
        <Template>
          <StyledIcon icon="dl" isHovered={isHovered} isSelected={isSelected} size={24} />
        </Template>
      ) : (
        <>
          {property?.default?.title && (
            <Title infoboxStyles={infoboxProperty}>{property.default.title}</Title>
          )}
          <Dl>
            {items?.map(i => (
              <Fragment key={i.id}>
                <Dt>{i.item_title}</Dt>
                <Dd>{i.item_datatype === "number" ? i.item_datanum : i.item_datastr}</Dd>
              </Fragment>
            ))}
          </Dl>
        </>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div<{
  typography?: Typography;
  isSelected?: boolean;
  isHovered?: boolean;
  isTemplate: boolean;
  isEditable?: boolean;
}>`
  margin: 0 8px;
  font-size: ${fonts.sizes.s}px;
  color: ${({ theme }) => theme.infoBox.mainText};
  ${({ typography }) => typographyStyles(typography)}
  border: 1px solid
    ${({ isSelected, isHovered, isTemplate, isEditable, theme }) =>
    (!isTemplate && !isHovered && !isSelected) || !isEditable
      ? "transparent"
      : isHovered
      ? theme.infoBox.border
      : isSelected
      ? theme.infoBox.accent2
      : theme.infoBox.weakText};
  border-radius: 6px;
  min-height: 70px;
`;

const Title = styled.div<{ infoboxStyles?: InfoboxProperty }>`
  font-size: 12px;
`;

const Dl = styled.dl`
  display: flex;
  flex-wrap: wrap;
  min-height: 15px;
`;

const Dt = styled.dt`
  width: 30%;
  padding: 10px;
  padding-left: 0;
  box-sizing: border-box;
  font-weight: bold;
`;

const Dd = styled.dd`
  width: 70%;
  margin: 0;
  padding: 10px;
  padding-right: 0;
  box-sizing: border-box;
`;

const Template = styled.div`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  height: 185px;
  margin: 0 auto;
  user-select: none;
`;

const StyledIcon = styled(Icon)<{ isSelected?: boolean; isHovered?: boolean }>`
  color: ${props =>
    props.isHovered
      ? props.theme.infoBox.border
      : props.isSelected
      ? props.theme.infoBox.accent2
      : props.theme.infoBox.weakText};
`;

export default DataList;
