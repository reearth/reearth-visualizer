import React from "react";
import { styled, useTheme } from "@reearth/theme";
import Text from "@reearth/components/atoms/Text";
export interface Props {
  className?: string;
  name?: string;
}

const PropertyGroup: React.FC<Props> = ({ className, name, children }) => {
  const theme = useTheme();
  return (
    <PropertyWrapper className={className}>
      <PropertyTitle>
        <Text
          size="xs"
          color={theme.main.strongText}
          weight="normal"
          otherProperties={{ flex: "auto" }}>
          {name}
        </Text>
      </PropertyTitle>
      <PropertyFields hidden={false}>{children}</PropertyFields>
    </PropertyWrapper>
  );
};

const PropertyWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 17px;
`;

const PropertyTitle = styled.div`
  background-color: ${props => props.theme.properties.bg};
  padding: 8px 16px;
  text-align: left;
  user-select: none;
  display: flex;
  align-items: center;
`;

const PropertyFields = styled.div<{ hidden?: boolean }>`
  width: calc(100% - 32px);
  background-color: ${props => props.theme.properties.bg};
  padding: 16px;
  display: ${({ hidden }) => (hidden ? "none" : "block")};
`;

export default PropertyGroup;
