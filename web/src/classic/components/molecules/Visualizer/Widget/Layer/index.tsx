import { MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClickAway, useMedia } from "react-use";

import Icon from "@reearth/classic/components/atoms/Icon";
import { metricsSizes } from "@reearth/classic/theme";
import fonts from "@reearth/classic/theme/reearthTheme/common/fonts";
import { Camera as CameraValue } from "@reearth/classic/util/value";
import { styled, usePublishTheme, PublishTheme, css } from "@reearth/services/theme";

import { ComponentProps as WidgetProps } from "..";
import useHooks from "./hooks";
import LayerTreeView from "./LayerTreeView";


export type Props = WidgetProps<Property>;

export type Property = {
  default?: {
    size?: "small" | "large" | "medium" | undefined;
    height? :number | undefined;
    heightType? : "auto" | "manual" | undefined;
    bgcolor?: string;
    infoboxPaddingTop?: number;
    infoboxPaddingBottom?: number;
    infoboxPaddingLeft?: number;
    infoboxPaddingRight?: number;
    outlineColor?: string;
    outlineWidth?: number;
  };
  camera?: {
    duration?: number;
    range?: number;
    camera?: CameraValue;
    autoOrbit?: boolean;
  };
};

const layerWidgetWidth = {
  large: 624,
  medium: 540,
  small: 346
};

const Layer = ({ widget, sceneProperty }: Props): JSX.Element | null => {
  const isPreviewPage = useMemo(() => {
    const regex = /\/published\.html\b|\/preview$/;
    return regex.test(window.location.href);
  }, [window.location.href]);
  const ref = useRef<HTMLDivElement>(null);
  const ref2 = useRef<HTMLDivElement>(null);
  const publishedTheme = usePublishTheme(sceneProperty.theme);
  const isExtraSmallWindow = useMedia("(max-width: 420px)");

  const {
    size,
    height,
    heightType,
    bgcolor,
    infoboxPaddingTop,
    infoboxPaddingBottom,
    infoboxPaddingLeft,
    infoboxPaddingRight,
    outlineColor,
    outlineWidth,
  } = (widget?.property as Property | undefined)?.default ?? {};

  const {
    duration,
    range,
    camera,
    autoOrbit,
  } = (widget?.property as Property | undefined)?.camera ?? {};

  const {
    rootLayerId,
    layers,
    selectedType,
    selectedLayerId,
    loading,
    selectLayer,
    moveLayer,
    renameLayer,
    removeLayer,
    updateLayerVisibility,
    importLayer,
    addLayerGroup,
    handleDrop,
    zoomToLayer,
    handleCancelOrbit,
  } = useHooks({
    camera,
    autoOrbit,
    range,
    duration,
  });

  const [open, setOpen] = useState<boolean>(true);
  const [width, setWidth] = useState<number>(layerWidgetWidth[size || 'small']);

  useEffect(() => {
    setOpen(true);
    return () => {
      console.log('ran out');
      setOpen(false);
      handleCancelOrbit();
    }
  }, [])
  
  const handleToggle = useCallback(() =>{
    setOpen(!open);
    (!open)
  },[open]);

  const handler = useCallback((mouseDownEvent: MouseEvent) => {
    if (!mouseDownEvent) return;
    mouseDownEvent.stopPropagation();
    mouseDownEvent.preventDefault();
    const startSize = width;
    const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };

    function onMouseMove(mouseMoveEvent: any) {
      setWidth(startSize - startPosition.x + mouseMoveEvent.pageX);
    }
    function onMouseUp() {
      document.body.removeEventListener("mousemove", onMouseMove);
      // uncomment the following line if not using `{ once: true }`
      // document.body.removeEventListener("mouseup", onMouseUp);
    }

    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp, { once: true });
  }, [width]);

  useEffect(() => {
    setWidth(layerWidgetWidth[size || 'small']);
  }, [size]);
  
  return (
    <Widget
      open={open}
      publishedTheme={publishedTheme}
      extended={!!widget.extended?.horizontally}
      floating={!widget.layout}
      isPreviewPage={isPreviewPage}
      width={width}
      height={height}
      heightType={heightType}
      outlineColor={outlineColor ? outlineColor : publishedTheme.mainText}
      outlineWidth={outlineWidth}
      bgcolor={bgcolor}
      >
      {<div className="draghandle" onMouseDown={handler} >
        <button className="toggle-infoBox-btn" onClick={handleToggle}>
          <Icon icon={ open ? "arrowRight" : "arrowLeft"} />
        </button>
      </div>}
      <Wrapper ref={ref} open={open}>
        <Content
          ref={ref2}
          open={open}
          paddingTop={infoboxPaddingTop}
          paddingBottom={infoboxPaddingBottom}
          paddingLeft={infoboxPaddingLeft}
          paddingRight={infoboxPaddingRight}
        >
          <LayerTreeView
            rootLayerId={rootLayerId}
            selectedLayerId={selectedLayerId}
            layers={layers}
            selectedType={selectedType}
            loading={loading}
            onLayerMove={moveLayer}
            onLayerVisibilityChange={updateLayerVisibility}
            onLayerRename={renameLayer}
            onLayerRemove={removeLayer}
            onLayerImport={importLayer}
            onLayerSelect={selectLayer}
            onLayerGroupCreate={addLayerGroup}
            onDrop={handleDrop}
            onZoomToLayer={zoomToLayer}
          />
        </Content>
      </Wrapper>
    </Widget>
  );
};

