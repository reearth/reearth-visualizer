import { Link } from "@reach/router";
import React, { useState, useCallback } from "react";
import { useMedia } from "react-use";

import Button from "@reearth/components/atoms/Button";
import PublicationStatus from "@reearth/components/atoms/PublicationStatus";
import Text from "@reearth/components/atoms/Text";
import { Project as ProjectType } from "@reearth/components/molecules/Dashboard/types";
import { styled, useTheme } from "@reearth/theme";

import defaultProjectImage from "./defaultProjectImage.jpg";

export interface Props {
  className?: string;
  project: ProjectType;
}

const Project: React.FC<Props> = ({ className, project }) => {
  const { name, description, image, status, id, sceneId } = project;
  const [isHover, setHover] = useState(false);

  const onPreviewOpen = useCallback(() => {
    window.open(`${location.origin}/edit/${sceneId}/preview`);
  }, [sceneId]);

  const theme = useTheme();

  const isSmallWindow = useMedia("(max-width: 1024px)");

  return (
    <StyledWrapper className={className}>
      <Block
        projectImage={image}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        <Content isHover={isHover}>
          <Text size={isSmallWindow ? "m" : "l"} color={theme.dashboard.projectName}>
            {name}
          </Text>
          {isHover && (
            <Actions>
              <ButtonWrapper>
                <StyledLink to={`/edit/${sceneId}`}>
                  <Button large buttonType="primary" icon="earthEditor" />
                </StyledLink>

                <Button large buttonType="primary" icon="preview" onClick={onPreviewOpen} />

                <StyledLink to={`/settings/project/${id}`}>
                  <Button large buttonType="primary" icon="settings" />
                </StyledLink>
              </ButtonWrapper>
              <DescriptionWrapper>
                <Description size="s" isParagraph={true} color={theme.dashboard.projectDescription}>
                  {description}
                </Description>
              </DescriptionWrapper>
            </Actions>
          )}
          <PublicationStatus status={status} color={theme.dashboard.publicationStatus} />
        </Content>
      </Block>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  flex: 0 1 33%;

  @media only screen and (max-width: 1024px) {
    flex: 1 1 50%;
  }

  @media only screen and (max-width: 920px) {
    flex: auto;
    width: 100%;
  }
`;

const Block = styled.div<{ projectImage?: string | null }>`
  height: 242px;
  border-radius: 12px;
  margin: 7px;
  background-image: ${props =>
    props.projectImage ? `url(${props.projectImage})` : `url(${defaultProjectImage})`};
  background-size: cover;
  background-position: center;
  ${props => !props.projectImage && "background-size: 560px 290px;"}

  @media only screen and (max-width: 1024px) {
    height: 200px;
  }
`;

const Content = styled.div<{ isHover?: boolean }>`
  position: relative;
  height: 194px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${props => props.theme.main.text};
  background-color: ${props => (props.isHover ? props.theme.main.lightTransparentBg : "")};
  border-radius: 12px;

  @media only screen and (max-width: 1024px) {
    height: 152px;
  }
`;

const DescriptionWrapper = styled.div`
  width: 100%;
`;

const Description = styled(Text)`
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  display: -webkit-inline-box;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ButtonWrapper = styled.div`
  display: flex;
  margin-bottom: 5px;
`;

const Actions = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.main.text};
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

export default Project;
