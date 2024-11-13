import { Button } from "@reearth/beta/lib/reearth-ui";
import { FC } from "react";

type Props = {
  handlePluginDownload: () => void;
};

const PluginInspector: FC<Props> = ({ handlePluginDownload }) => {
  return (
    <div>
      <Button
        icon="install"
        title="Download Package"
        onClick={handlePluginDownload}
      />
    </div>
  );
};

export default PluginInspector;
