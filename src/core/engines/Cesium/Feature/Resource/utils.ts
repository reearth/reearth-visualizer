import {
  KmlDataSource as CesiumKmlDataSource,
  CzmlDataSource as CesiumCzmlDataSource,
  GeoJsonDataSource as CesiumGeoJsonDataSource,
  JulianDate,
  Entity,
  Cartesian3,
  PolygonHierarchy,
} from "cesium";

import { AppearanceTypes, ComputedFeature, ComputedLayer, Feature } from "@reearth/core/mantle";
import { EvalFeature } from "@reearth/core/Map";

import { heightReference, shadowMode, toColor } from "../../common";
import { attachTag, getTag, Tag } from "../utils";

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
  ? keyof Pick<Entity, "point">
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
    };
  },
) {
  const [appearanceName, propertyName] = namePair;
  const property = entity[propertyName];
  if (!property) {
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

    let value = (computedFeature?.[appearanceName] as any)?.[appearanceKeyName];
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

    (property as any)[entityPropertyKey] = value ?? (property as any)[entityPropertyKey];
  });
}

export const attachStyle = (
  dataSource: CesiumKmlDataSource | CesiumCzmlDataSource | CesiumGeoJsonDataSource,
  appearances: (keyof AppearanceTypes)[] | undefined,
  layer: ComputedLayer | undefined,
  evalFeature: EvalFeature,
  currentTime: JulianDate,
) => {
  if (!layer) {
    return;
  }
  dataSource?.entities.values.forEach(entity => {
    appearances?.forEach(appearance => {
      if (layer?.layer.type == "simple" && !layer?.layer?.[appearance]) {
        return;
      }

      if (appearance === "marker") {
        const position = entity.position?.getValue(currentTime);
        const coordinates = [position?.x ?? 0, position?.y ?? 0, position?.z ?? 0];
        const feature: Feature = {
          type: "feature",
          id: entity.id,
          geometry: {
            type: "Point",
            coordinates,
          },
          properties: entity.properties?.getValue(JulianDate.now()) || {},
          range: {
            x: coordinates[0],
            y: coordinates[1],
            z: coordinates[2],
          },
        };
        const computedFeature = evalFeature(layer.layer, feature);
        attachProperties(entity, computedFeature, ["marker", "point"], {
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

      if (appearance === "polyline") {
        const entityPosition = entity.position?.getValue(JulianDate.now());
        const positions = entity.polyline?.positions?.getValue(JulianDate.now()) as Cartesian3[];
        const coordinates = positions?.map(position => [
          position?.x ?? 0,
          position?.y ?? 0,
          position?.z ?? 0,
        ]);
        const feature: Feature = {
          type: "feature",
          id: entity.id,
          geometry: {
            type: "LineString",
            coordinates,
          },
          properties: entity.properties || {},
          range: {
            x: entityPosition?.x ?? 0,
            y: entityPosition?.y ?? 0,
            z: entityPosition?.z ?? 0,
          },
        };
        const computedFeature = evalFeature(layer.layer, feature);
        attachProperties(entity, computedFeature, ["polyline", "polyline"], {
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
      }

      if (appearance === "polygon") {
        const entityPosition = entity.position?.getValue(JulianDate.now());
        const hierarchy = entity.polygon?.hierarchy?.getValue(JulianDate.now()) as PolygonHierarchy;
        const coordinates = hierarchy.holes?.map(hole =>
          hole.positions.map(position => [position?.x ?? 0, position?.y ?? 0, position?.z ?? 0]),
        );
        const feature: Feature = {
          type: "feature",
          id: entity.id,
          geometry: {
            type: "Polygon",
            coordinates,
          },
          properties: entity.properties || {},
          range: {
            x: entityPosition?.x ?? 0,
            y: entityPosition?.y ?? 0,
            z: entityPosition?.z ?? 0,
          },
        };
        const computedFeature = evalFeature(layer.layer, feature);
        attachProperties(entity, computedFeature, ["polygon", "polygon"], {
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
        });
      }
    });
  });
};
