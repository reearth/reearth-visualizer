import React from "react";
import { useIntl } from "react-intl";
import useHooks from "./hooks";

// Components
import SettingPage from "@reearth/components/organisms/Settings/SettingPage";
import SettingsHeader from "@reearth/components/molecules/Settings/SettingsHeader";
import PluginSection from "@reearth/components/molecules/Settings/Project/Plugin/PluginSection";
import ArchivedMessage from "@reearth/components/molecules/Settings/Project/ArchivedMessage";

type Props = {
  projectId: string;
};

const Plugin: React.FC<Props> = ({ projectId }) => {
  const intl = useIntl();
  const { currentProject, plugins } = useHooks();

  return (
    <SettingPage projectId={projectId}>
      <SettingsHeader
        title={intl.formatMessage({ defaultMessage: "Plugins" })}
        currentProject={currentProject?.name}
      />
      {!currentProject?.isArchived ? (
        <PluginSection
          plugins={plugins}
          // projects={currentProjects}
          // filterQuery={query}
          // onProjectSelect={selectProject}
          // onCreationButtonClick={openModal}
        />
      ) : (
        <ArchivedMessage />
      )}
    </SettingPage>
  );
};

export default Plugin;
