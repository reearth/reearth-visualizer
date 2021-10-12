import React, { useRef } from "react";
import { useClickAway, useMedia } from "react-use";

import Flex from "@reearth/components/atoms/Flex";
import Icon from "@reearth/components/atoms/Icon";
import Text from "@reearth/components/atoms/Text";
import { styled, usePublishTheme, PublishTheme, css } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";
import { Camera as CameraValue } from "@reearth/util/value";

import { ComponentProps as WidgetProps } from "../../Widget";

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

const Storytelling = ({
  widget,
  sceneProperty,
  widgetAlignSystemState,
}: Props): JSX.Element | null => {
  const publishedTheme = usePublishTheme(sceneProperty.theme);

  const isExtraSmallWindow = useMedia("(max-width: 420px)");

  const storiesData = (widget?.property as Property | undefined)?.stories;
  const { camera, duration, autoStart, range } =
    (widget?.property as Property | undefined)?.default ?? {};

  const { stories, menuOpen, selected, handleNext, handlePrev, selectAt, openMenu, toggleMenu } =
    useHooks({
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

  return (
    <div>
      <Menu
        publishedTheme={publishedTheme}
        ref={wrapperRef}
        menuOpen={menuOpen}
        extended={!!widget?.extended?.horizontally}
        area={widget?.layout?.location?.area}
        align={widget?.layout?.align}>
        {stories.map((story, i) => (
          <MenuItem
            publishedTheme={publishedTheme}
            key={story.layer}
            selected={selected?.story.layer === story.layer}
            align="center"
            onClick={selectAt.bind(undefined, i)}>
            <StyledIcon
              iconColor={publishedTheme.mainIcon}
              icon="marker"
              size={16}
              color={
                selected?.story.layer === story.layer
                  ? publishedTheme.strongText
                  : publishedTheme.mainText
              }
            />
            <Text
              size="m"
              color={
                selected?.story.layer === story.layer
                  ? publishedTheme.strongText
                  : publishedTheme.mainText
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
      <Widget
        publishedTheme={publishedTheme}
        extended={!!widget.extended?.horizontally}
        floating={!widget.layout}>
        <ArrowButton
          publishedTheme={publishedTheme}
          disabled={!selected?.index}
          onClick={handlePrev}
          // sometimes react-align goes wrong
          style={widgetAlignSystemState?.editing ? { pointerEvents: "none" } : undefined}>
          <Icon icon="arrowLeft" size={24} />
        </ArrowButton>
        <Current align="center" justify="space-between">
          <MenuIcon
            publishedTheme={publishedTheme}
            icon="storytellingMenu"
            onClick={toggleMenu}
            menuOpen={menuOpen}
          />
          <Title color={publishedTheme.mainText} size="m" weight="bold">
            {selected?.story.title}
          </Title>
          <Text
            color={publishedTheme.weakText}
            size={isExtraSmallWindow ? "xs" : "m"}
            weight="bold"
            otherProperties={{ userSelect: "none" }}>
            {typeof selected === "undefined" ? "-" : selected.index + 1} /{" "}
            {stories.length > 0 ? stories.length : "-"}
          </Text>
        </Current>
        <ArrowButton
          publishedTheme={publishedTheme}
          disabled={selected?.index === stories.length - 1}
          onClick={handleNext}
          // sometimes react-align goes wrong
          style={widgetAlignSystemState?.editing ? { pointerEvents: "none" } : undefined}>
          <Icon icon="arrowRight" size={24} />
        </ArrowButton>
      </Widget>
    </div>
  );
};

const Widget = styled.div<{
  publishedTheme: PublishTheme;
  extended?: boolean;
  floating?: boolean;
}>`
  background-color: ${({ publishedTheme }) => publishedTheme.background};
  color: ${({ publishedTheme }) => publishedTheme.mainText};
  display: flex;
  align-items: stretch;
  border-radius: ${metricsSizes["s"]}px;
  overflow: hidden;
  height: 80px;
  width: ${({ extended }) => (extended ? "100%" : "500px")};
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  pointer-events: auto;

  ${({ floating }) =>
    floating
      ? css`
          position: absolute;
          bottom: 80px;
          left: 80px;
        `
      : null}

  @media (max-width: 560px) {
    display: flex;
    width: ${({ extended }) => (extended ? "100%" : "90vw")};
    margin: 0 auto;
    height: 56px;
  }
`;

const ArrowButton = styled.button<{ publishedTheme: PublishTheme }>`
  background-color: ${({ publishedTheme }) => publishedTheme.mask};
  display: flex;
  flex-flow: column;
  justify-content: center;
  text-align: center;
  border: none;
  padding: ${metricsSizes["s"]}px;
  cursor: pointer;
  color: ${({ publishedTheme }) => publishedTheme.mainIcon};

  &:disabled {
    color: ${({ publishedTheme }) => publishedTheme.weakIcon};
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

const Title = styled(Text)<{ color: string }>`
  color: ${({ color }) => color};
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

const StyledIcon = styled(Icon)<{ iconColor: string }>`
  color: ${({ color }) => color};
  margin-right: ${metricsSizes["l"]}px;
`;

const MenuIcon = styled(Icon)<{ menuOpen?: boolean; publishedTheme: PublishTheme }>`
  background: ${props => (props.menuOpen ? props.publishedTheme.select : "unset")};
  border-radius: 25px;
  padding: ${metricsSizes["xs"]}px;
  margin-right: ${metricsSizes["xs"]}px;
  cursor: pointer;
  user-select: none;
  color: ${({ publishedTheme }) => publishedTheme.mainIcon};
`;

const Menu = styled.div<{
  menuOpen?: boolean;
  publishedTheme: PublishTheme;
  extended?: boolean;
  area?: string;
  align?: string;
}>`
  background-color: ${({ publishedTheme }) => publishedTheme.background};
  z-index: ${props => props.theme.zIndexes.dropDown};
  position: absolute;
  ${({ area, align }) =>
    area === "top" || (area === "middle" && align === "start") ? "top: 90px" : "bottom: 90px"};
  width: 324px;
  max-height: ${({ area, align }) =>
    area === "middle" && align === "centered" ? "200px" : "500px"};
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: ${metricsSizes["s"]}px;
  display: ${({ menuOpen }) => (!menuOpen ? "none" : "")};
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;

  @media (max-width: 560px) {
    width: ${({ extended }) => (extended ? `calc(100% - 18px)` : "65vw")};
    max-height: ${({ area, align }) =>
      area === "middle" && align === "centered" ? "30vh" : "70vh"};
    border: 1px solid ${props => props.theme.main.text};
    top: ${({ area, align }) =>
      area === "top" || (area === "middle" && align === "start") ? "60px" : null};
    bottom: ${({ area, align }) => (area !== "top" && align !== "start" ? "60px" : null)};
  }
`;

const MenuItem = styled(Flex)<{ selected?: boolean; publishedTheme: PublishTheme }>`
  border-radius: ${metricsSizes["m"]}px;
  padding: ${metricsSizes["m"]}px ${metricsSizes["s"]}px;
  background: ${({ publishedTheme, selected }) => (selected ? publishedTheme.select : "inherit")};
  cursor: pointer;
  user-select: none;
  &:hover {
    background: ${props => !props.selected && props.publishedTheme.mask};
  }
`;

export default Storytelling;
