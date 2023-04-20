import React from "react";
import useFileInput from "use-file-input";

import { Icons } from "@reearth/components/atoms/Icon";
import Loading from "@reearth/components/atoms/Loading";

import PluginInstallCardButton from "../PluginInstallCardButton";

export type Props = {
  className?: string;
  icon: Icons;
  buttonText: string;
  onSend?: (files: FileList) => void;
  loading?: boolean;
};

const ZipUpload: React.FC<Props> = ({ className, icon, buttonText, onSend, loading }) => {
  const accept = ".zip";
  const handleClick = useFileInput(files => onSend?.(files), {
    accept,
    multiple: false,
  });
  return (
    <>
      {loading ? (
        <Loading overlay />
      ) : (
        <PluginInstallCardButton
          className={className}
          icon={icon}
          text={buttonText}
          onClick={handleClick}
        />
      )}
    </>
  );
};

export default ZipUpload;
