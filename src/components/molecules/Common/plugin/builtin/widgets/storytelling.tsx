import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { Math as CesiumMath, BoundingSphere, HeadingPitchRange } from "cesium";
import { useClickAway, useMedia } from "react-use";

import Flex from "@reearth/components/atoms/Flex";
import Text from "@reearth/components/atoms/Text";
import Icon from "@reearth/components/atoms/Icon";
import { colors, styled } from "@reearth/theme";
import { metricsSizes } from "@reearth/theme/metrics";
import { Camera as CameraValue, flyTo, fromCamera } from "@reearth/util/value";
import { WidgetComponent } from "../../PluginWidget";
import { useReearthPluginAPI } from "../../../Cesium/api";
import { pluginId } from "..";
import { PluginProperty } from ".";

export type Story = {
  title: string;
  layer?: string;
  layerDuration?: number;
  layerRange?: number;
  layerCamera?: CameraValue;
};

export type Property = {
  default?: {
    duration?: number;
    range?: number;
    camera?: CameraValue;
    autoStart?: boolean;
  };
  stories?: Story[];
};

const defaultRange = 50000;
const defaultDuration = 3;
const defaultOffset = new HeadingPitchRange(0, CesiumMath.toRadians(-30), defaultRange);

const Storytelling: WidgetComponent<Property, PluginProperty> = ({ property }) => {
  const [menuOpen, setMenu] = useState(false);
  const isExtraSmallWindow = useMedia("(max-width: 420px)");
  const api = useReearthPluginAPI();
  const wrapperRef = useRef(null);
  useClickAway(wrapperRef, () => {
    setMenu(false);
  });

  const storyIds: string[] | undefined = property?.stories?.map(s => s.layer as string);
  const duration = property?.default?.duration ?? defaultDuration;
  const autoStart = property?.default?.autoStart;

  const stories = useMemo(() => {
    const layers = storyIds && api?.getLayers(storyIds);

    return (
      layers &&
      property?.stories
        ?.map(story => {
          const title = layers.find(l => l?.id === story.layer)?.title;
          return {
            ...story,
            title: title || story.title,
          };
        })
        .filter((s): s is Story => !!s)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storyIds]);

  const [layerIndex, setLayerIndex] = useState<number>();
  const currentLayerId = typeof layerIndex === "number" ? stories?.[layerIndex]?.layer : undefined;
  const selectedLayer = useMemo(
    () => (currentLayerId ? api?.getLayer(currentLayerId) : undefined),
    [api, currentLayerId],
  );

  const selectLayer = useCallback(
    (index: number) => {
      const story = stories?.[index];
      const id = story?.layer;
      if (!api || !story || !id) return;

      setMenu(false);
      setLayerIndex(index);
      api.selectLayer(id, "storytelling");

      const layer = api.getLayer(id);
      if (
        // Photooverlays have own camera flight and that is the priority here.
        layer?.pluginId === pluginId &&
        layer.extensionId === "photooverlay" &&
        !!layer.property?.default?.camera
      ) {
        return;
      }

      const position = api.getLayerPosition(id);
      if (story.layerCamera) {
        flyTo(api.cesiumViewer.camera, fromCamera(story.layerCamera), {
          duration: story.layerDuration ?? duration,
        });
      } else if (position) {
        api.cesiumViewer.camera.flyToBoundingSphere(new BoundingSphere(position), {
          // TODO: roll is ignored
          offset: property?.default?.camera
            ? new HeadingPitchRange(
                property.default.camera.heading,
                property.default.camera.pitch,
                story.layerRange ?? property.default.range ?? defaultRange,
              )
            : defaultOffset,
          duration: story.layerDuration ?? duration,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [api, stories],
  );

  const handleNext = useCallback(() => {
    selectLayer(typeof layerIndex === "undefined" ? 0 : layerIndex + 1);
  }, [selectLayer, layerIndex]);

  const handlePrev = useCallback(() => {
    selectLayer(typeof layerIndex === "undefined" ? 0 : layerIndex - 1);
  }, [selectLayer, layerIndex]);

  useEffect(() => {
    if (!api) return;

    const cb = () => {
      const id = api.cesiumViewer.selectedEntity?.id;
      const index = id ? stories?.findIndex(l => l.layer === id) : undefined;
      setLayerIndex(index);
    };

    api.cesiumViewer.selectedEntityChanged.addEventListener(cb);
    return () => {
      api.cesiumViewer.selectedEntityChanged.removeEventListener(cb);
    };
  }, [api, stories]);

  useEffect(() => {
    if (!selectedLayer) setMenu(false);
  }, [selectedLayer]);

  const layerCount = stories?.length ?? 0;
  useEffect(() => {
    if (!autoStart || layerCount === 0) return;
    selectLayer(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart]); // ignore everything else autoStart

  const layerPageCount = stories?.length;

  return typeof layerPageCount === "number" && layerPageCount > 0 ? (
    <>
      <Menu ref={wrapperRef} menuOpen={menuOpen}>
        {stories?.map((story, i) => (
          <MenuItem
            key={story.layer}
            selected={selectedLayer?.id === story.layer}
            align="center"
            onClick={selectLayer.bind(undefined, i)}>
            <StyledIcon
              icon="marker"
              size={16}
              color={selectedLayer?.id === story.layer ? colors.text.strong : colors.text.main}
            />
            <Text
              size="m"
              color={selectedLayer?.id === story.layer ? colors.text.strong : colors.text.main}
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
        <ArrowButton disabled={layerIndex === 0} onClick={handlePrev}>
          <Icon icon="arrowLeft" size={24} />
        </ArrowButton>
        <Current align="center" justify="space-between">
          <MenuIcon
            icon="storytellingMenu"
            onClick={() => setMenu(!menuOpen)}
            menuOpen={menuOpen}
          />
          <Title size="m" weight="bold">
            {selectedLayer?.title}
          </Title>
          <Text
            size={isExtraSmallWindow ? "xs" : "m"}
            weight="bold"
            otherProperties={{ userSelect: "none" }}>
            {typeof layerIndex === "undefined" ? "-" : layerIndex + 1} / {layerPageCount}
          </Text>
        </Current>
        <ArrowButton disabled={layerIndex === layerPageCount - 1} onClick={handleNext}>
          <Icon icon="arrowRight" size={24} />
        </ArrowButton>
      </Wrapper>
    </>
  ) : null;
};

const Wrapper = styled.div`
  background-color: ${props => props.theme.colors.bg[3]};
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
  background-color: ${props => props.theme.colors.bg[4]};
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
  color: ${colors.text.main};
  margin-right: ${metricsSizes["l"]}px;
`;

const MenuIcon = styled(Icon)<{ menuOpen?: boolean }>`
  background: ${props => (props.menuOpen ? props.theme.colors.bg[5] : props.theme.colors.bg[3])};
  border-radius: 25px;
  padding: ${metricsSizes["xs"]}px;
  margin-right: ${metricsSizes["xs"]}px;
  cursor: pointer;
  user-select: none;
`;

const Menu = styled.div<{ menuOpen?: boolean }>`
  background-color: ${props => props.theme.colors.bg[3]};
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
  background: ${({ selected }) => (selected ? colors.brand.main : "inherit")};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: ${props => !props.selected && props.theme.colors.bg[5]};
  }
`;

export default Storytelling;
