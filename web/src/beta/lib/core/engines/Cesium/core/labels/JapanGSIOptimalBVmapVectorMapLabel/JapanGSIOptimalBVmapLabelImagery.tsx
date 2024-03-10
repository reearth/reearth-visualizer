import {
  Cartesian3,
  Cartographic,
  Color,
  HeightReference,
  HorizontalOrigin,
  LabelStyle,
  NearFarScalar,
  LabelCollection,
  Rectangle,
  VerticalOrigin,
  type Ellipsoid,
  type Label,
} from "@cesium/engine";
import { merge, omit } from "lodash-es";
import { type Feature } from "protomaps";
import { memo, useCallback, useEffect, useMemo, useRef, type FC } from "react";
import { useCesium } from "resium";
import { suspend } from "suspend-react";

import { isNotNullish } from "../../../../Cesium/utils/polygon";
import { isColor, toColor } from "../../../common";

import { getAnnotationType, type AnnotationType } from "./getAnnotationType";
import { getTileCoords } from "./helpers";
import { type JapanGSIOptimalBVmapLabelImageryProvider } from "./JapanGSIOptimalBVmapLabelImageryProvider";
import { type Imagery, type ImageryCoords, type KeyedImagery } from "./types";

type LabelOptions = Partial<
  Pick<
    Label,
    {
      [K in keyof Label]: Label[K] extends (...args: any[]) => any ? never : K;
    }[keyof Label]
  >
>;

export type AnnotationStyle = Partial<
  Record<
    AnnotationType | "default",
    | (Omit<LabelOptions, "id" | "position" | "text" | "font" | "show"> & {
        fontSize?: number;
        fontFamily?: string;
      })
    | false
  >
>;

const fontScale = 5;
const scaleByDistance = new NearFarScalar(
  0,
  1 / fontScale,
  Number.POSITIVE_INFINITY,
  1 / fontScale,
);

const defaultStyle: AnnotationStyle = {
  default: {
    fontFamily: "sans-serif",
    fillColor: Color.BLACK,
    outlineColor: Color.WHITE.withAlpha(0.8),
    outlineWidth: 5,
  },
  municipalities: {
    fontSize: 12,
  },
  towns: {
    fontSize: 8,
    fillColor: Color.BLACK.withAlpha(0.6),
  },
  roads: {
    fontSize: 8,
  },
  railways: {
    fontSize: 8,
  },
  stations: {
    fontSize: 9,
  },
  landmarks: {
    fontSize: 8,
  },
  topography: {
    fontSize: 8,
    fillColor: Color.BLACK.withAlpha(0.6),
  },
};

function resolveStyle(code: number, style?: AnnotationStyle): Partial<LabelOptions> | undefined {
  const type = getAnnotationType(code);
  if (type == null) {
    return;
  }
  const typeStyle = style?.[type];
  if (typeStyle === false) {
    return;
  }
  const mergedStyle = merge(
    {},
    defaultStyle.default,
    defaultStyle[type],
    style?.default,
    typeStyle,
  );
  const convertedStyle = Object.fromEntries(
    Object.entries(mergedStyle).map(([k, v]) => [
      k,
      typeof v === "string" && isColor(v) ? toColor(v) : v,
    ]),
  );
  return {
    scaleByDistance,
    ...omit(convertedStyle, ["fontSize", "fontFamily"]),
    font:
      convertedStyle?.fontSize != null && convertedStyle.fontFamily != null
        ? `${convertedStyle.fontSize * fontScale}pt ${convertedStyle.fontFamily}`
        : undefined,
  };
}

interface AnnotationFeature extends Feature {
  props: {
    vt_code: number;
    vt_text: string;
    vt_arrng?: number;
    vt_arrngagl?: number;
  };
}

const positionScratch = new Cartesian3();
const cartographicScratch = new Cartographic();

function getPosition(
  coords: ImageryCoords,
  feature: Feature,
  bounds: Rectangle,
  descendantsBounds: Rectangle[] | undefined,
  tileSize: number,
  height?: number,
  ellipsoid?: Ellipsoid,
  result = new Cartesian3(),
): Cartesian3 | undefined {
  let x = feature.geom[0][0].x / tileSize;
  let y = feature.geom[0][0].y / tileSize;
  if (coords.level === 17) {
    // Tiles at 16 level includes features for level 17.
    // https://github.com/gsi-cyberjapan/optimal_bvmap
    x = x * 2 - (coords.x % 2);
    y = y * 2 - (coords.y % 2);
  }
  if (x < 0 || x > 1 || y < 0 || y > 1) {
    return;
  }
  const cartographic = Cartographic.fromRadians(
    bounds.west + bounds.width * x,
    bounds.south + bounds.height * (1 - y),
    height,
    cartographicScratch,
  );
  if (descendantsBounds?.some(bounds => Rectangle.contains(bounds, cartographic)) === true) {
    return;
  }
  return Cartographic.toCartesian(cartographic, ellipsoid, result);
}

