import { Cartesian3, Color, EntityCluster, HorizontalOrigin, VerticalOrigin } from "cesium";
import React, { useEffect, useMemo } from "react";
import { CustomDataSource } from "resium";

import { toCSSFont } from "@reearth/util/value";

import { ClusterComponentProps } from "..";

const Cluster: React.FC<ClusterComponentProps> = ({ property, children }) => {
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

  const cluster = useMemo(() => {
    return new EntityCluster({
      enabled: true,
      pixelRange: 15,
      minimumClusterSize: 2,
      clusterBillboards: true,
      clusterLabels: true,
      clusterPoints: true,
    });
  }, []);

  useEffect(() => {
    const isClusterHidden = React.Children.count(children) < clusterMinSize;
    const removeListener = cluster?.clusterEvent.addEventListener(
      (_clusteredEntities, clusterParam) => {
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
        clusterParam.label.eyeOffset = new Cartesian3(0, 0, -5);
        clusterParam.billboard.show = true;
        // Billboard.{image,height,width} should accept undefined
        (clusterParam.billboard.image as any) = clusterImage;
        (clusterParam.billboard.height as any) = clusterImageHeight;
        (clusterParam.billboard.width as any) = clusterImageWidth;
        // Workaround if minimumClusterSize is larger than number of layers event listner breaks
        cluster.minimumClusterSize = isClusterHidden
          ? React.Children.count(children)
          : clusterMinSize;
      },
    );
    cluster.enabled = !isClusterHidden;
    // Workaround to re-style components
    cluster.pixelRange = 0;
    cluster.pixelRange = clusterPixelRange;
    return () => {
      removeListener();
    };
  }, [
    clusterMinSize,
    clusterPixelRange,
    clusterLabelTypography,
    clusterImage,
    clusterImageHeight,
    clusterImageWidth,
    children,
    cluster,
  ]);

  return cluster ? (
    <CustomDataSource show clustering={cluster}>
      {children}
    </CustomDataSource>
  ) : null;
};

export default Cluster;
