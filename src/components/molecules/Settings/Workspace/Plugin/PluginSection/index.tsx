import React from "react";

import { styled, useTheme } from "@reearth/theme";
import Loading from "@reearth/components/atoms/Loading";
import Text from "@reearth/components/atoms/Text";
import { useIntl } from "react-intl";
// import PluginList from "./PluginList";
// import PluginInstall from "./PluginInstall";

export type Props = {
  title?: string;
  plugins?: any[]; //FIXME:When back-end API is ready
  loading?: boolean;
};

export type PluginPageMode =
  | "list"
  | "install-way"
  | "install-zip"
  | "install-public-repo"
  | "install-private-repo";

const PluginSection: React.FC<Props> = ({ loading }) => {
  // const [pageMode, setPageMode] = useState<PluginPageMode>("list");
  // const handleMovePageMode = (mode: PluginPageMode) => {
  //   setPageMode(mode);
  // };

  const intl = useIntl();
  const theme = useTheme();

  return (
    <>
      <SubHeader>
        <Text size="l" weight="bold" color={theme.main.text} otherProperties={{ margin: "30px 0" }}>
          {intl.formatMessage({ defaultMessage: "Under Construction. Coming Soon." })}
        </Text>
      </SubHeader>
      {loading && <Loading />}
      {/* {loading ? (
        <Loading />
      ) : pageMode === "list" ? (
        <PluginList onMoveNextPage={() => handleMovePageMode("install-way")} plugins={plugins} />
      ) : (
        <PluginInstall
          onMovePrevPage={() => handleMovePageMode("list")}
          onMovePage={handleMovePageMode}
        />
      )} */}
    </>
  );
};

const SubHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 20px 0;
`;

export default PluginSection;
