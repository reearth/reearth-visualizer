import {
  JulianDate,
  Entity,
  Cartesian3,
  PolygonHierarchy,
  PointGraphics,
  BillboardGraphics,
} from "cesium";

import { AppearanceTypes, ComputedFeature, ComputedLayer, Feature } from "@reearth/core/mantle";
import { EvalFeature } from "@reearth/core/Map";

import { heightReference, shadowMode, toColor } from "../../common";
import { attachTag, extractSimpleLayer, getTag, Tag } from "../utils";

export function overrideOriginalProperties(
  entity: Entity,
  tag: Tag | undefined,
  name: string,
  properties: any,
) {
  const originalProperties = tag?.originalProperties || {};
  attachTag(entity, {
    ...(tag || {}),
    originalProperties: {
      ...originalProperties,
      [name]: {
        ...originalProperties[name],
        ...properties,
      },
    },
  });
}

type CesiumEntityAppearanceKey = "polygon" | "polyline";
type SupportedAppearanceKey = "marker" | keyof Pick<Entity, CesiumEntityAppearanceKey>;

type EntityAppearanceKey<AName extends SupportedAppearanceKey> = AName extends "marker"
  ? keyof Pick<Entity, "point" | "billboard" | "label">
  : keyof Pick<Entity, CesiumEntityAppearanceKey>;

type AppearancePropertyKeyType = "color" | "heightReference" | "shadows";

export function attachProperties<
  AName extends SupportedAppearanceKey,
  PName extends EntityAppearanceKey<AName>,
>(
  entity: Entity,
  computedFeature: ComputedFeature | undefined,
  namePair: [appearanceName: AName, propertyName: PName],
  propertyMap: {
    [K in keyof Exclude<Entity[PName], undefined>]?: {
      name: keyof AppearanceTypes[AName];
      type?: AppearancePropertyKeyType;
      override?: any;
      default?: any;
    };
  },
) {
  const [appearanceName, propertyName] = namePair;
  const property = entity[propertyName] ?? {};
  if (!entity[propertyName]) {
    return;
  }

  const tag = getTag(entity);

  // Backup original properties
  overrideOriginalProperties(
    entity,
    tag,
    propertyName,
    Object.keys(propertyMap).reduce((r, k) => {
      r[k] = (property as any)[k];
      return r;
    }, {} as Record<string, any>),
  );

  Object.entries(propertyMap).forEach(([entityPropertyKey, appearancePropertyKey]) => {
    const appearanceKeyName = appearancePropertyKey.name;
    const appearanceKeyType = appearancePropertyKey.type as AppearancePropertyKeyType;

    let value =
      appearancePropertyKey.override ??
      (computedFeature?.[appearanceName] as any)?.[appearanceKeyName] ??
      appearancePropertyKey.default;
    switch (appearanceKeyType) {
      case "color":
        value = toColor(value);
        break;
      case "shadows":
        value = shadowMode(value);
        break;
      case "heightReference":
        value = heightReference(value);
    }

    (entity[propertyName] as any)[entityPropertyKey] =
      value ?? (property as any)[entityPropertyKey];
  });
}

const hasAppearance = <
  AName extends SupportedAppearanceKey,
  PName extends EntityAppearanceKey<AName>,
>(
  layer: ComputedLayer | undefined,
  entity: Entity,
  namePair: [appearanceName: AName, propertyName: PName],
): boolean => {
  return !!(extractSimpleLayer(layer)?.[namePair[0]] || entity[namePair[1]]);
};

