import { defined, Color, EntityCluster, HorizontalOrigin, VerticalOrigin } from "cesium";
import React, { useEffect, useRef, useState } from "react";
import { CustomDataSource } from "resium";

import { toCSSFont, Typography } from "@reearth/util/value";

import { LayerStore } from "../../..";
import P from "../../../Primitive";

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
    layers: any;
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
  const [cluster, setCluster] = useState<EntityCluster>();

  useEffect(() => {
    setCluster(
      new EntityCluster({
        enabled: true,
        pixelRange: 200,
        minimumClusterSize: 2,
        clusterBillboards: true,
        clusterLabels: true,
        clusterPoints: true,
      }),
    );
  }, []);

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

  const propertyRef = useRef(property);
  let removeListener: any;
  const removeListenerRef = useRef(removeListener);

  useEffect(() => {
    if (!cluster) return;

    propertyRef.current = property;

    removeListenerRef.current = cluster.clusterEvent.addEventListener(
      (clusteredEntities, clusterParam) => {
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
      },
    );

    cluster.pixelRange = 0;
    cluster.minimumClusterSize = clusterMinSize;
    cluster.pixelRange = clusterPixelRange;
    return () => {
      if (defined(removeListenerRef.current)) {
        removeListenerRef.current();
        removeListenerRef.current = undefined;
      }
    };
  }, [
    property,
    clusterMinSize,
    clusterPixelRange,
    cluster,
    clusterLabelTypography,
    clusterImage,
    clusterImageHeight,
    clusterImageWidth,
  ]);

  return (
    <>
      {cluster && (
        <CustomDataSource show clustering={cluster}>
          {layers?.flattenLayersRaw
            ?.filter(
              layer =>
                property?.layers &&
                property?.layers.some((clusterLayer: any) => clusterLayer.layer === layer.id),
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
      )}
    </>
  );
};

export default Cluster;
