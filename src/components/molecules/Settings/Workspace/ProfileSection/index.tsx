import React from "react";
import Section from "@reearth/components/molecules/Settings/Section";
import EditableItem from "@reearth/components/molecules/Settings/Project/EditableItem";
import Field from "@reearth/components/molecules/Settings/Field";
import { styled } from "@reearth/theme";
import { useIntl } from "react-intl";

export type Props = {
  currentTeam?: {
    id: string;
    name: string;
    // description: string;
    personal?: boolean;
  };
  updateTeamName?: (name: string) => void;
  updateProjectDescription?: (description: string) => void;
  owner?: boolean;
};

const ProfileSection: React.FC<Props> = ({
  currentTeam,
  updateTeamName,
  //   updateProjectDescription,
  owner,
}) => {
  const intl = useIntl();

  return (
    <Wrapper>
      <Section>
        {currentTeam?.personal || owner === false ? (
          <Field
            header={intl.formatMessage({ defaultMessage: "Workspace name" })}
            body={currentTeam?.name}
          />
        ) : (
          <EditableItem
            title={intl.formatMessage({ defaultMessage: "Workspace name" })}
            body={currentTeam?.name}
            onSubmit={updateTeamName}
          />
          // {/* <EditableItem
          //   title={intl.formatMessage({ defaultMessage: "Description" })}
          //   body={currentTeam?.description}
          //   multilineTextBox={true}
          //   onSubmit={updateTeamDescription}
          // /> */}
          // {/* <EditableItem
          //   title={intl.formatMessage({ defaultMessage: "Owner" })}
          //   body={currentTeam?.owner}
          //   onSubmit={updateTeamName}
          // /> */}
        )}
      </Section>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  background-color: ${props => props.theme.main.lighterBg};
`;

export default ProfileSection;
