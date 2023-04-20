import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useMedia } from "react-use";

import Button from "@reearth/components/atoms/Button";
import Flex from "@reearth/components/atoms/Flex";
import PublicationStatus from "@reearth/components/atoms/PublicationStatus";
import Text from "@reearth/components/atoms/Text";
import { Project as ProjectType } from "@reearth/components/molecules/Dashboard/types";
import { useT } from "@reearth/i18n";
import { styled, useTheme } from "@reearth/theme";

import defaultProjectImage from "./defaultProjectImage.jpg";

export type Props = {
  className?: string;
  project: ProjectType;
};

const Project: React.FC<Props> = ({ className, project }) => {
  const t = useT();
  const theme = useTheme();
  dayjs.extend(relativeTime);

  const isSmallWindow = useMedia("(max-width: 1024px)");
  const [isHovered, setHover] = useState(false);
  const { name, description, image, status, id, sceneId } = project;

  // const timeSinceLastEdit = useMemo(() => dayjs(updatedAt).fromNow(), [updatedAt]);
  const timeSinceLastEdit = undefined; // Once backend is implemented, remove this line and uncomment above timeSinceLastEdit

  const onPreviewOpen = useCallback(() => {
    window.open(`${location.origin}/edit/${sceneId}/preview`);
  }, [sceneId]);

  return (
    <StyledWrapper className={className}>
      <Block
        projectImage={image}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}>
        <Content isHovered={isHovered}>
          <Text size={isSmallWindow ? "m" : "l"} color={theme.dashboard.projectName}>
            {name}
          </Text>
          <Actions isHovered={isHovered}>
            <ButtonWrapper>
              <StyledLink to={`/edit/${sceneId}`}>
                <Button large buttonType="primary" icon="earthEditor" />
              </StyledLink>
              <Button large buttonType="primary" icon="preview" onClick={onPreviewOpen} />
              <StyledLink to={`/settings/projects/${id}`}>
                <Button large buttonType="primary" icon="settings" />
              </StyledLink>
            </ButtonWrapper>
            <DescriptionWrapper>
              <Description size="s" isParagraph={true} color={theme.dashboard.projectDescription}>
                {description}
              </Description>
            </DescriptionWrapper>
          </Actions>
          <Flex gap={36}>
            <PublicationStatus status={status} color={theme.dashboard.publicationStatus} />
            {timeSinceLastEdit && (
              <Text size="xs">{t("timeSince", { timeSince: timeSinceLastEdit })}</Text>
            )}
          </Flex>
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
  display: flex;
  height: 238px;
  border-radius: 12px;
  margin: 7px;
  background-image: ${({ projectImage }) =>
    projectImage ? `url(${projectImage})` : `url(${defaultProjectImage})`};
  background-size: cover;
  background-position: center;
  ${({ projectImage }) => !projectImage && "background-size: 560px 290px;"}

  @media only screen and (max-width: 1024px) {
    height: 200px;
  }
`;

const Content = styled.div<{ isHovered?: boolean }>`
  position: relative;
  flex: 1;
  padding: 16px 21px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: ${({ theme }) => theme.main.text};
  background-color: ${({ isHovered, theme }) => (isHovered ? theme.main.transparentBg : "")};
  border-radius: 12px;
  transition: all 0.4s;
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

const Actions = styled.div<{ isHovered?: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 16px 21px;
  box-sizing: border-box;
  opacity: ${({ isHovered }) => (isHovered ? 1 : 0)};
  transition: all 0.4s;
`;

const StyledLink = styled(Link)`
  color: ${props => props.theme.main.text};
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
`;

export default Project;
