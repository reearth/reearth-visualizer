import React from "react";
import useFileInput from "use-file-input";

import { Icons } from "@reearth/beta/components/Icon";
import Loading from "@reearth/beta/components/Loading";

import PluginInstallCardButton from "../PluginInstallCardButton";

export type Props = {
  icon: Icons;
  buttonText: string;
  onSend?: (files: FileList) => void;
  loading?: boolean;
};

const ZipUpload: React.FC<Props> = ({ icon, buttonText, onSend, loading }) => {
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
        <PluginInstallCardButton icon={icon} text={buttonText} onClick={handleClick} />
      )}
    </>
  );
};

export default ZipUpload;
