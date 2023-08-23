import { InnerPage, ArchivedSettingNotice } from "./common";

type Props = {
  isArchived?: boolean;
};

const PluginSettings: React.FC<Props> = ({ isArchived }) => {
  return (
    <InnerPage wide transparent>
      {!isArchived ? <>TEMP</> : <ArchivedSettingNotice />}
    </InnerPage>
  );
};

export default PluginSettings;
