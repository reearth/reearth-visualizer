import { memo } from "react";

import { useT } from "@reearth/i18n";
import { styled } from "@reearth/theme";

import Icon from "../Icon";

import { useNavigator } from "./hooks";
import { CompassAngle } from "./types";

export type Props = {
  degree: number;
  /**
   * Pass degree of circle as callback arguments.
   * This event is invoked when mouse down on outer circle and mouse move.
   * When mouse up, this event is stopped.
   */
  onRotate?: (degree: number) => void;
  /**
   * Pass distance of movement as x,y axis(px) and degree of circle as callback arguments.
   * This event is invoked when inner mouse down on circle button and mouse move.
   * When mouse up, this event is stopped.
   */
  onOrbit?: (angle: CompassAngle) => void;
  /**
   * This event is invoked when center of circle is clicked.
   */
  onRestoreRotate?: () => void;
  /**
   * Pass + or -  as callback arguments.
   */
  onClickHelp?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
};

const Navigator: React.FC<Props> = memo(function NavigatorPresenter({
  degree,
  onRotate,
  onOrbit,
  onRestoreRotate,
  onClickHelp,
  onZoomIn,
  onZoomOut,
}) {
  const {
    compassRef,
    compassDegree,
    compassFocusAngle,
    isMovingAngle,
    handleOnMouseDownAngle,
    handleOnMouseDownCompass,
  } = useNavigator({ degree, onRotate, onOrbit });
  const t = useT();
  return (
    <Container>
      <CompassContainer>
        <Compass ref={compassRef}>
          <CompassIcon onMouseDown={handleOnMouseDownCompass}>
            <Icon
              icon="compass"
              color="#000"
              aria-label={t("aria-label-compass")}
              size={64}
              style={{ transform: `rotate(${compassDegree}deg)` }}
            />
          </CompassIcon>
          {isMovingAngle && (
            <CompassFocusIcon
              style={{
                transform: `rotate(${compassFocusAngle.degree}deg)`,
              }}
              data-testId="compassFocus">
              <Icon icon="compassFocus" color="blue" alt="" size={30} />
            </CompassFocusIcon>
          )}
          <AngleIcon onMouseDown={handleOnMouseDownAngle}>
            <Icon icon="navigatorAngle" aria-label={t("aria-label-adjust-angle")} size={32} />
          </AngleIcon>
        </Compass>
        <Help onClick={onClickHelp}>?</Help>
      </CompassContainer>
      <Tool>
        <ToolIconButton onClick={onZoomOut}>
          <Icon icon="minus" aria-label={t("aria-label-zoom-out")} size={16} />
        </ToolIconButton>
        <ToolIconButton onDoubleClick={onRestoreRotate}>
          <Icon icon="house" aria-label={t("aria-label-Go-to-the-home-position")} size={16} />
        </ToolIconButton>
        <ToolIconButton onClick={onZoomIn}>
          <Icon icon="plus" aria-label={t("aria-label-zoom-in")} size={16} />
        </ToolIconButton>
      </Tool>
    </Container>
  );
});

const Container = styled.div`
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  padding-left: 32px;
`;

const CompassContainer = styled.div`
  position: relative;
  display: inline-grid;
  place-items: center;
`;

const Help = styled.button`
  position: absolute;
  height: 32px;
  width: 32px;
  border-radius: 16px 0 0 16px;
  left: -28px;
  background: #4a4a4a;
  color: #fff;
`;

const Compass = styled.div`
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 64px;
  height: 64px;
  cursor: pointer;
  z-index: 1;
`;

const CompassIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 64px;
  height: 64px;
`;

const CompassFocusIcon = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0.8;
  width: 64px;
  height: 64px;
`;

const AngleIcon = styled.div`
  color: ${({ theme }) => theme.main.weak};
  display: inline-block;
  height: 32px;
  width: 32px;
  z-index: 1;
`;

const Tool = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #fff;
  border-radius: 16px;
  margin-top: 8px;
`;

const ToolIconButton = styled.button`
  color: #4a4a4a;
  height: 32px;
  width: 32px;
  display: grid;
  place-items: center;
`;

export default Navigator;