export const attachStyle = (
  entity: Entity,
  layer: ComputedLayer | undefined,
  evalFeature: EvalFeature,
  currentTime: JulianDate,
): [Feature, ComputedFeature] | void => {
  if (!layer) {
    return;
  }

  // TODO: make it DRY
  const point = hasAppearance(layer, entity, ["marker", "point"]);
  const billboard = hasAppearance(layer, entity, ["marker", "billboard"]);
  const label = hasAppearance(layer, entity, ["marker", "label"]);
  if (point || billboard || label) {
    const position = entity.position?.getValue(currentTime);
    const coordinates = [position?.x ?? 0, position?.y ?? 0, position?.z ?? 0];
    const feature: Feature = {
      type: "feature",
      id: String(entity.id),
      geometry: {
        type: "Point",
        coordinates,
      },
      properties: entity.properties?.getValue(currentTime) || {},
      range: {
        x: coordinates[0],
        y: coordinates[1],
        z: coordinates[2],
      },
    };
    const computedFeature = evalFeature(layer.layer, feature);
    if (!computedFeature) {
      return;
    }
    const simpleLayer = extractSimpleLayer(layer);
    if (point) {
      const isPointStyle = simpleLayer?.marker?.style === "point";
      if (isPointStyle && !entity.point) {
        entity.point = new PointGraphics();
        entity.billboard = undefined;
      }

      attachProperties(entity, computedFeature, ["marker", "point"], {
        show: {
          name: "show",
          ...(simpleLayer?.marker?.style
            ? {
                override:
                  simpleLayer?.marker?.style === "point" && (simpleLayer?.marker.show ?? true),
              }
            : {}),
        },
        pixelSize: {
          name: "pointSize",
        },
        color: {
          name: "pointColor",
          type: "color",
        },
        outlineColor: {
          name: "pointOutlineColor",
          type: "color",
        },
        outlineWidth: {
          name: "pointOutlineWidth",
        },
        heightReference: {
          name: "heightReference",
          type: "heightReference",
        },
      });
    }

    if (billboard) {
      const isImageStyle = simpleLayer?.marker?.style === "image";
      if (isImageStyle && !entity.billboard) {
        entity.billboard = new BillboardGraphics();
        entity.point = undefined;
      }

      attachProperties(entity, computedFeature, ["marker", "billboard"], {
        show: {
          name: "show",
          ...(simpleLayer?.marker?.style
            ? {
                override:
                  simpleLayer?.marker?.style === "image" && (simpleLayer?.marker.show ?? true),
              }
            : {}),
        },
        image: {
          name: "image",
        },
        color: {
          name: "imageColor",
          type: "color",
        },
        scale: {
          name: "imageSize",
        },
        sizeInMeters: {
          name: "imageSizeInMeters",
        },
        heightReference: {
          name: "heightReference",
          type: "heightReference",
        },
        horizontalOrigin: {
          name: "imageHorizontalOrigin",
        },
        verticalOrigin: {
          name: "imageVerticalOrigin",
        },
      });

      if (label) {
        attachProperties(entity, computedFeature, ["marker", "label"], {
          show: {
            name: "show",
            default: true,
          },
          text: {
            name: "labelText",
          },
          backgroundColor: {
            name: "labelBackground",
            type: "color",
          },
          heightReference: {
            name: "heightReference",
            type: "heightReference",
          },
        });
      }
    }
    return [feature, computedFeature];
  }

  if (hasAppearance(layer, entity, ["polyline", "polyline"])) {
    const entityPosition = entity.position?.getValue(currentTime);
    const positions = entity.polyline?.positions?.getValue(currentTime) as Cartesian3[];
    const coordinates = positions?.map(position => [
      position?.x ?? 0,
      position?.y ?? 0,
      position?.z ?? 0,
    ]);
    const feature: Feature = {
      type: "feature",
      id: String(entity.id),
      geometry: {
        type: "LineString",
        coordinates,
      },
      properties: entity.properties?.getValue(currentTime) || {},
      range: {
        x: entityPosition?.x ?? 0,
        y: entityPosition?.y ?? 0,
        z: entityPosition?.z ?? 0,
      },
    };
    const computedFeature = evalFeature(layer.layer, feature);
    if (!computedFeature) {
      return;
    }
    attachProperties(entity, computedFeature, ["polyline", "polyline"], {
      show: {
        name: "show",
        default: true,
      },
      width: {
        name: "strokeWidth",
      },
      material: {
        name: "strokeColor",
        type: "color",
      },
      shadows: {
        name: "shadows",
        type: "shadows",
      },
      clampToGround: {
        name: "clampToGround",
      },
    });
    return [feature, computedFeature];
  }

  if (hasAppearance(layer, entity, ["polygon", "polygon"])) {
    const entityPosition = entity.position?.getValue(currentTime);
    const hierarchy = entity.polygon?.hierarchy?.getValue(currentTime) as PolygonHierarchy;
    const coordinates = hierarchy?.holes?.map(hole =>
      hole.positions.map(position => [position?.x ?? 0, position?.y ?? 0, position?.z ?? 0]),
    );
    const feature: Feature = {
      type: "feature",
      id: String(entity.id),
      geometry: {
        type: "Polygon",
        coordinates,
      },
      properties: entity.properties?.getValue(currentTime) || {},
      range: {
        x: entityPosition?.x ?? 0,
        y: entityPosition?.y ?? 0,
        z: entityPosition?.z ?? 0,
      },
    };
    const computedFeature = evalFeature(layer.layer, feature);
    if (!computedFeature) {
      return;
    }
    attachProperties(entity, computedFeature, ["polygon", "polygon"], {
      show: {
        name: "show",
        default: true,
      },
      fill: {
        name: "fill",
      },
      material: {
        name: "fillColor",
        type: "color",
      },
      outline: {
        name: "stroke",
      },
      outlineColor: {
        name: "strokeColor",
        type: "color",
      },
      outlineWidth: {
        name: "strokeWidth",
      },
      shadows: {
        name: "shadows",
        type: "shadows",
      },
      heightReference: {
        name: "heightReference",
        type: "heightReference",
      },
      extrudedHeight: {
        name: "extrudedHeight",
      },
    });
    return [feature, computedFeature];
  }
};