export interface JapanGSIOptimalBVmapLabelImageryProps {
  imageryProvider: JapanGSIOptimalBVmapLabelImageryProvider;
  imagery: KeyedImagery;
  descendants?: readonly Imagery[];
  height?: number;
  style?: AnnotationStyle;
  labelCollection?: LabelCollection;
}

export const JapanGSIOptimalBVmapLabelImagery: FC<JapanGSIOptimalBVmapLabelImageryProps> = memo(
  ({
    imageryProvider,
    imagery,
    descendants,
    height = 50,
    style = defaultStyle,
    labelCollection,
  }) => {
    const cesiumContext = useCesium();

    const tile = suspend(
      async () => await imageryProvider.tileCache.get(getTileCoords(imagery, 16)),
      [JapanGSIOptimalBVmapLabelImagery, imagery.key],
    );

    const bounds = useMemo(
      () => imageryProvider.tilingScheme.tileXYToRectangle(imagery.x, imagery.y, imagery.level),
      [imageryProvider, imagery],
    );

    const descendantsBounds = useMemo(
      () =>
        descendants?.map(descendant =>
          imageryProvider.tilingScheme.tileXYToRectangle(
            descendant.x,
            descendant.y,
            descendant.level,
          ),
        ),
      [imageryProvider, descendants],
    );

    const annotations = useMemo(() => {
      const features = tile.get("Anno");
      if (features == null) {
        return [];
      }
      return features.filter(
        (feature): feature is AnnotationFeature =>
          typeof feature.props.vt_code === "number" &&
          // Look for annotations with 3-digits code only.
          // https://maps.gsi.go.jp/help/pdf/vector/optbv_featurecodes.pdf
          `${feature.props.vt_code}`.length === 3 &&
          typeof feature.props.vt_text === "string" &&
          (feature.props.vt_arrng == null || typeof feature.props.vt_arrng === "number") &&
          (feature.props.vt_arrngagl == null || typeof feature.props.vt_arrngagl === "number") &&
          // `vt_flag17` property determines the visibility of features inside
          // tiles at level 16.
          // https://maps.gsi.go.jp/help/pdf/vector/optbv_attribute.pdf
          (imagery.level < 16 ||
            (imagery.level === 16 && feature.props.vt_flag17 !== 2) ||
            (imagery.level === 17 && feature.props.vr_flag17 !== 0)),
      );
    }, [tile, imagery]);

    const labelsRef = useRef<Array<[AnnotationFeature, Label]>>();
    const scene = cesiumContext?.scene;

    const updateVisibility = useCallback(() => {
      const labels = labelsRef.current;
      if (labels == null) {
        return;
      }
      labels.forEach(([feature, label]) => {
        const position = getPosition(
          imagery,
          feature,
          bounds,
          descendantsBounds,
          imageryProvider.tileCache.tileSize,
          height,
          scene?.globe?.ellipsoid,
          positionScratch,
        );
        if (position != null) {
          label.position = position;
          label.show = true;
        } else {
          label.show = false;
        }
      });
      scene?.requestRender();
    }, [imageryProvider, imagery, height, bounds, descendantsBounds, scene]);

    const updateVisibilityRef = useRef(updateVisibility);
    updateVisibilityRef.current = updateVisibility;

    useEffect(() => {
      if (!scene || !labelCollection) {
        return;
      }
      const texts: string[] = [];
      const labels = annotations
        .map((feature): [AnnotationFeature, Label] | undefined => {
          const styleOptions = resolveStyle(feature.props.vt_code, style);
          if (styleOptions == null) {
            return undefined;
          }
          const text = feature.props.vt_text;
          if (texts.includes(text)) {
            return undefined; // Basic dedupe, mostly for stations.
          }
          texts.push(text);
          const options: LabelOptions = {
            text,
            style: LabelStyle.FILL_AND_OUTLINE,
            horizontalOrigin: HorizontalOrigin.CENTER,
            verticalOrigin: VerticalOrigin.BOTTOM,
            heightReference: HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Infinity,
            ...styleOptions,
          };
          return [feature, labelCollection.add(options)];
        })
        .filter(isNotNullish);

      labelsRef.current = labels;
      updateVisibilityRef.current();

      const removeLabels = (): void => {
        if (!labelCollection.isDestroyed()) {
          labels.forEach(([, label]) => {
            labelCollection.remove(label);
          });
        }
        if (!scene.isDestroyed()) {
          scene?.postRender.removeEventListener(removeLabels);
        }
      };
      return () => {
        labelsRef.current = undefined;
        if (!scene.isDestroyed()) {
          scene?.postRender.addEventListener(removeLabels);
        }
      };
    }, [style, annotations, scene, labelCollection]);

    useEffect(() => {
      updateVisibility();
    }, [updateVisibility]);

    return null;
  },
);

JapanGSIOptimalBVmapLabelImagery.displayName = "JapanGSIOptimalBVmapLabelImagery";
