import React, { useState, useEffect } from "react";
import { useTransition, TransitionStatus } from "@rot1024/use-transition";
import { useTimeoutFn } from "react-use";

import { styled } from "@reearth/theme";
import { Camera } from "@reearth/util/value";
import { useFlyTo } from "@reearth/util/use-fly-to";
import { WidgetComponent } from "../../PluginWidget";
import { PluginProperty } from ".";

type Property = {
  overlay: {
    overlayEnabled?: boolean;
    overlayDelay?: number;
    overlayDuration?: number;
    overlayTransitionDuration?: number;
    overlayBgcolor?: string;
    overlayImage?: string;
    overlayImageW?: number;
    overlayImageH?: number;
    overlayTitle?: string;
  };
  camera?: {
    cameraPosition?: Camera;
    cameraDuration?: number;
    cameraDelay?: number;
  }[];
};

const SplashScreen: WidgetComponent<Property, PluginProperty> = ({ property, isBuilt }) => {
  const {
    overlayEnabled: enabled,
    overlayDelay: delay = 0,
    overlayDuration: duration = 3,
    overlayTransitionDuration: transitionDuration = 1,
    overlayBgcolor: bgcolor,
    overlayImage: image,
    overlayImageW: imageW,
    overlayImageH: imageH,
    overlayTitle: title,
  } = property?.overlay ?? {};
  const camera = property?.camera?.filter(c => !!c.cameraPosition);

  const [cameraSequence, setCameraSequence] = useState(0);
  const [delayedCameraSequence, setDelayedCameraSequence] = useState(-1);
  const currentCamera = camera?.[cameraSequence];
  const delayedCurrentCamera = camera?.[delayedCameraSequence];
  useFlyTo(delayedCurrentCamera?.cameraPosition, {
    duration: (delayedCurrentCamera?.cameraDuration ?? 0) * 1000,
    delay: (delayedCurrentCamera?.cameraDelay ?? 0) * 1000,
  });

  const [isActive, setActive] = useState(false);
  const state = useTransition(isActive, transitionDuration * 1000, {
    mountOnEnter: true,
    unmountOnExit: true,
  });

  useTimeoutFn(() => {
    if (isBuilt && enabled) {
      setActive(true);
    }
  }, delay * 1000);

  useTimeoutFn(() => {
    setActive(false);
  }, (delay + transitionDuration + duration) * 1000);

  useEffect(() => {
    if (!isBuilt || !currentCamera) return;
    const t = setTimeout(() => {
      setDelayedCameraSequence(i => i + 1);
    }, (currentCamera?.cameraDelay ?? 0) * 1000);
    return () => clearTimeout(t);
  }, [currentCamera, isBuilt]);

  useEffect(() => {
    if (!isBuilt || !delayedCurrentCamera) return;
    const t = setTimeout(() => {
      setCameraSequence(i => i + 1);
    }, (delayedCurrentCamera?.cameraDuration ?? 0) * 1000);
    return () => clearTimeout(t);
  }, [delayedCurrentCamera, isBuilt]);

  return state === "unmounted" ? null : (
    <Wrapper state={state} bgcolor={bgcolor} duration={transitionDuration}>
      <Image src={image} alt={title} width={imageW} height={imageH} />
    </Wrapper>
  );
};

const Wrapper = styled.div<{ state: TransitionStatus; bgcolor?: string; duration: number }>`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  transition: ${({ state, duration }) =>
    state === "entering" || state === "exiting" ? `all ${duration}s ease` : ""};
  opacity: ${({ state }) => (state === "entering" || state === "entered" ? 1 : 0)};
  background-color: ${({ bgcolor }) => bgcolor || "rgba(0, 0, 0, 0.7)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  padding: 16px;
  z-index: ${props => props.theme.zIndexes.splashScreen};
`;

const Image = styled.img`
  max-width: 100%;
`;

export default SplashScreen;
