import { Color, EntityCluster, HorizontalOrigin, VerticalOrigin } from "cesium";
import React, { useEffect, useMemo } from "react";
import { CustomDataSource } from "resium";

import { toCSSFont, Typography } from "@reearth/util/value";

import { LayerStore } from "../..";
import P from "../../Primitive";

export type Props = {
  property: {
    default: {
      clusterPixelRange: number;
      clusterMinSize: number;
      clusterLabelTypography?: Typography;
      clusterImage?: string;
      clusterImageHeight?: number;
      clusterImageWidth?: number;
    };
    layers: {
      layer?: string;
    }[];
  };
  pluginProperty?: { [key: string]: any };
  isEditable?: boolean;
  isBuilt?: boolean;
  pluginBaseUrl?: string;
  layers?: LayerStore;
  selectedLayerId?: string;
  overriddenProperties?: { [id in string]: any };
  isLayerHidden?: (id: string) => boolean;
};

const Cluster: React.FC<Props> = ({
  property,
  pluginProperty,
  isEditable,
  isBuilt,
  pluginBaseUrl,
  layers,
  selectedLayerId,
  overriddenProperties,
  isLayerHidden,
}) => {
  const {
    clusterPixelRange = 15,
    clusterMinSize = 3,
    clusterLabelTypography = {
      fontFamily: "sans-serif",
      fontSize: 30,
      fontWeight: 400,
      color: "#FFF",
      textAlign: "center",
      bold: false,
      italic: false,
      underline: false,
    },
    clusterImage,
    clusterImageWidth,
    clusterImageHeight,
  } = property?.default ?? {};

  const cluster = useMemo<EntityCluster>(() => {
    return new EntityCluster({
      enabled: true,
      pixelRange: 15,
      minimumClusterSize: 3,
      clusterBillboards: true,
      clusterLabels: true,
      clusterPoints: true,
    });
  }, []);

  useEffect(() => {
    cluster.pixelRange = clusterMinSize;
    cluster.minimumClusterSize = clusterPixelRange;
  }, [cluster, clusterMinSize, clusterPixelRange]);

  useEffect(() => {
    return cluster.clusterEvent.addEventListener((_clusteredEntities, clusterParam) => {
      clusterParam.label.font = toCSSFont(clusterLabelTypography, { fontSize: 30 });
      clusterParam.label.horizontalOrigin =
        clusterLabelTypography.textAlign === "right"
          ? HorizontalOrigin.LEFT
          : clusterLabelTypography.textAlign === "left"
          ? HorizontalOrigin.RIGHT
          : HorizontalOrigin.CENTER;
      clusterParam.label.verticalOrigin = VerticalOrigin.CENTER;
      clusterParam.label.fillColor = Color.fromCssColorString(
        clusterLabelTypography.color ?? "#FFF",
      );
      clusterParam.billboard.show = true;
      clusterParam.billboard.image = clusterImage;
      clusterParam.billboard.height = clusterImageWidth;
      clusterParam.billboard.width = clusterImageHeight;
    });
  }, [
    cluster,
    clusterImage,
    clusterImageHeight,
    clusterImageWidth,
    clusterLabelTypography,
    property,
  ]);

  return cluster ? (
    <CustomDataSource show clustering={cluster}>
      {layers?.flattenLayersRaw
        ?.filter(
          layer =>
            property?.layers &&
            property?.layers.some(clusterLayer => clusterLayer.layer === layer.id),
        )
        .map(layer =>
          !layer.isVisible || !!layer.children ? null : (
            <P
              key={layer.id}
              layer={layer}
              pluginProperty={
                layer.pluginId && layer.extensionId
                  ? pluginProperty?.[`${layer.pluginId}/${layer.extensionId}`]
                  : undefined
              }
              isHidden={isLayerHidden?.(layer.id)}
              isEditable={isEditable}
              isBuilt={isBuilt}
              isSelected={!!selectedLayerId && selectedLayerId === layer.id}
              pluginBaseUrl={pluginBaseUrl}
              overriddenProperties={overriddenProperties}
            />
          ),
        )}
    </CustomDataSource>
  ) : null;
};

export default Cluster;
