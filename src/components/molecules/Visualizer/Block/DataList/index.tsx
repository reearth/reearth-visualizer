import React, { Fragment, useCallback, useState } from "react";

import { styled } from "@reearth/theme";
import { Typography, typographyStyles } from "@reearth/util/value";
import Icon from "@reearth/components/atoms/Icon";

import { Border, Title } from "../common";
import { Props as BlockProps } from "..";

export type Props = BlockProps<Property>;

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

const DataList: React.FC<Props> = ({ block, infoboxProperty, isSelected, isEditable, onClick }) => {
  const { items } = (block?.property as Property | undefined) ?? {};
  const { title, typography } = block?.property?.default ?? {};
  const isTemplate = !title && !items;

  const [isHovered, setHovered] = useState(false);
  const handleMouseEnter = useCallback(() => setHovered(true), []);
  const handleMouseLeave = useCallback(() => setHovered(false), []);
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      onClick?.();
    },
    [onClick],
  );

  return (
    <Wrapper
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      typography={typography}
      isHovered={isHovered}
      isEditable={isEditable}
      isSelected={isSelected}>
      {isTemplate && isEditable ? (
        <Template>
          <StyledIcon icon="dl" isHovered={isHovered} isSelected={isSelected} size={24} />
        </Template>
      ) : (
        <>
          {title && <Title infoboxProperty={infoboxProperty}>{title}</Title>}
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

const Wrapper = styled(Border)<{
  typography?: Typography;
}>`
  margin: 0 8px;
  ${({ typography }) => typographyStyles({ ...typography })}
  min-height: 70px;
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
