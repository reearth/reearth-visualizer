import { Placement as PopperPlacement } from "@popperjs/core";
import React from "react";

import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled } from "@reearth/theme";

export type Placement = PopperPlacement;

type Props = {
  className?: string;
  title?: string;
  description?: string;
  img?: {
    imagePath: string;
    alt?: string;
  };
};

const Balloon: React.FC<Props> = ({ className, title, description, img }) => {
  return (
    <Wrapper className={className}>
      <TitleWrapper onlyTitle={!description}>
        <StyledIcon icon="help" size={16} />
        <Text size="xs">{title}</Text>
      </TitleWrapper>
      {img && <StyledImage src={img?.imagePath} alt={img?.alt} />}
      {description && <Text size="xs">{description}</Text>}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  border-radius: 3px;
  color: ${props => props.theme.descriptionBalloon.textColor};
  background-color: ${props => props.theme.descriptionBalloon.bg};
  box-shadow: ${props => `0px 5px 10px -5px ${props.theme.descriptionBalloon.shadowColor}`};
  padding: 12px;
  max-width: 200px;
  z-index: ${props => props.theme.zIndexes.descriptionBalloon};
`;

const StyledImage = styled.img`
  border-radius: 2px;
  margin: 8px 0;
  width: 100%;
`;

const TitleWrapper = styled.div<{ onlyTitle: boolean }>`
  display: flex;
  align-items: center;
  margin-bottom: ${props => (props.onlyTitle ? "" : "8px")};
`;

const StyledIcon = styled(Icon)`
  margin-right: 5px;
`;

export default Balloon;