const Widget = styled.div<{
  publishedTheme: PublishTheme;
  extended?: boolean;
  floating?: boolean;
  width?: number;
  isPreviewPage?: boolean;
  open: boolean;
  height?: number;
  heightType?: string;
  outlineColor?: string;
  outlineWidth?: number;
  bgcolor?: string;
}>`
  background-color: ${({ publishedTheme, bgcolor }) => bgcolor || publishedTheme?.background};
  color: ${({ publishedTheme }) => publishedTheme.mainText};
  display: flex;
  align-items: stretch;
  border-radius: ${metricsSizes["s"]}px;
  //overflow: hidden;
  ${({ heightType, height, open, isPreviewPage }) =>
    heightType === "auto"
    ? `height: calc(100vh - ${isPreviewPage ? "14" : "106"}px);`
    : height && open
    ? `height: ${height}px;`
    : `height: calc(100vh - ${isPreviewPage ? "14" : "106"}px);`}

  width: ${({ open, width }) => open? width : 0}px;

  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  //top: 10px;
  position: absolute;
  ${({ outlineWidth, outlineColor, open }) =>
    outlineWidth && open
      ? `border: ${outlineWidth}px ${outlineColor} solid`
      : ""};

  ${({ floating }) =>
    floating
      ? css`
          position: absolute;
          left: 80px;
        `
      : null}

  @media (max-width: 560px) {
    display: flex;
    width: ${({ extended }) => (extended ? "100%" : "90vw")};
    margin: 0 auto;
    height: 56px;
  }
  .draghandle {
    position: absolute;
    cursor: col-resize;
    width: ${({open}) => open ? 4 : 0}px;
    height: 100%;

    ${({ open }) => open ?"right: 0; " : ""}

    .toggle-infoBox-btn {
      position: absolute;
      top: 50%;
      left: ${({ open }) => (open ? "5px" : "-5px")};
      background: #fbf9f9 !important;
      border-radius: 0px 92px 92px 0px;
      padding: 0px;
      width: 15px;
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      border: 1px solid #b6b6b6;
    }
  }
`;

const Wrapper = styled.div<{ open?: boolean }>`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: ${({ open }) => (open ? "280px" : "100%")};
  width: 100%;

  @media (max-width: 624px) {
    transition: all 0.4s;
  }
`;

const Content = styled.div<{
  open?: boolean;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
}>`
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  flex: auto;
  font-size: ${fonts.sizes.s}px;
  padding: 10px 0 20px 0;
  transition: all 0.03s linear;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }

  a {
    color: inherit;
  }
  width: 100%;

  max-height: ${({ open }) => (open ? "100%" : "0")};
  padding: ${({ open }) => (open ? "20px 0" : "0")};
  padding-top: ${({ paddingTop, open }) => (paddingTop && open ? `${paddingTop}px` : null)};
  padding-bottom: ${({ paddingBottom, open }) =>
    paddingBottom && open ? `${paddingBottom}px` : null};
  padding-left: ${({ paddingLeft, open }) => (paddingLeft && open ? `${paddingLeft}px` : null)};
  padding-right: ${({ paddingRight, open }) => (paddingRight && open ? `${paddingRight}px` : null)};
`;

export default Layer;
