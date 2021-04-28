import React from "react";
import Icon from "@reearth/components/atoms/Icon";

export type Type = "image" | "video" | "pdf" | string;

export type Props = {
  className?: string;
  type?: Type;
};

const AssetIcon: React.FC<Props> = ({ className, type }) => {
  if (type === "image") {
    return <Icon className={className} icon="image" size={15} />;
  } else if (type === "video") {
    return <Icon className={className} icon="video" size={15} />;
  }
  return <Icon className={className} icon="file" size={15} />;
};

export default AssetIcon;
