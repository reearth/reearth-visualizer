import React, { useRef } from "react";
import { useClickAway, useMedia } from "react-use";

import { useTheme, styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";
import { Camera as CameraValue } from "@reearth/util/value";
import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import Icon from "@reearth/components/atoms/Icon";

import { Props as WidgetProps } from "../../Widget";
import useHooks, { Story as StoryType } from "./hooks";

export type { Story } from "./hooks";
export type Props = WidgetProps<Property>;

export type Property = {
  default?: {
    duration?: number;
    range?: number;
    camera?: CameraValue;
    autoStart?: boolean;
  };
  stories?: StoryType[];
};

const Storytelling = ({ widget }: Props): JSX.Element | null => {
  const theme = useTheme();
  const isExtraSmallWindow = useMedia("(max-width: 420px)");

  const storiesData = (widget?.property as Property | undefined)?.stories;
  const { camera, duration, autoStart, range } =
    (widget?.property as Property | undefined)?.default ?? {};

  const { stories, menuOpen, selected, handleNext, handlePrev, selectAt, openMenu } = useHooks({
    camera,
    autoStart,
    range,
    duration,
    stories: storiesData,
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  useClickAway(wrapperRef, () => {
    openMenu(false);
  });

  return stories?.length > 0 ? (
    <>
      <Menu ref={wrapperRef} menuOpen={menuOpen}>
        {stories?.map((story, i) => (
          <MenuItem
            key={story.layer}
            selected={selected?.story.layer === story.layer}
            align="center"
            onClick={selectAt.bind(undefined, i)}>
            <StyledIcon
              icon="marker"
              size={16}
              color={
                selected?.story.layer === story.layer ? theme.main.strongText : theme.main.text
              }
            />
            <Text
              size="m"
              color={
                selected?.story.layer === story.layer ? theme.main.strongText : theme.main.text
              }
              otherProperties={{
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}>
              {story.title}
            </Text>
          </MenuItem>
        ))}
      </Menu>
      <Wrapper>
        <ArrowButton disabled={!selected?.index} onClick={handlePrev}>
          <Icon icon="arrowLeft" size={24} />
        </ArrowButton>
        <Current align="center" justify="space-between">
          <MenuIcon icon="storytellingMenu" onClick={() => openMenu(o => !o)} menuOpen={menuOpen} />
          <Title size="m" weight="bold">
            {selected?.story.title}
          </Title>
          <Text
            size={isExtraSmallWindow ? "xs" : "m"}
            weight="bold"
            otherProperties={{ userSelect: "none" }}>
            {typeof selected === "undefined" ? "-" : selected.index + 1} / {stories.length}
          </Text>
        </Current>
        <ArrowButton disabled={selected?.index === stories.length - 1} onClick={handleNext}>
          <Icon icon="arrowRight" size={24} />
        </ArrowButton>
      </Wrapper>
    </>
  ) : null;
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.main.paleBg};
  color: ${props => props.theme.main.text};
  z-index: ${props => props.theme.zIndexes.infoBox};
  position: absolute;
  bottom: 80px;
  left: 80px;
  display: flex;
  align-items: stretch;
  border-radius: ${metricsSizes["s"]}px;
  overflow: hidden;
  height: 80px;
  width: 500px;
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);

  @media (max-width: 1366px) {
    left: 30px;
    bottom: 30px;
  }

  @media (max-width: 560px) {
    left: 16px;
    right: 16px;
    bottom: 16px;
    width: auto;
    height: 56px;
  }
`;

const ArrowButton = styled.button`
  background-color: ${props => props.theme.main.paleBg};
  display: flex;
  flex-flow: column;
  justify-content: center;
  text-align: center;
  border: none;
  padding: ${metricsSizes["s"]}px;
  cursor: pointer;
  color: inherit;

  &:disabled {
    color: #888;
    cursor: auto;
  }

  @media (max-width: 420px) {
    padding: ${metricsSizes["2xs"]}px;
  }
`;

const Current = styled(Flex)`
  width: 100%;
  padding: ${metricsSizes["2xl"]}px;

  @media (max-width: 420px) {
    padding: ${metricsSizes["s"]}px;
  }
`;

const Title = styled(Text)`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  box-sizing: border-box;
  margin: 0 auto;
  max-width: 250px;
  text-align: center;

  @media (max-width: 420px) {
    max-width: 190px;
  }
`;

const StyledIcon = styled(Icon)`
  color: ${props => props.theme.main.text};
  margin-right: ${metricsSizes["l"]}px;
`;

const MenuIcon = styled(Icon)<{ menuOpen?: boolean }>`
  background: ${props => (props.menuOpen ? props.theme.main.bg : props.theme.main.paleBg)};
  border-radius: 25px;
  padding: ${metricsSizes["xs"]}px;
  margin-right: ${metricsSizes["xs"]}px;
  cursor: pointer;
  user-select: none;
`;

const Menu = styled.div<{ menuOpen?: boolean }>`
  background-color: ${props => props.theme.main.paleBg};
  z-index: ${props => props.theme.zIndexes.dropDown};
  position: absolute;
  bottom: 168px;
  left: 80px;
  width: 324px;
  max-height: 500px;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: ${metricsSizes["s"]}px;
  display: ${({ menuOpen }) => (!menuOpen ? "none" : "")};
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;

  @media (max-width: 1366px) {
    left: 30px;
    bottom: 118px;
  }

  @media (max-width: 560px) {
    right: 16px;
    left: 16px;
    bottom: 80px;
    border: 1px solid ${props => props.theme.main.text};
  }

  @media (max-width: 420px) {
    width: auto;
  }
`;

const MenuItem = styled(Flex)<{ selected?: boolean }>`
  border-radius: ${metricsSizes["m"]}px;
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;
  background: ${({ theme, selected }) => (selected ? theme.main.highlighted : "inherit")};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${props => !props.selected && props.theme.main.bg};
  }
`;

export default Storytelling;
