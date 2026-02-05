import { Icon } from "@reearth/app/lib/reearth-ui";
import { useT } from "@reearth/services/i18n";
import { styled } from "@reearth/services/theme";
import { memo } from "react";

import type { Theme } from "../../../types";

import { useNavigator } from "./hooks";

export { degreeToRadian, radianToDegree } from "./utils";

export type Props = {
  theme?: Theme;
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
  onMoveOrbit?: (degree: number) => void;
  onStartOrbit?: () => void;
  onEndOrbit?: () => void;
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

const NavigatorUI: React.FC<Props> = memo(function NavigatorPresenterMemo({
  theme,
  degree,
  onRotate,
  onStartOrbit,
  onEndOrbit,
  onMoveOrbit,
  onRestoreRotate,
  onClickHelp,
  onZoomIn,
  onZoomOut
}) {
  const t = useT();

  const {
    compassRef,
    compassDegree,
    compassFocusDegree,
    isMovingAngle,
    handleOnMouseDownAngle,
    handleOnMouseDownCompass
  } = useNavigator({ degree, onRotate, onStartOrbit, onEndOrbit, onMoveOrbit });

  return (
    <Container>
      <CompassContainer>
        <Compass ref={compassRef}>
          <CompassIcon
            onMouseDown={handleOnMouseDownCompass}
            publishedTheme={theme}
          >
            <CompassIconWrapper
              icon="compass"
              ariaLabel={t("aria-label-compass")}
              compassDegree={compassDegree}
              size={64}
            />
          </CompassIcon>
          {isMovingAngle && (
            <CompassFocusIcon
              style={{
                transform: `rotate(${compassFocusDegree}deg)`
              }}
              data-testid="compassFocus"
            >
              <Icon icon="compassFocus" color={theme?.select} size={30} />
            </CompassFocusIcon>
          )}
          <AngleIcon
            onMouseDown={handleOnMouseDownAngle}
            publishedTheme={theme}
          >
            <Icon
              icon="navigatorAngle"
              ariaLabel={t("aria-label-adjust-angle")}
              size={32}
            />
          </AngleIcon>
        </Compass>
        {onClickHelp && <Help onClick={onClickHelp}>?</Help>}
      </CompassContainer>
      <Tool publishedTheme={theme}>
        <ToolIconButton onClick={onZoomIn} publishedTheme={theme}>
          <Icon icon="plus" ariaLabel={t("aria-label-zoom-in")} />
        </ToolIconButton>
        <ToolIconButton onClick={onRestoreRotate} publishedTheme={theme}>
          <Icon
            icon="home"
            ariaLabel={t("aria-label-Go-to-the-home-position")}
          />
        </ToolIconButton>
        <ToolIconButton onClick={onZoomOut} publishedTheme={theme}>
          <Icon icon="minus" ariaLabel={t("aria-label-zoom-out")} />
        </ToolIconButton>
      </Tool>
    </Container>
  );
});

const Container = styled("div")(() => ({
  display: "inline-flex",
  flexDirection: "column",
  alignItems: "center"
}));

const CompassContainer = styled("div")(() => ({
  display: "inline-grid",
  position: "relative",
  placeItems: "center"
}));

const Help = styled("button")(({ theme }) => ({
  position: "absolute",
  height: 32,
  width: 32,
  borderRadius: `16px 0 0 16px`,
  left: "-28px",
  background: "#4a4a4a",
  color: theme.item.default,
  userSelect: "none"
}));

const Compass = styled("div")(() => ({
  position: "relative",
  display: "inline-grid",
  placeItems: "center",
  width: 64,
  height: 64,
  cursor: "pointer"
}));

const CompassIconWrapper = styled(Icon)<{ compassDegree: number }>(
  ({ compassDegree }) => ({
    transform: `rotate(${compassDegree}deg)`
  })
);

const CompassIcon = styled("div")<{ publishedTheme?: Theme }>(
  ({ theme, publishedTheme }) => ({
    position: "absolute",
    top: 0,
    left: 0,
    width: 64,
    height: 64,
    color: publishedTheme?.mainText || theme.content.main,
    "& path": {
      fill: publishedTheme?.mainText || theme.content.main
    },
    "& circle": {
      stroke: publishedTheme?.background || theme.content.withBackground
    }
  })
);

const CompassFocusIcon = styled("div")(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  opacity: 0.8,
  width: 64,
  height: 64
}));

const AngleIcon = styled("div")<{ publishedTheme?: Theme }>(
  ({ theme, publishedTheme }) => ({
    "& circle": {
      fill: publishedTheme?.background || theme.bg[0]
    },
    "& g": {
      stroke: publishedTheme?.mainText || theme.content.main
    },
    display: "inline-block",
    height: 32,
    width: 32
  })
);

const Tool = styled("div")<{ publishedTheme?: Theme }>(
  ({ publishedTheme, theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    background: publishedTheme?.background
      ? publishedTheme?.background
      : theme.bg[0],
    borderRadius: 16,
    marginTop: theme.spacing.small
  })
);

const ToolIconButton = styled("button")<{ publishedTheme?: Theme }>(
  ({ publishedTheme, theme }) => ({
    height: 32,
    width: 32,
    display: "grid",
    placeItems: "center",
    color: publishedTheme?.mainText
      ? publishedTheme?.mainText
      : theme.content.main
  })
);

export default NavigatorUI;
